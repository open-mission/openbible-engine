# Projeto openbible-engine

## História e motivação

O open-bible legado dispersou regras bíblicas entre Web (Next.js, IndexedDB, DatabaseManager, BibleDatabase) e TUI (Bun, better-sqlite3, InstalledStore) com parsing divergente (`domain-bible` vs `tui/lib/parse-reference`) e acesso SQLite acoplado à UI. A fundação `openbible-engine` nasce para unificar essas regras em um motor headless, offline-first e portátil, testável via `conformance-cli` e consumível por Web/PWA (Astro/Next), desktop Native SDK, TUI OpenTUI e futuro React Native, permitindo migração strangler incremental com rollback do legado.

## Finalidade

Prover o bounded context **Scripture Library** (versões, livros, capítulos, versículos, referências, catálogo, instalação, leitura e busca) como biblioteca TypeScript pura, independente de React, TursoDB e drivers específicos, com contratos serializáveis e erros discriminados, garantindo operação offline desde a primeira abertura. A instalação é exception-safe via port `BibleInstaller` (stage → validate → commit → rollback/cleanup); o adapter SQLite Node opera sobre o schema legado real e executa reconciliação best-effort na inicialização; o adapter SQLite Web (Worker + SQLite WASM + OPFS SAHPool) é funcional, offline e com a mesma garantia exceção-safe + reconciliação best-effort.

## Pessoas e contexto de uso

- **Desenvolvedores Open Bible** (Web, TUI, Native SDK) que compõem o engine via `createBibleEngine({ library, registry, installer, packageSource, clock })` e consomem `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`.
- **Usuários finais** offline que leem capítulos ordenados e buscam versículos sem rede.

## Capacidades principais

- Catálogo e registry de Bíblias instaladas com instalação idempotente e exception-safe (header, schema, identidade, sanity, promote, registry, compensação e cleanup), além de reconciliação best-effort na inicialização.
- Listagem de livros ordenada por cânone e leitura de capítulos com versículos ordenados.
- Busca substring case-insensitive com limite explícito e ordenação determinística.
- Parser de referências que unifica Web (`rt 3`, `GN 50`, `1co13`, `genesis 1`, `sl.23`) e TUI (`Gn 1:15`, `1Jo 3:16`, `jo 3 16`) com acentos, prefixos e validação de limites, rejeitando ambíguos.
- Adapters substituíveis: SQLite Node funcional e compatível com o legado, HTTP opcional, SQLite Web/OPFS funcional (Worker + SQLite WASM + SAHPool, assets relativos e overrides) e SQLite Native SDK reservado para uma fatia futura.

## Limites

Não implementa Personal Study (notas, destaques, categorias) nem Sync (TursoDB, conflitos, identidade remota, API). Não distribui ARA na engine: a fixture/local source pertence ao consumidor. O pacote da engine não cria UI; o consumer de referência em `apps/consumer-web` é a primeira aplicação React/PWA do monorepo. Não publica pacotes nesta entrega.

## Contexto técnico

Monorepo pnpm 10 + Turborepo 2 + `workspace:*` + pnpm catalogs + Changesets, TypeScript 5.7 strict ESM, Vitest 3, ESLint 9 flat, Node 22, GitHub Actions, `turbo run build/test/typecheck/lint/check`. Fronteiras garantidas por `package.json`, exports e testes arquiteturais, não por Turborepo. Detalhes em `.specsfy/STACK.md` e `.specsfy/DATABASE.md`.

## Roadmap de evolução

O marco `M01` entrega a biblioteca local e os adapters SQLite Node/Web. A
próxima evolução recomendada é provar o engine como produto consumível antes
de ampliar o domínio:

1. estabilizar distribuição, exports, semver e conformance dos packages;
2. provar consumidores reais Web/PWA, Native SDK e TUI sem mover regras para as aplicações;
3. adicionar Personal Study como bounded context local separado;
4. adicionar Sync/Turso e API pública como serviços opcionais e independentes;
5. levar a engine ao React Native depois dos aprendizados Web e Native SDK;
6. avaliar journal durável antes do 1.0 conforme a necessidade observada.

O consumer de referência em `apps/consumer-web` prova a composição da engine em
Next.js App Router, com Biblioteca, Leitor, Busca e app shell PWA offline-first.

As fontes candidatas e suas dependências estão em `specs.md` e
`specs/inbox/`. Elas não são requisitos aprovados nem autorização de
implementação até serem refinadas e promovidas pelo fluxo Specsfy.
