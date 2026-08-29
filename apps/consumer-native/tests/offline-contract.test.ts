import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer offline contract", () => {
  it("has a local service boundary for Scripture operations", () => {
    // SPECSFY: US-001 FR-003 NFR-002 AC-010
    expect(existsSync(join(appRoot, "src/services/scripture-library.ts"))).toBe(true);
  });
});
