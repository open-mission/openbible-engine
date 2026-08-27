import { describe, it, expect } from "vitest";
import { readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "..", "..");
const WEB_DIR = join(ROOT, "packages/adapter-sqlite-web");
const WEB_PKG = join(WEB_DIR, "package.json");

// TDD derivado do BDD AC-002/AC-006 (US-001, FR-002, NFR-002, NFR-003).
// Nível mais baixo que prova a fronteira de distribuição do Web adapter: o
// pacote expõe o subpath `./worker` para o bundle do Worker (que inclui o
// SQLite WASM + OPFS) e os assets ficam sob um diretório incluído por `files`,
// permitindo que um bundler resolva sem caminho fixo em public/.
async function exists(value: string): Promise<boolean> {
  try {
    await access(value);
    return true;
  } catch {
    return false;
  }
}

describe("distribution harness: assets Worker/WASM distribuíveis", () => {
  // SPECSFY: US-001 FR-001 FR-002 NFR-002 NFR-003 AC-002
  it.sequential("o adapter-sqlite-web expõe o subpath de export ./worker (para além de '.')", async () => {
    const pkg = JSON.parse(await readFile(WEB_PKG, "utf8"));
    const subpaths = Object.keys(pkg.exports ?? {}).filter((key) => key !== ".");
    expect(subpaths, "exports do adapter-sqlite-web deve expor subpath para o Worker").toContain("./worker");
  });

  // SPECSFY: US-001 FR-002 NFR-002 NFR-003 AC-006
  it.sequential("o artefato do Worker (com o WASM) é alcançável a partir da instalação", async () => {
    const pkg = JSON.parse(await readFile(WEB_PKG, "utf8"));
    expect(pkg.files).toContain("dist");
    const workerTarget = pkg.exports?.["./worker"];
    expect(workerTarget, "subpath ./worker deve apontar para o Worker bundle").toContain("dist/worker/worker.js");
    expect(await exists(join(WEB_DIR, "dist/worker/worker.js")), "Worker bundle deve existir").toBe(true);
    expect(await exists(join(WEB_DIR, "dist/worker/sqlite3.wasm")), "WASM deve existir").toBe(true);
  });
});
