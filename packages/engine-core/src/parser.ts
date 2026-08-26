import type { BibleBook } from "./types.js";

export interface ParsedReference {
  book: BibleBook;
  chapter: number;
  verse?: number;
}

function normalizeForParse(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getBookKeys(book: BibleBook): string[] {
  const keys: string[] = [];
  const add = (s: string) => {
    const n = normalizeForParse(s);
    if (n && !keys.includes(n)) keys.push(n);
  };
  add(book.id);
  add(book.abbreviation);
  add(book.name);
  // collapsed name without spaces: "1 corintios" -> "1corintios"
  add(book.name.replace(/\s+/g, ""));
  // also collapsed abbreviation without spaces (already)
  // spaced variant for numbered books: "1co" -> "1 co"
  if (/^\d/.test(book.id)) {
    const spaced = book.id.replace(/^(\d)/, "$1 ").trim();
    add(spaced);
    // also for abbreviation
    const abbrSpaced = book.abbreviation.replace(/^(\d)/, "$1 ").trim();
    add(abbrSpaced);
    // name already has space "1 corintios", but also ensure "1corintios" already added
  }
  // Also add id without accents already handled
  return keys;
}

function buildExactMap(books: BibleBook[]): Map<string, BibleBook> {
  const map = new Map<string, BibleBook>();
  for (const b of books) {
    for (const k of getBookKeys(b)) {
      map.set(k, b);
    }
  }
  return map;
}

/**
 * Parse a free-form reference string.
 * Supports: rt 3, GN 50, 1co13, genesis 1, rt:3, sl.23, Gn 1:15, 1Jo 3:16, jo 3 16, with accents.
 * Returns null for empty, ambiguous, chapter 0 or out of range, etc.
 */
export function parseReference(
  input: string,
  books: BibleBook[],
): ParsedReference | null {
  if (typeof input !== "string") return null;
  const normInput = normalizeForParse(input);
  if (!normInput) return null;

  const exactMap = buildExactMap(books);

  // Collect all keys sorted descending length for prefix matching of input startsWith key
  // Also needed for prefix uniqueness checks
  // Build list of all keys (dedup)
  const allKeysSet = new Set<string>();
  for (const b of books) {
    for (const k of getBookKeys(b)) allKeysSet.add(k);
  }
  const allKeys = [...allKeysSet].sort((a, b) => b.length - a.length);

  let found: { book: BibleBook; remainder: string } | null = null;

  // Brute force over split point
  // Iterate i from normInput.length down to 1 to prefer longest book prefix
  for (let i = normInput.length; i >= 1; i--) {
    const candidateRaw = normInput.slice(0, i);
    let candidateNorm = normalizeForParse(candidateRaw).replace(/[:.\s]+$/g, "").trim();
    if (!candidateNorm) continue;

    // Try exact map
    const exactBook = exactMap.get(candidateNorm);
    if (exactBook) {
      const remainderRaw = normInput.slice(i).trim();
      const remainder = remainderRaw.replace(/^[:.\s]+/g, "").trim();
      if (remainder === "" || /^\d/.test(remainder)) {
        found = { book: exactBook, remainder };
        break;
      }
      // remainder not starting with digit nor empty -> candidate invalid, continue
      continue;
    }

    // Prefix uniqueness: candidate is prefix of unique book key
    if (candidateNorm.length < 2) continue;
    // Quick filter: candidate must be alphabetic prefix (with optional leading digit)
    // Find books where any key startsWith candidateNorm
    const matches: BibleBook[] = [];
    const seen = new Set<string>();
    for (const b of books) {
      const keys = getBookKeys(b);
      for (const k of keys) {
        if (k.startsWith(candidateNorm)) {
          if (!seen.has(b.id)) {
            seen.add(b.id);
            matches.push(b);
          }
          break;
        }
      }
    }
    if (matches.length === 1) {
      const remainderRaw = normInput.slice(i).trim();
      const remainder = remainderRaw.replace(/^[:.\s]+/g, "").trim();
      if (remainder === "" || /^\d/.test(remainder)) {
        found = { book: matches[0], remainder };
        break;
      }
    }
    // if 0 or >1 matches, continue searching shorter candidate
  }

  // Fallback: also try alternative strategy using token split for cases like "1co13" where key is prefix of input
  // The above loop already handles exactMap prefix via i iteration, but we also need to consider case where normInput startsWith key even when candidateRaw not exactly key due to trailing chars without separator.
  // Example: normInput "1co13" - during loop i=3 candidate "1co" exact found -> remainder "13" -> found.
  // So already covered.

  // Additional fallback: try to match allKeys as prefix of normInput directly (more robust for keys longer than candidate)
  if (!found) {
    for (const key of allKeys) {
      if (normInput === key) {
        const b = exactMap.get(key);
        if (b) {
          found = { book: b, remainder: "" };
          break;
        }
      }
      if (normInput.startsWith(key)) {
        const remainderRaw = normInput.slice(key.length).trim();
        const remainder = remainderRaw.replace(/^[:.\s]+/g, "").trim();
        if (remainder === "" || /^\d/.test(remainder)) {
          // Ensure next char after key is separator or digit (to avoid partial overlapping like "gen" matching "genesis" when input is "genesis"? That's okay "gen" is prefix of "genesis" but we want longest match; since allKeys sorted desc, "genesis" longer would be checked first.
          const b = exactMap.get(key);
          if (b) {
            found = { book: b, remainder };
            break;
          }
        }
      }
    }
  }

  if (!found) return null;

  const { book, remainder } = found;

  if (remainder === "") {
    // Just book supplied -> default chapter 1 as per spec
    return { book, chapter: 1 };
  }

  // Parse chapter and optional verse
  const parts = remainder.split(/[:\s.]+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    return { book, chapter: 1 };
  }

  const chapterStr = parts[0] ?? "";
  const verseStr = parts[1];

  const chapter = Number.parseInt(chapterStr, 10);
  if (!Number.isFinite(chapter) || String(chapter) !== chapterStr.replace(/^0+/, "") && chapterStr !== "0" && chapter !== 0) {
    // Use strict parse: ensure integer representation
    if (Number.isNaN(chapter)) return null;
  }
  // Validate chapter integer
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
    return null;
  }

  if (verseStr !== undefined) {
    const verse = Number.parseInt(verseStr, 10);
    if (!Number.isInteger(verse) || verse < 1) return null;
    // Verse upper bound not validated against chapterVerseCounts (unknown), just ensure >=1
    return { book, chapter, verse };
  }

  return { book, chapter };
}

/**
 * Alternative helper that returns BibleReference shape.
 */
export function parseReferenceToBibleReference(
  input: string,
  books: BibleBook[],
): { bookId: string; chapter: number; verseStart?: number; verseEnd?: number } | null {
  const parsed = parseReference(input, books);
  if (!parsed) return null;
  return {
    bookId: parsed.book.id,
    chapter: parsed.chapter,
    verseStart: parsed.verse,
    verseEnd: parsed.verse,
  };
}
