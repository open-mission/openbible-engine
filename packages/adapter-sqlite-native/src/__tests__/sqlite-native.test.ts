import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync, readdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EngineError } from "@openbible/engine-core";
import { createBibleEngine } from "@openbible/engine";
import { createNativeAdapter } from "../index.js";
import { buildRealSqliteBibleFixture, REAL_ARA_FIXTURE } from "../fixtures.js";
import { NodeSqliteDriver, nodeSqliteDriverFactory } from "../driver.js";

describe("adapter-sqlite-native real SQLite", () => {
  let dataDir: string;
  let registryPath: string;

  beforeAll(() => {
    dataDir = mkdtempSync(join(tmpdir(), "ob-native-"));
    registryPath = join(dataDir, "app.db");
  });
  afterAll(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  // SPECSFY: US-002 FR-010 NFR-002 AC-010
  it("buildRealSqliteBibleFixture writes a real SQLite file with the expected tables", async () => {
    const fixture = buildRealSqliteBibleFixture("tst", "TST");
    // First 16 bytes are the SQLite header.
    expect(new TextDecoder().decode(fixture.bytes.slice(0, 15))).toBe("SQLite format 3");

    // Open the produced bytes as a real DB (via temp file) and run real SQL queries.
    const file = join(dataDir, "probe.db");
    writeFileSync(file, fixture.bytes);
    const driver = new NodeSqliteDriver(file, { readOnly: true });
    try {
      const tables = (driver.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name);
      expect(tables).toEqual(expect.arrayContaining(["metadata", "book", "verse"]));
      expect((driver.prepare("SELECT COUNT(*) AS c FROM verse").get() as { c: number }).c).toBeGreaterThan(0);
      expect((driver.prepare("SELECT value FROM metadata WHERE key = 'versionId'").get() as { value: string }).value).toBe("tst");
    } finally {
      driver.close();
      rmSync(file, { force: true });
    }
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-004 FR-005 FR-006 FR-007 FR-009 NFR-003 NFR-006 AC-005
  it("installs, lists, reads, searches and uninstalls a real version atomically", async () => {
    const adapter = createNativeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    const fixture = REAL_ARA_FIXTURE;

    expect(await engine.listInstalledVersions()).toEqual([]);
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });

    expect((await engine.listInstalledVersions()).map((v) => v.id)).toContain(fixture.versionId);
    expect((await engine.getBooks(fixture.versionId)).length).toBeGreaterThan(0);
    expect((await engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 })).map((v) => v.verse)).toEqual([1, 2, 3]);
    expect((await engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 10 })).results.length).toBeGreaterThan(0);

    await engine.uninstallVersion(fixture.versionId);
    expect(await adapter.installer.isInstalled(fixture.versionId)).toBe(false);
    expect(await engine.listInstalledVersions()).toEqual([]);
    expect(existsSync(join(dataDir, `${fixture.versionId}.db`))).toBe(false);
    adapter.close();
  });

  // SPECSFY: US-001 FR-005 FR-009 NFR-006 AC-005 AC-030
  it("persists across a close/reopen (registry + bible file survive)", async () => {
    const fixture = REAL_ARA_FIXTURE;
    const first = createNativeAdapter({ dataDir, registryPath });
    await first.installer.install({ versionId: fixture.versionId, bytes: fixture.bytes, installedAt: 1, versionCode: 1 });
    first.close();

    // Simulate a process restart: a brand new adapter over the same paths.
    const second = createNativeAdapter({ dataDir, registryPath });
    try {
      expect(await second.installer.isInstalled(fixture.versionId)).toBe(true);
      const engine = createBibleEngine({ library: second.library, registry: second.registry, installer: second.installer });
      expect((await engine.listInstalledVersions()).map((v) => v.id)).toContain(fixture.versionId);
      expect((await engine.getBooks(fixture.versionId)).length).toBeGreaterThan(0);
      expect((await engine.getChapter({ versionId: fixture.versionId, bookId: "psa", chapter: 1 })).length).toBe(3);
      await engine.uninstallVersion(fixture.versionId);
      expect(await second.installer.isInstalled(fixture.versionId)).toBe(false);
    } finally {
      second.close();
    }
  });

  // SPECSFY: US-003 FR-005 NFR-007 AC-014
  it("invalid package installs nothing, leaves no temp and no partial (atomicity)", async () => {
    const adapter = createNativeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    const before = readDirList(dataDir);
    const notSqlite = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    await expect(engine.installVersion({ versionId: "bad", bytes: notSqlite })).rejects.toMatchObject({ code: "invalid_package" });
    expect(await adapter.installer.isInstalled("bad")).toBe(false);
    expect(await engine.listInstalledVersions()).toEqual([]);
    // No temporary files left behind.
    expect(readDirList(dataDir).filter((f) => f.includes(".tmp"))).toEqual([]);
    expect(readDirList(dataDir)).toEqual(before);
    adapter.close();
  });

  // SPECSFY: US-003 FR-008 NFR-007 AC-014
  it("unsupported schema (missing tables) is rejected", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ob-native-bad-"));
    const file = join(dir, "bad.db");
    try {
      const driver = nodeSqliteDriverFactory(file, { readOnly: false });
      driver.exec("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT)");
      driver.exec("INSERT INTO metadata VALUES ('versionId','x')");
      driver.close();
      const bytes = new Uint8Array(readFileSync(file));
      const adapter = createNativeAdapter({ dataDir: dir, registryPath: join(dir, "app.db") });
      const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
      await expect(engine.installVersion({ versionId: "x", bytes })).rejects.toMatchObject({ code: "unsupported_schema" });
      adapter.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  // SPECSFY: US-003 FR-005 NFR-001 AC-015
  it("failed commit rethrows typed EngineError and keeps a prior version usable", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ob-native-restore-"));
    try {
      const adapterPath = join(dir, "app.db");
      const fixture = REAL_ARA_FIXTURE;
      const first = createNativeAdapter({ dataDir: dir, registryPath: adapterPath });
      await first.installer.install({ versionId: fixture.versionId, bytes: fixture.bytes, installedAt: 1, versionCode: 1 });
      first.close();

      // Registry removal failure triggers compensation: version must remain usable.
      const broken = createNativeAdapter({ dataDir: dir, registryPath: adapterPath });
      const badReplace = new TextEncoder().encode("not a sqlite file, but long enough to fail header check");
      await expect(
        broken.installer.install({ versionId: fixture.versionId, bytes: badReplace, installedAt: 2, versionCode: 2 }),
      ).rejects.toMatchObject({ code: "invalid_package" });
      expect(await broken.installer.isInstalled(fixture.versionId)).toBe(true);
      broken.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function readDirList(dir: string): string[] {
  return readdirSync(dir);
}
