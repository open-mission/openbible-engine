import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildLegacySqliteBibleFixture } from "@openbible/adapter-sqlite-node";
import { createConsumerTuiEngine } from "../src/engine.js";

describe("consumer TUI: leitor e referências", () => {
  it("exibe os versículos do capítulo em ordem canônica", async () => {
    // SPECSFY: US-002 FR-002 NFR-004 AC-004
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-reader-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    try {
      await engine.installVersion({ versionId: fixture.versionId, name: fixture.name });
      const books = await engine.getBooks(fixture.versionId);
      const verses = await engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 });

      expect(books.map((book) => book.id)).toEqual(["gen", "exo", "jhn"]);
      expect(verses.map((verse) => verse.verse)).toEqual([1, 2, 3]);
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("resolve referência válida e recupera referência inválida", async () => {
    // SPECSFY: US-002 FR-002 NFR-005 AC-005
    const fixture = buildLegacySqliteBibleFixture("ara", "ARA");
    const root = mkdtempSync(join(tmpdir(), "openbible-reference-"));
    const engine = createConsumerTuiEngine({
      dataDir: join(root, "bibles"),
      registryPath: join(root, "registry.sqlite"),
      baseUrl: "https://example.test/api",
      fetchImpl: async () => new Response(fixture.bytes, { status: 200 }),
    });

    try {
      await engine.installVersion({ versionId: fixture.versionId, name: fixture.name });
      const books = await engine.getBooks(fixture.versionId);

      expect(engine.parseReference({ query: "João 1:2", books })).toEqual({
        bookId: "jhn",
        chapter: 1,
        verseStart: 2,
        verseEnd: 2,
      });
      expect(engine.parseReference({ query: "Livro inexistente 99", books })).toBeNull();
    } finally {
      engine.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
