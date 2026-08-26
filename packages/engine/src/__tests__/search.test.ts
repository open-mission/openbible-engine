import { describe, it, expect } from "vitest";
import { createBibleEngine } from "../engine.js";
import { FakeLibrary, FakeRegistry, createAraFixture } from "@openbible/engine-testing";

describe("search", () => {
  // SPECSFY: US-005 FR-007 NFR-006 AC-027
  it("limit 2 returns 2 when 5 matches", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const res2 = await engine.searchVerses({ versionId: fixture.versionId, query: "a", limit: 2 });
    expect(res2.results.length).toBe(2);
    const res100 = await engine.searchVerses({ versionId: fixture.versionId, query: "a", limit: 100 });
    expect(res100.results.length).toBeGreaterThanOrEqual(res2.results.length);
    expect(res100.total).toBe(res2.total);
  });

  // SPECSFY: US-005 FR-007 NFR-006 AC-027
  it("limit greater than total returns total", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const full = await engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 100 });
    expect(full.results.length).toBe(full.total);
  });

  // SPECSFY: US-005 FR-007 NFR-006 AC-027
  it("rejects invalid limit", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    await expect(engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 0 })).rejects.toMatchObject({ code: "invalid_reference" });
    await expect(engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 1001 })).rejects.toMatchObject({ code: "invalid_reference" });
  });

  // SPECSFY: US-002 FR-007 NFR-007 AC-007
  it("search is case-insensitive and ordered", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const lower = await engine.searchVerses({ versionId: fixture.versionId, query: "deus", limit: 10 });
    const upper = await engine.searchVerses({ versionId: fixture.versionId, query: "DEUS", limit: 10 });
    expect(lower.total).toBe(upper.total);
    // ordering check via canonical BOOKS order
    const { BOOKS } = await import("@openbible/engine-core");
    const order = new Map(BOOKS.map((b, i) => [b.id, i]));
    for (let i = 1; i < lower.results.length; i++) {
      const a = lower.results[i - 1];
      const b = lower.results[i];
      const ao = order.get(a.bookId) ?? 9999;
      const bo = order.get(b.bookId) ?? 9999;
      expect(bo >= ao).toBe(true);
    }
  });
});
