import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

describe("Native SQLite adapter security boundary", () => {
  it("rejects traversal before storage access and survives reopen/removal", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-011
    const storage = new TestNativeStorage();
    try {
      expect(() => createNativeAdapter({ namespace: "../legacy", storage })).toThrow();
      const first = createNativeAdapter({ namespace: "scripture-library", storage });
      await first.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });
      first.close();

      const reopened = createNativeAdapter({ namespace: "scripture-library", storage });
      expect(await reopened.registry.get("ara")).not.toBeNull();
      await reopened.installer.uninstall("ara");
      expect(await reopened.registry.get("ara")).toBeNull();
      expect(await reopened.installer.isInstalled("ara")).toBe(false);
      expect(storage.list("bibles")).toEqual([]);
    } finally {
      storage.close();
    }
  });
});
