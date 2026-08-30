# Backlog: Fundação openbible-engine — Scripture Library headless offline-first

| Metainformação | Valor |
| --- | --- |
| ID | 0001 |
| Status | Promoted |
| Produto | openbible-engine |
| Épico | Fundação do motor headless |
| Funcionalidade | Scripture Library (versões, livros, capítulos, versículos, busca, instalação) |
| Tipo | Feature |
| Prioridade | P1 — Crítica |
| Milestones | M01 |
| Criado em | 2026-08-26 |
| Spec promovida | `specs/completed/0001-openbible-engine-scripture-library/spec.md` |

## Ideia original

Criar `openbible-engine` como monorepo TypeScript portátil, pnpm + Turborepo, escopo `@openbible`, que concentre regras de negócio da biblioteca bíblica (versões, livros, capítulos, versículos, referências, instalação, leitura, busca) offline-first, independente de React, Astro, Next, Native SDK, OpenTUI, OPFS, TursoDB, drivers SQLite, auth e sync. Primeira fatia cobre apenas Scripture Library; Personal Study e Sync ficam para futuro. Inclui `engine-core` zero-deps síncrono, `engine` com portas, adapters web/native/http, `engine-testing` e `conformance-cli`.

## Problema percebido

Sem motor compartilhado, regras bíblicas duplicam entre Web (IndexedDB/domain-bible, DatabaseManager, BibleDatabase) e TUI (book-meta, BibleManager, InstalledStore, parse-reference) com divergências de parsing e schema. Falta fundação hexagonal testável que garanta IDs normalizados, instalação atômica, leitura ordenada, busca case-insensitive e operação offline determinística para futuros consumidores Web/PWA, desktop Native SDK, TUI OpenTUI e React Native.

## Pessoa afetada ou beneficiada

**Desenvolvedores Open Bible** (Web, TUI, Native SDK) beneficiados por motor único, testável e versionável. **Usuários finais** que precisam leitura/busca offline desde a primeira abertura com ARA embarcada pelo consumidor.

## Resultado ou valor esperado

Monorepo funcional com `pnpm workspace` + `turbo.json` + `pnpm catalogs` + `workspace:*` + Changesets, TypeScript strict ESM, Vitest, ESLint, declarations, build real, typecheck, GitHub Actions, testes arquiteturais, validações de exports, fixtures SQLite sintéticas, fakes, contract suite e `conformance-cli` que prova `createBibleEngine({library, registry, packageSource, clock})` com métodos `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`.

## Contexto

- Raiz confirmada: `/home/claudio/Projects/openbible-engine` (absoluto).
- Legado somente leitura: `/home/claudio/Projects/open-bible` (packages/domain-bible, application-bible, contracts, adapters-web, apps/web/lib/database/bible, apps/tui/src/db, services, lib/parse-reference).
- Autorização: `specsfy-setup`, `specsfy doctor`, skills, contextos, arquivos locais, deps, git local — sem remoto, publish, PRs, push, alteração do legado, cópia de bancos reais.
- Sequência: setup → inbox → backlog → specify → validate → tasks → tdd-bdd → implement → documentator → progress, com `specs/<estado>/<NNNN>-<slug>/spec.md` como única fonte normativa e Gherkin só na spec (Vitest materializa).
- Contexto persistente lido: `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md`; monitor em início, após cada tarefa e antes de concluir.
- Interface para pessoas: Não (conformance-cli é ferramenta técnica).
- Runner: Vitest. Docs/spec: pt-BR. Código/commits: inglês. Sem Gitflow, Conventional Commits.
- Offline-first, ARA embarcada pelo consumidor, TursoDB fora do milestone 1, sync futuro.
- Migr strangler futuro para open-bible como primeiro consumidor com rollback.

## Referências relacionadas

- Inbox: `specs/inbox/2026-08-26-142301-fundacao-openbible-engine-monorepo-typescript-offline-first.md` (SHA-256 `d5adba952082a2bab650574586718a0dfdf913dd41bb479b39eeaebcaccc8bac`).
- Legado `packages/domain-bible/src/index.ts`: `normalizeReference`, `parseReference(query, books)` com `match /^(\d?\s*[a-zA-ZÀ-ÿ]+)[:\s.]*(\d+)$/` , normalização NFD lower, startsWith, `chapter <= book.chapters`.
- Legado `packages/application-bible`: `getChapter`, `listVersions`, `searchVerses` async por portas `BibleCatalog`, `BibleReader`, `BibleSearch`.
- Legado `packages/contracts`: `Verse {id, bookId, chapter, verse, text}`, `BibleReader {getChapter}`, `BibleVersion {id, name}`, `BibleCatalog {listVersions}`, `BibleSearch {search}`.
- Legado `packages/adapters-web`: `WebBibleReader/Catalog/Search` wrappers.
- Legado `apps/web/lib/database/database.ts` + `DatabaseManager.ts` + `bible/BibleDatabase.ts` + `bible/book-meta.ts`: schema `metadata`, `book`, `verse(book_id, chapter, verse, text)`, Worker+OPFS, `getBooks` via `GROUP BY b.id ORDER BY b.id`, `getChapterVerses` ordered by verse, `search` LIKE COLLATE NOCASE, metadata name.
- Legado `apps/web/features/bible-reader/lib`: `BOOKS` 66 livros, `getVerses` mocks Genesis 1, Sl 23, Jo 1, `parseBibleRef` delega `parseReference`.
- Legado `apps/tui/src/lib/parse-reference.ts`: `normalize` NFD, `ABBR_TO_ID` via BOOK_META, tokens split, suporte `Gn 1:15`, `1Jo 3:16`, `jo 3 16`, fallback `chapter 1`.
- Legado `apps/tui/src/db/bible-manager.ts` + `installed-store.ts` + `sqlite.ts` + `services/download.ts`: `validateDbFile` header `SQLite format 3\0`, cache, `getBooks` join book+verse, `search` LIKE, `listRemoteVersions` fallback static, download gunzip, tmp+rename, InstalledStore tabela `installed_bibles(id, name, installed_at, version_code)`.

## Comportamento esperado

Ver spec `0001-openbible-engine-scripture-library` seções 5–7 para histórias, cenários Gherkin e requisitos. Resumo: IDs normalizados sem path traversal; versão só registrada após validação completa; instalação idempotente e atômica com tmp → validação header/schema/identidade/sanity → promote → registry → cleanup; leitura read-only ordenada; busca substring case-insensitive com limite explícito; operações locais sem rede; parsing cobre `rt 3`, `GN 50`, `1co13`, `genesis 1`, `rt:3`, `sl.23`, `Gn 1:15`, `1Jo 3:16`, `jo 3 16` com acentos, case-insensitive, abreviações, prefixos numéricos, capítulo/versículo, rejeita vazio, inválido, prefixo ambíguo, capítulo zero/fora limite; erros discriminados `version_not_installed`, `invalid_reference`, `invalid_package`, `unsupported_schema`, `storage_unavailable`, `storage_full`, `database_locked`, `network_unavailable`, `cancelled`.

## Regras de negócio

- Bounded contexts explícitos: Scripture Library (esta entrega), Personal Study e Sync futuros sem acoplamento no core.
- `engine-core` zero runtime deps, sync/determinístico, sem Node/DOM/SQL/filesystem/rede/Promise/framework.
- `engine` só depende de `engine-core`.
- Adapters contêm SQLite WASM/Worker/OPFS (web) e driver injetável (native), `adapter-http` opcional para catálogo/download com progresso/cancel, sem URL fixa no core.
- Contratos serializáveis com `Uint8Array`, discriminated unions, epoch ms (sem Date/Map/Set/ORM/DOM/Node).
- Invariantes já listados acima mantidos.

## Critérios de aceitação

Ver AC-001..AC-030 na spec. Cada US/FR/NFR com 3+ cenários (feliz, variação, falha). Destaques: parser com acentos/case-insensitive/abreviações/numéricos/cap/vers/vazio/inválido/ambíguo/limites; normalização e path traversal; erros tipados; delegação casos de uso; core sem imports plataforma; contract suite livros/capítulos/busca; instalação idempotente/falha sem parcial/preserva anterior; exports públicos; conformance CLI.

## Qualidades e operação

- Segurança: IDs validados, path traversal negado, instalação atômica, sem credenciais/.env.
- Privacidade: sem dados pessoais; offline-first.
- Desempenho/volume: busca com limite explícito, leitura ordenada determinística, fixture sintética pequena.
- Auditoria/observabilidade: eventos domínio, instalação progress, Vitest marcadores SPECSFY, RED→GREEN→regressão, typecheck/lint/build, testes arquiteturais.
- Operação: pnpm+Turbo cache, ESM, Changesets, Conventional Commits, GitHub Actions, docs via documentator, PACKAGES.md.
- NFRs verificáveis: sem HTTP quando offline, adapters equivalentes mesma fixture, ordenação determinística, core compila sem plataforma, serializáveis, lint/typecheck/test/build passam.

## Dependências

- Nenhuma runtime externa para core; engine depende de engine-core; adapters isolam better-sqlite3/sqlite-wasm/fetch.
- Node 22, pnpm, Turborepo, TypeScript strict, Vitest, ESLint, Changesets.
- Futura: Native SDK consome core via src/services com adapter Zig/C se driver TS não compilar; TursoDB futuro para sync/API pública; ARA embarcada pelo consumidor.

## Situações de erro

- `version_not_installed` quando versão não instalada; `invalid_reference` parsing/regras; `invalid_package` header/schema falho; `unsupported_schema` schema divergente; `storage_unavailable/full/locked`; `network_unavailable` catálogo remoto; `cancelled` instalação interrompida → sem corrupção, sem registro parcial, preserva anterior.

## Escopo

- Dentro: workspace monorepo, engine-core, engine, adapter-sqlite-web (mínimo testável sem navegador), adapter-sqlite-native (driver injetável), adapter-http (catálogo/download), engine-testing (fakes, fixtures, contract suite, golden cases), conformance-cli, contratos, parser, instalação 9 passos, fixture SQLite sintética, ADRs, docs, testes TDD/BDD.
- Fora: Notas/destaques/categorias, auth, sync, TursoDB, OPFS completo, TUI/páginas, React/Astro/Next/Native SDK/OpenTUI componentes, publicação npm, repo remoto, bancos reais.

## Dúvidas, decisões e riscos

- Decisões confirmadas registradas (15 itens arquitetura, TypeScript vs Rust, hexagonal, adapters, SQLite, offline, ARA, Native SDK substituível, TursoDB fora, strangler).
- Divergências Web/TUI parser documentadas na spec research: Web `normalizeReference` + regex prefix, TUI `parseReference` com ABBR_TO_ID e Gn 1:15/1Jo 3:16/jo 3 16; espec escolhe compatível sem ambiguidade, prefixos ambíguos inválidos, exemplos/contraexemplos inclusos.
- Riscos: compatibilidade parsing, path traversal, header SQLite, schema, header promoção atômica, isolamento core Web APIs, compilação Native SDK TypeScript subset → mitigação via testes caracterização, validação header/schema, contract suite ambos adapters, core sem imports plataforma e ADR Zig/C.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Implementado em `specs/completed/0001-openbible-engine-scripture-library/spec.md`; o status `Promoted` preserva o ciclo do backlog depois da promoção.
