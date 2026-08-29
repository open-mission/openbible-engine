import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildLegacySqliteBibleFixture } from "@openbible/adapter-sqlite-node";
import { createConsumerTuiEngine } from "../src/engine.js";

describe("consumer TUI: instalação remota", () => {
  it("instala a versão adquirida no namespace isolado", async () => {
    // SPECSFY: US-001 FR-001 FR-005 NFR-001 NFR-003 AC-001
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-consumer-tui-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    await expect(engine.installVersion({ versionId: fixture.versionId, name: fixture.name })).resolves.toBeUndefined();
    await expect(engine.listInstalledVersions()).resolves.toEqual([
      expect.objectContaining({ id: fixture.versionId, name: fixture.name }),
    ]);
    engine.close();
    rmSync(root, { recursive: true, force: true });
  });

  it("preserva a versão anterior quando a aquisição falha", async () => {
    // SPECSFY: US-001 US-004 FR-001 FR-005 NFR-002 NFR-003 AC-002
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-rollback-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    try {
      await engine.installVersion({ versionId: fixture.versionId, name: fixture.name });
      await expect(engine.installVersion({ versionId: fixture.versionId, bytes: new Uint8Array([1, 2, 3]), name: "invalid" }))
        .rejects.toMatchObject({ code: "invalid_package" });

      await expect(engine.listInstalledVersions()).resolves.toEqual([
        expect.objectContaining({ id: fixture.versionId, name: fixture.name }),
      ]);
      expect(readdirSync(join(root, "bibles"))).toEqual([`${fixture.versionId}.db`]);
      await expect(engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 })).resolves.toHaveLength(3);
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("lista e remove somente a versão do namespace do consumer", async () => {
    // SPECSFY: US-001 US-004 FR-001 FR-004 NFR-003 NFR-004 AC-003
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-remove-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    try {
      await engine.installVersion({ versionId: fixture.versionId, name: fixture.name });
      expect(await engine.listInstalledVersions()).toEqual([
        expect.objectContaining({ id: fixture.versionId, name: fixture.name }),
      ]);
      await engine.uninstallVersion(fixture.versionId);
      await expect(engine.listInstalledVersions()).resolves.toEqual([]);
      expect(existsSync(join(root, "bibles", `${fixture.versionId}.db`))).toBe(false);
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
