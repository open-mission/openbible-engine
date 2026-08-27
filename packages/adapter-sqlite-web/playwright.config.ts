import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function dirname(p) {
  return p.slice(0, p.lastIndexOf("/"));
}

const pkg = path.resolve(here, ".");
const port = Number(process.env.PORT ?? 8787);

// Chromium and WebKit are the blocking browsers; Firefox is informative only.
// WebKit is gated in `test-browser.mjs` when its system dependencies are missing.
const projects = [
  { name: "chromium", use: { browserName: "chromium" } },
  { name: "webkit", use: { browserName: "webkit" } },
  { name: "firefox", use: { browserName: "firefox" }, introduce: "informative" },
];

export default defineConfig({
  testDir: "tests/browser",
  timeout: 120000,
  expect: { timeout: 20000 },
  fullyParallel: true,
  worker: 1,
  reporter: [["list"], ["line"]],
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: projects
    .filter((p) => !process.env.INFORMATIVE_ONLY || p.name === "firefox")
    .filter((p) => !process.env.SKIP_BROWSERS?.split(",").includes(p.name)),
  webServer: {
    command: `node tests/browser/harness/server.mjs`,
    cwd: pkg,
    port,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
});
