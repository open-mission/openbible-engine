import { test, expect, type Page } from "@playwright/test";

async function createAdapter(page: Page, options?: unknown) {
  return page.evaluate(async (opts) => {
    const api = (globalThis as unknown as Record<string, any>).__openbible;
    const adapter = await api.createWebAdapter(opts ?? {});
    (globalThis as unknown as Record<string, any>).__adapter = adapter;
    return {
      keys: Object.keys(adapter).sort(),
      hasLibrary: typeof adapter.library?.getBooks === "function",
      hasRegistry: typeof adapter.registry?.list === "function",
      hasInstaller: typeof adapter.installer?.install === "function",
      hasReconcile: typeof adapter.reconcile === "function",
      hasClose: typeof adapter.close === "function",
      capabilities: adapter.capabilities,
    };
  }, options);
}

test.describe("initialization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/browser/harness/index.html");
  });

  test("AC-001: initializes with relative assets and exposes the full adapter (chromium/webkit)", async ({
    page,
  }) => {
    // SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-006 AC-001
    const result = await createAdapter(page, {});
    expect(result.hasLibrary).toBe(true);
    expect(result.hasRegistry).toBe(true);
    expect(result.hasInstaller).toBe(true);
    expect(result.hasReconcile).toBe(true);
    expect(result.hasClose).toBe(true);
    expect(result.keys).toEqual(["capabilities", "close", "installer", "library", "reconcile", "registry"]);
    expect(result.capabilities.worker).toBe(true);
    expect(result.capabilities.webAssembly).toBe(true);
    expect(result.capabilities.opfs).toBe(true);
  });

  test("AC-002: a second tab on the same directory fails with storage_busy while the first stays usable", async ({
    context,
  }) => {
    // SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-002 NFR-006 AC-002
    const page1 = await context.newPage();
    await page1.goto("/tests/browser/harness/index.html");
    const first = await createAdapter(page1, {});
    expect(first.hasRegistry).toBe(true);

    const page2 = await context.newPage();
    await page2.goto("/tests/browser/harness/index.html");
    const secondError = await page2.evaluate(async () => {
      const api = (globalThis as unknown as Record<string, any>).__openbible;
      try {
        await api.createWebAdapter({});
        return "ok";
      } catch (err) {
        return (err as { code?: string }).code ?? "unknown";
      }
    });
    expect(secondError).toBe("storage_busy");

    const stillUsable = await page1.evaluate(async () => {
      const adapter = (globalThis as unknown as Record<string, any>).__adapter;
      const list = await adapter.registry.list();
      return Array.isArray(list);
    });
    expect(stillUsable).toBe(true);
  });

  test("AC-003: reports capabilities and parses a denied persistence as a functional state", async ({
    page,
  }) => {
    // SPECSFY: US-001 FR-002 NFR-001 NFR-002 AC-003
    const result = await createAdapter(page, {});
    expect(result.capabilities.worker).toBe(true);
    expect(result.capabilities.opfs).toBe(true);
    expect(["granted", "denied", "unsupported", "not_requested"]).toContain(
      result.capabilities.persistentStorage,
    );
  });
});
