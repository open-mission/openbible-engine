import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// SPECSFY: US-001 US-002 US-003 FR-003 NFR-002 AC-005
describe("fronteira da aplicação", () => {
  it("usa somente os exports públicos da engine", () => {
    const root = resolve(import.meta.dirname, "..");
    const provider = readFileSync(resolve(root, "src/engine/bible-engine-provider.tsx"), "utf8");
    const features = readFileSync(resolve(root, "src/features/search/search-installed.ts"), "utf8");
    expect(`${provider}\n${features}`).not.toMatch(/@openbible\/(?:engine|adapter-sqlite-web)\/src\//);
    expect(provider).toContain("createWebAdapter");
    expect(provider).toContain("createBibleEngine");
  });
});
