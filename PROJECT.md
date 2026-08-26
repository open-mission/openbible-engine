# Projeto openbible-engine

## História e motivação

O open-bible legado dispersou regras bíblicas entre Web (Next.js, IndexedDB, DatabaseManager, BibleDatabase) e TUI (Bun, better-sqlite3, InstalledStore) com parsing divergente (`domain-bible` vs `tui/lib/parse-reference`) e acesso SQLite acoplado à UI. A fundação `openbible-engine` nasce para unificar essas regras em um motor headless, offline-first e portátil, testável via `conformance-cli` e consumível por Web/PWA (Astro/Next), desktop Native SDK, TUI OpenTUI e futuro React Native, permitindo migração strangler incremental com rollback do legado.

## Finalidade

Prover o bounded context **Scripture Library** (versões, livros, capítulos, versículos, referências, catálogo, instalação atômica, leitura e busca) como biblioteca TypeScript pura, independente de React, OPFS, TursoDB e drivers específicos, com contratos serializáveis e erros discriminados, garantindo operação offline desde a primeira abertura e equivalência entre adapters para a mesma fixture SQLite real. A instalação é transacional via port `BibleInstaller` (stage → validate → commit → rollback/cleanup) e o adapter nativo opera sobre arquivo SQLite real; o adapter Web/OPFS permanece como fatia planejada.

## Pessoas e contexto de uso

- **Desenvolvedores Open Bible** (Web, TUI, Native SDK) que compõem o engine via `createBibleEngine({library, registry, packageSource, clock})` e consomem `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`.
- **Usuários finais** offline que leem capítulos ordenados e buscam versículos sem rede.

## Capacidades principais

- Catálogo e registry de Bíblias instaladas com instalação idempotente e atômica (header, schema, identidade, sanity, promote, registry, cleanup).
- Listagem de livros ordenada por cânone e leitura de capítulos com versículos ordenados.
- Busca substring case-insensitive com limite explícito e ordenação determinística.
- Parser de referências que unifica Web (`rt 3`, `GN 50`, `1co13`, `genesis 1`, `sl.23`) e TUI (`Gn 1:15`, `1Jo 3:16`, `jo 3 16`) com acentos, prefixos e validação de limites, rejeitando ambíguos.
- Adapters substituíveis (sqlite-web in-memory, sqlite-native com driver injetável, http opcional) e contrato testado por suite única.

## Limites

Não implementa Personal Study (notas, destaques, categorias) nem Sync (TursoDB, conflitos, identidade remota, API). Não distribui ARA embarcada (responsabilidade do consumidor). Não publica pacotes nesta entrega. Não cria UI, hooks ou componentes.

## Contexto técnico

Monorepo pnpm 10 + Turborepo 2 + `workspace:*` + pnpm catalogs + Changesets, TypeScript 5.7 strict ESM, Vitest 3, ESLint 9 flat, Node 22, GitHub Actions, `turbo run build/test/typecheck/lint/check`. Fronteiras garantidas por `package.json`, exports e testes arquiteturais, não por Turborepo. Detalhes em `.specsfy/STACK.md` e `.specsfy/DATABASE.md`.

