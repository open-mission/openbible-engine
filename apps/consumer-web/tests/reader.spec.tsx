import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleEngine } from "@openbible/engine";
import type { BibleBook, InstalledBible, Verse } from "@openbible/engine-core";
import { PrevNextNav } from "@/features/reader/PrevNextNav";
import { Reader } from "@/features/reader/Reader";

const readerMocks = vi.hoisted(() => ({
  params: { version: "ara", book: "gn", chapter: "1" },
  push: vi.fn(),
  engine: {
    getBooks: vi.fn(),
    getChapter: vi.fn(),
    listInstalledVersions: vi.fn(),
  } as unknown as BibleEngine,
}));

vi.mock("next/navigation", () => ({
  useParams: () => readerMocks.params,
  useRouter: () => ({ push: readerMocks.push }),
}));

vi.mock("@/engine/bible-engine-provider", () => ({
  useBibleEngine: () => ({ engine: readerMocks.engine, status: "ready", refresh: vi.fn() }),
}));

const gen: BibleBook = { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 2 };
const exo: BibleBook = { id: "exo", name: "Êxodo", abbreviation: "Êx", testament: "old", chapters: 1 };
const installed: InstalledBible = { id: "ara", name: "ARA", installedAt: 1, versionCode: 1 };
const verses: Verse[] = [
  { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" },
  { id: "gen-1-2", bookId: "gen", chapter: 1, verse: 2, text: "A terra era sem forma" },
];

function mockReaderData(books: BibleBook[] = [gen, exo], chapterVerses: Verse[] = verses) {
  readerMocks.engine.getBooks = vi.fn(async () => books);
  readerMocks.engine.getChapter = vi.fn(async () => chapterVerses);
  readerMocks.engine.listInstalledVersions = vi.fn(async () => [installed]);
}

afterEach(() => {
  cleanup();
  readerMocks.params = { version: "ara", book: "gn", chapter: "1" };
  readerMocks.push.mockClear();
});

// SPECSFY: US-002 FR-002 FR-004 NFR-001 NFR-002 NFR-005 AC-002
describe("Leitor", () => {
  it("renderiza o capítulo retornado pela engine em ordem e com sua quantidade", async () => {
    mockReaderData();
    render(<Reader />);

    expect(await screen.findByRole("heading", { name: "Gênesis 1" })).toBeInTheDocument();
    expect(screen.getByText("2 versículos")).toBeInTheDocument();
    const verseText = screen.getAllByText(/No princípio|A terra era sem forma/).map((node) => node.textContent);
    expect(verseText).toEqual(["1No princípio", "2A terra era sem forma"]);
  });

  // SPECSFY: US-002 FR-002 NFR-003 AC-008
  it("preserva a composição de leitura enquanto o capítulo carrega", async () => {
    let resolveChapter: (value: Verse[]) => void = () => undefined;
    const chapter = new Promise<Verse[]>((resolve) => { resolveChapter = resolve; });
    readerMocks.engine.getBooks = vi.fn(async () => [gen]);
    readerMocks.engine.getChapter = vi.fn(() => chapter);
    readerMocks.engine.listInstalledVersions = vi.fn(async () => [installed]);

    render(<Reader />);

    expect(screen.getByLabelText("Carregando capítulo")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("reader-loading-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("reader-loading-heading")).toBeInTheDocument();
    expect(screen.getByTestId("reader-loading-verses")).toBeInTheDocument();

    resolveChapter(verses);
    expect(await screen.findByRole("heading", { name: "Gênesis 1" })).toBeInTheDocument();
  });

  // SPECSFY: US-002 FR-002 NFR-002 NFR-003 AC-005
  it("seleciona apenas livros válidos e envia a rota canônica ao router", async () => {
    mockReaderData();
    render(<Reader />);
    await screen.findByRole("heading", { name: "Gênesis 1" });

    fireEvent.click(screen.getByRole("button", { name: "Livro" }));
    expect(screen.getByRole("button", { name: "Gênesis" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Êxodo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Próximo capítulo/ })).toHaveAttribute("href", "/ara/gn/2");
    fireEvent.click(screen.getByRole("button", { name: "Êxodo" }));
    fireEvent.click(screen.getByRole("button", { name: "Capítulo 1" }));
    expect(readerMocks.push).toHaveBeenCalledWith("/ara/ex/1");
  });

  // SPECSFY: US-002 FR-002 NFR-002 NFR-003 AC-004 AC-005
  it("não cria navegação além do último livro e capítulo", async () => {
    readerMocks.params = { version: "ara", book: "ex", chapter: "1" };
    mockReaderData([gen, exo], [{ id: "exo-1-1", bookId: "exo", chapter: 1, verse: 1, text: "Êxodo" }]);
    render(<Reader routeParams={readerMocks.params} />);
    await screen.findByRole("heading", { name: "Êxodo 1" });

    expect(screen.queryByRole("link", { name: /Capítulo anterior/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Próximo capítulo/ })).not.toBeInTheDocument();
  });

  it("oferece navegação de capítulo anterior e próximo", () => {
    render(<PrevNextNav previous={{ href: "/ara/gn/1", label: "Capítulo anterior" }} next={{ href: "/ara/gn/3", label: "Próximo capítulo" }} />);
    expect(screen.getByRole("link", { name: /Capítulo anterior/ })).toHaveAttribute("href", "/ara/gn/1");
    expect(screen.getByRole("link", { name: /Próximo capítulo/ })).toHaveAttribute("href", "/ara/gn/3");
  });
});
