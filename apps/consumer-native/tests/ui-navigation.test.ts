import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer navigation", () => {
  it("has a single Native markup shell for the three areas", () => {
    // SPECSFY: US-001 FR-004 NFR-003 AC-008
    const file = join(appRoot, "src/app.native");
    expect(existsSync(file)).toBe(true);
    const source = readFileSync(file, "utf8");
    expect(source).toContain("<tabs");
    expect(source).toContain('on-press="show_library"');
    expect(source).toContain('on-press="show_reader"');
    expect(source).toContain('on-press="show_search"');
    expect(source).toContain("Open Bible");
  });
});
