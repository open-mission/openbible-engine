# Stack do sistema

Documente tecnologias estruturais e a evidência executável que confirma cada
uma. Preserve decisões humanas nas seções livres deste arquivo.

## Inventário detectado

<!-- specsfy:stack:start -->
| Camada | Tecnologia | Evidência |
| --- | --- | --- |
| Linguagem | TypeScript | `package.json` (`typescript`) |
| Runtime | Node.js | `package.json` (engines 22.x) |
| Gerenciador | pnpm | `pnpm-workspace.yaml`, `packageManager` `pnpm@10.22.0` |
| Orquestração | Turborepo | `turbo.json` (tasks build/test/typecheck/lint/check) |
| Testes | Vitest | `package.json` (`vitest`), `vitest.config.ts` |
| Lint | ESLint flat | `eslint.config.js` |
| Versionamento | Changesets | `.changeset/config.json` |
| Build | tsc declarations | `tsconfig.json` strict ESM |
<!-- specsfy:stack:end -->

## Decisões e observações do projeto

- pnpm workspaces + `workspace:*` + catalogs centralizam versões compartilhadas; Changesets para releases futuros (sem publish nesta entrega).
- `turbo.json` orquestra build/test/typecheck/lint/check com `dependsOn ^build` para grafo correto; fronteiras arquiteturais via `package.json`/`exports`/`eslint`/`tests/arch` não via Turbo.
- TypeScript portátil conservador no `engine-core` (zero deps, sync, sem Node/DOM/SQL/Promise) para futura compilação no Native SDK subset; fallback Zig/C fino se driver TS não compilar.
- Adapters isolam `better-sqlite3` (native) e `fetch` (http) atrás de ports; core nunca importa plataforma.
- ESM + declarations + typecheck real; sem `ignoreBuildErrors`; sem framework frontend.
