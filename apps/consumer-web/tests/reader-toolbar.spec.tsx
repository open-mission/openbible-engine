import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleEngine } from "@openbible/engine";
import type { BibleBook, InstalledBible, Verse } from "@openbible/engine-core";
import { Reader } from "@/features/reader/Reader";

const mocks = vi.hoisted(() => ({
  params: { version: "ara", book: "gn", chapter: "1" },
  push: vi.fn(),
  engine: {
    getBooks: vi.fn(),
    getChapter: vi.fn(),
    listInstalledVersions: vi.fn(),
  } as unknown as BibleEngine,
}));

vi.mock("next/navigation", () => ({
  useParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/engine/bible-engine-provider", () => ({
  useBibleEngine: () => ({ engine: mocks.engine, status: "ready", refresh: vi.fn() }),
}));

const books: BibleBook[] = [{ id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 2 }];
const installed: InstalledBible[] = [
  { id: "ara", name: "ARA", installedAt: 1, versionCode: 1 },
  { id: "nvi", name: "NVI", installedAt: 2, versionCode: 1 },
];
const verses: Verse[] = [{ id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" }];

afterEach(() => {
  cleanup();
  mocks.push.mockClear();
});

// SPECSFY: US-002 FR-002 NFR-003 AC-010
describe("toolbar do Reader", () => {
  it("apresenta a ação de exibição junto dos controles do capítulo", async () => {
    mocks.engine.getBooks = vi.fn(async () => books);
    mocks.engine.getChapter = vi.fn(async () => verses);
    mocks.engine.listInstalledVersions = vi.fn(async () => installed);
    mocks.engine.listAvailableVersions = vi.fn(async () => []);

    render(<Reader />);

    expect(await screen.findByRole("heading", { name: "Gênesis 1" })).toBeInTheDocument();
    expect(screen.getByTestId("reader-toolbar").firstElementChild).toHaveClass("reader-pill");
    expect(screen.getByRole("button", { name: "Versão" })).toHaveTextContent("ARA");
    // SPECSFY: US-002 FR-002 NFR-003 AC-010 AC-011
    expect(screen.getByRole("button", { name: "Capítulo" })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Capítulo" })).not.toHaveTextContent("Cap.");
    expect(screen.getByRole("button", { name: "Exibição" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Versão" }));
    fireEvent.click(await screen.findByRole("button", { name: /NVI/ }));
    expect(mocks.push).toHaveBeenCalledWith("/nvi/gn/1");
  });
});
