import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EngineError } from "@openbible/engine-core";
import { createBibleEngine } from "@openbible/engine";
import type { InstalledBibleRegistry } from "@openbible/engine";
import {
  createNodeAdapter,
  buildLegacySqliteBibleFixture,
  LEGACY_ARA_FIXTURE,
  NodeBibleLibrary,
  NodeBibleInstaller,
  NodeSqliteRegistry,
  nodeSqliteDriverFactory,
} from "../index.js";
import { bookIdToInt } from "../legacy-book-map.js";
import { runContractSuite } from "@openbible/engine-testing";

function tmpDir(): string {
  return mkdtempSync(join(tmpdir(), "ob-node-"));
}
function bytesOf(p: string): Buffer {
  return readFileSync(p);
}
function listNames(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir) : [];
}
function assertNoStrayFiles(dir: string, v: string): void {
  const names = listNames(dir);
  for (const n of names) {
    expect(n).not.toMatch(new RegExp(`${v}\\.db\\.tmp-`));
    expect(n).not.toMatch(new RegExp(`${v}\\.db\\.bak$`));
    expect(n).not.toMatch(new RegExp(`${v}\\.db\\.trash$`));
  }
}

function makeFailingRegistry(delegate: InstalledBibleRegistry, failSet: () => boolean): InstalledBibleRegistry {
  return {
    list: () => delegate.list(),
    get: (id) => delegate.get(id),
    set: async (b) => {
      if (failSet()) throw new Error("registry.set failed (injected)");
      return delegate.set(b);
    },
    remove: (id) => delegate.remove(id),
  };
}

describe("openbible adapter-sqlite-node (legacy schema)", () => {
  let dataDir: string;
  let registryPath: string;

  beforeEach(() => {
    dataDir = tmpDir();
    registryPath = join(dataDir, "store.db");
  });
  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  function installAra(engine: { installVersion: (i: { versionId: string; bytes?: Uint8Array }) => Promise<void> }): Promise<void> {
    return engine.installVersion({ versionId: LEGACY_ARA_FIXTURE.versionId, bytes: LEGACY_ARA_FIXTURE.bytes });
  }

  it("reproduces the legacy schema and maps integer ids to canonical (FR-001 FR-002 FR-006 NFR-006)", async () => {
    const fixture = buildLegacySqliteBibleFixture("tst", "TST");
    // First 16 bytes are the SQLite header.
    expect(new TextDecoder().decode(fixture.bytes.slice(0, 15))).toBe("SQLite format 3");

    const file = join(dataDir, "probe.db");
    writeFileSync(file, fixture.bytes);
    const driver = nodeSqliteDriverFactory(file, { readOnly: true });
    try {
      const bookCols = (driver.prepare("PRAGMA table_info(book)").all() as { name: string; type: string }[]).map((c) => `${c.name}:${c.type}`);
      expect(bookCols).toEqual(["id:INTEGER"]);
      const verseBook = (driver.prepare("PRAGMA table_info(verse)").all() as { name: string; type: string }[]).find((c) => c.name === "book_id");
      expect(verseBook?.type).toBe("INTEGER");
      // metadata has name but NO versionId required; extra columns don't break reads.
      expect((driver.prepare("SELECT COUNT(*) AS c FROM metadata WHERE key='versionId'").get() as { c: number }).c).toBe(0);
      expect((driver.prepare("SELECT COUNT(*) AS c FROM metadata WHERE key='name'").get() as { c: number }).c).toBe(1);
    } finally {
      driver.close();
      rmSync(file, { force: true });
    }

    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    const books = await engine.getBooks("ara");
    expect(books.map((b) => b.id)).toEqual(["gen", "exo", "jhn"]);
    expect(books.find((b) => b.id === "gen")?.chapters).toBe(2);
    expect(books.find((b) => b.id === "jhn")?.testament).toBe("new");
    const verses = await engine.getChapter({ versionId: "ara", bookId: "jhn", chapter: 1 });
    expect(verses.length).toBe(3);
    expect(verses[0].bookId).toBe("jhn");
    expect(await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 50 })).toBeDefined();
    adapter.close();
  });

  it("opens and reads a version (US-001 US-002 FR-006)", async () => {
    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    await runContractSuite(adapter.library, "ara", { expectedBookIds: ["gen", "exo"] });
    adapter.close();
  });

  it("reinstall with different content is read immediately without recreating the process (US-003 FR-005 NFR-007)", async () => {
    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    expect((await engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 1 }))[0].text).toContain("No princípio");

    // Reinstall the same id with different content (same schema), no process restart.
    const changedVerses = LEGACY_ARA_FIXTURE.verses.map((v) =>
      v.bookId === "gen" && v.chapter === 1 && v.verse === 1 ? { ...v, text: "GENESIS REINSTALLED" } : v,
    );
    const altBytes = buildAltBytes(LEGACY_ARA_FIXTURE.books, changedVerses);
    await engine.installVersion({ versionId: "ara", bytes: altBytes });

    // Immediately read the new content from the same engine.
    expect((await engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 1 }))[0].text).toBe("GENESIS REINSTALLED");
    expect((await engine.getBooks("ara")).map((b) => b.id)).toEqual(["gen", "exo", "jhn"]);
    adapter.close();
  });

  it("uninstalls while the database is already open (US-001 FR-004)", async () => {
    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    await engine.getBooks("ara"); // opens a read handle
    await engine.uninstallVersion("ara");
    expect(await adapter.installer.isInstalled("ara")).toBe(false);
    expect(existsSync(join(dataDir, "ara.db"))).toBe(false);
    await expect(engine.getBooks("ara")).rejects.toMatchObject({ code: "version_not_installed" });
    adapter.close();
  });

  it("no connection remains usable after close() (NFR-001)", async () => {
    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    await engine.getBooks("ara");
    adapter.close();
    await expect(adapter.library.getBooks("ara")).rejects.toMatchObject({ code: "storage_unavailable" });
  });

  it("commit failure after promote keeps previous version intact and no stray files (US-003 FR-005 NFR-001 NFR-007)", async () => {
    // Install v1 via a well-behaved installer.
    const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
    const lib1 = new NodeBibleLibrary(dataDir, nodeSqliteDriverFactory);
    const inst1 = new NodeBibleInstaller(dataDir, reg, lib1, nodeSqliteDriverFactory);
    await inst1.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 1, versionCode: 1 });
    const previousBytes = bytesOf(join(dataDir, "ara.db"));

    // Reinstall v2 with a registry whose set() fails after promote.
    let failSet = true;
    const failingReg = makeFailingRegistry(reg, () => failSet);
    const lib2 = new NodeBibleLibrary(dataDir, nodeSqliteDriverFactory);
    const inst2 = new NodeBibleInstaller(dataDir, failingReg, lib2, nodeSqliteDriverFactory);
    const alt = buildLegacySqliteBibleFixture("ara", "ARA");
    const altBytes = buildAltBytes(alt.books, alt.verses.map((v) => (v.bookId === "gen" && v.verse === 1 ? { ...v, text: "CHANGED" } : v)));
    await expect(inst2.install({ versionId: "ara", bytes: altBytes, installedAt: 2, versionCode: 2 })).rejects.toMatchObject({ code: "storage_unavailable" });

    // previous version byte-for-byte intact and queryable.
    expect(bytesOf(join(dataDir, "ara.db")).equals(previousBytes)).toBe(true);
    const lib3 = new NodeBibleLibrary(dataDir, nodeSqliteDriverFactory);
    const first = (await lib3.getChapter("ara", "gen", 1))[0];
    expect(first.text).toContain("No princípio");
    // previous registry remains.
    expect((await reg.get("ara"))?.versionCode).toBe(1);
    // no .tmp/.bak/.trash
    assertNoStrayFiles(dataDir, "ara");
    failSet = false;
    lib1.close();
    lib2.close();
    lib3.close();
    reg.close();
  });

  it("search total reflects matches before LIMIT and canonical order (US-004 FR-007 NFR-003)", async () => {
    const adapter = createNodeAdapter({ dataDir, registryPath });
    const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
    await installAra(engine);
    const full = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 100 });
    const limited = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 2 });
    // total reflects matches BEFORE the LIMIT (COUNT(*)).
    expect(full.total).toBe(full.results.length); // limit 100 >= all matches
    expect(limited.total).toBe(full.total); // unchanged by LIMIT
    expect(limited.results.length).toBe(2);
    expect(limited.total).toBeGreaterThan(limited.results.length); // total > limited results
    // canonical order: gen before exo before jhn (by canonical id)
    const ids = limited.results.map((v) => v.bookId);
    expect(ids).toEqual([...ids].sort((a, b) => canonicalIndex(a) - canonicalIndex(b)));
    adapter.close();
  });

  describe("crash recovery (reconcile) intermediate states", () => {
    function touch(dir: string, name: string): void {
      writeFileSync(join(dir, name), "x");
    }

    it("final absent + bak present restores bak (FR-005)", () => {
      touch(dataDir, "ara.db.bak");
      touch(dataDir, "ara.db.tmp-1");
      const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
      reg.setSync({ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 });
      const adapter = createNodeAdapter({ dataDir, registryPath });
      expect(existsSync(join(dataDir, "ara.db"))).toBe(true);
      expect(existsSync(join(dataDir, "ara.db.bak"))).toBe(false);
      expect(existsSync(join(dataDir, "ara.db.tmp-1"))).toBe(false);
      expect(adapter.reconcile.restored).toBe(1);
      adapter.close();
      reg.close();
    });

    it("final present + bak present rolls back to previous (FR-005)", () => {
      writeFileSync(join(dataDir, "ara.db"), "new");
      writeFileSync(join(dataDir, "ara.db.bak"), "old");
      const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
      reg.setSync({ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 });
      const adapter = createNodeAdapter({ dataDir, registryPath });
      expect(readFileSync(join(dataDir, "ara.db"), "utf8")).toBe("old");
      expect(existsSync(join(dataDir, "ara.db.bak"))).toBe(false);
      adapter.close();
      reg.close();
    });

    it("trash present + registry present + final absent restores (FR-005)", () => {
      touch(dataDir, "ara.db.trash");
      const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
      reg.setSync({ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 });
      const adapter = createNodeAdapter({ dataDir, registryPath });
      expect(existsSync(join(dataDir, "ara.db"))).toBe(true);
      expect(existsSync(join(dataDir, "ara.db.trash"))).toBe(false);
      adapter.close();
      reg.close();
    });

    it("trash present + registry absent + final absent removes trash (FR-005)", () => {
      touch(dataDir, "ara.db.trash");
      const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
      const adapter = createNodeAdapter({ dataDir, registryPath });
      expect(existsSync(join(dataDir, "ara.db.trash"))).toBe(false);
      expect(existsSync(join(dataDir, "ara.db"))).toBe(false);
      adapter.close();
      reg.close();
    });

    it("abandoned tmp is removed and stale registry entries are dropped (FR-005)", () => {
      touch(dataDir, "ara.db.tmp-99");
      const reg = new NodeSqliteRegistry(registryPath, nodeSqliteDriverFactory);
      reg.setSync({ id: "ara", name: "ARA", installedAt: 1, versionCode: 1 });
      const adapter = createNodeAdapter({ dataDir, registryPath });
      expect(existsSync(join(dataDir, "ara.db.tmp-99"))).toBe(false);
      expect(adapter.reconcile.removedTmp).toBe(1);
      expect(adapter.reconcile.removedStaleRegistry).toBe(1);
      expect(reg.listSync().length).toBe(0);
      adapter.close();
      reg.close();
    });
  });

  it("cancellation at each checkpoint leaves nothing installed and no stray files (US-005 FR-005 NFR-004 AC-025)", async () => {
    const stages = ["validating_header", "validating_schema", "sanity_check", "promoting", "registering"] as const;
    for (const stage of stages) {
      const dataDir2 = tmpDir();
      const regPath2 = join(dataDir2, "store.db");
      const adapter = createNodeAdapter({ dataDir: dataDir2, registryPath: regPath2 });
      const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
      const token = { aborted: false };
      const observer = {
        onProgress: (p: { stage: string }) => {
          if (p.stage === stage) token.aborted = true;
        },
      };
      await expect(engine.installVersion({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, token }, observer)).rejects.toMatchObject({ code: "cancelled" });
      expect(await adapter.installer.isInstalled("ara")).toBe(false);
      assertNoStrayFiles(dataDir2, "ara");
      // no residual .db with new content
      expect(existsSync(join(dataDir2, "ara.db"))).toBe(false);
      adapter.close();
      rmSync(dataDir2, { recursive: true, force: true });
    }
  });
});

function canonicalIndex(bookId: string): number {
  const order = ["gen", "exo", "lev", "num", "deu", "jos", "jdg", "rut", "1sa", "2sa", "1ki", "2ki", "1ch", "2ch", "ezr", "neh", "est", "job", "psa", "pro", "ecc", "sng", "isa", "jer", "lam", "ezk", "dan", "hos", "jol", "amo", "oba", "jon", "mic", "nam", "hab", "zep", "hag", "zec", "mal", "mat", "mrk", "luk", "jhn", "act", "rom", "1co", "2co", "gal", "eph", "php", "col", "1th", "2th", "1ti", "2ti", "tit", "phm", "heb", "jas", "1pe", "2pe", "1jo", "2jo", "3jo", "jud", "rev"];
  return order.indexOf(bookId);
}

function buildAltBytes(books: { id: string }[], verses: { bookId: string; chapter: number; verse: number; text: string }[]): Uint8Array {
  const d = mkdtempSync(join(tmpdir(), "ob-alt-"));
  const f = join(d, "b.db");
  const drv = nodeSqliteDriverFactory(f, { readOnly: false });
  drv.exec("CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  drv.exec("CREATE TABLE book (id INTEGER PRIMARY KEY)");
  drv.exec("CREATE TABLE verse (book_id INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL, text TEXT NOT NULL, translation TEXT DEFAULT '')");
  drv.prepare("INSERT INTO metadata VALUES ('name','ARA')").run();
  for (const b of books) {
    const intId = bookIdToInt(b.id);
    if (intId !== undefined) drv.prepare("INSERT INTO book VALUES (?)").run(intId);
  }
  for (const v of verses) {
    const intId = bookIdToInt(v.bookId);
    if (intId !== undefined) drv.prepare("INSERT INTO verse (book_id, chapter, verse, text) VALUES (?,?,?,?)").run(intId, v.chapter, v.verse, v.text);
  }
  drv.close();
  const bytes = new Uint8Array(readFileSync(f));
  rmSync(d, { recursive: true, force: true });
  return bytes;
}
