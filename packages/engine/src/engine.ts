import {
  EngineError,
  normalizeVersionId,
  normalizeBookId,
  parseReference as coreParseReference,
  BOOKS,
} from "@openbible/engine-core";
import type {
  BibleBook,
  BibleVersion,
  BibleReference,
  InstalledBible,
  Verse,
  SearchResult,
  CancellationToken,
  InstallationStage,
  InstallationProgress,
} from "@openbible/engine-core";
import type {
  BibleLibrary,
  InstalledBibleRegistry,
  BiblePackageSource,
  BibleInstaller,
  Clock,
  InstallationObserver,
} from "./ports.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEngineError(e: unknown): e is EngineError {
  return e instanceof EngineError;
}

function throwIfAborted(token?: CancellationToken): void {
  if (token?.aborted) {
    throw new EngineError("cancelled", "Operation cancelled", { cause: token.reason });
  }
}

function emit(
  observer: InstallationObserver | undefined,
  versionId: string,
  stage: InstallationStage,
  receivedBytes?: number,
  totalBytes?: number,
): void {
  if (!observer) return;
  const progress: InstallationProgress = { versionId, stage };
  if (receivedBytes !== undefined) progress.receivedBytes = receivedBytes;
  if (totalBytes !== undefined) progress.totalBytes = totalBytes;
  try {
    observer.onProgress(progress);
  } catch {
    // observer errors must not break install flow
  }
}

function wrapUnknown(e: unknown, fallbackCode: EngineError["code"], message: string): EngineError {
  if (isEngineError(e)) return e;
  return new EngineError(fallbackCode, message, { cause: e });
}

// ---------------------------------------------------------------------------
// Engine facade
// ---------------------------------------------------------------------------

export interface BibleEngineDeps {
  library: BibleLibrary;
  registry: InstalledBibleRegistry;
  /** Transactional owner of the install/uninstall cycle. */
  installer: BibleInstaller;
  packageSource?: BiblePackageSource;
  clock?: Clock;
}

export interface BibleEngine {
  listAvailableVersions(): Promise<BibleVersion[]>;
  listInstalledVersions(): Promise<InstalledBible[]>;
  installVersion(
    input: { versionId: string; bytes?: Uint8Array; name?: string; token?: CancellationToken },
    observer?: InstallationObserver,
  ): Promise<void>;
  uninstallVersion(versionId: string): Promise<void>;
  getBooks(versionId: string): Promise<BibleBook[]>;
  getChapter(input: { versionId: string; bookId: string; chapter: number }): Promise<Verse[]>;
  searchVerses(input: { versionId: string; query: string; limit: number }): Promise<SearchResult>;
  parseReference(input: { query: string; books?: BibleBook[] }): BibleReference | null;
}

function toBibleReference(
  parsed: { book: BibleBook; chapter: number; verse?: number },
): BibleReference {
  return {
    bookId: parsed.book.id,
    chapter: parsed.chapter,
    verseStart: parsed.verse,
    verseEnd: parsed.verse,
  };
}

export function createBibleEngine(deps: BibleEngineDeps): BibleEngine {
  const { library, registry, installer, packageSource, clock } = deps;
  const now = () => (clock ? clock.now() : Date.now());

  async function requireInstalled(versionIdNormalized: string): Promise<InstalledBible> {
    let entry: InstalledBible | null;
    try {
      entry = await registry.get(versionIdNormalized);
    } catch (e) {
      throw wrapUnknown(e, "storage_unavailable", "Storage unavailable during registry.get");
    }
    if (!entry) {
      throw new EngineError("version_not_installed", `Version not installed: ${versionIdNormalized}`);
    }
    return entry;
  }

  return {
    async listAvailableVersions(): Promise<BibleVersion[]> {
      if (!packageSource) return [];
      try {
        return await packageSource.listAvailable();
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("network_unavailable", "Network unavailable", { cause: e });
      }
    },

    async listInstalledVersions(): Promise<InstalledBible[]> {
      try {
        return await registry.list();
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Storage unavailable during registry.list");
      }
    },

    async installVersion(
      input: { versionId: string; bytes?: Uint8Array; name?: string; token?: CancellationToken },
      observer?: InstallationObserver,
    ): Promise<void> {
      let versionId: string;
      try {
        versionId = normalizeVersionId(input.versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${input.versionId}`, { cause: e });
      }

      const token = input.token;
      throwIfAborted(token);

      // Resolve bytes: local bytes or remote source (optional).
      let bytes: Uint8Array | undefined = input.bytes;
      let totalBytes: number | undefined = bytes?.length;

      if (!bytes) {
        if (!packageSource) {
          throw new EngineError("storage_unavailable", "No packageSource and no bytes provided");
        }
        emit(observer, versionId, "receiving", 0, undefined);
        try {
          throwIfAborted(token);
          bytes = await packageSource.fetchPackage(versionId, token, observer);
          totalBytes = bytes.length;
          emit(observer, versionId, "receiving", totalBytes, totalBytes);
        } catch (e) {
          if (isEngineError(e)) throw e;
          if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled during fetch", { cause: e });
          throw new EngineError("network_unavailable", "Failed to fetch package", { cause: e });
        }
      } else {
        emit(observer, versionId, "receiving", bytes.length, bytes.length);
      }

      if (!bytes) throw new EngineError("invalid_package", "Empty package bytes");
      throwIfAborted(token);

      // Previous record drives idempotency (versionCode) and rollback guarantees.
      let previous: InstalledBible | null = null;
      try {
        previous = await registry.get(versionId);
      } catch {
        previous = null;
      }

      try {
        await installer.install(
          {
            versionId,
            bytes,
            name: input.name,
            installedAt: now(),
            versionCode: previous ? previous.versionCode : 1,
            token,
          },
          observer,
        );
      } catch (e) {
        const err = isEngineError(e) ? e : wrapUnknown(e, "storage_unavailable", "Installation failed");
        throw err;
      }
    },

    async uninstallVersion(versionId: string): Promise<void> {
      let normalized: string;
      try {
        normalized = normalizeVersionId(versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${versionId}`, { cause: e });
      }
      await installer.uninstall(normalized);
    },

    async getBooks(versionId: string): Promise<BibleBook[]> {
      const normalized = normalizeVersionIdSafe(versionId, "invalid_package");
      await requireInstalled(normalized);
      let books: BibleBook[];
      try {
        books = await library.getBooks(normalized);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Failed to get books");
      }
      const order = new Map<string, number>();
      BOOKS.forEach((b, idx) => order.set(b.id, idx));
      return [...books].sort((a, b) => {
        const ao = order.get(a.id);
        const bo = order.get(b.id);
        if (ao !== undefined && bo !== undefined) return ao - bo;
        if (ao !== undefined) return -1;
        if (bo !== undefined) return 1;
        return a.id.localeCompare(b.id);
      });
    },

    async getChapter(input: { versionId: string; bookId: string; chapter: number }): Promise<Verse[]> {
      const versionId = normalizeVersionIdSafe(input.versionId, "invalid_package");
      const bookId = normalizeBookIdSafe(input.bookId);
      const chapter = input.chapter;
      if (!Number.isInteger(chapter) || chapter < 1) {
        throw new EngineError("invalid_reference", `Invalid chapter: ${chapter}`);
      }
      await requireInstalled(versionId);

      let books: BibleBook[];
      try {
        books = await library.getBooks(versionId);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Failed to get books for chapter validation");
      }
      const book = books.find((b) => {
        try {
          return normalizeBookId(b.id) === bookId;
        } catch {
          return b.id === bookId;
        }
      });
      if (!book) throw new EngineError("invalid_reference", `Book not found: ${bookId}`);
      if (chapter > book.chapters) {
        throw new EngineError(
          "invalid_reference",
          `Chapter ${chapter} exceeds ${book.chapters} for ${bookId}`,
        );
      }

      let verses: Verse[];
      try {
        verses = await library.getChapter(versionId, bookId, chapter);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Failed to get chapter");
      }
      return [...verses].sort((a, b) => a.verse - b.verse);
    },

    async searchVerses(input: { versionId: string; query: string; limit: number }): Promise<SearchResult> {
      const versionId = normalizeVersionIdSafe(input.versionId, "invalid_package");
      await requireInstalled(versionId);

      const query = input.query;
      const limit = input.limit;

      if (typeof query !== "string" || query.trim().length === 0) {
        return { versionId, query: query ?? "", results: [], total: 0 };
      }
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
        throw new EngineError("invalid_reference", `Invalid limit: ${limit} must be 1..1000`);
      }

      try {
        const result = await library.search(versionId, query, limit);
        return {
          versionId: result.versionId ?? versionId,
          query: result.query ?? query,
          results: result.results ?? [],
          total: typeof result.total === "number" ? result.total : (result.results?.length ?? 0),
        };
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Search failed");
      }
    },

    parseReference(input: { query: string; books?: BibleBook[] }): BibleReference | null {
      const query = input.query;
      const books = input.books;
      if (typeof query !== "string" || query.trim().length === 0) return null;
      if (!books || books.length === 0) return null;
      const parsed = coreParseReference(query, books);
      if (!parsed) return null;
      return toBibleReference(parsed);
    },
  };

  function normalizeVersionIdSafe(id: string, code: EngineError["code"]): string {
    try {
      return normalizeVersionId(id);
    } catch (e) {
      if (isEngineError(e)) throw e;
      throw new EngineError(code, `Invalid versionId: ${id}`, { cause: e });
    }
  }

  function normalizeBookIdSafe(id: string): string {
    try {
      return normalizeBookId(id);
    } catch (e) {
      if (isEngineError(e)) {
        if (e.code === "invalid_package") throw e;
        throw new EngineError("invalid_reference", e.message, { cause: e });
      }
      throw new EngineError("invalid_reference", `Invalid bookId: ${id}`, { cause: e });
    }
  }
}
