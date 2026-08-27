import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "..", "..");

// TDD derivado do BDD AC-001/AC-008 (US-001, FR-001, FR-002, NFR-001, NFR-003).
// Prova o contrato de empacotamento: `pnpm pack` converte `workspace:*` para
// versões semver reais, e os exports/files tornam o pacote consumível fora do
// workspace. Empacotar é a fronteira real do artefato distribuível.
const RUNTIME = [
  "@openbible/engine-core",
  "@openbible/engine",
  "@openbible/adapter-http",
  "@openbible/adapter-sqlite-node",
  "@openbible/adapter-sqlite-web",
];

interface Packed {
  name: string;
  deps?: Record<string, string>;
  exports?: Record<string, any>;
  files?: string[];
}

async function pack(name: string): Promise<Packed> {
  const dir = mkdtempSync(join(tmpdir(), "pack-"));
  const run = spawnSync("pnpm", ["--filter", name, "pack", "--pack-destination", dir], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (run.status !== 0) throw new Error(`falha ao empacotar ${name}: ${run.stderr?.trim() || run.stdout?.trim()}`);
  const tgz = readdirSync(dir).find((f) => f.endsWith(".tgz"));
  if (!tgz) throw new Error(`tarball não gerado para ${name}`);
  const tarRun = spawnSync("tar", ["-xzf", join(dir, tgz)], { cwd: dir, encoding: "utf8" });
  if (tarRun.status !== 0) throw new Error(`falha ao extrair ${name}`);
  const pkg = JSON.parse(readFileSync(join(dir, "package/package.json"), "utf8"));
  rmSync(dir, { recursive: true, force: true });
  return { name, deps: pkg.dependencies ?? {}, exports: pkg.exports ?? {}, files: pkg.files ?? [] };
}

let packed: Packed[] = [];

describe("distribution harness: tarball autocontido", () => {
  beforeAll(async () => {
    packed = await Promise.all(RUNTIME.map(pack));
  }, 60_000);

  // SPECSFY: US-001 FR-001 FR-002 NFR-001 NFR-003 AC-001
  it.sequential("o tarball não contém dependências workspace:* (autocontido)", () => {
    const offenders: string[] = [];
    for (const entry of packed) {
      for (const [dep, version] of Object.entries(entry.deps)) {
        if (/\bworkspace:/i.test(version)) offenders.push(`${entry.name}: ${dep} = ${version}`);
      }
    }
    expect(offenders, `workspace:* vazado no artefato: ${offenders.join(" | ")}`).toHaveLength(0);
  });

  // SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-003 AC-008
  it.sequential("exports/fíles tornam o pacote consumível fora do workspace", () => {
    const missing: string[] = [];
    for (const entry of packed) {
      if (!entry.exports?.["."]?.types) missing.push(`${entry.name}: exports['.'].types ausente`);
      if (!entry.exports?.["."]?.import) missing.push(`${entry.name}: exports['.'].import ausente`);
      if (!entry.files.includes("dist")) missing.push(`${entry.name}: files não contém dist`);
    }
    expect(missing, `contract de exports/files ausente: ${missing.join(" | ")}`).toHaveLength(0);
  });
});
