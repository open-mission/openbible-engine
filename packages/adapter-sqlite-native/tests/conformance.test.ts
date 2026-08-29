import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

describe("Native adapter conformance", () => {
  it("completes the local install/read/search/remove journey without a package source", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-004 AC-005 AC-006 AC-010
    const storage = new TestNativeStorage();
    try {
      const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
      await adapter.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });
      expect((await adapter.library.getChapter("ara", "jhn", 2)).map((verse) => verse.verse)).toEqual([1, 2, 3]);
      expect((await adapter.library.search("ara", "luz", 10)).total).toBeGreaterThan(0);
      await adapter.installer.uninstall("ara");
      expect(await adapter.installer.isInstalled("ara")).toBe(false);
    } finally {
      storage.close();
    }
  });

  it("reconciles interrupted promotion and removes temporary files on reopen", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-006 AC-007 AC-011
    const storage = new TestNativeStorage();
    try {
      const first = createNativeAdapter({ namespace: "scripture-library", storage });
      await first.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });
      storage.rename("bibles/ara.db", "bibles/ara.db.bak");
      storage.writeFile("bibles/ara.db.tmp", LEGACY_ARA_FIXTURE.bytes);
      first.close();

      const reopened = createNativeAdapter({ namespace: "scripture-library", storage });
      expect(reopened.reconcile.restored).toBe(1);
      expect(reopened.reconcile.removedTmp).toBe(1);
      expect((await reopened.library.getChapter("ara", "gen", 1)).length).toBe(3);
      expect(storage.list("bibles")).toEqual(["bibles/ara.db"]);
    } finally {
      storage.close();
    }
  });

  it("deletes a materialized database that has no registry entry", () => {
    // SPECSFY: US-001 FR-002 NFR-002 AC-007 AC-011
    const storage = new TestNativeStorage();
    try {
      storage.writeFile("bibles/orphan.db", LEGACY_ARA_FIXTURE.bytes);
      const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
      expect(adapter.reconcile.removedOrphans).toBe(1);
      expect(storage.list("bibles")).toEqual([]);
    } finally {
      storage.close();
    }
  });
});
