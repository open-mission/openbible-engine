/**
 * Test-only harness entry point. Imports the public API surface and exposes it
 * on the page so Playwright browser specs can drive the adapter without a path
 * dependency on the node_modules layout.
 */
import * as OpenBibleWeb from "../../../src/index.js";

const g = globalThis as unknown as { __openbible: unknown };
g.__openbible = OpenBibleWeb;
