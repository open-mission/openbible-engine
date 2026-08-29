import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

describe("consumer TUI: fronteira pública", () => {
  it("compõe a jornada sem importar fontes internas", async () => {
    // SPECSFY: US-001 US-002 US-003 US-004 FR-001 FR-002 FR-003 FR-005 NFR-004 AC-010
    const engineSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/engine.ts"), "utf8");
    const manifest = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    };

    expect(engineSource).toContain('from "@openbible/engine"');
    expect(engineSource).toContain('from "@openbible/adapter-http"');
    expect(engineSource).toContain('from "@openbible/adapter-sqlite-node"');
    expect(engineSource).not.toMatch(/@openbible\/(?:engine|adapter-[^"']+)\/(?:src|dist)\//);
    expect(Object.keys(manifest.dependencies).filter((name) => name.startsWith("@openbible/")).sort()).toEqual([
      "@openbible/adapter-http",
      "@openbible/adapter-sqlite-node",
      "@openbible/engine",
    ]);
  });
});
