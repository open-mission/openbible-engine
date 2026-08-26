import { describe, it, expect } from "vitest";
import { makeEngine } from "./helpers.js";

describe("openbible search", () => {
  // SPECSFY: US-004 FR-007 NFR-003 AC-007
  it("returns substring matches ordered and limited", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const res = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 50 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results.length).toBeLessThanOrEqual(50);
    for (const v of res.results) expect(v.text.toLowerCase()).toContain("deus");
  });

  // SPECSFY: US-005 FR-007 NFR-006 AC-027
  it("enforces the explicit limit", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const full = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 100 });
    const limited = await engine.searchVerses({ versionId: "ara", query: "Deus", limit: 2 });
    expect(limited.results.length).toBe(2);
    expect(limited.total).toBe(full.total);
  });

  // SPECSFY: US-005 FR-007 NFR-003 AC-007
  it("empty query returns empty", async () => {
    const { engine } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    const res = await engine.searchVerses({ versionId: "ara", query: "", limit: 10 });
    expect(res.results).toEqual([]);
    expect(res.total).toBe(0);
  });

  // SPECSFY: US-005 FR-008 NFR-001 AC-008 AC-028
  it("must be installed to search", async () => {
    const { engine } = makeEngine();
    await expect(engine.searchVerses({ versionId: "nvi", query: "a", limit: 10 })).rejects.toMatchObject({ code: "version_not_installed" });
  });
});
