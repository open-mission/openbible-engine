#!/usr/bin/env node
/**
 * Guarda de regressão da superfície pública (Specsfy SPEC-0003, FR-003).
 *
 * Verifica que os pacotes de runtime mantêm a superfície pública declarada
 * (exports, files, COMPATIBILITY.md e símbolos canônicos no source) e, em
 * `--check-no-publish`, que nenhum pacote expõe uma etapa de publicação.
 * Sai com código distinto de zero quando a superfície regride.
 */
import { readFile, access, readdir } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkNoPublish = process.argv.includes("--check-no-publish");

const RUNTIME = {
  "@openbible/engine-core": ["parseReference", "normalizeId", "EngineError"],
  "@openbible/engine": ["createBibleEngine"],
  "@openbible/adapter-http": ["HttpBiblePackageSource"],
  "@openbible/adapter-sqlite-node": ["createNodeAdapter"],
  "@openbible/adapter-sqlite-web": ["createWebAdapter"],
};

const has = async (value) => {
  try {
    await access(value);
    return true;
  } catch {
    return false;
  }
};

async function walkSource(dir) {
  const found = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      found.push(...(await walkSource(p)));
    } else if (/\.ts$/.test(entry.name) && !entry.name.includes(".test.")) {
      found.push(p);
    }
  }
  return found;
}

async function main() {
  const problems = [];

  for (const [name, symbols] of Object.entries(RUNTIME)) {
    const dir = name === "@openbible/adapter-sqlite-web" ? "packages/adapter-sqlite-web" : name.replace("@openbible/", "packages/");
    const pkgPath = join(root, dir, "package.json");
    if (!(await has(pkgPath))) {
      problems.push(`${name}: package.json ausente`);
      continue;
    }
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    const entry = pkg.exports?.["."];

    if (!entry?.types) problems.push(`${name}: exports['.'].types ausente`);
    if (!entry?.import) problems.push(`${name}: exports['.'].import ausente`);
    if (!Array.isArray(pkg.files) || !pkg.files.includes("dist")) problems.push(`${name}: files não contém dist`);

    if (!(await has(join(root, dir, "COMPATIBILITY.md")))) problems.push(`${name}: COMPATIBILITY.md ausente`);

    const src = join(root, dir, "src");
    const files = await walkSource(src);
    const source = (await Promise.all(files.map((f) => readFile(f, "utf8")))).join("\n");
    for (const symbol of symbols) {
      if (!source.includes(symbol)) problems.push(`${name}: símbolo público ${symbol} ausente da superfície`);
    }

    if (checkNoPublish) {
      const publish = Object.keys(pkg.scripts ?? {}).find((s) => /publish|release/i.test(s));
      if (publish) problems.push(`${name}: etapa de publicação detectada (script ${publish})`);
    }
  }

  if (problems.length) {
    for (const problem of problems) console.error(`[api-surface] ${problem}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(`[api-surface] ${error.message}`);
  process.exit(1);
});
