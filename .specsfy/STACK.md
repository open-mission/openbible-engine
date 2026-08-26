# Stack do sistema

Documente tecnologias estruturais e a evidência executável que confirma cada
uma. Preserve decisões humanas nas seções livres deste arquivo.

## Inventário detectado

<!-- specsfy:stack:start -->
| Camada | Tecnologia | Evidência |
| --- | --- | --- |
| Linguagem | TypeScript | `package.json` (`typescript`) |
| Runtime | Node.js | `package.json` (engines 22.x; `node:sqlite` nativo) |
| Gerenciador | pnpm | `pnpm-workspace.yaml`, `packageManager` `pnpm@10.22.0` |
| Orquestração | Turborepo | `turbo.json` (tasks build/test/typecheck/lint/check) |
| Testes | Vitest | `package.json` (`vitest`), `vitest.config.ts` |
| Lint | ESLint flat | `eslint.config.js` |
| Versionamento | Changesets | `.changeset/config.json` |
| Build | tsc declarations | `tsconfig.json` strict ESM |
| Persistência | SQLite real (`node:sqlite`) | `packages/adapter-sqlite-native/src/driver.ts`, `bible-store.ts`, `registry.ts`, `fixtures.ts` |
<!-- specsfy:stack:end -->

## Decisões e observações do projeto

- pnpm workspaces + `workspace:*` + catalogs centralizam versões compartilhadas; Changesets para releases futuros (sem publish nesta entrega).
- `turbo.json` orquestra build/test/typecheck/lint/check com `dependsOn ^build`; fronteiras arquiteturais via `package.json`/`exports`/`eslint`/`tests/arch`, não via Turbo.
- TypeScript portátil conservador no `engine-core` (zero deps, sync, sem Node/DOM/SQL/Promise). A engine (`@openbible/engine`) usa `CancellationToken` portátil e NÃO usa `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder`; não interpreta o formato SQLite.
- Arquitetura hexagonal revisada: `engine-core` → `engine` (ports incl. o port transacional `BibleInstaller`) → `adapters`. `BibleInstaller` é o único escritor transacional do armazenamento bíblico e do registry (stage → validate → commit → rollback/cleanup).
- `adapter-sqlite-native` opera contra arquivo SQLite real via driver injetável (`node:sqlite`, Node/Bun) com `NativeBibleLibrary` (leitura), `NativeBibleInstaller` (transacional) e `SqliteInstalledRegistry` (persistente).
- `adapter-sqlite-web` é uma FATIA PLANEJADA: não é adapter funcional; exige Worker + SQLite WASM + OPFS/SAHPool + testes em navegador real para ser concluído. Implementações in-memory vivem em `@openbible/engine-testing` como `FakeLibrary`/`FakeBibleInstaller`.
- ESM + declarations + typecheck real; sem `ignoreBuildErrors`; sem framework frontend. Compatibilidade com Vercel Native SDK tratada como hipótese até existir consumer mínimo que compile e execute.
