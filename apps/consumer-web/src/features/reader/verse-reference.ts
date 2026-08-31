import type { BibleBook, Verse } from "@openbible/engine-core";

function groupVerseNumbers(numbers: number[]): string[] {
  const sorted = [...new Set(numbers)].sort((left, right) => left - right);
  if (sorted.length === 0) return [];

  const segments: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (const number of sorted.slice(1)) {
    if (number === previous + 1) {
      previous = number;
      continue;
    }

    segments.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = number;
    previous = number;
  }

  segments.push(start === previous ? `${start}` : `${start}-${previous}`);
  return segments;
}

export function formatVerseReference(
  book: BibleBook,
  chapter: number,
  verses: Verse[],
  versionName: string,
): string {
  const segments = groupVerseNumbers(verses.map((verse) => verse.verse));
  return `${book.name} ${chapter}:${segments.join(", ")} (${versionName})`;
}

export function formatVerseText(
  book: BibleBook,
  chapter: number,
  verses: Verse[],
  versionName: string,
): string {
  const reference = formatVerseReference(book, chapter, verses, versionName);
  const ordered = [...verses].sort((left, right) => left.verse - right.verse);
  const text = ordered.map((verse) => `${verse.verse}. ${verse.text}`).join("\n");
  return `${reference}\n${text}`;
}
