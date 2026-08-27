import { describe, it, expect } from "vitest";
import { createWebAdapter } from "../../src/index.js";

describe("public adapter API", () => {
  it("exposes createWebAdapter", () => {
    // SPECSFY: US-001 FR-001 NFR-001 AC-001
    expect(typeof createWebAdapter).toBe("function");
  });

  it("fails with storage_unavailable when Web Worker support is absent", async () => {
    // SPECSFY: US-001 FR-001 NFR-001 NFR-002 AC-003
    if (typeof Worker === "undefined") {
      await expect(createWebAdapter()).rejects.toMatchObject({ code: "storage_unavailable" });
    } else {
      expect(createWebAdapter).toBeTruthy();
    }
  });
});
