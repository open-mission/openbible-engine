import type { Verse } from "@openbible/engine-core";

export function VerseRow({
  verse,
  selected,
  onToggle,
}: {
  verse: Verse;
  selected: boolean;
  onToggle: (verseId: string) => void;
}) {
  return (
    <button
      type="button"
      data-verse-id={verse.id}
      data-verse-row=""
      aria-label={`Versículo ${verse.verse}: ${verse.text}`}
      aria-pressed={selected}
      onClick={() => onToggle(verse.id)}
      className={`reader-verse ${selected ? "reader-verse-selected" : ""}`}
    >
      <sup>{verse.verse}</sup>
      {verse.text}
    </button>
  );
}
