import type {
  BibleBook,
  BibleVersion,
  InstalledBible,
  SearchResult,
  Verse,
  CancellationToken,
  InstallationStage,
} from "@openbible/engine-core";
import { BOOKS, EngineError } from "@openbible/engine-core";
import type {
  BibleLibrary,
  InstalledBibleRegistry,
  BiblePackageSource,
  BibleInstaller,
  Clock,
  InstallationObserver,
  InstallPackageInput,
} from "@openbible/engine";
import { createAraFixture } from "./fixtures.js";

// ---------------------------------------------------------------------------
// FakeClock
// ---------------------------------------------------------------------------
export class FakeClock implements Clock {
  private _now: number;
  constructor(initialEpochMs?: number) {
    this._now = initialEpochMs ?? Date.UTC(2024, 0, 1, 0, 0, 0, 0);
  }
  now(): number {
    return this._now;
  }
  tick(ms: number): void {
    if (!Number.isFinite(ms)) throw new Error("tick requires finite ms");
    this._now += ms;
  }
  set(epochMs: number): void {
    this._now = epochMs;
  }
  advance(ms: number): void {
    this.tick(ms);
  }
}

// ---------------------------------------------------------------------------
// FakeRegistry
// ---------------------------------------------------------------------------
export class FakeRegistry implements InstalledBibleRegistry {
  private map = new Map<string, InstalledBible>();
  constructor(initial?: InstalledBible[]) {
    if (initial) for (const b of initial) this.map.set(b.id, { ...b });
  }
  async list(): Promise<InstalledBible[]> {
    return [...this.map.values()].map((v) => ({ ...v }));
  }
  async get(id: string): Promise<InstalledBible | null> {
    const v = this.map.get(id);
    return v ? { ...v } : null;
  }
  async set(bible: InstalledBible): Promise<void> {
    this.map.set(bible.id, { ...bible });
  }
  async remove(id: string): Promise<void> {
    this.map.delete(id);
  }
  clear(): void {
    this.map.clear();
  }
  size(): number {
    return this.map.size;
  }
  has(id: string): boolean {
    return this.map.has(id);
  }
}

// ---------------------------------------------------------------------------
// Canonical order + search normalization helpers
// ---------------------------------------------------------------------------
const ORDER_MAP = (() => {
  const m = new Map<string, number>();
  BOOKS.forEach((b, idx) => m.set(b.id, idx));
  return m;
})();

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function normalizeForSearch(s: string): string {
  return stripAccents(s).toLowerCase();
}

export interface FakeLibraryEntry {
  books: BibleBook[];
  versesByKey: Map<string, Verse[]>;
  allVerses: Verse[];
  versionName: string;
}

/**
 * Read-only in-memory BibleLibrary used by fakes and contract tests.
 * It is only a reader; writing/composition happens through FakeBibleInstaller
 * (which populates it) or directly via populate().
 */
export class FakeLibrary implements BibleLibrary {
  private store = new Map<string, FakeLibraryEntry>();

  private populateFrom(versionId: string, books: BibleBook[], verses: Verse[], versionName: string): void {
    const versesByKey = new Map<string, Verse[]>();
    for (const v of verses) {
      const key = `${v.bookId}-${v.chapter}`;
      const arr = versesByKey.get(key) ?? [];
      arr.push({ ...v });
      versesByKey.set(key, arr);
    }
    for (const [, arr] of versesByKey) arr.sort((a, b) => a.verse - b.verse);
    this.store.set(versionId, {
      books: books.map((b) => ({ ...b })),
      versesByKey,
      allVerses: verses.map((v) => ({ ...v })),
      versionName,
    });
  }

  populate(versionId: string, data: { books: BibleBook[]; verses: Verse[]; name?: string }): void {
    this.populateFrom(versionId, data.books, data.verses, data.name ?? versionId);
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    const cloned = entry.books.map((b) => ({ ...b }));
    return cloned.sort((a, b) => {
      const ao = ORDER_MAP.get(a.id);
      const bo = ORDER_MAP.get(b.id);
      return (ao ?? Number.MAX_SAFE_INTEGER) - (bo ?? Number.MAX_SAFE_INTEGER);
    });
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    const arr = entry.versesByKey.get(`${bookId}-${chapter}`) ?? [];
    return arr.map((v) => ({ ...v })).sort((a, b) => a.verse - b.verse);
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
    const normQuery = normalizeForSearch(query);
    const matched = entry.allVerses.filter((v) => normalizeForSearch(v.text).includes(normQuery)).map((v) => ({ ...v }));
    matched.sort((a, b) => {
      const ao = ORDER_MAP.get(a.bookId) ?? Number.MAX_SAFE_INTEGER;
      const bo = ORDER_MAP.get(b.bookId) ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    return { versionId, query, results: matched.slice(0, limit), total: matched.length };
  }

  async getVersionName(versionId: string): Promise<string | null> {
    const entry = this.store.get(versionId);
    return entry ? entry.versionName : null;
  }

  hasVersion(versionId: string): boolean {
    return this.store.has(versionId);
  }
  clear(): void {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// FakeBibleInstaller - transactional owner for unit tests, with failure injection
// ---------------------------------------------------------------------------

export interface FakeInstallerOptions {
  registry: InstalledBibleRegistry;
  library?: FakeLibrary;
  /** Called after a successful commit (e.g. to populate the FakeLibrary). */
  onCommit?: (versionId: string, input: InstallPackageInput) => void;
  /** Force a failure at a given stage to prove atomicity guarantees. */
  failDuring?: InstallationStage | "validate" | "commit" | "registry";
  /** Optional opaque validator; return false to simulate invalid package. */
  validate?: (bytes: Uint8Array) => boolean;
}

export class FakeBibleInstaller implements BibleInstaller {
  private storage = new Map<string, Uint8Array>();

  constructor(private opts: FakeInstallerOptions) {}

  /** Runtime toggle to inject a failure for a given stage (test helper). */
  setFailDuring(stage?: FakeInstallerOptions["failDuring"]): void {
    this.opts.failDuring = stage;
  }
  /** Runtime validator toggle (test helper). */
  setValidate(fn?: (bytes: Uint8Array) => boolean): void {
    this.opts.validate = fn;
  }

  private emit(observer: InstallationObserver | undefined, versionId: string, stage: InstallationStage, length: number): void {
    if (!observer) return;
    try {
      observer.onProgress({ versionId, stage, receivedBytes: length, totalBytes: length });
    } catch {
      // ignore observer errors
    }
  }

  async install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible> {
    const { versionId, bytes, token } = input;
    if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: token.reason });

    this.emit(observer, versionId, "validating_header", bytes.length);
    if (this.opts.failDuring === "validating_header") throw new EngineError("invalid_package", "Invalid package: modelized failure");

    if (this.opts.validate && !this.opts.validate(bytes)) {
      throw new EngineError("invalid_package", "Invalid package: validation failed");
    }

    this.emit(observer, versionId, "validating_schema", bytes.length);
    if (this.opts.failDuring === "validating_schema") throw new EngineError("unsupported_schema", "Unsupported schema: modelized failure");
    this.emit(observer, versionId, "validating_identity", bytes.length);
    this.emit(observer, versionId, "sanity_check", bytes.length);

    // Commit
    this.emit(observer, versionId, "promoting", bytes.length);
    const hadPrevious = this.storage.has(versionId);
    const previousBytes = this.storage.get(versionId);
    this.storage.set(versionId, bytes);

    if (this.opts.failDuring === "commit") {
      // rollback: restore previous storage, no registry change
      if (hadPrevious) this.storage.set(versionId, previousBytes!);
      else this.storage.delete(versionId);
      throw new EngineError("storage_unavailable", "Commit failed (modelized)");
    }

    this.emit(observer, versionId, "registering", bytes.length);
    try {
      await this.opts.registry.set({
        id: versionId,
        name: input.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      });
    } catch (e) {
      if (hadPrevious) this.storage.set(versionId, previousBytes!);
      else this.storage.delete(versionId);
      if (this.opts.failDuring === "registry") throw new EngineError("storage_unavailable", "Registry failed (modelized)", { cause: e });
      throw new EngineError("storage_unavailable", "Failed to register installed bible", { cause: e });
    }

    this.opts.onCommit?.(versionId, input);
    return {
      id: versionId,
      name: input.name ?? versionId,
      installedAt: input.installedAt,
      versionCode: input.versionCode,
    };
  }

  async uninstall(versionId: string): Promise<void> {
    const hasStorage = this.storage.has(versionId);
    const hasRegistry = (await this.opts.registry.get(versionId)) !== null;
    if (!hasStorage && !hasRegistry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    this.storage.delete(versionId);
    if (hasRegistry) await this.opts.registry.remove(versionId);
  }

  async isInstalled(versionId: string): Promise<boolean> {
    const hasStorage = this.storage.has(versionId);
    const hasRegistry = (await this.opts.registry.get(versionId)) !== null;
    return hasStorage && hasRegistry;
  }

  hasStorage(versionId: string): boolean {
    return this.storage.has(versionId);
  }
}

// ---------------------------------------------------------------------------
// FakePackageSource
// ---------------------------------------------------------------------------
export interface FakePackageSourceOptions {
  versions?: BibleVersion[];
  packages?: Map<string, Uint8Array> | Record<string, Uint8Array>;
}

export class FakePackageSource implements BiblePackageSource {
  private versions: BibleVersion[];
  private packages: Map<string, Uint8Array>;

  constructor(options?: FakePackageSourceOptions) {
    this.versions = options?.versions ?? [
      { id: "ara", name: "ARA", language: "pt-BR", totalBooks: 66 },
      { id: "nvi", name: "NVI", language: "pt-BR", totalBooks: 66 },
      { id: "acf", name: "ACF", language: "pt-BR", totalBooks: 66 },
    ];
    const packages = options?.packages;
    if (packages instanceof Map) {
      this.packages = new Map(packages);
    } else if (packages) {
      this.packages = new Map(Object.entries(packages));
    } else {
      this.packages = new Map();
    }
  }

  async listAvailable(): Promise<BibleVersion[]> {
    return this.versions.map((v) => ({ ...v }));
  }

  async fetchPackage(
    versionId: string,
    token?: CancellationToken,
    observer?: InstallationObserver,
  ): Promise<Uint8Array> {
    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled");
    const bytes = this.packages.get(versionId);
    if (!bytes) throw new EngineError("invalid_package", `Package not found: ${versionId}`);
    if (observer) {
      try {
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes: bytes.length });
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: bytes.length, totalBytes: bytes.length });
      } catch {
        // ignore
      }
    }
    return new Uint8Array(bytes);
  }

  setPackage(versionId: string, bytes: Uint8Array): void {
    this.packages.set(versionId, bytes);
  }
  setVersions(versions: BibleVersion[]): void {
    this.versions = versions.map((v) => ({ ...v }));
  }
}

export function defaultFixtureData() {
  return createAraFixture();
}
