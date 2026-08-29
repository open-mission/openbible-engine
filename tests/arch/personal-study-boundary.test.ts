import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

describe("arch: personal study boundaries", () => {
  // SPECSFY: US-001 FR-001 NFR-001 NFR-002 AC-008
  it("keeps the personal study core portable", async () => {
    const files = ["types.ts", "errors.ts", "validation.ts", "index.ts"];
    const forbidden = [
      'from "node:',
      "from 'node:",
      'from "fs"',
      'from "path"',
      "fetch(",
      "react",
      "indexedDB",
      "window.",
      "document.",
      "Date",
      "Map",
      "Set",
    ];

    for (const file of files) {
      const content = await readFile(join(ROOT, "packages/personal-study-core/src", file), "utf8");
      for (const pattern of forbidden) {
        expect(content, `${file} contains forbidden platform dependency: ${pattern}`).not.toContain(pattern);
      }
    }
  });

  // SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-009
  it("keeps storage and platform access outside the application package", async () => {
    const files = ["ports.ts", "personal-study.ts", "index.ts"];
    const forbidden = ["node:fs", "node:path", "fetch(", "react", "indexedDB", "window.", "document."];

    for (const file of files) {
      const content = await readFile(join(ROOT, "packages/personal-study/src", file), "utf8");
      for (const pattern of forbidden) {
        expect(content, `${file} contains forbidden platform dependency: ${pattern}`).not.toContain(pattern);
      }
    }
  });

  // SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-010
  it("exposes only the public package entrypoint and its core dependency", async () => {
    const manifest = JSON.parse(
      await readFile(join(ROOT, "packages/personal-study/package.json"), "utf8"),
    ) as {
      exports?: Record<string, unknown>;
      dependencies?: Record<string, string>;
    };

    expect(Object.keys(manifest.exports ?? {})).toEqual(["."]);
    expect(manifest.dependencies).toEqual({
      "@openbible/personal-study-core": "workspace:*",
    });
  });
});
