import { describe, it, expect } from "vitest";
import { SqliteWebLibrary } from "../sqlite-web.js";

describe("adapter-sqlite-web planned slice", () => {
  it("is marked as a non-functional planned slice (not a Map-backed adapter)", () => {
    const lib = new SqliteWebLibrary();
    expect(lib.isWebSlice).toBe(true);
  });

  it("fails every operation deterministically until a real browser Worker+WASM+OPFS/SAHPool integration exists", async () => {
    const lib = new SqliteWebLibrary();
    await expect(lib.getBooks("ara")).rejects.toMatchObject({ code: "storage_unavailable" });
    await expect(lib.getChapter("ara", "gen", 1)).rejects.toMatchObject({ code: "storage_unavailable" });
    await expect(lib.search("ara", "a", 10)).rejects.toMatchObject({ code: "storage_unavailable" });
    await expect(lib.getVersionName("ara")).rejects.toMatchObject({ code: "storage_unavailable" });
  });
});
