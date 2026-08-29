import { useState } from "react";
import type { BibleBook } from "@openbible/engine";

export interface BookPickerProps {
  books: BibleBook[];
  selectedBookId?: string;
  busy?: boolean;
  onSelectBook: (bookId: string) => void;
  onSubmitReference: (query: string) => void;
  onClose: () => void;
}

export function BookPicker({
  books,
  selectedBookId,
  busy = false,
  onSelectBook,
  onSubmitReference,
  onClose,
}: BookPickerProps) {
  const [query, setQuery] = useState("");
  const filteredBooks = books.filter((book) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return !normalizedQuery || `${book.name} ${book.abbreviation}`.toLocaleLowerCase().includes(normalizedQuery);
  });
  const options = filteredBooks.map((book) => ({
    name: `${book.abbreviation} - ${book.name}`,
    description: `${book.chapters} capítulos`,
    value: book.id,
  }));

  return (
    <box
      title="Livro e referência"
      flexDirection="column"
      gap={1}
      border
      borderStyle="single"
      borderColor="#0ea5e9"
      padding={1}
      onKeyDown={(event) => {
        if (event.name === "escape") onClose();
      }}
    >
      <text content="Digite uma referência (por exemplo, João 3:16) ou filtre os livros. Esc fecha." fg="#cbd5e1" />
      <input
        focused={!busy}
        value={query}
        placeholder="Livro capítulo:versículo"
        onInput={setQuery}
        onSubmit={() => onSubmitReference(query)}
      />
      {filteredBooks.length === 0 ? (
        <text content="Nenhum livro encontrado." fg="#facc15" />
      ) : (
        <select
          focused={!busy}
          options={options}
          selectedIndex={Math.max(0, filteredBooks.findIndex((book) => book.id === selectedBookId))}
          onSelect={(_, option) => {
            if (typeof option?.value === "string") onSelectBook(option.value);
          }}
          showDescription
          showScrollIndicator
        />
      )}
      <text content="Enter confirma referência · Esc volta" fg="#64748b" />
      <text content={busy ? "Aguarde a operação atual..." : ""} fg="#facc15" />
    </box>
  );
}
