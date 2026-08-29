import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer feedback", () => {
  it("has a feedback block for operation states and retry", () => {
    // SPECSFY: US-001 FR-004 NFR-003 AC-009
    const file = join(appRoot, "src/components/feedback.native");
    expect(existsSync(file)).toBe(true);
    const source = readFileSync(file, "utf8");
    expect(source).toContain('state == \'loading\'');
    expect(source).toContain('state == \'failed\'');
    expect(source).toContain("Tentar novamente");
  });
});
