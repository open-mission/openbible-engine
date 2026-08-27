import { test, expect, type Page } from "@playwright/test";
import { buildLegacyFixture, INVALID_BYTES } from "../unit/helpers/fixture.js";

const BASE = "http://127.0.0.1:8787";
const HARNESS = "/tests/browser/harness/index.html";

const MAIN_FIXTURE = buildLegacyFixture({
  versionId: "ara",
  name: "ARA",
  books: [
    { bookId: "gen", intId: 1, verses: [{ chapter: 1, verse: 1, text: "No princípio criou Deus os céus e a terra." }] },
    { bookId: "exo", intId: 2, verses: [{ chapter: 1, verse: 1, text: "Estes são os nomes dos filhos de Israel." }] },
    { bookId: "jhn", intId: 43, verses: [{ chapter: 1, verse: 1, text: "No princípio era o Verbo." }] },
  ],
});

const SEARCH_FIXTURE = buildLegacyFixture({
  versionId: "ara",
  name: "ARA",
  books: [
    { bookId: "gen", intId: 1, verses: [
      { chapter: 1, verse: 1, text: "Deus criou os céus." },
      { chapter: 1, verse: 2, text: "Deus alegria." },
    ] },
    { bookId: "exo", intId: 2, verses: [{ chapter: 1, verse: 1, text: "Deus alegria exodo." }] },
    { bookId: "jhn", intId: 43, verses: [{ chapter: 1, verse: 1, text: "Deus alegria joao." }] },
  ],
});

async function openHarness(page: Page): Promise<void> {
  await page.goto(HARNESS);
}

function captureExternal(page: Page): { set: string[]; enable: () => void; disable: () => void } {
  const set: string[] = [];
  const on = (r: { url(): string }) => {
    if (!r.url().startsWith(BASE)) set.push(r.url());
  };
  return {
    set,
    enable: () => page.on("request", on),
    disable: () => page.removeListener("request", on),
  };
}

test.describe("install and library", () => {
  test("AC-004: installs a legacy fixture, reopens without network and persists the registry", async ({
    page,
  }) => {
    // SPECSFY: US-002 FR-004 FR-005 FR-006 NFR-003 NFR-004 NFR-005 AC-004
    await openHarness(page);
    const net = captureExternal(page);
    net.enable();
    const manifest = Array.from(MAIN_FIXTURE);
    const result = await page.evaluate(async (bytes) => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      const adapter = await api.createWebAdapter({});
      const installed = await adapter.installer.install({
        versionId: "ara",
        bytes: new Uint8Array(bytes),
        name: "ARA",
        installedAt: 1234,
        versionCode: 1,
      });
      await adapter.reconcile();
      await adapter.close();
      const reopened = await api.createWebAdapter({});
      const list = (await reopened.registry.list()).map((i: { id: string }) => i.id);
      const books = (await reopened.library.getBooks("ara")).map((b: { id: string }) => b.id);
      const name = await reopened.library.getVersionName("ara");
      await reopened.close();
      return { installed: installed.id, list, books, name };
    }, manifest);
    net.disable();
    expect(result.installed).toBe("ara");
    expect(result.list).toEqual(["ara"]);
    expect(result.books).toEqual(["gen", "exo", "jhn"]);
    expect(result.name).toBe("ARA");
    expect(net.set).toEqual([]);
  });

  test("AC-005: reads and searches by the public contract with a total counted before LIMIT", async ({
    page,
  }) => {
    // SPECSFY: US-002 FR-004 FR-005 FR-006 NFR-003 NFR-004 NFR-005 AC-005
    await openHarness(page);
    const manifest = Array.from(SEARCH_FIXTURE);
    const result = await page.evaluate(async (bytes) => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      const adapter = await api.createWebAdapter({});
      // expose search on a fixture without jhn-vs-gen ordering surprises
      await adapter.installer.install({
        versionId: "ara",
        bytes: new Uint8Array(bytes),
        name: "ARA",
        installedAt: 1,
        versionCode: 1,
      });
      const chapter = await adapter.library.getChapter("ara", "jhn", 1);
      const search = await adapter.library.search("ara", "alegria", 2);
      const empty = await adapter.library.search("ara", "inexistente-zilu", 5);
      await adapter.close();
      return {
        chapter: chapter.map((v: { verse: number; text: string }) => ({ verse: v.verse, text: v.text })),
        searchTotal: search.total,
        searchResults: search.results.map((v: { bookId: string }) => v.bookId),
        emptyTotal: empty.total,
        emptyResults: empty.results.length,
      };
    }, manifest);
    expect(result.chapter).toEqual([{ verse: 1, text: "Deus alegria joao." }]);
    expect(result.searchTotal).toBe(3);
    expect(result.searchResults).toEqual(["gen", "exo"]);
    expect(result.emptyTotal).toBe(0);
    expect(result.emptyResults).toBe(0);
  });

  test("AC-006: rejects invalid packages and cancels without leaving partial data", async ({ page }) => {
    // SPECSFY: US-002 FR-004 FR-005 FR-006 NFR-004 NFR-005 AC-006
    await openHarness(page);
    const invalid = Array.from(INVALID_BYTES);
    const result = await page.evaluate(async (bytes) => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      const adapter = await api.createWebAdapter({});
      let invalidCode = "none";
      try {
        await adapter.installer.install({
          versionId: "ara",
          bytes: new Uint8Array(bytes),
          installedAt: 1,
          versionCode: 1,
        });
      } catch (err) {
        invalidCode = (err as { code?: string }).code ?? "unknown";
      }
      let cancelCode = "none";
      try {
        await adapter.installer.install({
          versionId: "ara",
          bytes: new Uint8Array(bytes),
          installedAt: 1,
          versionCode: 1,
          token: { aborted: true, reason: "test" },
        });
      } catch (err) {
        cancelCode = (err as { code?: string }).code ?? "unknown";
      }
      const list = (await adapter.registry.list()).map((i: { id: string }) => i.id);
      await adapter.close();
      return { invalidCode, cancelCode, list };
    }, invalid);
    expect(result.invalidCode).toBe("invalid_package");
    expect(result.cancelCode).toBe("cancelled");
    expect(result.list).toEqual([]);
  });
});
