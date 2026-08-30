import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { buildLegacySqliteBibleFixture } from "@openbible/adapter-sqlite-node";
import { createConsumerTuiEngine } from "../src/engine.js";
import { resolveConsumerTuiConfig } from "../src/config.js";

describe("consumer TUI: conformance local", () => {
  it("completa leitura, busca e remoção sem rede", async () => {
    // SPECSFY: US-004 FR-004 NFR-002 NFR-003 AC-008
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(process.cwd(), "conformance-"));
    let networkCalls = 0;
    let networkEnabled = true;
    const createEngine = () => createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => {
        networkCalls++;
        if (!networkEnabled) throw new Error("network blocked after installation");
        return new Response(fixture.bytes, { status: 200 });
      },
    });
    let engine = createEngine();

    try {
      await engine.installVersion({ versionId: fixture.versionId, name: fixture.name });
      networkEnabled = false;

      const installed = await engine.listInstalledVersions();
      const books = await engine.getBooks(fixture.versionId);
      const chapter = await engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 });
      const reference = engine.parseReference({ query: "João 1:2", books });
      const result = await engine.searchVerses({ versionId: fixture.versionId, query: "luz", limit: 2 });

      expect(installed).toEqual([expect.objectContaining({ id: fixture.versionId, name: fixture.name })]);
      expect(books.map((book) => book.id)).toEqual(["gen", "exo", "jhn"]);
      expect(chapter.map((verse) => verse.verse)).toEqual([1, 2, 3]);
      expect(reference).toEqual({ bookId: "jhn", chapter: 1, verseStart: 2, verseEnd: 2 });
      expect(result.results.length).toBeLessThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      expect(networkCalls).toBe(1);

      engine.close();
      engine = createEngine();
      await expect(engine.listInstalledVersions()).resolves.toEqual([
        expect.objectContaining({ id: fixture.versionId, name: fixture.name }),
      ]);
      await expect(engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 })).resolves.toHaveLength(3);
      await expect(engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 10 })).resolves.toEqual(
        expect.objectContaining({ total: expect.any(Number) }),
      );

      await engine.uninstallVersion(fixture.versionId);
      await expect(engine.listInstalledVersions()).resolves.toEqual([]);
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("mantém o legado intacto sem depender do checkout antigo", () => {
    // SPECSFY: US-001 US-004 FR-001 NFR-003 NFR-004 AC-011
    const legacyRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../open-bible");
    const legacyTui = join(legacyRoot, "apps", "tui");

    expect(() => resolveConsumerTuiConfig({
      OPENBIBLE_TUI_DATA_DIR: join(legacyTui, "data"),
      OPENBIBLE_TUI_REGISTRY_PATH: join(legacyTui, "registry.sqlite"),
    })).toThrow(/legacy Open Bible project/);
  });
});
