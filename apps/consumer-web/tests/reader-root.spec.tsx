import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleEngine } from "@openbible/engine";
import type { BibleBook, InstalledBible, Verse } from "@openbible/engine-core";
import { Reader } from "@/features/reader/Reader";

const mocks = vi.hoisted(() => ({
  params: {},
  push: vi.fn(),
  engine: {
    getBooks: vi.fn(),
    getChapter: vi.fn(),
    listInstalledVersions: vi.fn(),
    listAvailableVersions: vi.fn(),
  } as unknown as BibleEngine,
}));

vi.mock("next/navigation", () => ({
  useParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/engine/bible-engine-provider", () => ({
  useBibleEngine: () => ({ engine: mocks.engine, status: "ready", refresh: vi.fn() }),
}));

const gen: BibleBook = { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 2 };
const installed: InstalledBible = { id: "nvi", name: "Nova Versão Internacional", installedAt: 1, versionCode: 1 };
const verses: Verse[] = [{ id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" }];

afterEach(() => {
  cleanup();
  mocks.params = {};
  mocks.push.mockClear();
});

// SPECSFY: US-002 FR-002 FR-004 NFR-002 NFR-003 AC-005 AC-011
describe("entrada principal do leitor", () => {
  it("resolve a primeira versão instalada e abre Gênesis 1 em /", async () => {
    mocks.engine.listInstalledVersions = vi.fn(async () => [installed]);
    mocks.engine.getBooks = vi.fn(async () => [gen]);
    mocks.engine.getChapter = vi.fn(async () => verses);

    render(<Reader />);

    expect(await screen.findByRole("heading", { name: "Gênesis 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Versão" })).toHaveTextContent("Nova Versão Internacional");
    expect(mocks.engine.getBooks).toHaveBeenCalledWith("nvi");
    expect(mocks.engine.getChapter).toHaveBeenCalledWith({ versionId: "nvi", bookId: "gen", chapter: 1 });
  });
});
