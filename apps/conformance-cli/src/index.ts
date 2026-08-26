#!/usr/bin/env node
import { createBibleEngine } from "@openbible/engine";
import type { BibleEngine } from "@openbible/engine";
import { createNodeAdapter } from "@openbible/adapter-sqlite-node";
import type { NodeAdapter } from "@openbible/adapter-sqlite-node";
import { buildLegacySqliteBibleFixture, LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { BOOKS, EngineError } from "@openbible/engine-core";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function printError(err: unknown): void {
  if (err instanceof EngineError) {
    console.error(JSON.stringify({ error: { code: err.code, message: err.message } }, null, 2));
  } else if (err instanceof Error) {
    console.error(JSON.stringify({ error: { code: "unknown", message: err.message } }, null, 2));
  } else {
    console.error(JSON.stringify({ error: { code: "unknown", message: String(err) } }, null, 2));
  }
}

/** Real legacy-schema SQLite engine backed by a temp data dir + persistent registry file. */
function makeRealEngine(): {
  engine: BibleEngine;
  adapter: NodeAdapter;
  dataDir: string;
  registryPath: string;
  cleanup(): void;
} {
  const dataDir = mkdtempSync(join(tmpdir(), "ob-cli-"));
  const registryPath = join(dataDir, "store.db");
  const adapter = createNodeAdapter({ dataDir, registryPath });
  const engine = createBibleEngine({ library: adapter.library, registry: adapter.registry, installer: adapter.installer });
  return {
    engine,
    adapter,
    dataDir,
    registryPath,
    cleanup() {
      try {
        adapter.close();
      } catch {
        // ignore
      }
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}

async function ensureInstalled(engine: BibleEngine, versionId: string): Promise<void> {
  const installed = await engine.listInstalledVersions();
  if (installed.some((v) => v.id === versionId)) return;
  const fixture =
    versionId === LEGACY_ARA_FIXTURE.versionId
      ? LEGACY_ARA_FIXTURE
      : buildLegacySqliteBibleFixture(versionId, versionId.toUpperCase());
  await engine.installVersion({ versionId, bytes: fixture.bytes });
}

export async function runCheck(): Promise<{ ok: boolean; results: Array<Record<string, unknown>> }> {
  const results: Array<Record<string, unknown>> = [];
  let ok = true;
  const push = (op: string, pass: boolean, data?: unknown, error?: unknown) => {
    results.push({ op, pass, ...(data !== undefined ? { data } : {}), ...(error !== undefined ? { error } : {}) });
    if (!pass) ok = false;
  };

  const ctx = makeRealEngine();
  try {
    const { engine, adapter, dataDir, registryPath } = ctx;
    const fixture = LEGACY_ARA_FIXTURE;

    push("listInstalled_initial", (await engine.listInstalledVersions()).length === 0);

    try {
      await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
      push("install_real_sqlite", true);
    } catch (e) {
      push("install_real_sqlite", false, undefined, e instanceof EngineError ? e.code : String(e));
    }

    push("listInstalled_after_install", (await engine.listInstalledVersions()).some((v) => v.id === fixture.versionId));

    const books = await engine.getBooks(fixture.versionId);
    push("getBooks", books.length > 0 && books.some((b) => b.id === "gen"), books.slice(0, 2));

    const verses = await engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 });
    push("getChapter", verses.length === 3 && verses.every((v, i) => i === 0 || v.verse > verses[i - 1].verse), verses);

    const search = await engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 10 });
    push("search", search.results.length > 0 && search.total >= search.results.length, { total: search.total, first: search.results[0]?.text });

    // Persistence proof: close the adapter (simulate process restart) and reopen.
    adapter.close();
    const reopened = createNodeAdapter({ dataDir, registryPath });
    try {
      const reopenedEngine = createBibleEngine({ library: reopened.library, registry: reopened.registry, installer: reopened.installer });
      const stillInstalled = (await reopenedEngine.listInstalledVersions()).some((v) => v.id === fixture.versionId);
      const booksAfter = await reopenedEngine.getBooks(fixture.versionId);
      const chapterAfter = await reopenedEngine.getChapter({ versionId: fixture.versionId, bookId: "jhn", chapter: 1 });
      push("persist_after_reopen", stillInstalled && booksAfter.length > 0 && chapterAfter.length === 3, {
        stillInstalled,
        books: booksAfter.length,
        chapter: chapterAfter.length,
      });

      try {
        await reopenedEngine.uninstallVersion(fixture.versionId);
        push("uninstall", (await reopenedEngine.listInstalledVersions()).length === 0);
      } catch (e) {
        push("uninstall", false, undefined, e instanceof EngineError ? e.code : String(e));
      }
    } finally {
      reopened.close();
    }
  } catch (e) {
    push("check_fatal", false, undefined, String(e));
  } finally {
    ctx.cleanup();
  }

  return { ok, results };
}

export async function runListBooks(versionId: string): Promise<unknown> {
  const ctx = makeRealEngine();
  try {
    await ensureInstalled(ctx.engine, versionId);
    return await ctx.engine.getBooks(versionId);
  } finally {
    ctx.cleanup();
  }
}

export async function runGetChapter(versionId: string, bookId: string, chapterStr: string): Promise<unknown> {
  const ctx = makeRealEngine();
  try {
    await ensureInstalled(ctx.engine, versionId);
    return await ctx.engine.getChapter({ versionId, bookId, chapter: Number.parseInt(chapterStr, 10) });
  } finally {
    ctx.cleanup();
  }
}

export async function runSearch(versionId: string, query: string, limitStr?: string): Promise<unknown> {
  const ctx = makeRealEngine();
  try {
    await ensureInstalled(ctx.engine, versionId);
    const limit = limitStr ? Number.parseInt(limitStr, 10) : 10;
    return await ctx.engine.searchVerses({ versionId, query, limit });
  } finally {
    ctx.cleanup();
  }
}

export function runParse(query: string): unknown {
  const { createBibleEngine: mk } = { createBibleEngine };
  const ctx = makeRealEngine();
  try {
    const engine = mk({ library: ctx.adapter.library, registry: ctx.adapter.registry, installer: ctx.adapter.installer });
    return engine.parseReference({ query, books: [...BOOKS] });
  } finally {
    ctx.cleanup();
  }
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(`conformance-cli - proves consumption via public exports on a REAL SQLite engine
Usage:
  conformance-cli check
  conformance-cli list-books <versionId>
  conformance-cli get-chapter <versionId> <bookId> <chapter>
  conformance-cli search <versionId> <query> [limit]
  conformance-cli parse <query>
`);
    process.exit(0);
  }

  try {
    switch (command) {
      case "check": {
        const result = await runCheck();
        printJson(result);
        process.exit(result.ok ? 0 : 1);
        break;
      }
      case "list-books": {
        if (!args[0]) throw new EngineError("invalid_reference", "Missing versionId");
        printJson(await runListBooks(args[0]));
        break;
      }
      case "get-chapter": {
        if (!args[0] || !args[1] || !args[2]) throw new EngineError("invalid_reference", "Usage: get-chapter <versionId> <bookId> <chapter>");
        printJson(await runGetChapter(args[0], args[1], args[2]));
        break;
      }
      case "search": {
        if (!args[0] || !args[1]) throw new EngineError("invalid_reference", "Usage: search <versionId> <query> [limit]");
        printJson(await runSearch(args[0], args[1], args[2]));
        break;
      }
      case "parse": {
        const query = args.join(" ");
        if (!query) throw new EngineError("invalid_reference", "Missing query");
        printJson(runParse(query));
        break;
      }
      default: {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
      }
    }
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
