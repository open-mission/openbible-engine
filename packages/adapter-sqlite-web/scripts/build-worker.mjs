import { build } from "esbuild";
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "..");
const root = resolve(pkg, "../..");

// The adapter's Worker owns SQLite WASM + OPFS SAHPool. It must be bundled
// (browsers can't resolve node_modules bare specifiers) into a single ESM file,
// with the SQLite WASM copied next to it (resolved via `import.meta.url`).
const workerEntry = resolve(pkg, "src/worker/index.ts");
if (!existsSync(workerEntry)) {
  console.log("build-worker: no worker entry; skipping");
  process.exit(0);
}

mkdirSync(resolve(pkg, "dist/worker"), { recursive: true });
await build({
  entryPoints: [workerEntry],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: resolve(pkg, "dist/worker/worker.js"),
  logLevel: "info",
});

const wasm = join(pkg, "node_modules/@sqlite.org/sqlite-wasm/dist/sqlite3.wasm");
if (existsSync(wasm)) {
  copyFileSync(wasm, resolve(pkg, "dist/worker/sqlite3.wasm"));
}

console.log("build-worker: done");
