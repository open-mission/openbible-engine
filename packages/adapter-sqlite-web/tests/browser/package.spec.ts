import { test, expect } from "@playwright/test";
import { statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, "..", "..");
const dist = join(pkg, "dist");
const worker = join(dist, "worker");

test.describe("package artifacts", () => {
  test("AC-009: dist contains JS, declarations, Worker and WASM artifacts", async () => {
    // SPECSFY: US-003 FR-007 FR-008 FR-009 NFR-001 NFR-002 NFR-006 AC-009
    const files = [
      "index.js",
      "index.d.ts",
      "adapter.js",
      "adapter.d.ts",
      "openbible-browser.js",
      "worker/worker.js",
      "worker/index.d.ts",
      "worker/sqlite3.wasm",
    ];
    for (const f of files) {
      const path = join(dist, f);
      expect(statSync(path).size, `${f} should exist`).toBeGreaterThan(0);
    }
    // The worker bundle must be sizeable (SQLite WASM inlined) and reference the
    // WASM with a module-relative location.
    const workerJs = readFileSync(join(worker, "worker.js"), "utf8");
    expect(workerJs.length).toBeGreaterThan(100_000);
    // The client should resolve a module-relative worker (FR-003).
    const clientSrc = readFileSync(join(dist, "worker-client.js"), "utf8");
    expect(clientSrc).toContain("worker.js");
  });

  test("AC-009: the package does not declare atomic-rename or crash-safety wording", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-005 AC-009
    const source = readFileSync(join(worker, "worker.js"), "utf8");
    const forbidden = ["atomic rename", "crash-safe", "power-loss safe", "crash safety"];
    for (const word of forbidden) {
      expect(source).not.toContain(word);
    }
  });
});
