import { EngineError } from "@openbible/engine-core";
import type { BibleBook, Verse, SearchResult } from "@openbible/engine-core";
import type { BibleLibrary } from "@openbible/engine";
import type { PoolLike, DbHandle } from "../pool.js";
import { finalPath } from "./paths.js";
import { bookIdToInt, intToBook, intToCanonicalId } from "./legacy-book-map.js";

interface RawVerse {
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

function rowToVerse(raw: RawVerse): Verse | null {
  const canonical = intToCanonicalId(Number(raw.book_id));
  if (!canonical) return null;
  return {
    id: `${canonical}-${Number(raw.chapter)}-${Number(raw.verse)}`,
    bookId: canonical,
    chapter: Number(raw.chapter),
    verse: Number(raw.verse),
    text: String(raw.text),
  };
}

function readMetadata(db: DbHandle, key: string): string | null {
  const row = db.prepare("SELECT value FROM metadata WHERE key = ?").get(key);
  return row ? String(row.value) : null;
}

/**
 * Read-only library over the legacy schema held in the SAHPool. Connections are
 * opened per version and held until `closeVersion`/`close`; the installer
 * closes a version's handle before replacing its file (SAHPool import on an
 * open db is undefined).
 */
export class WebLibrary implements BibleLibrary {
  private open = new Map<string, DbHandle>();
  private closed = false;

  constructor(private readonly pool: PoolLike) {}

  closeVersion(versionId: string): void {
    const handle = this.open.get(versionId);
    if (handle) {
      handle.close();
      this.open.delete(versionId);
    }
  }

  close(): void {
    for (const handle of this.open.values()) {
      try {
        handle.close();
      } catch {
        // ignore
      }
    }
    this.open.clear();
    this.closed = true;
  }

  private require(versionId: string): DbHandle {
    if (this.closed) throw new EngineError("storage_unavailable", "Bible library is closed");
    let handle = this.open.get(versionId);
    if (!handle) {
      handle = this.pool.open(finalPath(versionId), { readOnly: true, create: false });
      this.open.set(versionId, handle);
    }
    handle.prepare("SELECT COUNT(*) AS c FROM metadata").get();
    return handle;
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    const db = this.require(versionId);
    const rows = db
      .prepare(
        "SELECT b.id, MAX(v.chapter) AS chapters FROM book b JOIN verse v ON v.book_id = b.id GROUP BY b.id ORDER BY b.id",
      )
      .all();
    const books: BibleBook[] = [];
    for (const row of rows) {
      const book = intToBook(Number(row.id));
      if (!book) continue;
      books.push({ ...book, chapters: Number(row.chapters) });
    }
    return books;
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    const intId = bookIdToInt(bookId);
    if (intId === undefined) return [];
    const rows = this.require(versionId)
      .prepare("SELECT book_id, chapter, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse")
      .all(intId, chapter) as unknown as RawVerse[];
    const verses: Verse[] = [];
    for (const r of rows) {
      const v = rowToVerse(r);
      if (v) verses.push(v);
    }
    return verses;
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const db = this.require(versionId);
    if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
    const pattern = `%${query}%`;
    const total = Number(
      (db.prepare("SELECT COUNT(*) AS c FROM verse WHERE text LIKE ? COLLATE NOCASE").get(pattern) as {
        c: number;
      }).c,
    );
    const rows = db
      .prepare(
        "SELECT book_id, chapter, verse, text FROM verse WHERE text LIKE ? COLLATE NOCASE ORDER BY book_id, chapter, verse LIMIT ?",
      )
      .all(pattern, limit) as unknown as RawVerse[];
    const results: Verse[] = [];
    for (const r of rows) {
      const c = rowToVerse(r);
      if (c) results.push(c);
    }
    return { versionId, query, results, total };
  }

  async getVersionName(versionId: string): Promise<string | null> {
    return readMetadata(this.require(versionId), "name");
  }
}
