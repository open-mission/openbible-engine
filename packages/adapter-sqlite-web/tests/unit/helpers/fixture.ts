import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { BibleBook } from "@openbible/engine-core";

export interface VerseRow {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface FixtureOptions {
  versionId?: string;
  name?: string;
  books?: Array<{ bookId: string; intId: number; verses?: VerseRow[] }>;
  includeTables?: boolean;
}

/**
 * Build a minimal SQLite database using the legacy Open Bible schema
 * (`metadata(name[, versionId])`, `book(id INTEGER)`, `verse(book_id, chapter,
 * verse, text)`), returning its bytes.
 */
export function buildLegacyFixture(opts: FixtureOptions = {}): Uint8Array {
  const dir = mkdtempSync(join(tmpdir(), "openbible-fixture-"));
  const file = join(dir, "bible.db");
  const db = new DatabaseSync(file);
  try {
    if (opts.includeTables !== false) {
      db.exec(`
        CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE book (id INTEGER PRIMARY KEY);
        CREATE TABLE verse (book_id INTEGER, chapter INTEGER, verse INTEGER, text TEXT);
      `);
      const insMeta = db.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)");
      insMeta.run("name", opts.name ?? "Teste");
      if (opts.versionId) {
        insMeta.run("versionId", opts.versionId);
      }
    }
    const books = opts.books ?? [
      { bookId: "gen", intId: 1, verses: [{ chapter: 1, verse: 1, text: "No princípio..." }] },
    ];
    const insBook = db.prepare("INSERT INTO book (id) VALUES (?)");
    const insVerse = db.prepare(
      "INSERT INTO verse (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)",
    );
    for (const b of books) {
      insBook.run(b.intId);
      for (const v of b.verses ?? []) {
        insVerse.run(b.intId, v.chapter, v.verse, v.text);
      }
    }
  } finally {
    db.close();
  }
  const bytes = new Uint8Array(readFileSync(file));
  rmSync(dir, { recursive: true, force: true });
  return bytes;
}

const NON_SQLITE = new Uint8Array(32).fill(0x41);

export const INVALID_BYTES = NON_SQLITE;

export const GEN_VERSES: VerseRow[] = [
  { chapter: 1, verse: 1, text: "No princípio criou Deus os céus e a terra." },
  { chapter: 1, verse: 2, text: "E a terra era sem forma e vazia." },
  { chapter: 1, verse: 3, text: "E disse Deus: Haja luz." },
];

export const LEGACY_FIXTURE = buildLegacyFixture({
  versionId: "ara",
  name: "ARA",
  books: [
    { bookId: "gen", intId: 1, verses: GEN_VERSES },
    { bookId: "exo", intId: 2, verses: [{ chapter: 1, verse: 1, text: "Estes são os nomes..." }] },
    { bookId: "jhn", intId: 43, verses: [{ chapter: 1, verse: 1, text: "No princípio era o Verbo." }] },
  ],
});
