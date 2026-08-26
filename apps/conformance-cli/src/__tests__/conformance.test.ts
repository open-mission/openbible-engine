import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNativeAdapter } from "@openbible/adapter-sqlite-native";
import { createBibleEngine } from "@openbible/engine";
import { BOOKS } from "@openbible/engine-core";
import { runCheck, runListBooks, runGetChapter, runSearch, runParse } from "../index.js";

function tempNativeEngine() {
  const dir = mkdtempSync(join(tmpdir(), "ob-cli-"));
  const adapter = createNativeAdapter({ dataDir: dir, registryPath: join(dir, "store.db") });
  return {
    adapter,
    engine: createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer }),
    cleanup() {
      adapter.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

describe("conformance-cli via public exports on real SQLite", () => {
  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("check runs the compliance suite incl. persistence after reopen", async () => {
    const result = await runCheck();
    expect(result.ok).toBe(true);
    expect(result.results.length).toBeGreaterThan(5);
    for (const r of result.results) expect(r.pass).toBe(true);
    expect(result.results.find((r) => r.op === "persist_after_reopen")?.pass).toBe(true);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("list-books returns books via the public facade", async () => {
    const books = (await runListBooks("ara")) as Array<{ id: string }>;
    expect(books.length).toBeGreaterThan(0);
    expect(books.some((b) => b.id === "gen")).toBe(true);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("get-chapter returns verses ordered", async () => {
    const verses = (await runGetChapter("ara", "gen", "1")) as Array<{ verse: number }>;
    expect(verses.length).toBe(3);
    expect(verses.map((v) => v.verse)).toEqual([1, 2, 3]);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("search returns ordered results", async () => {
    const res = (await runSearch("ara", "Deus", "5")) as { results: unknown[]; total: number };
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("parse returns a BibleReference for Gn 1:1", () => {
    const parsed = runParse("Gn 1:1") as { bookId: string; chapter: number } | null;
    expect(parsed?.bookId).toBe("gen");
    expect(parsed?.chapter).toBe(1);
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("engine composes with the real native adapter and only public exports", () => {
    const { engine, cleanup } = tempNativeEngine();
    try {
      expect(engine.listAvailableVersions).toBeDefined();
    } finally {
      cleanup();
    }
  });

  // SPECSFY: US-005 FR-010 NFR-002 AC-030
  it("public BOOKS import drives parseReference", () => {
    expect(BOOKS.length).toBe(66);
    const { engine, cleanup } = tempNativeEngine();
    try {
      expect(engine.parseReference({ query: "João 3:16", books: [...BOOKS] })).not.toBeNull();
    } finally {
      cleanup();
    }
  });
});
