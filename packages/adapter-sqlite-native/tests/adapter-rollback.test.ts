import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

describe("Native SQLite adapter rollback", () => {
  it("preserves the previous database and registry after invalid replacement", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-007
    const storage = new TestNativeStorage();
    try {
      const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
      await adapter.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });

      await expect(adapter.installer.install({ versionId: "ara", bytes: new Uint8Array([1, 2, 3]), installedAt: 200, versionCode: 2 })).rejects.toMatchObject({
        code: "invalid_package",
      });
      expect(await adapter.registry.get("ara")).toMatchObject({ installedAt: 100, versionCode: 1 });
      expect((await adapter.library.getChapter("ara", "gen", 1)).length).toBe(3);
      expect(storage.list("bibles").some((path) => path.includes(".tmp") || path.includes(".bak"))).toBe(false);
    } finally {
      storage.close();
    }
  });
});
