import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { inspectLegacySqlite } from "../src/legacy-sqlite.js";

describe("Native SQLite published schema", () => {
  it("reads verse rows whose INTEGER PRIMARY KEY is omitted from payloads", () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-001 AC-004 AC-005 AC-013
    const directory = mkdtempSync(join(tmpdir(), "openbible-r2-schema-"));
    const filename = join(directory, "ara.sqlite");
    const database = new DatabaseSync(filename);
    try {
      database.exec("CREATE TABLE metadata (key VARCHAR(255) PRIMARY KEY, value VARCHAR(255))");
      database.exec("CREATE TABLE book (id INTEGER PRIMARY KEY, book_reference_id INTEGER, testament_reference_id INTEGER, name VARCHAR(50))");
      database.exec("CREATE TABLE verse (id INTEGER PRIMARY KEY, book_id INTEGER, chapter INTEGER, verse INTEGER, text TEXT)");
      database.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)").run("name", "Almeida Revista e Atualizada");
      database.prepare("INSERT INTO book (id, book_reference_id, testament_reference_id, name) VALUES (?, ?, ?, ?)").run(1, 1, 1, "Gênesis");
      database.prepare("INSERT INTO verse (id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)").run(1, 1, 1, 1, "No princípio, criou Deus os céus e a terra.");
    } finally {
      database.close();
    }

    try {
      const parsed = inspectLegacySqlite(new Uint8Array(readFileSync(filename)), "ara");
      expect(parsed.books).toEqual([1]);
      expect(parsed.verses).toEqual([{
        bookId: 1,
        chapter: 1,
        verse: 1,
        text: "No princípio, criou Deus os céus e a terra.",
      }]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
