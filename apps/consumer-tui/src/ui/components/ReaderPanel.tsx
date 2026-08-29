import type { BibleBook, InstalledBible, Verse } from "@openbible/engine";

export interface ReaderPanelProps {
  versions: InstalledBible[];
  books: BibleBook[];
  verses: Verse[];
  selectedVersionId?: string;
  selectedBookId?: string;
  chapter: number;
  busy?: boolean;
  onSelectVersion: (versionId: string) => void;
  onSelectBook: (bookId: string) => void;
  onSelectChapter: (chapter: number) => void;
}

export function ReaderPanel({
  versions,
  books,
  verses,
  selectedVersionId,
  selectedBookId,
  chapter,
  busy = false,
  onSelectVersion,
  onSelectBook,
  onSelectChapter,
}: ReaderPanelProps) {
  const selectedBook = books.find((book) => book.id === selectedBookId);
  const versionOptions = versions.map((version) => ({
    name: version.name,
    description: version.id,
    value: version.id,
  }));
  const bookOptions = books.map((book) => ({
    name: `${book.abbreviation} - ${book.name}`,
    description: `${book.chapters} capítulos`,
    value: book.id,
  }));
  const chapterOptions = selectedBook
    ? Array.from({ length: selectedBook.chapters }, (_, index) => ({
        name: `Capítulo ${index + 1}`,
        description: "Enter abre",
        value: index + 1,
      }))
    : [];

  return (
    <box flexDirection="column" flexGrow={1} gap={1} border borderStyle="single" borderColor="#334155" padding={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text content="Leitor" />
        <text content={busy ? "CARREGANDO" : "OFFLINE"} fg={busy ? "#facc15" : "#38bdf8"} />
      </box>
      <box flexDirection="row" gap={1}>
        <select
          focused={!busy}
          options={versionOptions}
          selectedIndex={Math.max(0, versions.findIndex((version) => version.id === selectedVersionId))}
          onSelect={(_, option) => {
            if (typeof option?.value === "string") onSelectVersion(option.value);
          }}
          showDescription
        />
        <select
          focused={!busy}
          options={bookOptions}
          selectedIndex={Math.max(0, books.findIndex((book) => book.id === selectedBookId))}
          onSelect={(_, option) => {
            if (typeof option?.value === "string") onSelectBook(option.value);
          }}
          showDescription
        />
        <select
          focused={!busy}
          options={chapterOptions}
          selectedIndex={Math.max(0, chapter - 1)}
          onSelect={(_, option) => {
            if (typeof option?.value === "number") onSelectChapter(option.value);
          }}
          showDescription
        />
      </box>
      <text
        content={
          selectedBook
            ? `${selectedBook.name} ${chapter} · n próximo · p anterior · d livro · : referência`
            : "Escolha uma versão e um livro para começar a leitura."
        }
        fg="#94a3b8"
      />
      <scrollbox flexGrow={1} focused={!busy} border borderStyle="single" borderColor="#1e293b" padding={1}>
        {verses.length === 0 ? (
          <text content="Nenhum versículo carregado para esta seleção." fg="#facc15" />
        ) : (
          <text content={verses.map((verse) => `${verse.verse}  ${verse.text}`).join("\n")} wrapMode="word" />
        )}
      </scrollbox>
    </box>
  );
}
