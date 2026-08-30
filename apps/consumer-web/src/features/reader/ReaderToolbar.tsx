import Link from "next/link";

export type ReaderWidth = "narrow" | "medium" | "wide";

export function ReaderToolbar({
  bookName,
  chapter,
  versionName,
  previous,
  next,
  width,
  displayOpen,
  onOpenBookPicker,
  onOpenChapterPicker,
  onOpenVersionPicker,
  onDisplayToggle,
  onWidthChange,
}: {
  bookName: string;
  chapter: number;
  versionName: string;
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
  width: ReaderWidth;
  displayOpen: boolean;
  onOpenBookPicker: () => void;
  onOpenChapterPicker: () => void;
  onOpenVersionPicker: () => void;
  onDisplayToggle: () => void;
  onWidthChange: (width: ReaderWidth) => void;
}) {
  return (
    <header data-testid="reader-toolbar" className="sticky top-0 z-20 flex justify-center px-3 py-3 sm:px-6">
      <div className="reader-pill flex w-full max-w-3xl flex-wrap items-center justify-center gap-1 p-1 sm:w-auto sm:flex-nowrap">
        {previous ? <Link href={previous.href} aria-label={previous.label} title={previous.label} className="reader-pill-icon">←</Link> : null}
        <button type="button" aria-label="Livro" aria-haspopup="dialog" onClick={onOpenBookPicker} className="reader-pill-select max-w-[10rem] truncate text-left">{bookName}</button>
        <span className="reader-pill-divider" aria-hidden="true">/</span>
        <button type="button" aria-label="Capítulo" aria-haspopup="dialog" onClick={onOpenChapterPicker} className="reader-pill-select w-auto">{chapter}</button>
        <button type="button" aria-label="Versão" aria-haspopup="dialog" onClick={onOpenVersionPicker} className="reader-pill-version" title={versionName}>{versionName}</button>
        <button type="button" aria-expanded={displayOpen} aria-controls="reader-display-settings" onClick={onDisplayToggle} className="reader-pill-action">Exibição</button>
        {next ? <Link href={next.href} aria-label={next.label} title={next.label} className="reader-pill-icon">→</Link> : null}
      </div>

      {displayOpen ? (
        <div id="reader-display-settings" role="dialog" aria-label="Ajustes de exibição" className="reader-display-menu">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Largura do texto</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["narrow", "medium", "wide"] as const).map((option) => (
              <button key={option} type="button" aria-pressed={width === option} onClick={() => onWidthChange(option)} className={`reader-display-option ${width === option ? "reader-display-option-active" : ""}`}>
                {option === "narrow" ? "Estreita" : option === "medium" ? "Padrão" : "Larga"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
