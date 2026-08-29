import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter } from "../src/index.js";
import { TestNativeStorage } from "./native-storage.js";

describe("Native SQLite adapter reads", () => {
  it("reads ordered chapters and bounded case-insensitive searches", async () => {
    // SPECSFY: US-001 FR-002 FR-003 FR-004 NFR-001 NFR-002 AC-005
    const storage = new TestNativeStorage();
    try {
      const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
      await adapter.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });
      const chapter = await adapter.library.getChapter("ara", "gen", 1);
      const search = await adapter.library.search("ara", "DEUS", 2);

      expect(chapter.map((verse) => verse.verse)).toEqual([1, 2, 3]);
      expect(chapter[0]?.text).toContain("No princípio");
      expect(search.results).toHaveLength(2);
      expect(search.total).toBeGreaterThanOrEqual(2);
      expect(search.results.map((verse) => `${verse.bookId}:${verse.chapter}:${verse.verse}`)).toEqual([
        "gen:1:1",
        "gen:1:3",
      ]);
    } finally {
      storage.close();
    }
  });
});
