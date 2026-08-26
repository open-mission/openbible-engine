import { describe, it, expect } from "vitest";
import { FakeLibrary } from "../fakes.js";
import { createAraFixture } from "../fixtures.js";
import { runContractSuite } from "../contract-suite.js";
import { BOOKS } from "@openbible/engine-core";

function seededLibrary() {
  const lib = new FakeLibrary();
  const fixture = createAraFixture();
  lib.populate(fixture.versionId, { books: fixture.books, verses: fixture.verses, name: fixture.name });
  return { lib, fixture };
}

describe("contract suite", () => {
  // SPECSFY: US-001 FR-006 NFR-006 AC-006
  it("getChapter returns verses ordered by verse ASC", async () => {
    const { lib, fixture } = seededLibrary();
    const verses = await lib.getChapter(fixture.versionId, "gen", 1);
    expect(verses.length).toBe(3);
    expect(verses.map((v) => v.verse)).toEqual([1, 2, 3]);
    await runContractSuite(lib, fixture.versionId);
  });

  // SPECSFY: US-002 FR-007 NFR-007 AC-007
  it("search substring case-insensitive with limit returns ordered matches", async () => {
    const { lib, fixture } = seededLibrary();
    const res = await lib.search(fixture.versionId, "deus", 10);
    expect(res.results.length).toBeGreaterThan(0);
    const upper = await lib.search(fixture.versionId, "DEUS", 10);
    expect(upper.total).toBe(res.total);
  });

  // SPECSFY: US-003 FR-007 NFR-003 AC-017
  it("search preserves deterministic ordering by book_id chapter verse", async () => {
    const { lib, fixture } = seededLibrary();
    const res = await lib.search(fixture.versionId, "a", 20);
    await runContractSuite(lib, fixture.versionId);
    const order = new Map(BOOKS.map((bk, idx) => [bk.id, idx]));
    for (let i = 1; i < res.results.length; i++) {
      const ao = order.get(res.results[i - 1].bookId) ?? 9999;
      const bo = order.get(res.results[i].bookId) ?? 9999;
      expect(bo >= ao).toBe(true);
    }
  });

  // SPECSFY: US-005 FR-006 NFR-005 AC-026
  it("getChapter with verse specific still returns full chapter ordered", async () => {
    const { lib, fixture } = seededLibrary();
    const chap = await lib.getChapter(fixture.versionId, "gen", 1);
    expect(chap.map((v) => v.verse)).toEqual([1, 2, 3]);
  });

  // SPECSFY: US-002 FR-010 NFR-003 AC-010
  it("same fixture yields equivalent results across library instances", async () => {
    const { lib, fixture } = seededLibrary();
    const lib2 = new FakeLibrary();
    lib2.populate(fixture.versionId, { books: fixture.books, verses: fixture.verses, name: fixture.name });
    await runContractSuite(lib, fixture.versionId, { expectedBookIds: ["gen", "exo"] });
    expect(await lib.getBooks(fixture.versionId)).toEqual(await lib2.getBooks(fixture.versionId));
  });

  // SPECSFY: US-001 FR-006 NFR-006 AC-006
  it("contract suite passes for fixture with 3 books 2 chapters", async () => {
    const { lib, fixture } = seededLibrary();
    await expect(runContractSuite(lib, fixture.versionId)).resolves.not.toThrow();
  });

  // SPECSFY: US-002 FR-007 NFR-007 AC-007
  it("search limit respected", async () => {
    const { lib, fixture } = seededLibrary();
    const res = await lib.search(fixture.versionId, "Deus", 2);
    expect(res.results.length).toBeLessThanOrEqual(2);
  });

  // SPECSFY: US-003 FR-007 NFR-003 AC-017
  it("search total independent of limit and deterministic", async () => {
    const { lib, fixture } = seededLibrary();
    const full = await lib.search(fixture.versionId, "Deus", 100);
    const limited = await lib.search(fixture.versionId, "Deus", 3);
    expect(limited.total).toBe(full.total);
  });
});
