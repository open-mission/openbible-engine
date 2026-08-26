import { describe, it, expect } from "vitest";
import { EngineError, BOOKS } from "@openbible/engine-core";
import { FakePackageSource } from "@openbible/engine-testing";
import { makeEngine } from "./helpers.js";

describe("openbible engine facade", () => {
  // SPECSFY: US-002 FR-009 NFR-002 AC-009
  it("delegates listInstalledVersions to registry and reflects install", async () => {
    const { engine, registry } = makeEngine();
    expect(await engine.listInstalledVersions()).toEqual([]);
    await engine.installVersion({ versionId: "ara" });
    expect((await engine.listInstalledVersions()).map((v) => v.id)).toContain("ara");
    expect(registry.has("ara")).toBe(true);
  });

  // SPECSFY: US-002 FR-008 NFR-001 AC-008
  it("throws version_not_installed for getBooks on uninstalled version", async () => {
    const { engine } = makeEngine();
    await expect(engine.getBooks("nvi")).rejects.toMatchObject({ code: "version_not_installed" });
  });

  // SPECSFY: US-002 FR-006 NFR-006 AC-006
  it("delegates getBooks to library after install and keeps canonical order", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const books = await engine.getBooks("ara");
    expect(books.length).toBeGreaterThan(0);
    const ids = books.map((b) => b.id);
    const index = new Map(BOOKS.map((b, i) => [b.id, i]));
    const sorted = [...ids].sort((a, b) => (index.get(a) ?? 9999) - (index.get(b) ?? 9999));
    expect(ids).toEqual(sorted);
  });

  // SPECSFY: US-003 FR-006 NFR-003 AC-006
  it("reads a chapter ordered by verse", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const verses = await engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 1 });
    expect(verses.length).toBe(3);
    expect(verses.every((v, i) => i === 0 || v.verse > verses[i - 1].verse)).toBe(true);
  });

  // SPECSFY: US-003 FR-008 NFR-004 AC-018
  it("rejects chapter zero or above the book limit", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    await expect(engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 0 })).rejects.toMatchObject({ code: "invalid_reference" });
    await expect(engine.getChapter({ versionId: "ara", bookId: "gen", chapter: 999 })).rejects.toMatchObject({ code: "invalid_reference" });
  });

  // SPECSFY: US-004 FR-007 NFR-003 AC-007
  it("searches substring case-insensitive with explicit limit", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const res = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThanOrEqual(res.results.length);
    expect(res.results.length).toBeLessThanOrEqual(5);
  });

  // SPECSFY: US-004 FR-007 NFR-003 AC-007 AC-027
  it("empty query returns an empty result set", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const res = await engine.searchVerses({ versionId: "ara", query: "  ", limit: 5 });
    expect(res.results).toEqual([]);
    expect(res.total).toBe(0);
  });

  // SPECSFY: US-004 FR-007 NFR-003 AC-027
  it("validates the search limit range", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    await expect(engine.searchVerses({ versionId: "ara", query: "a", limit: 0 })).rejects.toMatchObject({ code: "invalid_reference" });
  });

  // SPECSFY: US-005 FR-003 FR-009 NFR-001 AC-013 AC-029
  it("local operations do not attempt HTTP even with a packageSource present", async () => {
    const source = new FakePackageSource();
    let fetchCalls = 0;
    source.fetchPackage = async () => {
      fetchCalls++;
      throw new EngineError("network_unavailable", "must not be called for local reads");
    };
    const { engine } = makeEngine({ packageSource: source });
    await engine.installVersion({ versionId: "ara", bytes: new Uint8Array([1, 2, 3]) });
    expect((await engine.getBooks("ara")).length).toBeGreaterThan(0);
    expect(fetchCalls).toBe(0);
  });

  // SPECSFY: US-001 FR-003 NFR-006 AC-003
  it("listAvailableVersions defers to the packageSource", async () => {
    const source = new FakePackageSource();
    const { engine } = makeEngine({ packageSource: source });
    expect((await engine.listAvailableVersions()).some((v) => v.id === "ara")).toBe(true);
  });

  // SPECSFY: US-001 FR-003 NFR-001 AC-003
  it("treats the catalogue as optional (empty, no network) when no source resolves", async () => {
    const { engine } = makeEngine({ packageSource: { listAvailable: async () => [], fetchPackage: async () => new Uint8Array([1]) } });
    expect(await engine.listAvailableVersions()).toEqual([]);
  });

  // SPECSFY: US-005 FR-002 NFR-002 AC-023
  it("parseReference resolves basic cases", () => {
    const { engine } = makeEngine();
    const parsed = engine.parseReference({
      query: "Gn 1:15",
      books: [{ id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 50 }],
    });
    expect(parsed).toMatchObject({ bookId: "gen", chapter: 1, verseStart: 15 });
  });

  // SPECSFY: US-001 FR-001 NFR-004 AC-001 AC-011
  it("normalizes and rejects path traversal in a version id", async () => {
    const { engine } = makeEngine();
    await expect(engine.getBooks("../etc/passwd")).rejects.toMatchObject({ code: "invalid_package" });
  });
});
