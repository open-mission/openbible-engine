import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

describe("Native SQLite adapter installation", () => {
  it("installs a real legacy SQLite fixture and lists books canonically", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-001 NFR-002 AC-004
    const storage = new TestNativeStorage();
    try {
      const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
      const installed = await adapter.installer.install({
        versionId: LEGACY_ARA_FIXTURE.versionId,
        bytes: LEGACY_ARA_FIXTURE.bytes,
        installedAt: 100,
        versionCode: 1,
      });

      expect(installed).toMatchObject({ id: "ara", name: "ARA", versionCode: 1 });
      expect(await adapter.registry.list()).toEqual([installed]);
      expect((await adapter.library.getBooks("ara")).map((book) => book.id)).toEqual(["gen", "exo", "jhn"]);
      expect(await adapter.installer.isInstalled("ara")).toBe(true);
      adapter.close();
    } finally {
      storage.close();
    }
  });
});
