import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// Server root is the package directory; the harness + built assets live under it.
const pkg = resolve(here, "../../..");
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".sqlite": "application/octet-stream",
  ".db": "application/octet-stream",
};

const server = createServer(async (req, res) => {
  try {
    const parsed = new URL(req.url, "http://x");
    const urlPath = normalize(decodeURIComponent(parsed.pathname));
    // Serve harness + fixtures with the package root as base; prevent traversal.
    let rel = urlPath === "/" ? "tests/browser/harness/index.html" : urlPath.replace(/^\/+/, "");
    let file = resolve(pkg, rel);
    if (!file.startsWith(pkg)) throw new Error("forbidden");
    const content = await readFile(file);
    const type = MIME[extname(file)] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found: " + String(err));
  }
});

const port = Number(process.env.PORT ?? 8787);
server.listen(port, () => console.log(`harness server listening on ${port}`));
