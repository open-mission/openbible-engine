# Stack do sistema

Documente tecnologias estruturais e a evidência executável que confirma cada
uma. Preserve decisões humanas nas seções livres deste arquivo.

## Inventário detectado

<!-- specsfy:stack:start -->
| Camada | Tecnologia | Evidência |
| --- | --- | --- |
| Linguagem | TypeScript | `package.json` (`typescript`) |
| Testes | Vitest | `package.json` (`vitest`) |
| Runtime | Node.js | `package.json` |
| Runtime | Node.js | `package.json` (engines 22.x; `node:sqlite` nativo) |
| Gerenciador | pnpm | `pnpm-workspace.yaml`, `packageManager` `pnpm@10.22.0` |
| Orquestração | Turborepo | `turbo.json` (tasks build/test/typecheck/lint/check) |
| Testes | Vitest | `package.json` (`vitest`), `vitest.config.ts` |
| Lint | ESLint flat | `eslint.config.js` |
| Versionamento | Changesets | `.changeset/config.json` |
| Build | tsc declarations | `tsconfig.json` strict ESM |
| Persistência | SQLite real (`node:sqlite`) | `packages/adapter-sqlite-node/src/driver.ts`, `bible-store.ts`, `registry.ts`, `fixtures.ts` |
<!-- specsfy:stack:end -->

## Decisões e observações do projeto

- pnpm workspaces + `workspace:*` + catalogs centralizam versões compartilhadas; Changesets para releases futuros (sem publish nesta entrega).
- `turbo.json` orquestra build/test/typecheck/lint/check com `dependsOn ^build`; fronteiras arquiteturais via `package.json`/`exports`/`eslint`/`tests/arch`, não via Turbo.
- `apps/consumer-web` adiciona Next.js 15 App Router, React 19, Tailwind CSS 4,
  `@ducanh2912/next-pwa`, Vitest com jsdom/Testing Library e Playwright. O
  script `copy-web-assets.mjs` expõe somente os bundles oficiais do Worker e
  `sqlite3.wasm` como overrides públicos do adapter; `pnpm --filter
  @openbible/consumer-web run check` valida a app completa.
- `@openbible/adapter-http` implementa a origem remota de pacotes: usa
  `NEXT_PUBLIC_BIBLE_API_URL` para catálogo/proxy CORS e
  `NEXT_PUBLIC_BIBLE_BUCKET_URL` para arquivos SQLite diretos no R2 `/bibles`,
  com mapeamento por versão e validação do cabeçalho SQLite.
- TypeScript portátil conservador no `engine-core` (zero deps, sync, sem Node/DOM/SQL/Promise). A engine (`@openbible/engine`) usa `CancellationToken` portátil e NÃO usa `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder`; não interpreta o formato SQLite.
- Arquitetura hexagonal revisada: `engine-core` → `engine` (ports incl. o port transacional `BibleInstaller`) → `adapters`. `BibleInstaller` é o único escritor transacional do armazenamento bíblico e do registry (stage → validate → commit → rollback/cleanup).
- `@openbible/adapter-sqlite-node` opera contra arquivo SQLite real compatível com o **schema legado** do Open Bible (`book.id INTEGER`, `verse.book_id INTEGER`, `metadata` com somente `name`) via driver injetável (`node:sqlite`) com `NodeBibleLibrary` (leitura + `closeVersion`/`close`), `NodeBibleInstaller` (transacional **exception-safe** com **reconciliação best-effort** via `reconcileNodeDataDir`) e `NodeSqliteRegistry` (persistente). Documentado como adapter **Node.js** (`node:fs`/`node:path`/`node:sqlite`); compatibilidade com Bun não é afirmada (não executada). `@openbible/adapter-sqlite-native` fica reservado ao futuro adapter do Native SDK.
- `@openbible/adapter-sqlite-web` (SPEC-0002) é adapter Web **funcional e headless** sobre Worker dedicado + SQLite WASM (`@sqlite.org/sqlite-wasm`) + OPFS SAHPool (`opfs-sahpool`), sem COOP/COEP, com assets de Worker/WASM referenciados de forma relativa ao módulo e overrides de URL/factory (`workerUrl`/`wasmUrl`/`workerFactory`). Exports públicos: `createWebAdapter`, `WebAdapter`, `WebAdapterOptions`, `WebCapabilities`, `WebReconcileStats`. O main-thread só troca RPC semântico validado (`protocol.ts`) com o Worker; nenhum SQL/conexão cruza a fronteira. Garantia nomeada: **SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort** (sem atomic rename/crash-safe). Implementações in-memory vivem em `@openbible/engine-testing` como `FakeLibrary`/`FakeBibleInstaller`.
- Conformance Web: testes de browser via **Playwright** (Chromium e WebKit bloqueiam; Firefox informativo) e **esbuild** para empacotar cliente (`dist/openbible-browser.js`) e Worker (`dist/worker/worker.js`) + `sqlite3.wasm`; unidade em Vitest com `node:sqlite` como pool falso. Comandos: `build:browser`, `test:tdd` (Vitest unit) e `test:browser` (Playwright).
- ESM + declarations + typecheck real; sem `ignoreBuildErrors`. O core continua
  sem framework frontend; a UI isolada em `apps/consumer-web` usa Next.js.
  Compatibilidade com Vercel Native SDK tratada como hipótese até existir
  consumer mínimo que compile e execute.
- SPEC-0003 (prontidão de distribuição, sem publish): `@openbible/adapter-sqlite-web` expõe o subpath de export `./worker` → `dist/worker/worker.js` (bundle do Worker + `sqlite3.wasm` + OPFS SAHPool), mantendo `files: ["dist"]`; `apps/distribution-harness/` (privado) empacota os tarballs dos 5 pacotes de runtime e prova a conversão de `workspace:*` + contrato de exports/files; `scripts/check-api-surface.mjs` é a guarda de regressão da superfície pública (e `--check-no-publish`); cada pacote de runtime ganhou `COMPATIBILITY.md` declarando semver/0.x e a superfície estável. Runner de execução dos testes do harness: Vitest (`apps/distribution-harness`).
