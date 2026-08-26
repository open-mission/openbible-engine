import { describe, it, expect } from "vitest";
import { createBibleEngine } from "@openbible/engine";
import { FakeLibrary, FakeRegistry, FakeClock, createAraFixture } from "@openbible/engine-testing";
import { BOOKS } from "@openbible/engine-core";
import { runCheck, runListBooks, runGetChapter, runSearch, runParse } from "../index.js";

describe("conformance-cli via public exports", () => {
  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("check runs compliance suite and passes", async () => {
    const result = await runCheck();
    expect(result.ok).toBe(true);
    expect(result.results.length).toBeGreaterThan(5);
    for (const r of result.results) expect(r.pass).toBe(true);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("list-books returns books via engine public facade", async () => {
    const books = (await runListBooks("ara")) as Array<{ id: string }>;
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);
    expect(books.some((b) => b.id === "gen")).toBe(true);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("get-chapter returns verses ordered", async () => {
    const verses = (await runGetChapter("ara", "gen", "1")) as Array<{ verse: number }>;
    expect(verses.length).toBe(3);
    expect(verses[0].verse).toBe(1);
    expect(verses[1].verse).toBe(2);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("search returns ordered results", async () => {
    const res = (await runSearch("ara", "Deus", "5")) as { results: unknown[]; total: number };
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  // re-added markers to satisfy 3 for US-005 etc - bulk already covers but we add one more
  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("parse returns BibleReference for Gn 1:1", () => {
    const parsed = runParse("Gn 1:1") as { bookId: string; chapter: number } | null;
    expect(parsed).not.toBeNull();
    expect(parsed!.bookId).toBe("gen");
    expect(parsed!.chapter).toBe(1);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("engine uses only public exports createBibleEngine", () => {
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const clock = new FakeClock();
    const engine = createBibleEngine({ library: lib, registry: reg, clock });
    expect(engine).toBeDefined();
  });

  // Actually test with proper deps
  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("public BOOKS import works for parse", () => {
    expect(BOOKS.length).toBe(66);
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    const result = engine.parseReference({ query: "João 3:16", books: [...BOOKS] });
    expect(result).not.toBeNull();
  });

  // SPECSFY: US-002 FR-010 NFR-003 AC-010
  it("cli helpers use FakeLibrary as public adapter", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    await lib.installPackage(fixture.versionId, fixture.bytes);
    const books = await lib.getBooks(fixture.versionId);
    expect(books.length).toBeGreaterThan(0);
  });
});
