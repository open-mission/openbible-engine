import { readdirSync, readFileSync } from "node:fs";
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

  // SPECSFY: US-001 US-002 US-003 FR-001 FR-002 FR-003 NFR-001 NFR-002 NFR-003 AC-009
  it("não leva SQL, fixtures de execução ou caminhos do legado para a UI", () => {
    const root = resolve(import.meta.dirname, "../src");
    const files: string[] = [];
    const visit = (directory: string) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) visit(path);
        else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path);
      }
    };
    visit(root);
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/\bSELECT\b|\bCREATE TABLE\b|\/fixtures\/ara\.db|open-bible\/apps\/web/);
  });
});
