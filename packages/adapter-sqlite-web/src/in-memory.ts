import { EngineError, BOOKS } from "@openbible/engine-core";
import type { BibleBook, SearchResult, Verse } from "@openbible/engine-core";
import type { BibleLibrary } from "@openbible/engine";

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
const SQLITE_HEADER = new TextEncoder().encode(SQLITE_HEADER_TEXT);

function canonicalOrder(): Map<string, number> {
  const m = new Map<string, number>();
  BOOKS.forEach((b, idx) => m.set(b.id, idx));
  return m;
}
const ORDER = canonicalOrder();

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function normalizeForSearch(s: string): string {
  return stripAccents(s).toLowerCase();
}

interface WebStoreEntry {
  books: BibleBook[];
  versesByKey: Map<string, Verse[]>;
  allVerses: Verse[];
  versionName: string;
}

function parseSyntheticBytes(bytes: Uint8Array): { versionId: string; name: string; books: BibleBook[]; verses: Verse[] } {
  if (bytes.length < SQLITE_HEADER.length) throw new EngineError("invalid_package", "Invalid package: missing SQLite header");
  for (let i = 0; i < SQLITE_HEADER.length; i++) if (bytes[i] !== SQLITE_HEADER[i]) throw new EngineError("invalid_package", "Invalid package: SQLite header mismatch");
  const payloadBytes = bytes.slice(SQLITE_HEADER.length);
  const text = new TextDecoder().decode(payloadBytes);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new EngineError("unsupported_schema", "Unsupported schema: missing JSON payload");
  const jsonText = text.slice(start, end + 1);
  const lower = jsonText.toLowerCase();
  if (!lower.includes("metadata") || !lower.includes("book") || !lower.includes("verse")) {
    throw new EngineError("unsupported_schema", "Unsupported schema: missing required tables");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new EngineError("unsupported_schema", "Unsupported schema: invalid JSON", { cause: e });
  }
  const obj = parsed as Record<string, unknown>;
  const meta = obj["metadata"] as Record<string, unknown> | undefined;
  let versionIdRaw: string | undefined;
  if (meta && typeof meta["versionId"] === "string") versionIdRaw = meta["versionId"] as string;
  else if (meta && typeof meta["id"] === "string") versionIdRaw = meta["id"] as string;
  else if (typeof obj["versionId"] === "string") versionIdRaw = obj["versionId"] as string;
  const name = (meta?.["name"] as string) ?? (obj["name"] as string) ?? versionIdRaw ?? "unknown";
  const books = (obj["books"] as BibleBook[]) ?? [];
  const verses = (obj["verses"] as Verse[]) ?? [];
  return { versionId: versionIdRaw ?? name, name, books, verses };
}

/**
 * InMemoryWebLibrary - web boundary separate class but same logic as native for milestone.
 * Future will use OPFS/Worker; now delegates to in-memory map.
 */
export class InMemoryWebLibrary implements BibleLibrary {
  private store = new Map<string, WebStoreEntry>();

  async install(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.installPackage(versionId, bytes);
  }

  async installPackage(versionId: string, bytes: Uint8Array): Promise<void> {
    const parsed = parseSyntheticBytes(bytes);
    const versesByKey = new Map<string, Verse[]>();
    for (const v of parsed.verses) {
      const key = `${v.bookId}-${v.chapter}`;
      const arr = versesByKey.get(key) ?? [];
      arr.push({ ...v });
      versesByKey.set(key, arr);
    }
    for (const [, arr] of versesByKey) arr.sort((a, b) => a.verse - b.verse);
    this.store.set(versionId, {
      books: parsed.books.map((b) => ({ ...b })),
      versesByKey,
      allVerses: parsed.verses.map((v) => ({ ...v })),
      versionName: parsed.name,
    });
  }

  async save(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.installPackage(versionId, bytes);
  }

  async validatePackage(bytes: Uint8Array): Promise<{ valid: boolean; versionId?: string }> {
    try {
      const p = parseSyntheticBytes(bytes);
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
    const cloned = entry.books.map((b) => ({ ...b }));
    return cloned.sort((a, b) => {
      const ao = ORDER.get(a.id);
      const bo = ORDER.get(b.id);
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
    return arr.map((v) => ({ ...v })).sort((a, b) => a.verse - b.verse);
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const entry = this.store.get(versionId);
    if (!entry) throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
    const normQuery = normalizeForSearch(query);
    const matched: Verse[] = [];
    for (const v of entry.allVerses) {
      if (normalizeForSearch(v.text).includes(normQuery)) matched.push({ ...v });
    }
    matched.sort((a, b) => {
      const ao = ORDER.get(a.bookId) ?? Number.MAX_SAFE_INTEGER;
      const bo = ORDER.get(b.bookId) ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    const total = matched.length;
    const results = matched.slice(0, limit);
    return { versionId, query, results, total };
  }

  async uninstall(versionId: string): Promise<void> {
    this.store.delete(versionId);
  }
  async remove(versionId: string): Promise<void> {
    return this.uninstall(versionId);
  }
  async delete(versionId: string): Promise<void> {
    return this.uninstall(versionId);
  }

  hasVersion(versionId: string): boolean {
    return this.store.has(versionId);
  }
  clear(): void {
    this.store.clear();
  }
}
