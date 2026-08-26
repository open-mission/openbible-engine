import { BOOKS } from "@openbible/engine-core";
import type { BibleBook } from "@openbible/engine-core";

/**
 * Maps the legacy Open Bible integer book ids (1..66, canonical order) to the
 * engine's canonical domain ids (`gen`, `exo`, ..., `rev`).
 *
 * `BOOKS` is already in the legacy order (index 0 => int 1). Ids outside
 * 1..66, or a canonical id not present in `BOOKS`, produce no mapping.
 */
const INT_TO_BOOK: Map<number, BibleBook> = new Map();
const BOOK_TO_INT: Map<string, number> = new Map();
BOOKS.forEach((book, index) => {
  const intId = index + 1;
  INT_TO_BOOK.set(intId, book);
  BOOK_TO_INT.set(book.id, intId);
});

export function bookIdToInt(bookId: string): number | undefined {
  return BOOK_TO_INT.get(bookId);
}

export function intToBook(intId: number): BibleBook | undefined {
  return INT_TO_BOOK.get(intId);
}

export function intToCanonicalId(intId: number): string | undefined {
  return INT_TO_BOOK.get(intId)?.id;
}

export const MAX_BOOK_ID = BOOKS.length; // 66
