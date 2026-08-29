import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildLegacySqliteBibleFixture } from "@openbible/adapter-sqlite-node";
import { createConsumerTuiEngine } from "../src/engine.js";
import { ScriptureLibraryService } from "../src/services/scripture-library.js";

describe("consumer TUI: busca offline", () => {
  it("apresenta resultados limitados ou orienta termo vazio", async () => {
    // SPECSFY: US-003 FR-003 NFR-002 NFR-005 AC-006
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-search-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    try {
      const service = new ScriptureLibraryService(engine);
      await service.installVersion(fixture.versionId, fixture.name);
      const result = await service.searchVerses(fixture.versionId, "Deus", 2);
      const empty = await service.searchVerses(fixture.versionId, "   ", 2);

      expect(result.results.length).toBeLessThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      expect(empty).toEqual({ versionId: fixture.versionId, query: "   ", results: [], total: 0 });
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("busca no armazenamento local sem nova chamada HTTP", async () => {
    // SPECSFY: US-003 US-004 FR-003 NFR-002 NFR-005 AC-007
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-offline-search-"));
    let networkCalls = 0;
    let networkEnabled = true;
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => {
        networkCalls++;
        if (!networkEnabled) throw new Error("network blocked after installation");
        return new Response(fixture.bytes, { status: 200 });
      },
    });

    try {
      const service = new ScriptureLibraryService(engine);
      await service.installVersion(fixture.versionId, fixture.name);
      networkEnabled = false;

      const result = await service.searchVerses(fixture.versionId, "luz", 10);

      expect(result.results.length).toBeGreaterThan(0);
      expect(networkCalls).toBe(1);
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
