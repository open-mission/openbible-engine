import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BibleEngine } from "@openbible/engine";
import type { BibleBook, InstalledBible, Verse } from "@openbible/engine-core";
import { Reader } from "@/features/reader/Reader";

const mocks = vi.hoisted(() => ({
  params: { version: "ara", book: "gn", chapter: "1" },
  engine: {
    getBooks: vi.fn(),
    getChapter: vi.fn(),
    listInstalledVersions: vi.fn(),
  } as unknown as BibleEngine,
}));

vi.mock("next/navigation", () => ({
  useParams: () => mocks.params,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/engine/bible-engine-provider", () => ({
  useBibleEngine: () => ({ engine: mocks.engine, status: "ready", refresh: vi.fn() }),
}));

const book: BibleBook = { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 2 };
const installed: InstalledBible = { id: "ara", name: "ARA", installedAt: 1, versionCode: 1 };
const verses: Verse[] = [
  { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" },
  { id: "gen-1-2", bookId: "gen", chapter: 1, verse: 2, text: "A terra era sem forma" },
];

function mockReaderData() {
  mocks.engine.getBooks = vi.fn(async () => [book]);
  mocks.engine.getChapter = vi.fn(async () => verses);
  mocks.engine.listInstalledVersions = vi.fn(async () => [installed]);
}

function setClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

beforeEach(() => {
  mockReaderData();
  setClipboard(vi.fn(async () => undefined));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// SPECSFY: US-002 FR-002 FR-005 NFR-003 AC-015
describe("seleção de versículos", () => {
  it("abre um popover nomeado ao alternar um versículo focável", async () => {
    render(<Reader />);
    await screen.findByRole("heading", { name: "Gênesis 1" });

    const verse = screen.getByRole("button", { name: /Versículo 1: No princípio/ });
    expect(verse).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(verse);

    expect(verse).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("dialog", { name: "Ações dos versículos selecionados" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar referência" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar texto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar seleção" })).toBeInTheDocument();
  });

  // SPECSFY: US-002 FR-002 FR-005 NFR-003 AC-016
  it("copia a referência da seleção múltipla ou seu texto numerado", async () => {
    const writeText = vi.fn(async () => undefined);
    setClipboard(writeText);
    render(<Reader />);
    await screen.findByRole("heading", { name: "Gênesis 1" });

    fireEvent.click(screen.getByRole("button", { name: /Versículo 1: No princípio/ }));
    fireEvent.click(screen.getByRole("button", { name: /Versículo 2: A terra era sem forma/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copiar referência" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Gênesis 1:1-2 (ARA)"));

    fireEvent.click(screen.getByRole("button", { name: "Copiar texto" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      "Gênesis 1:1-2 (ARA)\n1. No princípio\n2. A terra era sem forma",
    ));
  });

  // SPECSFY: US-002 FR-005 NFR-003 AC-017
  it("fecha com Escape e mantém a seleção quando o clipboard falha", async () => {
    const writeText = vi.fn(async () => { throw new Error("clipboard denied"); });
    setClipboard(writeText);
    document.execCommand = vi.fn(() => false);
    render(<Reader />);
    await screen.findByRole("heading", { name: "Gênesis 1" });

    const verse = screen.getByRole("button", { name: /Versículo 1: No princípio/ });
    fireEvent.click(verse);
    fireEvent.click(screen.getByRole("button", { name: "Copiar texto" }));
    expect(await screen.findByText("Não foi possível copiar.")).toBeInTheDocument();
    expect(verse).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ações dos versículos selecionados" })).not.toBeInTheDocument());
    expect(verse).toHaveAttribute("aria-pressed", "false");
  });

  // SPECSFY: US-002 FR-005 NFR-003 AC-017
  it("limpa a seleção ao clicar fora ou na ação explícita", async () => {
    render(<Reader />);
    await screen.findByRole("heading", { name: "Gênesis 1" });

    const verse = screen.getByRole("button", { name: /Versículo 1: No princípio/ });
    fireEvent.click(verse);
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ações dos versículos selecionados" })).not.toBeInTheDocument());
    expect(verse).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(verse);
    fireEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ações dos versículos selecionados" })).not.toBeInTheDocument());
    expect(verse).toHaveAttribute("aria-pressed", "false");
  });
});
