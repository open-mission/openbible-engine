#!/usr/bin/env node
import { createBibleEngine } from "@openbible/engine";
import { FakeLibrary, FakeRegistry, FakeClock, createAraFixture } from "@openbible/engine-testing";
import { BOOKS, EngineError } from "@openbible/engine-core";

// Public-exports-only CLI. All operations via engine facade + fakes.

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

async function createReadyEngine(): Promise<{
  engine: ReturnType<typeof createBibleEngine>;
  library: FakeLibrary;
  registry: FakeRegistry;
  clock: FakeClock;
  fixture: ReturnType<typeof createAraFixture>;
}> {
  const fixture = createAraFixture();
  const library = new FakeLibrary();
  const registry = new FakeRegistry();
  const clock = new FakeClock();
  const engine = createBibleEngine({ library, registry, clock });
  // Ensure ARA installed via public installVersion (atomic cycle)
  const installed = await registry.get(fixture.versionId);
  if (!installed) {
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
  }
  return { engine, library, registry, clock, fixture };
}

export async function runCheck(): Promise<{ ok: boolean; results: Array<Record<string, unknown>> }> {
  const results: Array<Record<string, unknown>> = [];
  let ok = true;
  const push = (op: string, pass: boolean, data?: unknown, error?: unknown) => {
    results.push({ op, pass, ...(data !== undefined ? { data } : {}), ...(error !== undefined ? { error } : {}) });
    if (!pass) ok = false;
  };

  try {
    const fixture = createAraFixture();
    const library = new FakeLibrary();
    const registry = new FakeRegistry();
    const clock = new FakeClock();
    const engine = createBibleEngine({ library, registry, clock });

    // 1. listInstalled empty
    try {
      const list = await engine.listInstalledVersions();
      push("listInstalled_initial", Array.isArray(list) && list.length === 0, list);
    } catch (e) {
      push("listInstalled_initial", false, undefined, e instanceof EngineError ? e.code : String(e));
    }

    // 2. install
    try {
      await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
      push("install", true);
    } catch (e) {
      push("install", false, undefined, e instanceof EngineError ? e.code : String(e));
    }

    // 3. listInstalled after install
    try {
      const list = await engine.listInstalledVersions();
      const hasAra = list.some((v) => v.id === fixture.versionId);
      push("listInstalled_after_install", hasAra, list);
    } catch (e) {
      push("listInstalled_after_install", false, undefined, String(e));
    }

    // 4. getBooks
    try {
      const books = await engine.getBooks(fixture.versionId);
      const pass = books.length > 0 && books.some((b) => b.id === "gen");
      push("getBooks", pass, books.slice(0, 2));
    } catch (e) {
      push("getBooks", false, undefined, String(e));
    }

    // 5. getChapter
    try {
      const verses = await engine.getChapter({ versionId: fixture.versionId, bookId: "gen", chapter: 1 });
      const sorted = verses.every((v, i) => i === 0 || v.verse > verses[i - 1].verse);
      push("getChapter", verses.length === 3 && sorted, verses);
    } catch (e) {
      push("getChapter", false, undefined, String(e));
    }

    // 6. search
    try {
      const res = await engine.searchVerses({ versionId: fixture.versionId, query: "Deus", limit: 10 });
      const pass = res.results.length > 0 && res.total >= res.results.length;
      push("search", pass, res);
    } catch (e) {
      push("search", false, undefined, String(e));
    }

    // 7. parse
    try {
      const parsed = engine.parseReference({ query: "Gn 1:1", books: fixture.books });
      push("parse", parsed !== null && parsed.bookId === "gen" && parsed.chapter === 1, parsed);
    } catch (e) {
      push("parse", false, undefined, String(e));
    }

    // 8. uninstall
    try {
      await engine.uninstallVersion(fixture.versionId);
      const list = await engine.listInstalledVersions();
      push("uninstall", list.length === 0, list);
    } catch (e) {
      push("uninstall", false, undefined, String(e));
    }

    // 9. reinstall after uninstall to prove clean state
    try {
      await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
      const books = await engine.getBooks(fixture.versionId);
      push("reinstall_getBooks", books.length > 0, books.length);
    } catch (e) {
      push("reinstall_getBooks", false, undefined, String(e));
    }
  } catch (e) {
    push("check_fatal", false, undefined, String(e));
  }

  return { ok, results };
}

export async function runListBooks(versionId: string): Promise<unknown> {
  const { engine } = await createReadyEngine();
  // If requested versionId differs from ara, install it as well
  const normalizedRequested = versionId.trim().toLowerCase();
  if (normalizedRequested !== "ara") {
    const fixture = createAraFixture();
    // create synthetic bytes for requested versionId using same payload but different id
    const { createSyntheticBibleBytes } = await import("@openbible/engine-testing");
    const bytes = createSyntheticBibleBytes(versionId, fixture.books, fixture.verses, versionId);
    try {
      await engine.installVersion({ versionId, bytes });
    } catch {
      // ignore if already installed
    }
  }
  return engine.getBooks(versionId);
}

export async function runGetChapter(versionId: string, bookId: string, chapterStr: string): Promise<unknown> {
  const chapter = Number.parseInt(chapterStr, 10);
  const { engine } = await createReadyEngine();
  return engine.getChapter({ versionId, bookId, chapter });
}

export async function runSearch(versionId: string, query: string, limitStr?: string): Promise<unknown> {
  const limit = limitStr ? Number.parseInt(limitStr, 10) : 10;
  const { engine } = await createReadyEngine();
  return engine.searchVerses({ versionId, query, limit });
}

export function runParse(query: string): unknown {
  // Use BOOKS from engine-core public export only
  // Need books list; use BOOKS directly
  const { parseReference } = (() => {
    // dynamic to avoid bundling issues but still public export
    // we import at top? BOOKS already imported, need parseReference via engine-core? Use engine's parseReference helper
    // For simplicity, use engine-core's parseReference if available, otherwise manual
    return { parseReference: undefined as unknown as never };
  })();
  void parseReference;
  // Create temporary engine with FakeLibrary to use its parseReference (which delegates to core)
  // But parse is sync; we can use createBibleEngine's parseReference with BOOKS
  const library = new FakeLibrary();
  const registry = new FakeRegistry();
  const engine = createBibleEngine({ library, registry });
  const result = engine.parseReference({ query, books: [...BOOKS] });
  return result;
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(`conformance-cli - proves consumption via public exports
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
        const [versionId] = args;
        if (!versionId) throw new EngineError("invalid_reference", "Missing versionId");
        const books = await runListBooks(versionId);
        printJson(books);
        break;
      }
      case "get-chapter": {
        const [versionId, bookId, chapter] = args;
        if (!versionId || !bookId || !chapter) throw new EngineError("invalid_reference", "Usage: get-chapter <versionId> <bookId> <chapter>");
        const verses = await runGetChapter(versionId, bookId, chapter);
        printJson(verses);
        break;
      }
      case "search": {
        const [versionId, query, limit] = args;
        if (!versionId || !query) throw new EngineError("invalid_reference", "Usage: search <versionId> <query> [limit]");
        const result = await runSearch(versionId, query, limit);
        printJson(result);
        break;
      }
      case "parse": {
        const query = args.join(" ");
        if (!query) throw new EngineError("invalid_reference", "Missing query");
        const result = runParse(query);
        printJson(result);
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

// Only run main if this file is executed directly (not imported in tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
