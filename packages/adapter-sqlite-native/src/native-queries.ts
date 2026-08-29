import type { LegacySqliteBible } from "./legacy-sqlite.js";
import { NATIVE_BOOKS, type NativeBook } from "./native-book-meta.js";

export interface NativeVerse {
  readonly id: string;
  readonly bookId: string;
  readonly chapter: number;
  readonly verse: number;
  readonly text: string;
}

export interface NativeSearch {
  readonly versionId: string;
  readonly query: string;
  readonly results: NativeVerse[];
  readonly total: number;
}

/** @param {number} id @returns {{ id: string, name: string, abbreviation: string, testament: "old" | "new", chapters: number } | undefined} */
function bookAt(id: number): NativeBook | undefined {
  return id >= 1 && id <= NATIVE_BOOKS.length ? NATIVE_BOOKS[id - 1] : undefined;
}

/**
 * @param {{ name: string, books: number[], verses: { bookId: number, chapter: number, verse: number, text: string }[] }} data
 * @returns {{ id: string, name: string, abbreviation: string, testament: "old" | "new", chapters: number }[]}
 */
export function nativeBooks(data: LegacySqliteBible): NativeBook[] {
  const result: NativeBook[] = [];
  for (const id of data.books) {
    const book = bookAt(id);
    if (!book) continue;
    let chapters = 0;
    for (const verse of data.verses) if (verse.bookId === id && verse.chapter > chapters) chapters = verse.chapter;
    result.push({ ...book, chapters });
  }
  return result;
}

/**
 * @param {{ name: string, books: number[], verses: { bookId: number, chapter: number, verse: number, text: string }[] }} data
 * @param {string} canonical
 * @param {number} chapter
 * @returns {{ id: string, bookId: string, chapter: number, verse: number, text: string }[]}
 */
export function nativeChapter(data: LegacySqliteBible, canonical: string, chapter: number): NativeVerse[] {
  const numeric = data.books.find((id) => bookAt(id)?.id === canonical);
  if (numeric === undefined) return [];
  return data.verses
    .filter((verse) => verse.bookId === numeric && verse.chapter === chapter)
    .sort((a, b) => a.verse - b.verse)
    .map((verse) => ({
      id: `${canonical}-${verse.chapter}-${verse.verse}`,
      bookId: canonical,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    }));
}

/**
 * @param {{ name: string, books: number[], verses: { bookId: number, chapter: number, verse: number, text: string }[] }} data
 * @param {string} versionId
 * @param {string} query
 * @param {number} limit
 * @returns {{ versionId: string, query: string, results: { id: string, bookId: string, chapter: number, verse: number, text: string }[], total: number }}
 */
export function nativeSearch(data: LegacySqliteBible, versionId: string, query: string, limit: number): NativeSearch {
  if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
  const needle = query.toLowerCase();
  const matches = data.verses
    .filter((verse) => verse.text.toLowerCase().includes(needle))
    .sort((a, b) => a.bookId - b.bookId || a.chapter - b.chapter || a.verse - b.verse);
  const results: NativeVerse[] = [];
  for (const verse of matches.slice(0, Math.max(0, limit))) {
    const canonical = bookAt(verse.bookId)?.id;
    if (canonical) {
      results.push({ id: `${canonical}-${verse.chapter}-${verse.verse}`, bookId: canonical, chapter: verse.chapter, verse: verse.verse, text: verse.text });
    }
  }
  return { versionId, query, results, total: matches.length };
}
