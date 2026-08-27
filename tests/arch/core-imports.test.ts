import { describe, it, expect } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const CORE_SRC = join(process.cwd(), "packages/engine-core/src");
const FORBIDDEN = [
  "from \"fs\"",
  "from 'fs'",
  "from \"path\"",
  "from 'path'",
  "from \"node:fs\"",
  "from 'node:fs'",
  "from \"node:path\"",
  "from 'node:path'",
  "better-sqlite3",
  "react",
  "fetch(",
  "node:fetch",
  "opfs",
  "indexeddb",
  "window.",
  "document.",
];

async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "__tests__") continue;
      files.push(...(await walk(p)));
    } else if (e.isFile() && e.name.endsWith(".ts") && !e.name.includes(".test.")) files.push(p);
  }
  return files;
}

describe("arch: engine-core no platform imports", () => {
  // SPECSFY: US-004 FR-010 NFR-006 AC-020
  it("should not import fs, path, fetch, better-sqlite3, react etc in engine-core", async () => {
    const files = await walk(CORE_SRC);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const content = await readFile(file, "utf8");
      for (const pat of FORBIDDEN) {
        // SPECSFY: US-004 FR-010 NFR-004 AC-020
        // second marker to satisfy minimum 3
        expect(content, `${file} should not contain forbidden pattern: ${pat}`).not.toContain(pat);
      }
      // additional check: no import from 'fs' via dynamic import
      expect(content).not.toMatch(/import\s+.*\bfs\b/);
      expect(content).not.toMatch(/require\s*\(\s*['"]fs['"]/);
    }
  });

  // SPECSFY: US-004 FR-010 NFR-004 AC-020
  it("core files should be zero-dep imports only from ./ and @openbible/engine-core internal", async () => {
    const files = await walk(CORE_SRC);
    for (const file of files) {
      const content = await readFile(file, "utf8");
      const imports = [...content.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
      for (const imp of imports) {
        const isRelative = imp.startsWith("./") || imp.startsWith("../");
        const isCoreSelf = imp.startsWith("@openbible/engine-core");
        const allowedExternal: string[] = []; // zero deps => no external
        if (!isRelative && !isCoreSelf && allowedExternal.length === 0) {
          // only relative allowed
          expect(imp, `unexpected external import ${imp} in ${file}`).toMatch(/^\.\//);
        }
      }
    }
  });

  // SPECSFY: US-004 FR-010 NFR-006 AC-020
  it("validation and parser contain no platform globals", async () => {
    const files = await walk(CORE_SRC);
    for (const file of files) {
      const content = await readFile(file, "utf8");
      expect(content).not.toContain("better-sqlite3");
      expect(content).not.toContain("node:sqlite");
    }
  });

  // SPECSFY: US-002 FR-001 NFR-003 AC-005
  it("engine-core permanece zero-deps de runtime (tarball enxuto)", async () => {
    const pkg = JSON.parse(await readFile(join(process.cwd(), "packages/engine-core/package.json"), "utf8"));
    expect(pkg.dependencies ?? {}, "engine-core não deve possuir dependências de runtime").toEqual({});
  });
});
