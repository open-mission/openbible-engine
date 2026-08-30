import { test as base, expect, type BrowserContext } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const test = base.extend({
  context: async ({ playwright, browserName, baseURL }, use) => {
    const userDataDir = await mkdtemp(join(tmpdir(), "openbible-consumer-web-"));
    let context: BrowserContext | undefined;
    try {
      context = await playwright[browserName].launchPersistentContext(userDataDir, { baseURL });
      await use(context);
    } finally {
      await context?.close();
      await rm(userDataDir, { recursive: true, force: true });
    }
  },
});

export { expect };
