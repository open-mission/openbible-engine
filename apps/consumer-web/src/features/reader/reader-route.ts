import { stripAccents, type BibleBook } from "@openbible/engine-core";

function routeSegment(value: string): string {
  return stripAccents(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bookRouteSegment(book: BibleBook, books: readonly BibleBook[] = []): string {
  const abbreviation = routeSegment(book.abbreviation) || routeSegment(book.id);
  const hasCollision = books.some((candidate) => candidate.id !== book.id && routeSegment(candidate.abbreviation) === abbreviation);
  return hasCollision ? routeSegment(book.id) : abbreviation;
}

export function findBookByRouteSegment(books: readonly BibleBook[], segment: string): BibleBook | undefined {
  const normalized = routeSegment(segment);
  return books.find((book) => bookRouteSegment(book, books) === normalized);
}

export function readerPath(versionId: string, bookSegment: string, chapter: number): string {
  return `/${encodeURIComponent(versionId)}/${encodeURIComponent(bookSegment)}/${chapter}`;
}
