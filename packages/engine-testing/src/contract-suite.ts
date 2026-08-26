import type { BibleLibrary } from "@openbible/engine";
import { BOOKS } from "@openbible/engine-core";
import type { BibleBook, Verse } from "@openbible/engine-core";

/**
 * Shared assertion helper that throws on failure.
 */
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Contract assertion failed: ${message}`);
}

function canonicalOrderMap(): Map<string, number> {
  const m = new Map<string, number>();
  BOOKS.forEach((b, idx) => m.set(b.id, idx));
  return m;
}

const ORDER = canonicalOrderMap();

function isSortedByCanonical(books: BibleBook[]): boolean {
  for (let i = 1; i < books.length; i++) {
    const prev = ORDER.get(books[i - 1].id) ?? Number.MAX_SAFE_INTEGER;
    const curr = ORDER.get(books[i].id) ?? Number.MAX_SAFE_INTEGER;
    if (curr < prev) return false;
    if (curr === prev && books[i - 1].id.localeCompare(books[i].id) > 0) return false;
  }
  return true;
}

function isSortedVerses(verses: Verse[]): boolean {
  for (let i = 1; i < verses.length; i++) {
    if (verses[i].verse < verses[i - 1].verse) return false;
  }
  return true;
}

function isSearchSorted(results: Verse[]): boolean {
  for (let i = 1; i < results.length; i++) {
    const a = results[i - 1];
    const b = results[i];
    const ao = ORDER.get(a.bookId) ?? 9999;
    const bo = ORDER.get(b.bookId) ?? 9999;
    if (bo < ao) return false;
    if (bo === ao) {
      if (b.chapter < a.chapter) return false;
      if (b.chapter === a.chapter && b.verse < a.verse) return false;
    }
  }
  return true;
}

export interface ContractSuiteOptions {
  // Optional books/chapters to test existence; if omitted uses whatever library returns
  expectedBookIds?: string[];
}

/**
 * runContractSuite - validates a BibleLibrary implementation against shared contract.
 * Tests:
 *  - getBooks returns sorted by canonical order, non-empty, no duplicates
 *  - getChapter returns verses sorted by verse ASC, filtered correctly, empty for non-existent? (but engine validates)
 *  - search is case-insensitive substring, returns sorted by canonical book order + chapter + verse, respects limit, total
 *  - getVersionName returns string or null
 */
export async function runContractSuite(library: BibleLibrary, versionId: string, options?: ContractSuiteOptions): Promise<void> {
  const vid = versionId;

  // 1. getBooks
  const books = await library.getBooks(vid);
  assert(Array.isArray(books), "getBooks must return array");
  assert(books.length > 0, "getBooks must return non-empty");
  // No duplicate ids
  const ids = books.map((b) => b.id);
  const uniq = new Set(ids);
  assert(uniq.size === ids.length, "getBooks must not have duplicate ids");
  assert(isSortedByCanonical(books), `getBooks must be sorted by canonical BOOKS order. Got: ${ids.join(",")}`);
  if (options?.expectedBookIds) {
    for (const expected of options.expectedBookIds) {
      assert(ids.includes(expected), `getBooks must contain expected book ${expected}`);
    }
  }

  // 2. getChapter - test first book, first two chapters
  for (const book of books.slice(0, Math.min(2, books.length))) {
    for (let chapter = 1; chapter <= Math.min(2, book.chapters); chapter++) {
      const verses = await library.getChapter(vid, book.id, chapter);
      assert(Array.isArray(verses), `getChapter ${book.id} ${chapter} must return array`);
      // If we know fixture has 3 verses per chapter, assert non-empty
      // But generic: if verses non-empty, check sorting and filtering
      if (verses.length > 0) {
        assert(isSortedVerses(verses), `getChapter ${book.id} ${chapter} verses must be sorted by verse ASC`);
        for (const v of verses) {
          assert(v.bookId === book.id, `verse bookId must match ${book.id} got ${v.bookId}`);
          assert(v.chapter === chapter, `verse chapter must match ${chapter} got ${v.chapter}`);
          assert(typeof v.text === "string" && v.text.length > 0, "verse text must be non-empty string");
          assert(Number.isInteger(v.verse) && v.verse >= 1, "verse number must be integer >=1");
        }
      }
    }
  }

  // 2b. Check that chapters are read-only: mutation shouldn't affect subsequent call
  if (books.length > 0) {
    const b = books[0];
    const c1 = await library.getChapter(vid, b.id, 1);
    if (c1.length > 0) {
      const originalText = c1[0].text;
      (c1[0] as unknown as Record<string, unknown>).text = "MUTATED";
      const c2 = await library.getChapter(vid, b.id, 1);
      assert(c2[0].text === originalText, "getChapter should return copy/read-only, mutation must not persist");
    }
  }

  // 3. search
  // Case-insensitive substring test: search for "Deus" should find results (ARA fixture contains it)
  const searchA = await library.search(vid, "Deus", 10);
  assert(searchA.versionId === vid, "search versionId must match");
  assert(searchA.query === "Deus", "search query must echo");
  assert(Array.isArray(searchA.results), "search results must be array");
  assert(typeof searchA.total === "number", "search total must be number");
  assert(searchA.total >= searchA.results.length, "total >= results.length");
  assert(searchA.results.length <= 10, "limit respected");
  if (searchA.results.length > 1) {
    assert(isSearchSorted(searchA.results), `search results must be sorted by canonical order, chapter, verse`);
  }
  // Verify each result text contains query case-insensitive
  const lowerQuery = "deus".toLowerCase();
  for (const r of searchA.results) {
    const norm = r.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    assert(norm.includes(lowerQuery), `search result text must contain query "Deus" case-insensitive, got "${r.text}"`);
  }

  // 3b. case-insensitive: lower vs upper should give same count
  const searchLower = await library.search(vid, "deus", 10);
  const searchUpper = await library.search(vid, "DEUS", 10);
  assert(searchLower.total === searchUpper.total, "search must be case-insensitive (deus vs DEUS)");
  assert(searchLower.results.length === searchUpper.results.length, "case-insensitive length match");

  // 3c. limit enforced and ordering consistent with larger limit
  const searchLimited = await library.search(vid, "Deus", 2);
  assert(searchLimited.results.length <= 2, "limit 2");
  if (searchA.results.length >= 2) {
    assert(searchLimited.results[0].id === searchA.results[0].id, "limited results should be prefix of larger limit results");
    if (searchLimited.results.length === 2) {
      assert(searchLimited.results[1].id === searchA.results[1].id, "second limited result prefix check");
    }
  }

  // 3d. search with accent-insensitive? query "Deus" without accent should match same as with accent test using fixtures containing "criou"
  const searchCriou = await library.search(vid, "criou", 20);
  if (searchCriou.total > 0) {
    assert(isSearchSorted(searchCriou.results), "search criada sorted");
  }

  // 3e. empty query returns empty
  const emptySearch = await library.search(vid, "", 10);
  assert(emptySearch.results.length === 0 && emptySearch.total === 0, "empty query should return 0 results");

  const wsSearch = await library.search(vid, "   ", 10);
  // Libraries may treat whitespace as empty; we don't strictly require but check not crash
  assert(Array.isArray(wsSearch.results), "whitespace query should not crash");

  // 3f. search ordering: verify total and that limit truncates but total remains
  const full = await library.search(vid, "Deus", 100);
  const limited = await library.search(vid, "Deus", 3);
  assert(full.total === limited.total, "total must be same regardless of limit");
  assert(limited.results.length === Math.min(3, full.total), "limited results length correct");

  // 4. getVersionName if implemented
  if (library.getVersionName) {
    const name = await library.getVersionName(vid);
    // Can be string or null, but if string must be non-empty
    assert(name === null || (typeof name === "string" && name.length > 0), "getVersionName must be string non-empty or null");
  }

  // 5. Ensure getBooks read-only: mutation check
  const books2 = await library.getBooks(vid);
  const origLen = books2.length;
  (books2 as BibleBook[]).push({ id: "fake", name: "Fake", abbreviation: "Fk", testament: "old", chapters: 1 });
  const books3 = await library.getBooks(vid);
  assert(books3.length === origLen, "getBooks must return copy, mutation should not persist");
}

// ---------------------------------------------------------------------------
// Shared helpers for individual test files (lighter weight)
// ---------------------------------------------------------------------------

export function expectBooksSorted(books: BibleBook[]): void {
  if (!isSortedByCanonical(books)) throw new Error("Books not sorted by canonical order");
}

export function expectVersesSorted(verses: Verse[]): void {
  if (!isSortedVerses(verses)) throw new Error("Verses not sorted by verse ASC");
}

export function expectSearchSorted(results: Verse[]): void {
  if (!isSearchSorted(results)) throw new Error("Search results not sorted correctly");
}

export async function assertLibraryReadOnly(library: BibleLibrary, versionId: string): Promise<void> {
  const books = await library.getBooks(versionId);
  if (books.length === 0) return;
  const copy = [...books];
  (books as BibleBook[]).length = 0;
  const after = await library.getBooks(versionId);
  assert(after.length === copy.length, "library must be read-only / return copies");
}
