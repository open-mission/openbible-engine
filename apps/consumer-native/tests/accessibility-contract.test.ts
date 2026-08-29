import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer accessibility", () => {
  it("has a Native markup view to expose keyboard semantics", () => {
    // SPECSFY: US-001 FR-004 NFR-003 AC-012
    const file = join(appRoot, "src/app.native");
    const manifest = join(appRoot, "app.json");
    expect(existsSync(file)).toBe(true);
    const source = readFileSync(file, "utf8");
    const manifestSource = readFileSync(manifest, "utf8");
    expect(source).toContain('tabs label="Área principal"');
    expect(manifestSource).toContain('accessibility_label": "Scripture Library"');
  });
});
