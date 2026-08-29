import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Native consumer boundary", () => {
  it("has a deterministic Native SDK core entry point", () => {
    // SPECSFY: US-001 FR-001 NFR-001 AC-002
    expect(existsSync("apps/consumer-native/src/core.ts")).toBe(true);
  });
});
