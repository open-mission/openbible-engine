import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import {
  installNativePackage,
  installNativePackageDownload,
  readNativeLibrary,
  resetNativePackageDownload,
  stageNativePackageDownloadChunk,
} from "../src/index.js";
import type { NativeStorage } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

function failRegistryRename(storage: TestNativeStorage): NativeStorage {
  return {
    exists: (path) => storage.exists(path),
    readFile: (path) => storage.readFile(path),
    writeFile: (path, bytes) => storage.writeFile(path, bytes),
    rename(from, to) {
      if (to === "registry.json") throw new Error("simulated registry failure");
      storage.rename(from, to);
    },
    remove: (path) => storage.remove(path),
    list: (prefix) => storage.list(prefix),
  };
}

describe("Native adapter package download", () => {
  it("stages ordered chunks and commits through the existing installer", () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-004 AC-007 AC-013
    const storage = new TestNativeStorage();
    try {
      resetNativePackageDownload(storage, "ara");
      const split = 12000;
      const first = LEGACY_ARA_FIXTURE.bytes.slice(0, split);
      const second = LEGACY_ARA_FIXTURE.bytes.slice(split);

      expect(stageNativePackageDownloadChunk(storage, "ara", 0, first)).toEqual({ received: split });
      expect(() => stageNativePackageDownloadChunk(storage, "ara", 0, second)).toThrow();
      expect(stageNativePackageDownloadChunk(storage, "ara", split, second)).toEqual({ received: LEGACY_ARA_FIXTURE.bytes.length });
      expect(storage.readFile("downloads/ara.sqlite.part")).toEqual(LEGACY_ARA_FIXTURE.bytes);

      expect(installNativePackageDownload(storage, {
        versionId: "ara",
        name: "ARA",
        installedAt: 100,
        versionCode: 1,
      })).toEqual({ versionId: "ara", installed: true });
      expect(storage.exists("downloads/ara.sqlite.part")).toBe(false);
      expect(storage.exists("bibles/ara.db")).toBe(true);
    } finally {
      storage.close();
    }
  });

  it("rejects an incomplete part and cleans it without promoting a database", () => {
    // SPECSFY: US-001 FR-003 FR-004 NFR-001 NFR-002 NFR-003 AC-007 AC-013
    const storage = new TestNativeStorage();
    try {
      resetNativePackageDownload(storage, "ara");
      stageNativePackageDownloadChunk(storage, "ara", 0, LEGACY_ARA_FIXTURE.bytes.slice(0, 12000));

      expect(() => installNativePackageDownload(storage, {
        versionId: "ara",
        name: "ARA",
        installedAt: 100,
        versionCode: 1,
      })).toThrow();
      expect(storage.exists("downloads/ara.sqlite.part")).toBe(false);
      expect(storage.exists("bibles/ara.db")).toBe(false);
    } finally {
      storage.close();
    }
  });

  it("rolls back a promoted replacement when registry commit fails", () => {
    // SPECSFY: US-001 FR-002 FR-003 FR-004 NFR-001 NFR-002 NFR-003 AC-007 AC-013
    const storage = new TestNativeStorage();
    try {
      installNativePackage(storage, {
        versionId: "ara",
        bytes: LEGACY_ARA_FIXTURE.bytes,
        name: "ARA original",
        installedAt: 100,
        versionCode: 1,
      });
      stageNativePackageDownloadChunk(storage, "ara", 0, LEGACY_ARA_FIXTURE.bytes);

      expect(() => installNativePackageDownload(failRegistryRename(storage), {
        versionId: "ara",
        name: "ARA replacement",
        installedAt: 200,
        versionCode: 2,
      })).toThrow();

      expect(storage.readFile("bibles/ara.db")).toEqual(LEGACY_ARA_FIXTURE.bytes);
      expect(readNativeLibrary(storage, {
        versionId: "ara",
        bookId: "gen",
        chapter: 1,
        query: "luz",
        limit: 5,
      }).installed).toBe(true);
      expect(storage.exists("downloads/ara.sqlite.part")).toBe(false);
      expect(storage.list("bibles").some((path) => path.endsWith(".tmp") || path.endsWith(".bak"))).toBe(false);
    } finally {
      storage.close();
    }
  });
});
