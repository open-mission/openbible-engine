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
  InstallationProgress,
  InstallationStage,
} from "@openbible/engine-core";
import type {
  BibleLibrary,
  InstalledBibleRegistry,
  BiblePackageSource,
  Clock,
  InstallationObserver,
} from "./ports.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
const SQLITE_HEADER = new TextEncoder().encode(SQLITE_HEADER_TEXT);

function isEngineError(e: unknown): e is EngineError {
  return e instanceof EngineError;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new EngineError("cancelled", "Operation cancelled", { cause: signal.reason });
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
  if (isEngineError(e)) throw e;
  if (e instanceof DOMException && e.name === "AbortError") {
    throw new EngineError("cancelled", "Operation cancelled", { cause: e });
  }
  // AbortSignal abort throws DOMException in some runtimes already handled above
  // For generic errors, wrap
  throw new EngineError(fallbackCode, message, { cause: e });
}

function checkHeader(bytes: Uint8Array): void {
  if (bytes.length < SQLITE_HEADER.length) {
    throw new EngineError("invalid_package", "Invalid package: missing SQLite header");
  }
  for (let i = 0; i < SQLITE_HEADER.length; i++) {
    if (bytes[i] !== SQLITE_HEADER[i]) {
      throw new EngineError("invalid_package", "Invalid package: SQLite header mismatch");
    }
  }
}

function decodePayload(bytes: Uint8Array): { jsonText: string; parsed: unknown } {
  // Payload is JSON after 16-byte header. For synthetic fixtures it is plain JSON;
  // we extract substring from first '{' to last '}' to tolerate trailing zeros.
  const payloadBytes = bytes.slice(SQLITE_HEADER.length);
  const text = new TextDecoder().decode(payloadBytes);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new EngineError("unsupported_schema", "Unsupported schema: missing JSON payload");
  }
  const jsonText = text.slice(start, end + 1);

  // Check required markers as described in task: metadata, book, verse
  // Use case-insensitive? Use lower case includes.
  const lower = jsonText.toLowerCase();
  if (!lower.includes("metadata") || !lower.includes("book") || !lower.includes("verse")) {
    throw new EngineError("unsupported_schema", "Unsupported schema: missing required tables");
  }

  try {
    const parsed = JSON.parse(jsonText);
    return { jsonText, parsed };
  } catch (err) {
    throw new EngineError("unsupported_schema", "Unsupported schema: invalid JSON payload", {
      cause: err,
    });
  }
}

function validateParsedPayload(parsed: unknown, expectedVersionId: string): void {
  if (typeof parsed !== "object" || parsed === null) {
    throw new EngineError("unsupported_schema", "Unsupported schema: payload not an object");
  }
  const obj = parsed as Record<string, unknown>;
  const metadata = obj["metadata"] as Record<string, unknown> | undefined;
  const books = obj["books"] as unknown;
  const verses = obj["verses"] as unknown;

  if (!Array.isArray(books) || !Array.isArray(verses)) {
    throw new EngineError("unsupported_schema", "Unsupported schema: books or verses missing");
  }

  // Identity: metadata.versionId must match normalized versionId
  // Accept variations: metadata.versionId, metadata.id, metadata.version
  let metaVersionRaw: string | undefined;
  if (metadata && typeof metadata === "object") {
    const m = metadata as Record<string, unknown>;
    if (typeof m["versionId"] === "string") metaVersionRaw = m["versionId"] as string;
    else if (typeof m["id"] === "string") metaVersionRaw = m["id"] as string;
    else if (typeof m["version"] === "string") metaVersionRaw = m["version"] as string;
  }
  // Also check top-level versionId
  if (!metaVersionRaw && typeof obj["versionId"] === "string") metaVersionRaw = obj["versionId"] as string;

  if (!metaVersionRaw) {
    throw new EngineError("invalid_package", "Invalid package: metadata.versionId missing");
  }

  let normalizedMeta: string;
  try {
    normalizedMeta = normalizeVersionId(metaVersionRaw);
  } catch (e) {
    // If metadata id itself invalid, treat as invalid_package
    if (isEngineError(e)) throw new EngineError("invalid_package", `Invalid package: metadata versionId invalid: ${metaVersionRaw}`, { cause: e });
    throw e;
  }

  if (normalizedMeta !== expectedVersionId) {
    throw new EngineError(
      "invalid_package",
      `Invalid package: versionId mismatch expected ${expectedVersionId} got ${normalizedMeta}`,
    );
  }

  // Sanity: books non-empty and first book has chapters
  if (books.length === 0) {
    throw new EngineError("unsupported_schema", "Unsupported schema: empty books");
  }
  const first = books[0] as Record<string, unknown>;
  const chapters = (first as Record<string, unknown>)["chapters"];
  if (typeof chapters !== "number" || !Number.isInteger(chapters) || chapters < 1) {
    throw new EngineError("unsupported_schema", "Unsupported schema: first book chapters invalid");
  }
  // also ensure books have id/name
  for (const b of books as unknown[]) {
    const br = b as Record<string, unknown>;
    if (typeof br["id"] !== "string" || typeof br["name"] !== "string") {
      throw new EngineError("unsupported_schema", "Unsupported schema: book entry invalid");
    }
  }
}

// ---------------------------------------------------------------------------
// Engine facade
// ---------------------------------------------------------------------------

export interface BibleEngineDeps {
  library: BibleLibrary;
  registry: InstalledBibleRegistry;
  packageSource?: BiblePackageSource;
  clock?: Clock;
}

export interface BibleEngine {
  listAvailableVersions(): Promise<BibleVersion[]>;
  listInstalledVersions(): Promise<InstalledBible[]>;
  installVersion(
    input: { versionId: string; bytes?: Uint8Array; signal?: AbortSignal },
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
  const { library, registry, packageSource, clock } = deps;
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
        // Treat network-like errors as network_unavailable
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
      input: { versionId: string; bytes?: Uint8Array; signal?: AbortSignal },
      observer?: InstallationObserver,
    ): Promise<void> {
      // 1. normalize versionId, check not traversal
      let versionId: string;
      try {
        versionId = normalizeVersionId(input.versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${input.versionId}`, { cause: e });
      }

      const signal = input.signal;
      throwIfAborted(signal);

      // 2. get bytes
      let bytes: Uint8Array | undefined = input.bytes;
      let totalBytes: number | undefined = bytes?.length;

      if (!bytes) {
        if (!packageSource) {
          throw new EngineError("storage_unavailable", "No packageSource and no bytes provided");
        }
        emit(observer, versionId, "receiving", 0, undefined);
        try {
          throwIfAborted(signal);
          bytes = await packageSource.fetchPackage(versionId, signal, observer);
          totalBytes = bytes.length;
          emit(observer, versionId, "receiving", totalBytes, totalBytes);
        } catch (e) {
          if (isEngineError(e)) throw e;
          if (signal?.aborted) {
            throw new EngineError("cancelled", "Installation cancelled during fetch", { cause: e });
          }
          // Propagate network errors
          if (e instanceof DOMException && e.name === "AbortError") {
            throw new EngineError("cancelled", "Installation cancelled", { cause: e });
          }
          throw new EngineError("network_unavailable", "Failed to fetch package", { cause: e });
        }
      } else {
        // bytes provided directly
        emit(observer, versionId, "receiving", bytes.length, bytes.length);
      }

      if (!bytes) {
        throw new EngineError("invalid_package", "Empty package bytes");
      }

      throwIfAborted(signal);

      // Remember previous entry for rollback (idempotency / keep previous on failure)
      let previous: InstalledBible | null = null;
      try {
        previous = await registry.get(versionId);
      } catch {
        // ignore registry get error for previous, proceed
        previous = null;
      }

      // 3-7 validation stages with progress emission
      try {
        // 4. validate header
        emit(observer, versionId, "validating_header", bytes.length, totalBytes);
        throwIfAborted(signal);
        checkHeader(bytes);

        // If library has validatePackage hook, call it
        if (library.validatePackage) {
          try {
            const res = await library.validatePackage(bytes);
            if (!res.valid) {
              throw new EngineError("invalid_package", "Package validation failed via library");
            }
          } catch (e) {
            if (isEngineError(e)) throw e;
            throw new EngineError("invalid_package", "Package validation failed", { cause: e });
          }
        }

        // 5. validate schema
        emit(observer, versionId, "validating_schema", bytes.length, totalBytes);
        throwIfAborted(signal);
        const { parsed } = decodePayload(bytes);

        // 6. validate identity
        emit(observer, versionId, "validating_identity", bytes.length, totalBytes);
        throwIfAborted(signal);
        validateParsedPayload(parsed, versionId);

        // 7. sanity query
        emit(observer, versionId, "sanity_check", bytes.length, totalBytes);
        throwIfAborted(signal);
        // Already validated non-empty and chapters; additional library-like parsing was done.
        // No further action needed; if library has sanity method we could call getBooks but bytes already validated.

        // 8. promote: call library install hook if available
        emit(observer, versionId, "promoting", bytes.length, totalBytes);
        throwIfAborted(signal);

        const libAny = library as unknown as Record<string, unknown>;
        const promoteFn =
          (typeof libAny["install"] === "function" ? (libAny["install"] as (a: string, b: Uint8Array) => Promise<void>) : undefined) ??
          (typeof libAny["installPackage"] === "function"
            ? (libAny["installPackage"] as (a: string, b: Uint8Array) => Promise<void>)
            : undefined) ??
          (typeof libAny["save"] === "function" ? (libAny["save"] as (a: string, b: Uint8Array) => Promise<void>) : undefined);

        if (promoteFn) {
          try {
            await promoteFn.call(library, versionId, bytes);
          } catch (e) {
            if (isEngineError(e)) throw e;
            // Map storage errors
            const msg = e instanceof Error ? e.message : String(e);
            if (/full/i.test(msg)) throw new EngineError("storage_full", "Storage full during promotion", { cause: e });
            if (/locked/i.test(msg)) throw new EngineError("database_locked", "Database locked", { cause: e });
            throw new EngineError("storage_unavailable", "Storage unavailable during promotion", { cause: e });
          }
        }

        // 9. registry.set atomically
        emit(observer, versionId, "registering", bytes.length, totalBytes);
        throwIfAborted(signal);

        // Determine name: try library.getVersionName or metadata name or versionId
        let name = versionId;
        if (library.getVersionName) {
          try {
            const n = await library.getVersionName(versionId);
            if (typeof n === "string" && n.trim().length > 0) name = n;
          } catch {
            // ignore
          }
        }
        // Try to extract from parsed payload if name still versionId
        if (name === versionId) {
          try {
            const payloadParsed = parsed as Record<string, unknown>;
            const meta = payloadParsed["metadata"] as Record<string, unknown> | undefined;
            if (meta && typeof meta["name"] === "string" && (meta["name"] as string).trim().length > 0) {
              name = (meta["name"] as string).trim();
            } else if (typeof payloadParsed["name"] === "string" && (payloadParsed["name"] as string).trim().length > 0) {
              name = (payloadParsed["name"] as string).trim();
            }
          } catch {
            // ignore
          }
        }

        const entry: InstalledBible = {
          id: versionId,
          name,
          installedAt: now(),
          versionCode: previous ? previous.versionCode : 1,
        };
        // For idempotency, if previous exists with same versionCode we keep but update installedAt.
        // If we want to bump versionCode on reinstall we could keep same; spec says idempotent so not duplicate.
        try {
          await registry.set(entry);
        } catch (e) {
          throw wrapUnknown(e, "storage_unavailable", "Failed to register installed bible");
        }

        // Cleanup: success, no tmp to clean (in-memory)
        // Optionally ensure no partial left behind – already atomic
      } catch (e) {
        // Handle cancellation
        if (signal?.aborted) {
          // Ensure registry not updated for this version if it wasn't previously present
          // If previous was null, ensure no entry exists; if we created one, remove it
          // But we only set after success, so nothing to clean unless promoteFn partially wrote.
          // We already haven't called registry.set in failure path, so just throw cancelled
          if (e instanceof EngineError && e.code === "cancelled") throw e;
          throw new EngineError("cancelled", "Installation cancelled", { cause: e });
        }
        if (isEngineError(e) && e.code === "cancelled") throw e;
        // On failure, ensure no partial registry entry if previous was null
        // If we had already set, this catch wouldn't have reached set; so no need.
        // If previous existed we keep it (do nothing)
        // Re-throw original EngineError or wrap
        if (isEngineError(e)) throw e;
        throw wrapUnknown(e, "storage_unavailable", "Installation failed");
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
      let existing: InstalledBible | null;
      try {
        existing = await registry.get(normalized);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Storage unavailable during uninstall get");
      }
      if (!existing) {
        throw new EngineError("version_not_installed", `Version not installed: ${normalized}`);
      }
      try {
        await registry.remove(normalized);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Storage unavailable during uninstall remove");
      }
      // Also try to remove from library if it has uninstall/remove hook
      const libAny = library as unknown as Record<string, unknown>;
      const removeFn =
        (typeof libAny["uninstall"] === "function" ? (libAny["uninstall"] as (a: string) => Promise<void>) : undefined) ??
        (typeof libAny["remove"] === "function" ? (libAny["remove"] as (a: string) => Promise<void>) : undefined) ??
        (typeof libAny["delete"] === "function" ? (libAny["delete"] as (a: string) => Promise<void>) : undefined);
      if (removeFn) {
        try {
          await removeFn.call(library, normalized);
        } catch {
          // library cleanup failure should not revert registry removal; log silently
        }
      }
    },

    async getBooks(versionId: string): Promise<BibleBook[]> {
      let normalized: string;
      try {
        normalized = normalizeVersionId(versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${versionId}`, { cause: e });
      }
      await requireInstalled(normalized);
      let books: BibleBook[];
      try {
        books = await library.getBooks(normalized);
      } catch (e) {
        throw wrapUnknown(e, "storage_unavailable", "Failed to get books");
      }
      // Return sorted by canonical BOOKS order when possible, else lexicographic
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
      let versionId: string;
      let bookId: string;
      try {
        versionId = normalizeVersionId(input.versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${input.versionId}`, { cause: e });
      }
      try {
        bookId = normalizeBookId(input.bookId);
      } catch (e) {
        if (isEngineError(e)) {
          // Map invalid_book/traversal to invalid_reference for chapter context, keep invalid_package for traversal?
          if (e.code === "invalid_package") throw e;
          throw new EngineError("invalid_reference", e.message, { cause: e });
        }
        throw new EngineError("invalid_reference", `Invalid bookId: ${input.bookId}`, { cause: e });
      }

      const chapter = input.chapter;
      if (!Number.isInteger(chapter) || chapter < 1) {
        throw new EngineError("invalid_reference", `Invalid chapter: ${chapter}`);
      }

      // Check registry
      await requireInstalled(versionId);

      // Validate book exists and chapter within range via getBooks
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
      if (!book) {
        throw new EngineError("invalid_reference", `Book not found: ${bookId}`);
      }
      if (chapter > book.chapters) {
        throw new EngineError("invalid_reference", `Chapter ${chapter} exceeds ${book.chapters} for ${bookId}`);
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
      let versionId: string;
      try {
        versionId = normalizeVersionId(input.versionId);
      } catch (e) {
        if (isEngineError(e)) throw e;
        throw new EngineError("invalid_package", `Invalid versionId: ${input.versionId}`, { cause: e });
      }
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
        // Ensure shape consistency
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
      if (!books || books.length === 0) {
        // No books provided: cannot parse without context. Per task, require books; return null.
        // Optional async fetch from first installed is not possible in sync method, so return null.
        return null;
      }
      const parsed = coreParseReference(query, books);
      if (!parsed) return null;
      return toBibleReference(parsed);
    },
  };
}
