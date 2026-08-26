import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BOOKS } from "@openbible/engine-core";
import type { BibleBook, Verse } from "@openbible/engine-core";
import { nodeSqliteDriverFactory } from "./driver.js";
import type { DriverFactory } from "./driver.js";
import { bookIdToInt } from "./legacy-book-map.js";

export const LEGACY_ARABIC_VERSION_ID = "ara";
export const LEGACY_ARABIC_VERSION_NAME = "ARA";

// Old Testament + New Testament sample to prove int→canonical mapping and order.
function bookIds(): string[] {
  return ["gen", "exo", "jhn"];
}

function buildBooks(ids: string[]): BibleBook[] {
  return ids.map((id) => ({ ...BOOKS.find((b) => b.id === id)! }));
}

function buildVerses(ids: string[]): Verse[] {
  const templates = [
    "No princípio criou Deus os céus e a terra.",
    "E a terra era sem forma e vazia.",
    "E disse Deus: Haja luz; e houve luz.",
    "Deus criou o homem à sua imagem.",
    "Cantai ao Senhor porque Deus é fiel.",
    "Deus criou as luzes no firmamento.",
  ];
  const verses: Verse[] = [];
  let idx = 0;
  for (const bookId of ids) {
    for (let chapter = 1; chapter <= 2; chapter++) {
      for (let verse = 1; verse <= 3; verse++) {
        const text =
          bookId === "gen" && chapter === 1 && verse === 1
            ? "No princípio criou Deus os céus e a terra."
            : `${templates[idx % templates.length]} (${bookId} ${chapter}:${verse})`;
        idx++;
        verses.push({ id: `${bookId}-${chapter}-${verse}`, bookId, chapter, verse, text });
      }
    }
  }
  return verses;
}

export interface LegacySqliteFixture {
  versionId: string;
  name: string;
  books: BibleBook[];
  verses: Verse[];
  bytes: Uint8Array;
}

/**
 * Builds a real SQLite bible that reproduces the legacy Open Bible schema:
 *   book(id INTEGER PRIMARY KEY), verse(book_id INTEGER, chapter, verse, text), metadata(key,value)
 * `metadata` holds only `name` (no `versionId` required). An extra `translation`
 * column and an extra metadata key are added to prove extra fields do not break
 * reads. No protected biblical content.
 */
export function buildLegacySqliteBibleFixture(
  versionId: string,
  name: string,
  driverFactory: DriverFactory = nodeSqliteDriverFactory,
): LegacySqliteFixture {
  const books = buildBooks(bookIds());
  const verses = buildVerses(bookIds());
  const dir = mkdtempSync(join(tmpdir(), "ob-node-"));
  const file = join(dir, "bible.db");
  const driver = driverFactory(file, { readOnly: false });
  try {
    driver.exec("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    driver.exec("CREATE TABLE book (id INTEGER PRIMARY KEY)");
    driver.exec(
      "CREATE TABLE verse (book_id INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL, text TEXT NOT NULL, translation TEXT DEFAULT '', PRIMARY KEY (book_id, chapter, verse))",
    );
    driver.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("name", name);
    driver.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("copyright", "synthetic fixture");
    for (const b of books) {
      const intId = bookIdToInt(b.id);
      if (intId !== undefined) driver.prepare("INSERT INTO book (id) VALUES (?)").run(intId);
    }
    for (const v of verses) {
      const intId = bookIdToInt(v.bookId);
      if (intId !== undefined) {
        driver.prepare("INSERT INTO verse (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)").run(
          intId,
          v.chapter,
          v.verse,
          v.text,
        );
      }
    }
  } finally {
    driver.close();
  }
  const bytes = new Uint8Array(readFileSync(file));
  rmSync(dir, { recursive: true, force: true });
  return { versionId, name, books, verses, bytes };
}

export const LEGACY_ARA_FIXTURE = buildLegacySqliteBibleFixture(LEGACY_ARABIC_VERSION_ID, LEGACY_ARABIC_VERSION_NAME);
