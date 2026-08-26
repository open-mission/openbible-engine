import type { BibleBook, BibleVersion, InstalledBible, SearchResult, Verse } from "@openbible/engine-core";
import { BOOKS, EngineError } from "@openbible/engine-core";
import type { BibleLibrary, InstalledBibleRegistry, BiblePackageSource, Clock, InstallationObserver } from "@openbible/engine";
import { createSyntheticBibleBytes, createAraFixture, ARA_VERSION_ID } from "./fixtures.js";

// ---------------------------------------------------------------------------
// FakeClock
// ---------------------------------------------------------------------------
export class FakeClock implements Clock {
  private _now: number;

  constructor(initialEpochMs?: number) {
    // fixed epoch default: 2024-01-01T00:00:00Z
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

  // Alias for convenience
  advance(ms: number): void {
    this.tick(ms);
  }
}

// ---------------------------------------------------------------------------
// FakeRegistry - Map based InstalledBibleRegistry
// ---------------------------------------------------------------------------
export class FakeRegistry implements InstalledBibleRegistry {
  private map = new Map<string, InstalledBible>();

  constructor(initial?: InstalledBible[]) {
    if (initial) {
      for (const b of initial) this.map.set(b.id, { ...b });
    }
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

  // Test helper to inspect
  size(): number {
    return this.map.size;
  }

  has(id: string): boolean {
    return this.map.has(id);
  }
}

// ---------------------------------------------------------------------------
// Helpers for canonical ordering and normalization
// ---------------------------------------------------------------------------
function canonicalOrderMap(): Map<string, number> {
  const m = new Map<string, number>();
  BOOKS.forEach((b, idx) => m.set(b.id, idx));
  return m;
}

const ORDER_MAP = canonicalOrderMap();

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeForSearch(s: string): string {
  return stripAccents(s).toLowerCase();
}

function parsePayload(bytes: Uint8Array): { versionId: string; name: string; books: BibleBook[]; verses: Verse[] } {
  const SQLITE_HEADER = new TextEncoder().encode("SQLite format 3\0");
  if (bytes.length < SQLITE_HEADER.length) throw new EngineError("invalid_package", "missing header");
  for (let i = 0; i < SQLITE_HEADER.length; i++) if (bytes[i] !== SQLITE_HEADER[i]) throw new EngineError("invalid_package", "header mismatch");
  const payloadBytes = bytes.slice(SQLITE_HEADER.length);
  const text = new TextDecoder().decode(payloadBytes);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new EngineError("unsupported_schema", "missing json");
  const json = JSON.parse(text.slice(start, end + 1)) as { metadata?: { versionId?: string; name?: string; id?: string }; books?: BibleBook[]; verses?: Verse[]; name?: string; versionId?: string };
  const meta = json.metadata;
  const versionId = (meta?.versionId ?? meta?.id ?? json.versionId ?? json.metadata?.versionId ?? "") as string;
  const name = (meta?.name ?? json.name ?? versionId) as string;
  const books = (json.books ?? []) as BibleBook[];
  const verses = (json.verses ?? []) as Verse[];
  return { versionId, name, books, verses };
}

// ---------------------------------------------------------------------------
// FakeLibrary - in-memory BibleLibrary with data for fixture
// ---------------------------------------------------------------------------
export interface FakeLibraryStoreEntry {
  books: BibleBook[];
  versesByKey: Map<string, Verse[]>; // key `${bookId}-${chapter}`
  allVerses: Verse[];
  versionName: string;
}

export class FakeLibrary implements BibleLibrary {
  private store = new Map<string, FakeLibraryStoreEntry>();

  constructor(initialVersionId?: string) {
    // Optionally pre-populate with ARA fixture
    if (initialVersionId) {
      const fixture = createAraFixture();
      // If custom id requested, recreate bytes with that id
      if (initialVersionId !== ARA_VERSION_ID) {
        const bytes = createSyntheticBibleBytes(initialVersionId, fixture.books, fixture.verses, initialVersionId);
        // Use sync internal install without async header check? We'll populate directly.
        this.populateFromParsed(initialVersionId, fixture.books, fixture.verses, initialVersionId);
        void bytes; // keep for completeness
      } else {
        this.populateFromParsed(fixture.versionId, fixture.books, fixture.verses, fixture.name);
      }
    }
  }

  private populateFromParsed(versionId: string, books: BibleBook[], verses: Verse[], versionName: string): void {
    const versesByKey = new Map<string, Verse[]>();
    for (const v of verses) {
      const key = `${v.bookId}-${v.chapter}`;
      const arr = versesByKey.get(key) ?? [];
      arr.push({ ...v });
      versesByKey.set(key, arr);
    }
    // Ensure sorting inside each chapter by verse
    for (const [, arr] of versesByKey) arr.sort((a, b) => a.verse - b.verse);
    this.store.set(versionId, {
      books: books.map((b) => ({ ...b })),
      versesByKey,
      allVerses: verses.map((v) => ({ ...v })),
      versionName,
    });
  }

  // Direct populate helper for tests
  populate(versionId: string, books: BibleBook[], verses: Verse[], name?: string): void {
    this.populateFromParsed(versionId, books, verses, name ?? versionId);
  }

  // Install from synthetic bytes (called by engine)
  async install(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.installPackage(versionId, bytes);
  }

  async installPackage(versionId: string, bytes: Uint8Array): Promise<void> {
    const parsed = parsePayload(bytes);
    // If versionId mismatch, we could throw but engine already validated; we use passed versionId as key
    // Use parsed books/verses but key by versionId param to stay consistent
    this.populateFromParsed(versionId, parsed.books, parsed.verses, parsed.name);
  }

  async save(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.installPackage(versionId, bytes);
  }

  // ValidatePackage hook
  async validatePackage(bytes: Uint8Array): Promise<{ valid: boolean; versionId?: string }> {
    try {
      const p = parsePayload(bytes);
      if (!p.versionId) return { valid: false };
      // Basic check that books/verses arrays present already done in parsePayload
      return { valid: true, versionId: p.versionId };
    } catch {
      return { valid: false };
    }
  }

  async getVersionName(versionId: string): Promise<string | null> {
    const entry = this.store.get(versionId);
    return entry ? entry.versionName : null;
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    // Return sorted by canonical order - clone each book
    const order = ORDER_MAP;
    const cloned = entry.books.map((b) => ({ ...b }));
    return cloned.sort((a, b) => {
      const ao = order.get(a.id);
      const bo = order.get(b.id);
      if (ao !== undefined && bo !== undefined) return ao - bo;
      if (ao !== undefined) return -1;
      if (bo !== undefined) return 1;
      return a.id.localeCompare(b.id);
    });
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    const key = `${bookId}-${chapter}`;
    const arr = entry.versesByKey.get(key) ?? [];
    // Return sorted by verse ASC (already sorted) - clone each verse to ensure read-only
    return arr.map((v) => ({ ...v })).sort((a, b) => a.verse - b.verse);
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    if (!query || query.trim().length === 0) {
      return { versionId, query, results: [], total: 0 };
    }
    const normQuery = normalizeForSearch(query);
    const matched: Verse[] = [];
    for (const v of entry.allVerses) {
      const normText = normalizeForSearch(v.text);
      if (normText.includes(normQuery)) matched.push({ ...v });
    }
    // Sort by canonical book order, then chapter, then verse
    const order = ORDER_MAP;
    matched.sort((a, b) => {
      const ao = order.get(a.bookId) ?? Number.MAX_SAFE_INTEGER;
      const bo = order.get(b.bookId) ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    const total = matched.length;
    const results = matched.slice(0, limit);
    return { versionId, query, results, total };
  }

  // Helpers for tests
  hasVersion(versionId: string): boolean {
    return this.store.has(versionId);
  }

  clear(): void {
    this.store.clear();
  }

  // For removal support (engine uninstall hook)
  async uninstall(versionId: string): Promise<void> {
    this.store.delete(versionId);
  }
  async remove(versionId: string): Promise<void> {
    this.store.delete(versionId);
  }
  async delete(versionId: string): Promise<void> {
    this.store.delete(versionId);
  }
}

// ---------------------------------------------------------------------------
// FakePackageSource
// ---------------------------------------------------------------------------
export interface FakePackageSourceOptions {
  versions?: BibleVersion[];
  // Map versionId -> bytes
  packages?: Map<string, Uint8Array> | Record<string, Uint8Array>;
}

export class FakePackageSource implements BiblePackageSource {
  private versions: BibleVersion[];
  private packages: Map<string, Uint8Array>;

  constructor(options?: FakePackageSourceOptions) {
    // Default static versions: ara and nvi
    this.versions = options?.versions ?? [
      { id: "ara", name: "ARA", language: "pt-BR", totalBooks: 66 },
      { id: "nvi", name: "NVI", language: "pt-BR", totalBooks: 66 },
      { id: "acf", name: "ACF", language: "pt-BR", totalBooks: 66 },
    ];
    this.packages = new Map<string, Uint8Array>();
    if (options?.packages) {
      const rec = options.packages;
      if (rec instanceof Map) {
        for (const [k, v] of rec.entries()) this.packages.set(k, v);
      } else {
        for (const [k, v] of Object.entries(rec)) this.packages.set(k, v as Uint8Array);
      }
    } else {
      // Default: provide synthetic ara
      const fixture = createAraFixture();
      this.packages.set(fixture.versionId, fixture.bytes);
      // Also provide generic synthetic for other versions (reuse same data with different versionId)
      for (const ver of this.versions) {
        if (!this.packages.has(ver.id)) {
          const bytes = createSyntheticBibleBytes(ver.id, fixture.books, fixture.verses, ver.name);
          this.packages.set(ver.id, bytes);
        }
      }
    }
  }

  async listAvailable(): Promise<BibleVersion[]> {
    return this.versions.map((v) => ({ ...v }));
  }

  async fetchPackage(versionId: string, signal?: AbortSignal, observer?: InstallationObserver): Promise<Uint8Array> {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const bytes = this.packages.get(versionId);
    if (!bytes) throw new EngineError("invalid_package", `Package not found: ${versionId}`);
    // Simulate progress observer callbacks
    if (observer) {
      try {
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes: bytes.length });
        // small chunk simulation
        const mid = Math.floor(bytes.length / 2);
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: mid, totalBytes: bytes.length });
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: bytes.length, totalBytes: bytes.length });
      } catch {
        // ignore observer errors
      }
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    // Return copy
    return new Uint8Array(bytes);
  }

  // Test helpers
  setPackage(versionId: string, bytes: Uint8Array): void {
    this.packages.set(versionId, bytes);
  }

  setVersions(versions: BibleVersion[]): void {
    this.versions = versions.map((v) => ({ ...v }));
  }
}
