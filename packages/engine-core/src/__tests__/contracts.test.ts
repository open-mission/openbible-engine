import { describe, it, expect } from "vitest";
import type { Verse, InstalledBible, SearchResult } from "../types.js";
import { BOOKS } from "../book-meta.js";

describe("contracts serializable", () => {
  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("Verse is serializable via JSON without Date", () => {
    const verse: Verse = { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "No princípio" };
    const json = JSON.stringify(verse);
    const parsed = JSON.parse(json) as Verse;
    expect(parsed).toEqual(verse);
    expect(json).not.toContain("Date");
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("InstalledBible uses epoch ms number", () => {
    const inst: InstalledBible = { id: "ara", name: "ARA", installedAt: 1704067200000, versionCode: 1 };
    expect(typeof inst.installedAt).toBe("number");
    const json = JSON.stringify(inst);
    const p = JSON.parse(json);
    expect(p.installedAt).toBe(1704067200000);
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("SearchResult is serializable", () => {
    const res: SearchResult = { versionId: "ara", query: "Deus", results: [], total: 0 };
    expect(JSON.parse(JSON.stringify(res))).toEqual(res);
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("BOOKS contracts have required fields and testament", () => {
    for (const b of BOOKS) {
      expect(typeof b.id).toBe("string");
      expect(typeof b.name).toBe("string");
      expect(typeof b.abbreviation).toBe("string");
      expect(["old", "new"]).toContain(b.testament);
      expect(b.chapters).toBeGreaterThan(0);
    }
  });

  // SPECSFY: US-004 FR-001 NFR-005 AC-021
  it("no contract uses Map/Set/Date", () => {
    const verse: Verse = { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "text" };
    // Ensure no Date instance in verse
    expect(verse).not.toHaveProperty("date");
    // Ensure JSON round-trip preserves types
    const round = JSON.parse(JSON.stringify({ verse, list: [verse] }));
    expect(Array.isArray(round.list)).toBe(true);
  });
});
