import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleBook, InstalledBible } from "@openbible/engine-core";
import { BookChapterPicker } from "@/features/reader/BookChapterPicker";

const books: BibleBook[] = [
  { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 2 },
  { id: "mat", name: "Mateus", abbreviation: "Mt", testament: "new", chapters: 1 },
];

const installed: InstalledBible[] = [
  { id: "ara", name: "Almeida Revista e Atualizada", installedAt: 1, versionCode: 1 },
];

afterEach(() => cleanup());

// SPECSFY: US-002 FR-002 FR-004 NFR-003 AC-011
describe("picker de livro e capítulo", () => {
  it("abre livros, avança para capítulos e confirma a seleção válida", async () => {
    const onSelectBook = vi.fn();
    const onSelectChapter = vi.fn();
    const onClose = vi.fn();

    render(
      <BookChapterPicker
        open
        books={books}
        selectedBookId="gen"
        selectedChapter={1}
        onClose={onClose}
        onSelectBook={onSelectBook}
        onSelectChapter={onSelectChapter}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Selecionar livro e capítulo" })).toHaveAttribute("data-picker-mode", "modal");
    fireEvent.click(screen.getByRole("button", { name: "Gênesis" }));
    expect(screen.getByRole("button", { name: "Capítulo 2" })).toHaveClass("bg-background", "hover:bg-accent/80");
    expect(screen.getByRole("button", { name: "Capítulo 2" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Capítulo 2" }));

    expect(onSelectBook).toHaveBeenCalledWith("gen");
    expect(onSelectChapter).toHaveBeenCalledWith(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // SPECSFY: US-002 FR-002 FR-004 NFR-003 AC-011
  it("usa drawer no mobile e fecha com Escape", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(max-width: 639px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as typeof window.matchMedia;
    const onClose = vi.fn();

    render(
      <BookChapterPicker
        open
        books={books}
        selectedBookId={null}
        selectedChapter={null}
        onClose={onClose}
        onSelectBook={vi.fn()}
        onSelectChapter={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Selecionar livro e capítulo" })).toHaveAttribute("data-picker-mode", "drawer"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    window.matchMedia = originalMatchMedia;
  });
});
