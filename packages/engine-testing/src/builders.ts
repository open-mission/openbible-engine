import type { BibleVersion, BibleBook, Verse } from "@openbible/engine-core";

export class BibleVersionBuilder {
  private version: BibleVersion = { id: "ara", name: "ARA", language: "pt-BR", totalBooks: 66 };

  withId(id: string): this {
    this.version.id = id;
    return this;
  }
  withName(name: string): this {
    this.version.name = name;
    return this;
  }
  withLanguage(language: string): this {
    this.version.language = language;
    return this;
  }
  withTotalBooks(n: number): this {
    this.version.totalBooks = n;
    return this;
  }
  build(): BibleVersion {
    return { ...this.version };
  }
}

export class BibleBookBuilder {
  private book: BibleBook = {
    id: "gen",
    name: "Gênesis",
    abbreviation: "Gn",
    testament: "old",
    chapters: 50,
  };

  withId(id: string): this {
    this.book.id = id;
    return this;
  }
  withName(name: string): this {
    this.book.name = name;
    return this;
  }
  withAbbreviation(abbr: string): this {
    this.book.abbreviation = abbr;
    return this;
  }
  withTestament(t: "old" | "new"): this {
    this.book.testament = t;
    return this;
  }
  withChapters(n: number): this {
    this.book.chapters = n;
    return this;
  }
  build(): BibleBook {
    return { ...this.book };
  }
}

export class VerseBuilder {
  private verse: Verse = {
    id: "gen-1-1",
    bookId: "gen",
    chapter: 1,
    verse: 1,
    text: "No princípio Deus criou os céus e a terra",
  };

  withId(id: string): this {
    this.verse.id = id;
    return this;
  }
  withBookId(bookId: string): this {
    this.verse.bookId = bookId;
    return this;
  }
  withChapter(chapter: number): this {
    this.verse.chapter = chapter;
    return this;
  }
  withVerse(verse: number): this {
    this.verse.verse = verse;
    return this;
  }
  withText(text: string): this {
    this.verse.text = text;
    return this;
  }
  build(): Verse {
    return { ...this.verse };
  }

  static many(count: number, opts?: { bookId?: string; chapter?: number; startVerse?: number; textPrefix?: string }): Verse[] {
    const arr: Verse[] = [];
    const bookId = opts?.bookId ?? "gen";
    const chapter = opts?.chapter ?? 1;
    const start = opts?.startVerse ?? 1;
    const prefix = opts?.textPrefix ?? "Verso";
    for (let i = 0; i < count; i++) {
      const v = start + i;
      arr.push(
        new VerseBuilder()
          .withId(`${bookId}-${chapter}-${v}`)
          .withBookId(bookId)
          .withChapter(chapter)
          .withVerse(v)
          .withText(`${prefix} ${v} Deus criou`)
          .build(),
      );
    }
    return arr;
  }
}

// Convenience factory functions
export function aBibleVersion(overrides?: Partial<BibleVersion>): BibleVersion {
  const b = new BibleVersionBuilder();
  if (overrides?.id) b.withId(overrides.id);
  if (overrides?.name) b.withName(overrides.name);
  if (overrides?.language) b.withLanguage(overrides.language);
  if (overrides?.totalBooks !== undefined) b.withTotalBooks(overrides.totalBooks);
  return b.build();
}

export function aBibleBook(overrides?: Partial<BibleBook>): BibleBook {
  const b = new BibleBookBuilder();
  if (overrides?.id) b.withId(overrides.id);
  if (overrides?.name) b.withName(overrides.name);
  if (overrides?.abbreviation) b.withAbbreviation(overrides.abbreviation);
  if (overrides?.testament) b.withTestament(overrides.testament);
  if (overrides?.chapters !== undefined) b.withChapters(overrides.chapters);
  return b.build();
}

export function aVerse(overrides?: Partial<Verse>): Verse {
  const b = new VerseBuilder();
  if (overrides?.id) b.withId(overrides.id);
  if (overrides?.bookId) b.withBookId(overrides.bookId);
  if (overrides?.chapter !== undefined) b.withChapter(overrides.chapter);
  if (overrides?.verse !== undefined) b.withVerse(overrides.verse);
  if (overrides?.text) b.withText(overrides.text);
  return b.build();
}
