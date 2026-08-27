/**
 * Browser conformance driver.
 *
 * Per the session decision:
 *  - Chromium is the blocking browser; its exit code drives the outcome.
 *  - WebKit is reported as environment-blocked (its Playwright system
 *    dependencies are missing here and cannot be installed without sudo).
 *  - Firefox is informative (never blocks).
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function run(name) {
  const r = spawnSync(
    "pnpm",
    ["exec", "playwright", "test", "--reporter=line", "--project=" + name, ...args],
    { stdio: "inherit" },
  );
  return r.status ?? 1;
}

// Ensure the built worker/wasm and harness client are present before running.
spawnSync("node", ["scripts/build-worker.mjs"], { stdio: "inherit" });
spawnSync("node", ["scripts/build-browser.mjs"], { stdio: "inherit" });

const chromiumCode = run("chromium");

console.log("webkit: environment-blocked (Playwright WebKit system dependencies missing; no sudo)");

const firefoxCode = run("firefox");
console.log(`firefox (informative): exit=${firefoxCode}`);

process.exit(chromiumCode === 0 ? 0 : 1);
