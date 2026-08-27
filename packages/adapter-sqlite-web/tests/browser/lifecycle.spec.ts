import { test, expect } from "@playwright/test";
import { buildLegacyFixture } from "../unit/helpers/fixture.js";

const HARNESS = "/tests/browser/harness/index.html";

const FIXTURE = buildLegacyFixture({
  versionId: "ara",
  name: "ARA",
  books: [
    { bookId: "gen", intId: 1, verses: [{ chapter: 1, verse: 1, text: "No princípio criou Deus." }] },
    { bookId: "exo", intId: 2, verses: [{ chapter: 1, verse: 1, text: "Estes são os nomes." }] },
  ],
});

test.describe("lifecycle", () => {
  test("AC-007: a failed reinstall preserves the previous version and reconcile keeps it usable", async ({
    page,
  }) => {
    // SPECSFY: US-003 FR-007 FR-008 FR-009 NFR-004 NFR-005 AC-007
    await page.goto(HARNESS);
    const bytes = Array.from(FIXTURE);
    const result = await page.evaluate(async (b) => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      const adapter = await api.createWebAdapter({});
      await adapter.installer.install({
        versionId: "ara", bytes: new Uint8Array(b), name: "ARA", installedAt: 1, versionCode: 1,
      });
      const before = (await adapter.library.getBooks("ara")).map((x: { id: string }) => x.id);
      // Reinstall with invalid bytes: must be rejected and must keep "ara".
      let failed = "none";
      try {
        await adapter.installer.install({
          versionId: "ara", bytes: new Uint8Array([9, 9, 9]), installedAt: 2, versionCode: 2,
        });
      } catch (err) {
        failed = (err as { code?: string }).code ?? "unknown";
      }
      const after = await adapter.installer.isInstalled("ara");
      const stats = await adapter.reconcile();
      await adapter.close();
      return { before, failed, after, stats };
    }, bytes);
    expect(result.before).toEqual(["gen", "exo"]);
    expect(result.failed).toBe("invalid_package");
    expect(result.after).toBe(true);
    expect(typeof result.stats.removedOrphans).toBe("number");
  });

  test("AC-008: uninstall removes storage and registry, and close is idempotent and disables further calls", async ({
    page,
  }) => {
    // SPECSFY: US-003 FR-007 FR-008 FR-009 NFR-003 NFR-006 AC-008
    await page.goto(HARNESS);
    const bytes = Array.from(FIXTURE);
    const result = await page.evaluate(async (b) => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      const adapter = await api.createWebAdapter({});
      await adapter.installer.install({
        versionId: "ara", bytes: new Uint8Array(b), name: "ARA", installedAt: 1, versionCode: 1,
      });
      const installedBefore = await adapter.installer.isInstalled("ara");
      await adapter.installer.uninstall("ara");
      const installedAfter = await adapter.installer.isInstalled("ara");
      const listAfter = (await adapter.registry.list()).map((i: { id: string }) => i.id);
      await adapter.close();
      await adapter.close(); // idempotent
      let postClose: string | null = null;
      try {
        await adapter.registry.list();
      } catch (err) {
        postClose = (err as { code?: string }).code ?? "unknown";
      }
      // A fresh adapter on the same origin sees the uninstalled state.
      const reopened = await api.createWebAdapter({});
      const reopenedList = (await reopened.registry.list()).map((i: { id: string }) => i.id);
      await reopened.close();
      return { installedBefore, installedAfter, listAfter, postClose, reopenedList };
    }, bytes);
    expect(result.installedBefore).toBe(true);
    expect(result.installedAfter).toBe(false);
    expect(result.listAfter).toEqual([]);
    expect(result.postClose).toBe("storage_unavailable");
    expect(result.reopenedList).toEqual([]);
  });
});
