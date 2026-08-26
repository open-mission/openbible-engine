import type { BibleBook } from "./types.js";

/**
 * BOOKS - 66 books canonical, Portuguese names and abbreviations, real chapter counts.
 * Ids use short kebab like gen, exo, 1sa, etc as listed in spec.
 */

export const BOOKS: readonly BibleBook[] = [
  { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 50 },
  { id: "exo", name: "Êxodo", abbreviation: "Ex", testament: "old", chapters: 40 },
  { id: "lev", name: "Levítico", abbreviation: "Lv", testament: "old", chapters: 27 },
  { id: "num", name: "Números", abbreviation: "Nm", testament: "old", chapters: 36 },
  { id: "deu", name: "Deuteronômio", abbreviation: "Dt", testament: "old", chapters: 34 },
  { id: "jos", name: "Josué", abbreviation: "Js", testament: "old", chapters: 24 },
  { id: "jdg", name: "Juízes", abbreviation: "Jz", testament: "old", chapters: 21 },
  { id: "rut", name: "Rute", abbreviation: "Rt", testament: "old", chapters: 4 },
  { id: "1sa", name: "1 Samuel", abbreviation: "1Sm", testament: "old", chapters: 31 },
  { id: "2sa", name: "2 Samuel", abbreviation: "2Sm", testament: "old", chapters: 24 },
  { id: "1ki", name: "1 Reis", abbreviation: "1Rs", testament: "old", chapters: 22 },
  { id: "2ki", name: "2 Reis", abbreviation: "2Rs", testament: "old", chapters: 25 },
  { id: "1ch", name: "1 Crônicas", abbreviation: "1Cr", testament: "old", chapters: 29 },
  { id: "2ch", name: "2 Crônicas", abbreviation: "2Cr", testament: "old", chapters: 36 },
  { id: "ezr", name: "Esdras", abbreviation: "Ed", testament: "old", chapters: 10 },
  { id: "neh", name: "Neemias", abbreviation: "Ne", testament: "old", chapters: 13 },
  { id: "est", name: "Ester", abbreviation: "Et", testament: "old", chapters: 10 },
  { id: "job", name: "Jó", abbreviation: "Jó", testament: "old", chapters: 42 },
  { id: "psa", name: "Salmos", abbreviation: "Sl", testament: "old", chapters: 150 },
  { id: "pro", name: "Provérbios", abbreviation: "Pv", testament: "old", chapters: 31 },
  { id: "ecc", name: "Eclesiastes", abbreviation: "Ec", testament: "old", chapters: 12 },
  { id: "sng", name: "Cânticos", abbreviation: "Ct", testament: "old", chapters: 8 },
  { id: "isa", name: "Isaías", abbreviation: "Is", testament: "old", chapters: 66 },
  { id: "jer", name: "Jeremias", abbreviation: "Jr", testament: "old", chapters: 52 },
  { id: "lam", name: "Lamentações", abbreviation: "Lm", testament: "old", chapters: 5 },
  { id: "ezk", name: "Ezequiel", abbreviation: "Ez", testament: "old", chapters: 48 },
  { id: "dan", name: "Daniel", abbreviation: "Dn", testament: "old", chapters: 12 },
  { id: "hos", name: "Oseias", abbreviation: "Os", testament: "old", chapters: 14 },
  { id: "jol", name: "Joel", abbreviation: "Jl", testament: "old", chapters: 3 },
  { id: "amo", name: "Amós", abbreviation: "Am", testament: "old", chapters: 9 },
  { id: "oba", name: "Obadias", abbreviation: "Ob", testament: "old", chapters: 1 },
  { id: "jon", name: "Jonas", abbreviation: "Jn", testament: "old", chapters: 4 },
  { id: "mic", name: "Miqueias", abbreviation: "Mq", testament: "old", chapters: 7 },
  { id: "nam", name: "Naum", abbreviation: "Na", testament: "old", chapters: 3 },
  { id: "hab", name: "Habacuque", abbreviation: "Hc", testament: "old", chapters: 3 },
  { id: "zep", name: "Sofonias", abbreviation: "Sf", testament: "old", chapters: 3 },
  { id: "hag", name: "Ageu", abbreviation: "Ag", testament: "old", chapters: 2 },
  { id: "zec", name: "Zacarias", abbreviation: "Zc", testament: "old", chapters: 14 },
  { id: "mal", name: "Malaquias", abbreviation: "Ml", testament: "old", chapters: 4 },
  { id: "mat", name: "Mateus", abbreviation: "Mt", testament: "new", chapters: 28 },
  { id: "mrk", name: "Marcos", abbreviation: "Mc", testament: "new", chapters: 16 },
  { id: "luk", name: "Lucas", abbreviation: "Lc", testament: "new", chapters: 24 },
  { id: "jhn", name: "João", abbreviation: "Jo", testament: "new", chapters: 21 },
  { id: "act", name: "Atos", abbreviation: "At", testament: "new", chapters: 28 },
  { id: "rom", name: "Romanos", abbreviation: "Rm", testament: "new", chapters: 16 },
  { id: "1co", name: "1 Coríntios", abbreviation: "1Co", testament: "new", chapters: 16 },
  { id: "2co", name: "2 Coríntios", abbreviation: "2Co", testament: "new", chapters: 13 },
  { id: "gal", name: "Gálatas", abbreviation: "Gl", testament: "new", chapters: 6 },
  { id: "eph", name: "Efésios", abbreviation: "Ef", testament: "new", chapters: 6 },
  { id: "php", name: "Filipenses", abbreviation: "Fp", testament: "new", chapters: 4 },
  { id: "col", name: "Colossenses", abbreviation: "Cl", testament: "new", chapters: 4 },
  { id: "1th", name: "1 Tessalonicenses", abbreviation: "1Ts", testament: "new", chapters: 5 },
  { id: "2th", name: "2 Tessalonicenses", abbreviation: "2Ts", testament: "new", chapters: 3 },
  { id: "1ti", name: "1 Timóteo", abbreviation: "1Tm", testament: "new", chapters: 6 },
  { id: "2ti", name: "2 Timóteo", abbreviation: "2Tm", testament: "new", chapters: 4 },
  { id: "tit", name: "Tito", abbreviation: "Tt", testament: "new", chapters: 3 },
  { id: "phm", name: "Filemom", abbreviation: "Fm", testament: "new", chapters: 1 },
  { id: "heb", name: "Hebreus", abbreviation: "Hb", testament: "new", chapters: 13 },
  { id: "jas", name: "Tiago", abbreviation: "Tg", testament: "new", chapters: 5 },
  { id: "1pe", name: "1 Pedro", abbreviation: "1Pe", testament: "new", chapters: 5 },
  { id: "2pe", name: "2 Pedro", abbreviation: "2Pe", testament: "new", chapters: 3 },
  { id: "1jo", name: "1 João", abbreviation: "1Jo", testament: "new", chapters: 5 },
  { id: "2jo", name: "2 João", abbreviation: "2Jo", testament: "new", chapters: 1 },
  { id: "3jo", name: "3 João", abbreviation: "3Jo", testament: "new", chapters: 1 },
  { id: "jud", name: "Judas", abbreviation: "Jd", testament: "new", chapters: 1 },
  { id: "rev", name: "Apocalipse", abbreviation: "Ap", testament: "new", chapters: 22 },
] as const;

/**
 * Maps for lookups.
 */
export const BOOK_BY_ID: Record<string, BibleBook> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
) as Record<string, BibleBook>;

export const BOOK_MAP: Record<string, BibleBook> = BOOK_BY_ID;

export const BOOK_BY_ABBR: Record<string, BibleBook> = Object.fromEntries(
  BOOKS.map((b) => [b.abbreviation.toLowerCase(), b]),
) as Record<string, BibleBook>;

export function getBookById(id: string): BibleBook | undefined {
  return BOOK_BY_ID[id];
}

export function getBookByAbbreviation(abbr: string): BibleBook | undefined {
  return BOOK_BY_ABBR[abbr.toLowerCase()];
}
