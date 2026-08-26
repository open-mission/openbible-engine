import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ENGINE_SRC = join(process.cwd(), "packages/engine/src");

const FORBIDDEN_ENGINE = [
  "SQLite format",
  "checkHeader",
  "decodePayload",
  "validateParsedPayload",
  "TextEncoder",
  "TextDecoder",
  "DOMException",
  "AbortSignal",
  "indexedDB",
  "OpfsSaPool",
  "OpfsSAHPool",
  "installPackage",
  "install\\?",
  "validatePackage",
  "getDb",
  ".sqlite",
];

describe("arch: @openbible/engine does not interpret storage format", () => {
  // SPECSFY: US-001 FR-001 NFR-004 AC-001
  it("engine.ts must not decode SQLite bytes or use DOM globals", async () => {
    const content = await readFile(join(ENGINE_SRC, "engine.ts"), "utf8");
    for (const pat of FORBIDDEN_ENGINE) {
      expect(content, `engine.ts should not contain "${pat}"`).not.toMatch(new RegExp(pat, "i"));
    }
  });

  // SPECSFY: US-001 FR-001 NFR-004 AC-001
  it("ports.ts exposes only required read/install contracts", async () => {
    const content = await readFile(join(ENGINE_SRC, "ports.ts"), "utf8");
    expect(content).toContain("BibleInstaller");
    expect(content).toContain("install(input:");
    // no dynamic optional install hooks on the library
    expect(content).not.toContain("install?(");
    expect(content).not.toContain("installPackage?(");
    expect(content).not.toContain("save?(");
    expect(content).not.toContain("uninstall?(");
    expect(content).not.toContain("remove?(");
    expect(content).not.toContain("delete?(");
  });

  // SPECSFY: US-001 FR-001 NFR-004 AC-001
  it("engine package declares only engine-core as a runtime dependency", async () => {
    const pkg = await readFile(join(process.cwd(), "packages/engine/package.json"), "utf8");
    const parsed = JSON.parse(pkg) as { dependencies?: Record<string, string> };
    expect(Object.keys(parsed.dependencies ?? {})).toEqual(["@openbible/engine-core"]);
  });
});
