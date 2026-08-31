import { describe, expect, it } from "vitest";
import type { BibleBook, Verse } from "@openbible/engine-core";
import { formatVerseReference, formatVerseText } from "@/features/reader/verse-reference";

const book: BibleBook = {
  id: "gen",
  name: "Gênesis",
  abbreviation: "Gn",
  testament: "old",
  chapters: 50,
};

const verses: Verse[] = [
  { id: "gen-1-4", bookId: "gen", chapter: 1, verse: 4, text: "A luz era boa" },
  { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" },
  { id: "gen-1-2", bookId: "gen", chapter: 1, verse: 2, text: "A terra era sem forma" },
];

// SPECSFY: US-002 FR-002 FR-005 NFR-003 AC-016
describe("formatos de versículos selecionados", () => {
  it("agrupa somente números contíguos e inclui a versão", () => {
    expect(formatVerseReference(book, 1, verses, "ARA")).toBe("Gênesis 1:1-2, 4 (ARA)");
  });

  it("coloca a referência e os versículos em ordem canônica no texto", () => {
    expect(formatVerseText(book, 1, verses, "ARA")).toBe(
      "Gênesis 1:1-2, 4 (ARA)\n1. No princípio\n2. A terra era sem forma\n4. A luz era boa",
    );
  });
});
