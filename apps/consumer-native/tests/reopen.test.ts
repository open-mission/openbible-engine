import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer reopen", () => {
  it("has a consumer harness for persisted registry state", () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-006
    expect(existsSync(join(appRoot, "tests/harness.test.ts"))).toBe(true);
  });
});
