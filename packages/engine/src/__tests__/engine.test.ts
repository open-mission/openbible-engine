import { describe, it, expect } from "vitest";
import { createBibleEngine } from "../engine.js";
import { EngineError } from "@openbible/engine-core";
import { FakeLibrary, FakeRegistry, FakeClock, FakePackageSource, createAraFixture } from "@openbible/engine-testing";

describe("engine facade", () => {
  // SPECSFY: US-002 FR-008 NFR-001 AC-008
  it("throws version_not_installed for getBooks when not installed", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.getBooks("nvi")).rejects.toMatchObject({ code: "version_not_installed" });
  });

  // SPECSFY: US-002 FR-008 NFR-001 AC-008
  it("throws version_not_installed for getChapter when not installed", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 1 })).rejects.toMatchObject({ code: "version_not_installed" });
  });

  // SPECSFY: US-002 FR-009 NFR-002 AC-009
  it("facade delegates to registry without exposing SQL", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    const list = await engine.listInstalledVersions();
    expect(Array.isArray(list)).toBe(true);
    // should not expose executeSql
    expect(engine as unknown as Record<string, unknown>).not.toHaveProperty("executeSql");
  });

  // SPECSFY: US-002 FR-009 NFR-002 AC-009
  it("listInstalledVersions delegates to registry.list", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry([{ id: "ara", name: "ARA", installedAt: Date.now(), versionCode: 1 }]);
    const engine = createBibleEngine({ library: lib, registry: reg });
    const list = await engine.listInstalledVersions();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("ara");
  });

  // SPECSFY: US-001 FR-003 NFR-003 AC-003
  it("listAvailableVersions returns catalog from packageSource", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const source = new FakePackageSource();
    const engine = createBibleEngine({ library: lib, registry: reg, packageSource: source });
    const avail = await engine.listAvailableVersions();
    expect(avail.length).toBeGreaterThan(0);
  });

  // SPECSFY: US-003 FR-003 NFR-006 AC-013
  it("getBooks offline does not trigger fetch", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const source = new FakePackageSource();
    let fetched = false;
    const origFetch = source.fetchPackage.bind(source);
    source.fetchPackage = async (...args) => {
      fetched = true;
      return origFetch(...args);
    };
    const engine = createBibleEngine({ library: lib, registry: reg, packageSource: source });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const books = await engine.getBooks(fixture.versionId);
    expect(books.length).toBeGreaterThan(0);
    expect(fetched).toBe(false);
    void origFetch;
  });

  // SPECSFY: US-005 FR-009 NFR-001 AC-029
  it("search offline does not trigger fetch", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const source = new FakePackageSource();
    let fetched = false;
    source.fetchPackage = async () => {
      fetched = true;
      throw new EngineError("network_unavailable", "fetch should not be called");
    };
    const engine = createBibleEngine({ library: lib, registry: reg, packageSource: source });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const res = await engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(fetched).toBe(false);
  });

  // SPECSFY: US-005 FR-009 NFR-001 AC-029
  it("search with empty query returns empty without fetch", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const res = await engine.searchVerses({ versionId: fixture.versionId, query: "   ", limit: 10 });
    expect(res.results.length).toBe(0);
  });

  // SPECSFY: US-001 FR-003 NFR-003 AC-003
  it("offline operations work with no packageSource", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const books = await engine.getBooks(fixture.versionId);
    expect(books.length).toBeGreaterThan(0);
  });

  // SPECSFY: US-002 FR-009 NFR-002 AC-009
  it("throws invalid_reference for invalid chapter", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    await expect(engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 0 })).rejects.toMatchObject({ code: "invalid_reference" });
    await expect(engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 999 })).rejects.toMatchObject({ code: "invalid_reference" });
  });

  // additional marker for coverage
  // SPECSFY: US-001 FR-003 NFR-003 AC-003
  it("listAvailableVersions empty when no source", async () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    const avail = await engine.listAvailableVersions();
    expect(avail).toEqual([]);
  });
});
