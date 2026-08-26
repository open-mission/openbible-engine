import type { BibleBook, Verse } from "@openbible/engine-core";
import { BOOKS } from "@openbible/engine-core";

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
const SQLITE_HEADER = new TextEncoder().encode(SQLITE_HEADER_TEXT);

export const SQLITE_HEADER_BYTES: Uint8Array = SQLITE_HEADER;
export const SQLITE_HEADER_STRING = SQLITE_HEADER_TEXT;

export interface SyntheticPayload {
  metadata: { versionId: string; name: string };
  books: BibleBook[];
  verses: Verse[];
}

/**
 * Create synthetic bible bytes: 16 bytes header + UTF8 JSON payload.
 * Payload contains {metadata:{versionId,name}, books:[...], verses:[...]}
 */
export function createSyntheticBibleBytes(
  versionId: string,
  books: BibleBook[],
  verses: Verse[],
  name?: string,
): Uint8Array {
  const payload: SyntheticPayload = {
    metadata: { versionId, name: name ?? versionId },
    books,
    verses,
  };
  const json = JSON.stringify(payload);
  const jsonBytes = new TextEncoder().encode(json);
  const out = new Uint8Array(SQLITE_HEADER.length + jsonBytes.length);
  out.set(SQLITE_HEADER, 0);
  out.set(jsonBytes, SQLITE_HEADER.length);
  return out;
}

// ---------------------------------------------------------------------------
// Default ARA fixture: 3 books (gen 50, exo 40, psa 150) each with 2 chapters, 3 verses per chapter
// Texts contain "Deus criou" etc for search tests
// ---------------------------------------------------------------------------

export const ARA_VERSION_ID = "ara";
export const ARA_VERSION_NAME = "ARA";

function buildDefaultBooks(): BibleBook[] {
  const gen = BOOKS.find((b) => b.id === "gen")!;
  const exo = BOOKS.find((b) => b.id === "exo")!;
  const psa = BOOKS.find((b) => b.id === "psa")!;
  // Return clones to avoid mutation of BOOKS
  return [gen, exo, psa].map((b) => ({ ...b }));
}

function buildDefaultVerses(books: BibleBook[]): Verse[] {
  const verses: Verse[] = [];
  // Predefined texts to ensure search coverage
  const templates: string[] = [
    "No princípio Deus criou os céus e a terra",
    "E Deus viu que era bom e Deus amou a criação",
    "Porque Deus amou o mundo de tal maneira",
    "Deus criou o homem à sua imagem",
    "Cantai ao Senhor porque Deus é fiel",
    "Deus criou as luzes no firmamento",
  ];
  let idx = 0;
  for (const book of books) {
    for (let chapter = 1; chapter <= 2; chapter++) {
      for (let verse = 1; verse <= 3; verse++) {
        // Ensure first verse of gen 1:1 has exact searchable text
        let text: string;
        if (book.id === "gen" && chapter === 1 && verse === 1) {
          text = "No princípio Deus criou os céus e a terra";
        } else if (book.id === "psa" && chapter === 1) {
          text = `Bem-aventurado o homem que confia em Deus - ${templates[idx % templates.length]}`;
        } else {
          text = `${templates[idx % templates.length]} (${book.id} ${chapter}:${verse})`;
        }
        idx++;
        verses.push({
          id: `${book.id}-${chapter}-${verse}`,
          bookId: book.id,
          chapter,
          verse,
          text,
        });
      }
    }
  }
  return verses;
}

export function createAraFixture(): { versionId: string; name: string; books: BibleBook[]; verses: Verse[]; bytes: Uint8Array } {
  const books = buildDefaultBooks();
  const verses = buildDefaultVerses(books);
  const bytes = createSyntheticBibleBytes(ARA_VERSION_ID, books, verses, ARA_VERSION_NAME);
  return { versionId: ARA_VERSION_ID, name: ARA_VERSION_NAME, books, verses, bytes };
}

// Convenience default bytes
export const DEFAULT_ARA_FIXTURE = createAraFixture();
export const DEFAULT_ARA_BYTES: Uint8Array = DEFAULT_ARA_FIXTURE.bytes;
export const DEFAULT_ARA_BOOKS: BibleBook[] = DEFAULT_ARA_FIXTURE.books;
export const DEFAULT_ARA_VERSES: Verse[] = DEFAULT_ARA_FIXTURE.verses;

// ---------------------------------------------------------------------------
// Invalid fixtures
// ---------------------------------------------------------------------------

/**
 * Bytes with invalid header (not starting with SQLite format 3)
 */
export function createInvalidHeaderFixture(): Uint8Array {
  const badHeader = new TextEncoder().encode("BAD HEADER!!!!!!"); // 16 bytes-ish
  const payload = JSON.stringify({ metadata: { versionId: "bad", name: "Bad" }, books: [], verses: [] });
  const jsonBytes = new TextEncoder().encode(payload);
  const out = new Uint8Array(badHeader.length + jsonBytes.length);
  out.set(badHeader, 0);
  out.set(jsonBytes, badHeader.length);
  return out;
}

export const INVALID_HEADER_BYTES = createInvalidHeaderFixture();

/**
 * Bytes with correct header but missing required schema markers (no metadata/book/verse substring)
 * JSON intentionally lacks those keywords.
 */
export function createMissingSchemaFixture(versionId = "ara"): Uint8Array {
  const payload = JSON.stringify({ foo: "bar", versionId, data: [] });
  const jsonBytes = new TextEncoder().encode(payload);
  const out = new Uint8Array(SQLITE_HEADER.length + jsonBytes.length);
  out.set(SQLITE_HEADER, 0);
  out.set(jsonBytes, SQLITE_HEADER.length);
  return out;
}

export const MISSING_SCHEMA_BYTES = createMissingSchemaFixture();

/**
 * Bytes with mismatched identity: metadata.versionId !== requested versionId
 */
export function createMismatchedIdentityFixture(requestedVersionId = "ara", actualVersionId = "other-version"): Uint8Array {
  const books = buildDefaultBooks();
  const verses = buildDefaultVerses(books);
  const payload = {
    metadata: { versionId: actualVersionId, name: "Other" },
    books,
    verses,
  };
  const json = JSON.stringify(payload);
  const jsonBytes = new TextEncoder().encode(json);
  const out = new Uint8Array(SQLITE_HEADER.length + jsonBytes.length);
  out.set(SQLITE_HEADER, 0);
  out.set(jsonBytes, SQLITE_HEADER.length);
  return out;
}

export const MISMATCHED_IDENTITY_BYTES = createMismatchedIdentityFixture();

// Export helpers for tests to quickly get invalid fixtures by kind
export const invalidFixtures = {
  invalidHeader: INVALID_HEADER_BYTES,
  missingSchema: MISSING_SCHEMA_BYTES,
  mismatchedIdentity: MISMATCHED_IDENTITY_BYTES,
} as const;

/**
 * Helper to decode synthetic bytes for verification (used by fakes/drivers)
 */
export function decodeSyntheticBytes(bytes: Uint8Array): SyntheticPayload {
  // Slice after header
  const payloadBytes = bytes.slice(SQLITE_HEADER.length);
  const text = new TextDecoder().decode(payloadBytes);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Missing JSON payload");
  const jsonText = text.slice(start, end + 1);
  return JSON.parse(jsonText) as SyntheticPayload;
}

export function isValidHeader(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) {
    if (bytes[i] !== SQLITE_HEADER[i]) return false;
  }
  return true;
}
