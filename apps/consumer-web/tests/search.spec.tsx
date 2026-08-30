import { describe, expect, it } from "vitest";
import type { Verse } from "@openbible/engine-core";
import { searchInstalledVersions } from "@/features/search/search-installed";

// SPECSFY: US-003 FR-003 NFR-002 NFR-005 AC-003
describe("Busca", () => {
  it("consulta todas as versões instaladas e preserva a origem", async () => {
    const verse = (id: string): Verse => ({ id, bookId: "gen", chapter: 1, verse: 1, text: `resultado ${id}` });
    const engine = {
      listInstalledVersions: async () => [{ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 }, { id: "nvi", name: "NVI", installedAt: 2, versionCode: 1 }],
      getBooks: async () => [{ id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old" as const, chapters: 50 }],
      searchVerses: async ({ versionId }: { versionId: string }) => ({ versionId, query: "luz", results: [verse(versionId)], total: 1 }),
    };
    const results = await searchInstalledVersions(engine, "luz", 50);
    expect(results.map((result) => result.versionName)).toEqual(["ARA", "NVI"]);
    expect(results.map((result) => result.bookSegment)).toEqual(["gn", "gn"]);
  });
});
