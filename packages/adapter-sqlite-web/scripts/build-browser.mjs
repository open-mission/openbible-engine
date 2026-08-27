import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "..");
const root = resolve(pkg, "../..");

const alias = {
  "@openbible/engine-core": resolve(root, "packages/engine-core/src/index.ts"),
  "@openbible/engine": resolve(root, "packages/engine/src/index.ts"),
  "@openbible/engine-testing": resolve(root, "packages/engine-testing/src/index.ts"),
};

// Browser harness client bundle: exposes the public API on the page so the
// Playwright conformance specs can drive the adapter. It is emitted at the
// package dist root so the default module-relative worker URL resolves against
// the real published layout.
await build({
  entryPoints: [resolve(pkg, "tests/browser/harness/browser-entry.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  alias,
  outfile: resolve(pkg, "dist/openbible-browser.js"),
  logLevel: "info",
});

console.log("build-browser: done");
