import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GUARD = join(ROOT, "scripts/check-api-surface.mjs");

// TDD derivado do BDD AC-003/AC-004/AC-007 (US-002, FR-003, NFR-001, NFR-002).
// A guarda de regressão de API compara a superfície pública tipada e falha em
// quebra de patch/minor de 0.x; a sua ausência mantém o gate pendente.
describe("arch: guarda de regressão de API", () => {
  // SPECSFY: US-002 FR-003 NFR-001 NFR-002 AC-003
  it("a guarda de API existe e é executável", () => {
    expect(existsSync(GUARD), `guard script ausente: ${GUARD}`).toBe(true);
  });

  // SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-004
  it("a guarda de API reporta superfície estável (exit 0) quando nada quebrou", () => {
    const result = spawnSync("node", [GUARD], { cwd: ROOT, encoding: "utf8" });
    expect(result.status, `stderr: ${result.stderr}`).toBe(0);
  });

  // SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-007
  it("a guarda de API não publica nem toca em remoto", () => {
    const result = spawnSync("node", [GUARD, "--check-no-publish"], { cwd: ROOT, encoding: "utf8" });
    expect(result.status, `stderr: ${result.stderr}`).toBe(0);
  });
});
