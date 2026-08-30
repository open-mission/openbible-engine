"use client";

import { useEffect, useMemo, useState } from "react";
import type { BibleBook } from "@openbible/engine-core";
import { ResponsivePicker } from "@/features/reader/ResponsivePicker";

export function BookChapterPicker({
  open,
  books,
  selectedBookId,
  selectedChapter,
  initialView = "books",
  onClose,
  onSelectBook,
  onSelectChapter,
}: {
  open: boolean;
  books: BibleBook[];
  selectedBookId: string | null;
  selectedChapter: number | null;
  initialView?: "books" | "chapters";
  onClose: () => void;
  onSelectBook: (bookId: string) => void;
  onSelectChapter: (chapter: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"books" | "chapters">("books");
  const [activeBookId, setActiveBookId] = useState<string | null>(selectedBookId);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveBookId(selectedBookId);
    setView(initialView === "chapters" && selectedBookId ? "chapters" : "books");
  }, [initialView, open, selectedBookId]);

  const activeBook = books.find((book) => book.id === activeBookId);
  const filteredBooks = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    if (!value) return books;
    return books.filter((book) =>
      [book.id, book.name, book.abbreviation].some((field) => field.toLocaleLowerCase().includes(value)),
    );
  }, [books, query]);
  const oldTestament = filteredBooks.filter((book) => book.testament === "old");
  const newTestament = filteredBooks.filter((book) => book.testament === "new");

  function close() {
    setQuery("");
    setView("books");
    onClose();
  }

  function handleEscape() {
    if (view === "chapters") setView("books");
    else close();
  }

  function selectChapter(chapter: number) {
    if (!activeBookId) return;
    onSelectBook(activeBookId);
    onSelectChapter(chapter);
    close();
  }

  return (
    <ResponsivePicker open={open} title="Selecionar livro e capítulo" onClose={close} onEscape={handleEscape}>
      <div className="flex min-h-0 flex-col">
        {view === "books" ? (
          <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <label className="sr-only" htmlFor="book-picker-search">Buscar livro</label>
            <input
              id="book-picker-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar livro..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ) : null}

        <div className="space-y-6 p-4 sm:p-6">
          {view === "chapters" && activeBook ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                 <button type="button" onClick={() => setView("books")} className="rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                  Voltar para livros
                </button>
                <span className="truncate text-sm font-semibold text-foreground">{activeBook.name}</span>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selecione o capítulo</p>
                <div className="grid grid-cols-5 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-8 md:grid-cols-10">
                  {Array.from({ length: activeBook.chapters }, (_, index) => index + 1).map((chapter) => {
                    const isSelected = selectedBookId === activeBook.id && selectedChapter === chapter;
                    return (
                      <button
                        key={chapter}
                        type="button"
                        aria-label={`Capítulo ${chapter}`}
                        aria-pressed={isSelected}
                        onClick={() => selectChapter(chapter)}
                        className={`flex aspect-square items-center justify-center text-sm font-bold transition-all ${isSelected ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent/80"}`}
                      >
                        {chapter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {books.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum livro disponível.</p> : null}
              {oldTestament.length > 0 ? <BookSection title="Antigo Testamento" books={oldTestament} selectedBookId={activeBookId} onSelect={(id) => { setActiveBookId(id); setView("chapters"); }} /> : null}
              {newTestament.length > 0 ? <BookSection title="Novo Testamento" books={newTestament} selectedBookId={activeBookId} onSelect={(id) => { setActiveBookId(id); setView("chapters"); }} /> : null}
              {books.length > 0 && filteredBooks.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum livro encontrado para “{query}”.</p> : null}
            </>
          )}
        </div>
      </div>
    </ResponsivePicker>
  );
}

function BookSection({
  title,
  books,
  selectedBookId,
  onSelect,
}: {
  title: string;
  books: BibleBook[];
  selectedBookId: string | null;
  onSelect: (bookId: string) => void;
}) {
  return (
    <section aria-labelledby={`book-section-${title}`} className="space-y-3">
      <h3 id={`book-section-${title}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {books.map((book) => (
          <button
            key={book.id}
            type="button"
            aria-label={book.name}
            aria-pressed={selectedBookId === book.id}
            onClick={() => onSelect(book.id)}
             className={`group flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${selectedBookId === book.id ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border text-foreground hover:bg-accent/60"}`}
           >
             <span>
               <span className="block font-semibold">{book.name}</span>
               <span className={`mt-0.5 block text-[10px] font-bold uppercase tracking-wider ${selectedBookId === book.id ? "text-primary/75" : "text-muted-foreground/75"}`}>{book.abbreviation}</span>
             </span>
             <span aria-hidden="true" className={`text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 ${selectedBookId === book.id ? "text-primary" : ""}`}>→</span>
           </button>
        ))}
      </div>
    </section>
  );
}
