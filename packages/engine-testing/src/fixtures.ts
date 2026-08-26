import type { BibleBook, Verse } from "@openbible/engine-core";
import { BOOKS } from "@openbible/engine-core";

/**
 * Synthetic in-memory bible data used by fakes and contract tests.
 *
 * This is NOT a storage fixture: real SQLite bytes are produced by
 * `buildLegacySqliteBibleFixture` in `@openbible/adapter-sqlite-node`. The
 * module-level fakes store plain data objects, never "header + JSON" bytes.
 */

export const ARA_VERSION_ID = "ara";
export const ARA_VERSION_NAME = "ARA";

function buildDefaultBooks(): BibleBook[] {
  return ["gen", "exo", "psa"].map((id) => ({ ...BOOKS.find((b) => b.id === id)! }));
}

function buildDefaultVerses(books: BibleBook[]): Verse[] {
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
        const text =
          book.id === "gen" && chapter === 1 && verse === 1
            ? "No princípio Deus criou os céus e a terra"
            : `${templates[idx % templates.length]} (${book.id} ${chapter}:${verse})`;
        idx++;
        verses.push({ id: `${book.id}-${chapter}-${verse}`, bookId: book.id, chapter, verse, text });
      }
    }
  }
  return verses;
}

export interface BibleFixtureData {
  versionId: string;
  name: string;
  books: BibleBook[];
  verses: Verse[];
}

/** Default ARA fixture (no bytes). */
export function createAraFixture(): BibleFixtureData {
  const books = buildDefaultBooks();
  const verses = buildDefaultVerses(books);
  return { versionId: ARA_VERSION_ID, name: ARA_VERSION_NAME, books, verses };
}

/** Fixture for an arbitrary version id/name using the same sample data. */
export function createFixture(versionId: string, name: string): BibleFixtureData {
  const books = buildDefaultBooks();
  const verses = buildDefaultVerses(books);
  return { versionId, name, books, verses };
}

export const DEFAULT_ARA_FIXTURE: BibleFixtureData = createAraFixture();
export const DEFAULT_ARA_BOOKS: BibleBook[] = DEFAULT_ARA_FIXTURE.books;
export const DEFAULT_ARA_VERSES: Verse[] = DEFAULT_ARA_FIXTURE.verses;
