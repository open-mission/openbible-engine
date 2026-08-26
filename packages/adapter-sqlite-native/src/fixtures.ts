import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BOOKS } from "@openbible/engine-core";
import type { BibleBook, Verse } from "@openbible/engine-core";
import { nodeSqliteDriverFactory } from "./driver.js";
import type { DriverFactory } from "./driver.js";

export const REAL_ARABIC_VERSION_ID = "ara";
export const REAL_ARABIC_VERSION_NAME = "ARA";

function buildBooks(): BibleBook[] {
  return ["gen", "exo", "psa"].map((id) => ({ ...BOOKS.find((b) => b.id === id)! }));
}

function buildVerses(books: BibleBook[]): Verse[] {
  const templates = [
    "No princípio Deus criou os céus e a terra",
    "E Deus viu que era bom e Deus amou a criação",
    "Porque Deus amou o mundo de tal maneira",
    "Deus criou o homem à sua imagem",
    "Cantai ao Senhor porque Deus é fiel",
    "Deus criou as luzes no firmamento",
  ];
  const verses: Verse[] = [];
  let idx = 0;
  for (const book of books) {
    for (let chapter = 1; chapter <= 2; chapter++) {
      for (let verse = 1; verse <= 3; verse++) {
        let text: string;
        if (book.id === "gen" && chapter === 1 && verse === 1) {
          text = "No princípio Deus criou os céus e a terra";
        } else {
          text = `${templates[idx % templates.length]} (${book.id} ${chapter}:${verse})`;
        }
        idx++;
        verses.push({ id: `${book.id}-${chapter}-${verse}`, bookId: book.id, chapter, verse, text });
      }
    }
  }
  return verses;
}

export interface RealSqliteFixture {
  versionId: string;
  name: string;
  books: BibleBook[];
  verses: Verse[];
  bytes: Uint8Array;
}

/**
 * Builds a real SQLite bible file (metadata/book/verse tables) and returns its
 * raw bytes. Generated for tests; no protected biblical content.
 */
export function buildRealSqliteBibleFixture(
  versionId: string,
  name: string,
  driverFactory: DriverFactory = nodeSqliteDriverFactory,
): RealSqliteFixture {
  const books = buildBooks();
  const verses = buildVerses(books);
  const dir = mkdtempSync(join(tmpdir(), "ob-engine-"));
  const file = join(dir, "bible.db");
  const driver = driverFactory(file, { readOnly: false });
  try {
    driver.exec("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    driver.exec("CREATE TABLE book (id TEXT PRIMARY KEY, name TEXT NOT NULL)");
    driver.exec(
      "CREATE TABLE verse (book_id TEXT NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL, text TEXT NOT NULL, PRIMARY KEY (book_id, chapter, verse))",
    );
    driver.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("versionId", versionId);
    driver.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("name", name);
    for (const b of books) driver.prepare("INSERT INTO book (id, name) VALUES (?, ?)").run(b.id, b.name);
    for (const v of verses) {
      driver.prepare("INSERT INTO verse (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)").run(
        v.bookId,
        v.chapter,
        v.verse,
        v.text,
      );
    }
  } finally {
    driver.close();
  }
  const bytes = new Uint8Array(readFileSync(file));
  rmSync(dir, { recursive: true, force: true });
  return { versionId, name, books, verses, bytes };
}

export const REAL_ARA_FIXTURE = buildRealSqliteBibleFixture(REAL_ARABIC_VERSION_ID, REAL_ARABIC_VERSION_NAME);
