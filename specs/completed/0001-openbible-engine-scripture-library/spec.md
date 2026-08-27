# Especificação integrada: Fundação openbible-engine — Scripture Library

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | 0001 |
| Slug | 0001-openbible-engine-scripture-library |
| Status | Complete |
| Effort | 8 |
| Effort updated at | 2026-08-26 |
| Effort rationale | Monorepo completo com 7 packages + CLI, parser, instalação atômica, adapters, contract suite; high complexity. |
| ClickUp Task | |
| Milestones | M01 |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não — apps/conformance-cli é ferramenta técnica de conformidade, não interface de produto. |
| Atualizada em | 2026-08-26 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O ecossistema Open Bible dissipa regras bíblicas entre Web (Next.js/IndexedDB/DatabaseManager) e TUI (Bun/better-sqlite3), duplicando parsing, normalização e acesso SQLite. Não existe motor headless testável, offline-first e independente de framework que unifique leitura, busca, catálogo e instalação para Web/PWA, desktop Native SDK, TUI OpenTUI e futuro React Native, mantendo instalação atômica, IDs validados e contratos serializáveis.

#### Resultado desejado

Entregar fundação do monorepo `openbible-engine` em TypeScript portátil, pnpm + Turborepo, escopo `@openbible`, com `engine-core` zero-deps síncrono, `engine` com portas e façade `createBibleEngine`, adapters web/native/http mínimos testáveis, `engine-testing` e `conformance-cli`, validado por Vitest, ESLint, typecheck, build, contract suite e CLI que consome apenas exports públicos, pronto para strangler migration do legado.

#### Métricas de sucesso

- 100% operações locais sem HTTP quando rede indisponível (teste NFR).
- Adapters web/native retornam resultados idênticos para mesma fixture SQLite sintética (3 livros, 2 capítulos cada, ordenação preservada).
- Parsing cobre 12+ casos válidos (rt 3, GN 50, 1co13, genesis 1, rt:3, sl.23, Gn 1:15, 1Jo 3:16, jo 3 16, com acentos) e rejeita 6 inválidos (vazio, prefixo ambíguo, cap 0, cap > limite, path traversal, id fora do padrão).
- Instalação atômica com 9 passos e 3 garantias (idempotente, sem parcial, preserva anterior) verificadas por testes.
- Lint, typecheck, testes, build passam via `turbo run build test typecheck lint check`.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: Parsing legado Web vs TUI diverge? → Web usa `parseReference(query, books)` com regex `^(\\d?\\s*[a-zA-ZÀ-ÿ]+)[:\\s.]*(\\d+)$` e startsWith; TUI usa `ABBR_TO_ID` + tokens + Gn 1:15/1Jo 3:16/jo 3 16; conclusão: criar parser unificado com normalização NFD, map de abreviações + nomes + variações numéricas, rejeitar prefixos ambíguos (ex: "j" ambíguo entre Jo/João? exige único candidato), validar capítulo ≤ book.chapters, suportar capítulo e versículo opcionais, case-insensitive, acentos removidos.
- **R-002**: Schema SQLite legado? → `metadata(key,value)`, `book(id)`, `verse(book_id, chapter, verse, text)` + `installed_bibles(id, name, installed_at, version_code)`; validação header `SQLite format 3\\0`, schema via sqlite_master, sanity `SELECT COUNT`, promoção rename atômico.
- **R-003**: TypeScript portátil vs Rust? → Decisão confirmada TS portátil; core sem Node/DOM/SQL/Promise para compilação futura Native SDK subset, zig/c adapter fallback.
- **R-004**: Monorepo orquestração? → pnpm workspaces + Turborepo + workspace:* + pnpm catalogs + Changesets; boundaries via package.json/exports/ESLint/testes, não via Turbo.

#### Fontes e contexto consultados

- `/home/claudio/Projects/open-bible/packages/domain-bible/src/index.ts` — normalizeReference, parseReference
- `/home/claudio/Projects/open-bible/packages/application-bible/src/index.ts` — getChapter/listVersions/searchVerses
- `/home/claudio/Projects/open-bible/packages/contracts/src/index.ts` — Verse, BibleReader/Catalog/Search
- `/home/claudio/Projects/open-bible/packages/adapters-web/src/index.ts` — WebBibleReader wrappers
- `/home/claudio/Projects/open-bible/apps/web/lib/database/database.ts` — Database facade
- `/home/claudio/Projects/open-bible/apps/web/lib/database/DatabaseManager.ts` — Worker+OPFS, exec, installBible, openBible
- `/home/claudio/Projects/open-bible/apps/web/lib/database/bible/BibleDatabase.ts` + book-meta.ts — getBooks, getChapterVerses, search
- `/home/claudio/Projects/open-bible/apps/web/features/bible-reader/lib/bible-data.ts` — BOOKS 66, getVerses
- `/home/claudio/Projects/open-bible/apps/web/features/bible-reader/utils/parseBibleRef.ts` — parseBibleRef delegação
- `/home/claudio/Projects/open-bible/apps/tui/src/lib/parse-reference.ts` — ABBR_TO_ID, parseReference Gn 1:15
- `/home/claudio/Projects/open-bible/apps/tui/src/db/bible-manager.ts` — validateDbFile header, getBooks, search
- `/home/claudio/Projects/open-bible/apps/tui/src/db/installed-store.ts` — installed_bibles schema
- `/home/claudio/Projects/open-bible/apps/tui/src/db/sqlite.ts` — openReadOnly/ReadWrite Bun vs better-sqlite3
- `/home/claudio/Projects/open-bible/apps/tui/src/services/download.ts` — listRemoteVersions fallback, downloadBible gunzip tmp→rename
- Inbox `specs/inbox/2026-08-26-142301-fundacao-openbible-engine-monorepo-typescript-offline-first.md`

#### Documentação consultada

- Specsfy/2.0 contrato `.specsfy/Spec.md` v0.9.2, Node 22, pnpm 10.22, Turborepo, Vitest, ESLint, Changesets docs locais.
- TypeScript Handbook strict ESM, ESLint flat config, Turborepo pipeline docs.

#### Artefatos de pesquisa armazenados

- `specs/draft/0001-openbible-engine-scripture-library/research/legacy-domain-bible/`: snapshot do parsing e contratos domain-bible (sem banco real).
- `specs/draft/0001-openbible-engine-scripture-library/research/legacy-tui-parser/`: snapshot parse-reference TUI e divergências.
- Nenhum banco bíblico real copiado.

#### Dúvidas respondidas

- **Q**: Runner TDD? → **A**: Vitest confirmado (prompt) — materializado em `test:tdd` nos packages.
- **Q**: Interface? → **A**: Não (conformance-cli técnica) — não implementar TUI.
- **Q**: Gitflow? → **A**: Não adotar (prompt) — Conventional Commits.
- **Q**: Publicação? → **A**: Nenhum publish nesta entrega (prompt).
- **Q**: TursoDB? → **A**: Fora do milestone 1, futuro sync/API.

#### Dúvidas abertas

- Nenhuma — decisões confirmadas cobrem stack, bounded contexts, estrutura e invariantes.

#### Revisão arquitetural (validação da fundação experimental)

A validação arquitetural aplicada sobre a fundação experimental identificou
diferenças entre a documentação, os critérios de aceite e a implementação
observada, que não sustentavam a afirmação de entrega concluída. Registro da
revisão (executada via `$specsfy-update-spec`):

- **R-005** [critical] "a engine interpretava o formato SQLite internamente"
  claim — Verdict: **refuted** — Evidence: `packages/engine/src/engine.ts`
  (antes: `SQLITE_HEADER`, `decodePayload`, `validateParsedPayload`,
  `TextEncoder`/`TextDecoder`, `DOMException`) — Confiança alta.
- **R-006** [critical] "atomicidade da instalação era coordenada por
  `BibleLibrary` e `InstalledBibleRegistry` independentes com hooks opcionais e
  descoberta dinâmica (`install`/`installPackage`/`save`/`uninstall`/`remove`/
  `delete`)" claim — Verdict: **refuted** — Evidence: `packages/engine/src/ports.ts`
  (antes: métodos opcionais) — Confiança alta.
- **R-007** [critical] "'adapter SQLite' web funcional delegando para um `Map`"
  claim — Verdict: **refuted** — Evidence: `packages/adapter-sqlite-web/src/in-memory.ts`
  (removido; movido para fakes em `@openbible/engine-testing`) — Confiança alta.
- **R-008** [material] "instalação provada sobre SQLite real" claim — Verdict:
  **refuted initially** — Evidence: fixtures geradas como cabeçalho `SQLite
  format 3\0` + JSON (não SQLite real) — Confiança alta.

Correções incorporadas (desenho final validado e testado):

1. `@openbible/engine` não interpreta mais o formato SQLite: header, schema,
   metadata e sanity query pertencem ao adapter (`BibleInstaller`).
2. Removidos os métodos opcionais e a descoberta dinâmica de
   `install`/`installPackage`/`save`/`uninstall`/`remove`/`delete`; substituídos
   por contratos explícitos e tipados (`BibleInstaller`, `InstallPackageInput`).
3. Novo port `BibleInstaller` é o dono do ciclo stage → validate → commit →
   rollback/cleanup, com registro como parte da garantia transacional e
   compensação verificável; `BibleLibrary` é somente leitura.
4. Em qualquer falha após a promoção (incl. registro/cancelamento), provado por
   teste: instalação nova não deixa dados parciais, versão anterior permanece
   utilizável, temporários são removidos e registry/armazenamento não divergem.
5. `SqliteWebLibrary` não é mais rotulado como adapter funcional delegando a um
   `Map`; implementações in-memory foram movidas para fakes em
   `@openbible/engine-testing`.
6. `adapter-sqlite-node` (antes `adapter-sqlite-native`) opera contra arquivo
   SQLite real (driver Node via `node:sqlite`), com banco temporário real
   (`metadata`, `book`, `verse`), consultas reais e limpeza ao final.
7. Fixture SQLite real, pequena e sem conteúdo bíblico protegido, gerada para
   os testes (`buildRealSqliteBibleFixture`) — não é cabeçalho+JSON.
8. `adapter-sqlite-web` mantido como fatia planejada: não marcado como
   concluído; critérios de aceite definidos (Worker + SQLite WASM + OPFS/SAHPool,
   testes de integração em navegador real).
9. Compatibilidade com Vercel Native SDK tratada como hipótese até existir um
   consumer mínimo que compile e execute; não afirmada apenas pelo fato de o
   core não importar Node.js.
10. `AbortSignal`, `DOMException`, `TextEncoder` e `TextDecoder` avaliados;
    introduzido `CancellationToken` portátil (engine-core) e a engine ficou
    livre de globals de DOM, documentando os runtimes suportados.
11. Desinstalação corrigida: não remove primeiro o registry ignorando falhas de
    armazenamento; aplica compensação reversível.
12. `*.tsbuildinfo` removidos do Git e ignorados; removidos nomes
    `placeholder.test.ts`; removidos casts/comentários defensivos.
13. Separadas as camadas: implementado e comprovado (engine-core, engine, port
    transacional, adapter nativo real, fakes, contract suite, conformance CLI);
    adapter experimental (web/OPFS planejado); arquitetura desejada (Native SDK
    consumer mínimo); trabalho futuro (sync/TursoDB/Personal Study).
14. Rastreabilidade não é satisfeita por repetição de marcadores: cada
    requisito possui teste comportamental que falha se a capacidade for
    removida; o marcador de massa `traceability-bulk.test.ts` foi removido.

#### Revisão 2 — Compatibilidade com o schema SQLite do legado

A fatia SQLite não era compatível com os bancos reais do Open Bible legado
(`book.id`/`verse.book_id` INTEGER, `metadata` com somente `name`). Registro da
segunda revisão (via `$specsfy-update-spec`):

- **R-009** [critical] "schema reproduzido pela fixture era textual inventado"
  (header `SQLite format 3\0` + JSON; `book`/`verse` com ids de texto) claim —
  Verdict: **refuted** — Evidence: `packages/adapter-sqlite-node/src/fixtures.ts`
  (antes) e `apps/tui/tests/bible-manager.test.ts`,
  `apps/tui/src/db/bible-manager.ts`,
  `apps/web/lib/database/bible/BibleDatabase.ts` (referência) — Confiança alta.
- **R-010** [critical] "identidade da versão exigia `metadata.versionId`" claim —
  Verdict: **refuted** — Evidence: `bible-store.ts`
  (`validateMaterializedBibleFile` agora aceita bancos sem `versionId`) —
  Confiança alta.
- **R-011** [critical] "instalação declarada crash-atomic sem recuperação" claim —
  Verdict: **refuted** — Evidence: `bible-store.ts` (`reconcileNodeDataDir`)
  implementa reconciliação de `.tmp`/`.bak`/`.trash` na abertura do adapter —
  Confiança alta.

Correções incorporadas (Revisão 2):

1. Fixture SQLite real que reproduz o schema legado: `book(id INTEGER PRIMARY
   KEY)`, `verse(book_id INTEGER, chapter, verse, text[, translation])`,
   `metadata(key,value)` com apenas `name`; campos adicionais (ex. `translation`,
   `copyright`) não quebram leitura.
2. IDs numéricos 1..66 do SQLite convertidos para os canônicos do domínio
   (`gen`..`rev`) ao listar livros, ler capítulos e buscar
   (`legacy-book-map.ts`, ordem = `BOOKS`/`BOOK_META` legado).
3. Identidade da versão vem do input/manifest da instalação; se
   `metadata.versionId` existir, é validado; se ausente, o banco legado não é
   rejeitado. Checksum do pacote fica como evolução futura.
4. Ciclo de conexões corrigido: `NodeBibleLibrary` expõe `closeVersion`/`close`;
   conexão fechada antes de substituir/remover o arquivo; `NodeAdapter.close()`
   fecha library e registry; reinstalação não lê o inode/banco antigo.
5. Testes reais: abrir/ler; reinstalar com conteúdo diferente e ler imediatamente
   sem recriar processo; desinstalar com banco aberto; nenhuma conexão utilizável
   após `close()`.
6. Teste de falha de registro depois do promote: versão anterior intacta byte a
   byte, consultável; registry anterior preservado; sem `.tmp`/`.bak`.
7. Garantia **exception-safe** ao longo da instalação/desinstalação e
   **reconciliação best-effort na inicialização** (não crash-safe completa):
   `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash` ao abrir o adapter.
   Um arquivo `.db` sem entrada no registry é tratado como **órfão** e removido
   (ex.: primeira instalação interrompida após o promote e antes do registro);
   documentado que `.db + .bak` é **ambíguo sem journal** e resolvido por
   heurística determinística (rollback ao anterior). Crash-safety completa com
   journal por operação fica como **spec futura**. Testado também o caso de
   primeira instalação interrompida após o promote e antes do registry.
8. `CancellationToken` consultado entre fases (após write, após validação, antes
   de mover o anterior, antes de promover, antes de registrar), com teste de
   cancelamento provocado pelo observer em cada checkpoint.
9. `SearchResult.total` = total de matches antes do LIMIT via `COUNT(*)`, com
   ordem canônica bíblica.
10. Adapter documentado como **Node.js** (`node:fs`/`node:path`/`node:sqlite`);
    compatibilidade com Bun não é afirmada (não executada). Package renomeado
    para `@openbible/adapter-sqlite-node`; `@openbible/adapter-sqlite-native`
    reservado ao futuro adapter do Native SDK.
11. Conformance CLI usa a fixture compatível com o schema legado, não o schema
    textual inventado pela engine.

Nesta entrega **não** se declara a engine inteira concluída; declara-se apenas a
fatia SQLite Node compatível com o schema legado.

### 3. Escopo e atores

#### Incluído

- Monorepo pnpm workspace com `turbo.json` (build, test, test:coverage, typecheck, lint, check), `pnpm-workspace.yaml`, catalogs, `workspace:*`, Changesets.
- `@openbible/engine-core` (zero deps, sync, determinístico, sem plataforma; inclui `CancellationToken`).
- `@openbible/engine` (portas, casos de uso, façade `createBibleEngine`, depende só de engine-core; port transacional `BibleInstaller`; sem interpretar SQLite nem globals de DOM).
- `@openbible/adapter-sqlite-node` (adapter **Node.js** REAL sobre arquivo SQLite via driver `node:sqlite` injetável; compatível com o **schema legado** do Open Bible: `book.id INTEGER`, `verse.book_id INTEGER`, `metadata(key,value)` com `name` e `versionId` opcional; `NodeBibleLibrary` leitura + ciclo de conexão, `NodeBibleInstaller` transacional **exception-safe** com **reconciliação best-effort** na inicialização, `NodeSqliteRegistry` persistente). `@openbible/adapter-sqlite-native` fica reservado para o futuro adapter do Native SDK (runtimes não compartilháveis).
- `@openbible/adapter-sqlite-web` (fatia PLANEJADA — boundary não funcional; requer Worker + SQLite WASM + OPFS/SAHPool em navegador real para ser concluído).
- `@openbible/adapter-http` (catálogo/download opcional com progresso/cancel).
- `@openbible/engine-testing` (fixtures, fakes, contract suite, builders — a implementação in-memory vive aqui como `FakeLibrary`/`FakeBibleInstaller`).
- `apps/conformance-cli` (smoke via exports públicos sobre SQLite real; prova persistência após fechar/reabrir).
- Contratos serializáveis, erros discriminados, parser, instalação 9 passos (dono: `BibleInstaller`), fixture SQLite real, ADRs, docs, testes TDD/BDD com Vitest, lint/typecheck/build, GH Actions.

#### Fora de escopo

- Personal Study (notas, destaques, categorias) e Sync (multidispositivo, TursoDB, API, identidade) — não implementar e não acoplar core.
- Notas/destaques/categorias/auth/sync, integração OPFS/Worker/WASM em navegador real (fatia planejada), framework frontend (React/Astro/Next/Native SDK/OpenTUI componentes), consumer mínimo do Native SDK (hipótese), banco real ARA, publicação npm, repo remoto.

#### Atores

- **Consumidor Engine (Web/PWA, Native SDK desktop, TUI, React Native futuro)**: compõe engine via `createBibleEngine`, lista versões/livros, lê capítulos, busca, instala/remove, parseia referências, opera offline.
- **Desenvolvedor Engine**: mantém core, portas, adapters, tests, CLI, garante boundaries, contrato e compatibilidade com legado via strangler migration com rollback.

### 4. Princípios e restrições do projeto

- **PR-001**: Arquitetura hexagonal — core puro sem I/O, ports no engine, adapters substituíveis.
- **PR-002**: Offline-first — leitura/busca/acesso local nunca provocam rede implícita; rede só via adapter-http opcional.
- **PR-003**: TypeScript portátil conservador (subset compatível Native SDK) — sem Promise/DOM/Node/SQL no core.
- **PR-004**: Contratos serializáveis (records, arrays, numbers, booleans, strings, Uint8Array, unions) com epoch ms, sem Date/Map/Set/ORM.
- **PR-005**: Fronteiras garantidas por package.json/exports/ESLint/testes arquiteturais/contract suite, não por Turborepo.
- **PR-006**: Instalação atômica idempotente com validação header/schema/identidade/sanity, tmp→promote, registry só após sucesso, cleanup em falha.
- **PR-007**: Sem mensagens UI no engine, erros por códigos estáveis traduzidos pelos apps.
- **PR-008**: Testes first com Vitest, Gherkin só na spec, marcadores SPECSFY, RED válido antes de GREEN, sem mocks que escondam fronteira.

### 5. Histórias de usuário

#### US-001 — Instalar e gerenciar versões bíblicas (P1)

Como consumidor do engine, quero instalar, listar e remover versões bíblicas a partir de bytes locais ou remotos, para manter biblioteca offline utilizável e atualizável.

**Por que P1**: Bootstrap offline e ARA embarcada dependem de ciclo de instalação confiável; base para todos os demais casos.
**Teste independente**: `installVersion(bytes) → listInstalledVersions` contém id; `uninstallVersion` remove; re-instalar mesmo bytes é idempotente; falha não deixa parcial.
**Requisitos**: FR-003, FR-004, FR-005, FR-008, FR-009

#### US-002 — Listar livros de versão instalada (P1)

Como consumidor, quero listar livros e metadados de uma versão instalada, para navegar e validar parsing.

**Por que P1**: Navegação e parsing dependem de catálogo de livros com capítulos e limites.
**Teste independente**: `getBooks(versionId)` retorna livros ordenados por id com chapters e testament; versão não instalada retorna erro version_not_installed.
**Requisitos**: FR-003, FR-004, FR-006, FR-008

#### US-003 — Ler capítulo ordenado (P1)

Como consumidor, quero ler versículos de um capítulo ordenados, para renderizar leitura.

**Por que P1**: Leitura é uso primário offline; ordenação determinística crítica.
**Teste independente**: `getChapter({versionId, bookId, chapter})` retorna verses ordenados por verse ASC com bookId/chapter/text; livro/cap inválido → invalid_reference.
**Requisitos**: FR-001, FR-006, FR-008, FR-009

#### US-004 — Buscar versículos substring (P1)

Como consumidor, quero buscar versículos por substring case-insensitive com limite explícito, para estudo.

**Por que P1**: Busca é requisito compartilhado Web/TUI; limite evita overload.
**Teste independente**: `searchVerses({versionId, query, limit})` retorna matches ordenados por book_id, chapter, verse LIMIT; query vazia→ array vazio; sem rede.
**Requisitos**: FR-001, FR-007, FR-008, FR-009

#### US-005 — Parsear referências bíblicas (P1)

Como consumidor, quero parsear strings como "Gn 1:15", "1Jo 3:16", "rt 3", "GN 50", "1co13", "genesis 1", "sl.23" com acentos e variações, para navegação por entrada livre.

**Por que P1**: Entrada livre é principal UX Web/TUI; divergências devem ser unificadas sem ambiguidade.
**Teste independente**: `parseReference(input, books)` com acentos/case-insensitive/abreviações/numéricos retorna book+chapter+verse?; entradas vazias/ambíguas/cap 0/>limite → null + invalid_reference quando via engine.
**Requisitos**: FR-001, FR-002, FR-008, FR-009

### 6. Cenários BDD de aceite

#### AC-001 — normalização de IDs aceita case-insensitive e impede path traversal

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-001
Feature: normalização de IDs aceita case-insensitive e impede path traversal

  Scenario: caminho feliz AC-001
    Given um versionId "ARA" e livro "gen"
    When normalizar "ARA" e "../etc/passwd"
    Then "ara" é válido e traversal é rejeitado com invalid_package
```

#### AC-002 — parser aceita abreviação case-insensitive com acento removido

**Cobre**: US-001, FR-002, NFR-002

```gherkin
@US-001 @FR-002 @NFR-002 @AC-002
Feature: parser aceita abreviação case-insensitive com acento removido

  Scenario: caminho feliz AC-002
    Given livros com GEN, PSA, JHN
    When parsear "GEN 1" em caixa alta
    Then retorna book gen chapter 1 (case-insensitive)
```

#### AC-003 — listar versões disponíveis sem rede quando offline

**Cobre**: US-001, FR-003, NFR-003

```gherkin
@US-001 @FR-003 @NFR-003 @AC-003
Feature: listar versões disponíveis sem rede quando offline

  Scenario: caminho feliz AC-003
    Given catálogo remoto indisponível
    When listAvailableVersions via packageSource fake offline
    Then retorna lista local sem tentativa HTTP em operações locais
```

#### AC-004 — instalação idempotente re-aplicada mantém registry único

**Cobre**: US-001, FR-004, NFR-004

```gherkin
@US-001 @FR-004 @NFR-004 @AC-004
Feature: instalação idempotente re-aplicada mantém registry único

  Scenario: caminho feliz AC-004
    Given versão ara instalada
    When reinstalar mesmos bytes
    Then registry mantém um registro, segunda chamada é idempotente
```

#### AC-005 — ciclo instalação atômica com header e schema válidos promove e registra

**Cobre**: US-001, FR-005, NFR-005

```gherkin
@US-001 @FR-005 @NFR-005 @AC-005
Feature: ciclo instalação atômica com header e schema válidos promove e registra

  Scenario: caminho feliz AC-005
    Given bytes SQLite válido com metadata ara
    When installVersion com observer
    Then progresso emite estágios, valida header/schema/identidade, promove e registra
```

#### AC-006 — leitura de capítulo retorna versículos ordenados

**Cobre**: US-001, FR-006, NFR-006

```gherkin
@US-001 @FR-006 @NFR-006 @AC-006
Feature: leitura de capítulo retorna versículos ordenados

  Scenario: caminho feliz AC-006
    Given versão ara com Gn 1 (3 versículos)
    When getChapter gen 1
    Then retorna 3 versículos ordenados por verse 1..3
```

#### AC-007 — busca substring case-insensitive com limite explícito retorna matches ordenados

**Cobre**: US-002, FR-007, NFR-007

```gherkin
@US-002 @FR-007 @NFR-007 @AC-007
Feature: busca substring case-insensitive com limite explícito retorna matches ordenados

  Scenario: caminho feliz AC-007
    Given ara com "Deus criou" em Gen 1:1
    When searchVerses query "deus" limit 10
    Then encontra versículo case-insensitive ordenado
```

#### AC-008 — erro version_not_installed quando versão não registrada

**Cobre**: US-002, FR-008, NFR-001

```gherkin
@US-002 @FR-008 @NFR-001 @AC-008
Feature: erro version_not_installed quando versão não registrada

  Scenario: falha esperada AC-008
    Given registry vazio
    When getBooks "nvi" não instalada
    Then retorna erro version_not_installed
```

#### AC-009 — façade delega para portas sem expor SQL ou conexões

**Cobre**: US-002, FR-009, NFR-002

```gherkin
@US-002 @FR-009 @NFR-002 @AC-009
Feature: façade delega para portas sem expor SQL ou conexões

  Scenario: caminho feliz AC-009
    Given engine criado com fakes
    When chamar listInstalledVersions
    Then delega para registry sem expor executeSql ou connection
```

#### AC-010 — adapters web e native retornam livros equivalentes para mesma fixture

**Cobre**: US-002, FR-010, NFR-003

```gherkin
@US-002 @FR-010 @NFR-003 @AC-010
Feature: adapters web e native retornam livros equivalentes para mesma fixture

  Scenario: caminho feliz AC-010
    Given fixture sintética ara.db mínima
    When executar contract suite em adapters web e native
    Then ambos retornam mesmos livros e capítulos
```

#### AC-011 — rejeição de ID com path traversal como invalid_package

**Cobre**: US-002, FR-001, NFR-004

```gherkin
@US-002 @FR-001 @NFR-004 @AC-011
Feature: rejeição de ID com path traversal como invalid_package

  Scenario: variação crítica AC-011
    Given input versionId "../../../etc/passwd"
    When validar ID
    Then rejeita com invalid_package
```

#### AC-012 — parser com acentos como Gênesis e João

**Cobre**: US-002, FR-002, NFR-005

```gherkin
@US-002 @FR-002 @NFR-005 @AC-012
Feature: parser com acentos como Gênesis e João

  Scenario: caminho feliz AC-012
    Given livros com Gênesis e João
    When parsear "Gênesis 1" e "João 3:16" com acentos
    Then retorna gen 1 e jhn 3:16
```

#### AC-013 — catálogo remoto opcional não bloqueia operações locais offline

**Cobre**: US-003, FR-003, NFR-006

```gherkin
@US-003 @FR-003 @NFR-006 @AC-013
Feature: catálogo remoto opcional não bloqueia operações locais offline

  Scenario: caminho feliz AC-013
    Given rede indisponível mas packageSource configurado
    When getBooks offline
    Then não realiza fetch, retorna dados locais
```

#### AC-014 — falha de schema remove temporários e não registra parcial

**Cobre**: US-003, FR-004, NFR-007

```gherkin
@US-003 @FR-004 @NFR-007 @AC-014
Feature: falha de schema remove temporários e não registra parcial

  Scenario: falha esperada AC-014
    Given bytes com header SQLite mas sem tabela verse
    When installVersion
    Then falha unsupported_schema, limpa tmp, não registra
```

#### AC-015 — preservação da versão anterior quando nova instalação falha

**Cobre**: US-003, FR-005, NFR-001

```gherkin
@US-003 @FR-005 @NFR-001 @AC-015
Feature: preservação da versão anterior quando nova instalação falha

  Scenario: falha esperada AC-015
    Given ara v1 instalada
    When tentar instalar v2 corrompida
    Then mantém v1 íntegra, registry não sobrescreve
```

#### AC-016 — parser prefixos numéricos 1co, 1Jo, 2Pe com capítulo

**Cobre**: US-003, FR-006, NFR-002

```gherkin
@US-003 @FR-006 @NFR-002 @AC-016
Feature: parser prefixos numéricos 1co, 1Jo, 2Pe com capítulo

  Scenario: caminho feliz AC-016
    Given livros 1Co, 1Jo, 2Pe
    When parsear "1co13" e "1Jo 3:16"
    Then reconhece livro numérico + capítulo/versículo
```

#### AC-017 — busca preserva ordenação determinística por book_id, chapter, verse

**Cobre**: US-003, FR-007, NFR-003

```gherkin
@US-003 @FR-007 @NFR-003 @AC-017
Feature: busca preserva ordenação determinística por book_id, chapter, verse

  Scenario: caminho feliz AC-017
    Given versículos espalhados
    When search "a" com limite
    Then resultado ordenado por book_id chapter verse
```

#### AC-018 — invalid_reference para capítulo zero ou fora do limite

**Cobre**: US-003, FR-008, NFR-004

```gherkin
@US-003 @FR-008 @NFR-004 @AC-018
Feature: invalid_reference para capítulo zero ou fora do limite

  Scenario: falha esperada AC-018
    Given livro gen com 50 capítulos
    When parsear "gen 0" e "gen 51"
    Then rejeita com invalid_reference
```

#### AC-019 — consumo apenas via exports públicos createBibleEngine

**Cobre**: US-004, FR-009, NFR-005

```gherkin
@US-004 @FR-009 @NFR-005 @AC-019
Feature: consumo apenas via exports públicos createBibleEngine

  Scenario: caminho feliz AC-019
    Given bundle @openbible/engine
    When inspecionar exports
    Then apenas createBibleEngine e tipos, sem internals
```

#### AC-020 — core não importa plataforma (sem fs, fetch, DOM, better-sqlite3)

**Cobre**: US-004, FR-010, NFR-006

```gherkin
@US-004 @FR-010 @NFR-006 @AC-020
Feature: core não importa plataforma (sem fs, fetch, DOM, better-sqlite3)

  Scenario: caminho feliz AC-020
    Given código engine-core
    When inspecionar imports
    Then zero import de fs, path, fetch, DOM, better-sqlite3
```

#### AC-021 — contratos serializáveis sem Date/Map/Set

**Cobre**: US-004, FR-001, NFR-007

```gherkin
@US-004 @FR-001 @NFR-007 @AC-021
Feature: contratos serializáveis sem Date/Map/Set

  Scenario: caminho feliz AC-021
    Given contrato Verse
    When serializar via JSON
    Then contém apenas strings/números/Uint8Array, epoch ms
```

#### AC-022 — parser rejeita prefixo ambíguo que casa múltiplos livros

**Cobre**: US-004, FR-002, NFR-001

```gherkin
@US-004 @FR-002 @NFR-001 @AC-022
Feature: parser rejeita prefixo ambíguo que casa múltiplos livros

  Scenario: variação crítica AC-022
    Given query "j" ambígua entre João, Judas, Jonas
    When parsear "j 3"
    Then retorna null (ambíguo) não escolhe arbitrariamente
```

#### AC-023 — parser reconhece rt 3, GN 50, genesis 1, rt:3, sl.23

**Cobre**: US-004, FR-003, NFR-002

```gherkin
@US-004 @FR-003 @NFR-002 @AC-023
Feature: parser reconhece rt 3, GN 50, genesis 1, rt:3, sl.23

  Scenario: caminho feliz AC-023
    Given casos observados Web
    When parsear "rt 3", "GN 50", "genesis 1", "rt:3", "sl.23"
    Then todos retornam livro+capítulo válidos
```

#### AC-024 — uninstall remove do registry mas mantém outras versões

**Cobre**: US-004, FR-004, NFR-003

```gherkin
@US-004 @FR-004 @NFR-003 @AC-024
Feature: uninstall remove do registry mas mantém outras versões

  Scenario: caminho feliz AC-024
    Given instaladas ara e nvi
    When uninstall nvi
    Then remove nvi, mantém ara
```

#### AC-025 — cancelamento de instalação limpa temporários e retorna cancelled

**Cobre**: US-005, FR-005, NFR-004

```gherkin
@US-005 @FR-005 @NFR-004 @AC-025
Feature: cancelamento de instalação limpa temporários e retorna cancelled

  Scenario: falha esperada AC-025
    Given instalação em progresso
    When cancelar via AbortSignal
    Then retorna cancelled e limpa tmp
```

#### AC-026 — getChapter com versículo específico ainda retorna capítulo ordenado

**Cobre**: US-005, FR-006, NFR-005

```gherkin
@US-005 @FR-006 @NFR-005 @AC-026
Feature: getChapter com versículo específico ainda retorna capítulo ordenado

  Scenario: caminho feliz AC-026
    Given gen 1 com 3 versículos
    When getChapter com referência com versículo
    Then retorna capítulo completo ordenado
```

#### AC-027 — busca com limite zero ou maior que total respeita limite

**Cobre**: US-005, FR-007, NFR-006

```gherkin
@US-005 @FR-007 @NFR-006 @AC-027
Feature: busca com limite zero ou maior que total respeita limite

  Scenario: caminho feliz AC-027
    Given 5 versículos com "a"
    When search limit 2 e limit 100
    Then primeiro retorna 2, segundo retorna 5
```

#### AC-028 — invalid_package em header SQLite inválido

**Cobre**: US-005, FR-008, NFR-007

```gherkin
@US-005 @FR-008 @NFR-007 @AC-028
Feature: invalid_package em header SQLite inválido

  Scenario: falha esperada AC-028
    Given bytes "not sqlite"
    When installVersion
    Then falha invalid_package
```

#### AC-029 — operações locais não tentam HTTP mesmo com packageSource presente

**Cobre**: US-005, FR-009, NFR-001

```gherkin
@US-005 @FR-009 @NFR-001 @AC-029
Feature: operações locais não tentam HTTP mesmo com packageSource presente

  Scenario: caminho feliz AC-029
    Given engine com packageSource http
    When executar searchVerses offline
    Then nenhum fetch disparado
```

#### AC-030 — conformance CLI executa cenários e prova equivalência adapters

**Cobre**: US-005, FR-010, NFR-002

```gherkin
@US-005 @FR-010 @NFR-002 @AC-030
Feature: conformance CLI executa cenários e prova equivalência adapters

  Scenario: caminho feliz AC-030
    Given fixture e fakes
    When rodar conformance-cli --check
    Then todos cenários passam via exports públicos
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve normalizar e validar IDs de versões e livros (trim, lower, NFD sem acentos, kbd kebab, sem path traversal, sem caracteres especiais) e rejeitar inválidos com erro discriminado.
- **FR-002**: O sistema deve parsear referências bíblicas case-insensitive com acentos removidos, abreviações, nomes completos, prefixos numéricos (1-3), capítulo e versículo opcionais, rejeitando vazio, ambíguo, capítulo zero/fora limite.
- **FR-003**: O sistema deve prover catálogo de versões (listAvailable) via BiblePackageSource opcional, sem obrigar rede para operações locais.
- **FR-004**: O sistema deve manter registry de bíblias instaladas (id, name, installedAt epoch ms) com list/get/set/remove, isolado de filesystem direto.
- **FR-005**: O sistema deve instalar versões em ciclo atômico: receber bytes → tmp → validar header SQLite → validar schema → validar identidade → sanity query → promote atômico → atualizar registry → cleanup em falha, com progresso e cancelamento.
- **FR-006**: O sistema deve listar livros e ler capítulos via BibleLibrary read-only, retornando versículos ordenados por verse ASC, validando version_installed e limites.
- **FR-007**: O sistema deve buscar versículos por substring case-insensitive com limite explícito, retornando SearchResult ordenado por book/chapter/verse.
- **FR-008**: O sistema deve modelar erros discriminados com códigos estáveis (version_not_installed, invalid_reference, invalid_package, unsupported_schema, storage_unavailable, storage_full, database_locked, network_unavailable, cancelled, invalid_book, invalid_chapter).
- **FR-009**: O sistema deve expor façade `createBibleEngine({library, registry, installer, packageSource?, clock})` com `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`, sem expor SQL/conexões nem interpretar o formato de armazenamento. O `installer` é o port transacional (`BibleInstaller`) dono do ciclo stage → validate → commit → rollback/cleanup; a engine não contém header/schema/metadata ou codecs DOM.
- **FR-010**: O sistema deve prover adapters web/native/http como boundaries substituíveis, mantendo core sem deps de plataforma, e garantir equivalência via contract suite para mesma fixture.

#### Não funcionais

- **NFR-001**: Operação offline-first — com rede indisponível, operações locais não tentam HTTP. **Verificação**: teste com packageSource que lança network_unavailable se chamado; realizar getBooks/search sem fetch.
- **NFR-002**: Equivalência de adapters — web e native retornam resultados idênticos para mesma fixture SQLite sintética. **Verificação**: contract suite compartilhado executado em ambos adapters com mesma fixture.
- **NFR-003**: Ordenação determinística — versículos de um capítulo sempre ordenados ASC. **Verificação**: teste que insere versículos fora de ordem e valida retorno ordenado.
- **NFR-004**: Core sem dependências de plataforma — engine-core não importa fs, path, fetch, DOM, better-sqlite3, etc. **Verificação**: teste arquitetural ESLint + inspection de imports.
- **NFR-005**: Contratos serializáveis com epoch ms, sem Date/Map/Set. **Verificação**: teste de serialização JSON + validação de tipos.
- **NFR-006**: Qualidade de pipeline — lint, typecheck, teste, build passam via turbo na raiz. **Verificação**: execução `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- **NFR-007**: Instalação robusta — idempotente, sem parcial em falha, preserva anterior. **Verificação**: testes de re-instalação, falha de schema/header, e falha após versão válida.

#### Erros e casos-limite

- versionId com "/" ou ".." → invalid_package / invalid_reference sem path traversal.
- capítulo 0 ou > book.chapters → invalid_reference.
- query vazia → search retorna [].
- versão não instalada → version_not_installed.
- header não SQLite → invalid_package.
- schema sem metadata/book/verse → unsupported_schema.
- storage full/locked/unavailable → erros correspondentes.
- cancelamento via signal → cancelled + cleanup.
- prefixo ambíguo (ex: "j" casa Jo/Jd/Jn) → invalid_reference (null).

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Legado em /home/claudio/Projects/open-bible: Next.js 16 + React 19 + better-sqlite3/bun:sqlite + drizzle + OPFS+Worker, TUI Bun+OpenTUI, domains duplicados. Novo projeto é monorepo independente pnpm+Turborepo; não reutiliza código legado diretamente, mas preserva comportamentos de parsing, schema verse/book/metadata e busca LIKE COLLATE NOCASE.

#### Arquitetura e módulos

- Hexagonal (revisada): `engine-core` (entidades, value objects, normalização, parser, erros, `CancellationToken`, invariantes, zero deps, sync) → `engine` (ports: `BibleLibrary` somente-leitura, `InstalledBibleRegistry`, `BiblePackageSource`, `Clock`, `InstallationObserver` e o port transacional `BibleInstaller`; use-cases; façade `createBibleEngine`) → `adapters` (sqlite-native: `node:sqlite` REAL; sqlite-web: boundary PLANEJADO; http: fetch catálogo/download). `engine-testing` fornece fakes, fixtures e contract suite. `apps/conformance-cli` consome exports públicos sobre SQLite real.
- `BibleInstaller` é o único escritor do armazenamento bíblico E do registry, dono do ciclo stage → validate → commit → rollback/cleanup, com compensação verificável; a engine NÃO interpreta header/schema/metadata/sanity (responsabilidade do adapter) e NÃO usa `TextEncoder`/`TextDecoder`/`DOMException`/`AbortSignal` (usa `CancellationToken` portátil).
- Direção: adapters → engine → engine-core (core nunca importa adapters). Frontend (Web/TUI/Native SDK) são consumidores substituíveis atrás das ports. Compatibilidade com Native SDK tratada como hipótese até existir consumer mínimo que compile e execute.

#### Migrations

- Não aplicável nesta entrega (sem Turso, sem app.db externo). Instalação usa tmp file + rename atômico; registry é abstraído via InstalledBibleRegistry (adapter decide persistência). Futuro sync poderá adicionar migrations versionadas com rollback; não criar agora.

#### Models

- BibleVersion { id: string (normalized kebab), name: string, language?: string, totalBooks?: number } — validação id, sem path traversal.
- BibleBook { id, name, abbreviation, testament: "old"|"new", chapters: number, chapterVerseCounts?: number[] } — invariantes id e chapters.
- Verse { id: string (book-chapter-verse), bookId, chapter, verse, text } — text preserves original.
- BibleReference { bookId, chapter, verseStart?, verseEnd? } — value object.
- InstalledBible { id, name, installedAt: number (epoch ms), versionCode: number } — registry.
- SearchRequest { versionId, query, limit: number } — limit explícito >0.
- SearchResult { versionId, query, results: Verse[], total: number } — ordenado.
- InstallationProgress { versionId, stage: "receiving"|"validating_header"|"validating_schema"|"validating_identity"|"sanity_check"|"promoting"|"registering", receivedBytes?, totalBytes? } — progresso.
- EngineError { code: "version_not_installed"|... , message: string, details?: unknown, cause?: unknown } — discriminada.

#### Controllers e casos de uso

- `createBibleEngine({library, registry, installer, packageSource?, clock})` → { listAvailableVersions, listInstalledVersions, installVersion(input, observer?), uninstallVersion, getBooks, getChapter, searchVerses, parseReference } — a engine valida IDs, resolve bytes e delega a instalação/remoção ao `installer` (port transacional) e a leitura ao `library`; não interpreta SQLite nem usa `TextEncoder`/`TextDecoder`/`DOMException`/`AbortSignal` (usa `CancellationToken`).
- Use-cases: InstallBibleUseCase (9 passos), ListBooks, GetChapter, SearchVerses, ParseReference, ListVersions. Arquivos: `packages/engine/src/use-cases/*.ts`, `packages/engine/src/engine.ts`.

#### Views e experiência

- Não há interface para pessoas. `apps/conformance-cli` é técnico: comandos `check`, `list-books`, `get-chapter`, `search`, `parse` que invocam engine via exports públicos e imprimem JSON. Não usar React/Tailwind/shadcn; CLI usa Node `node:fs`/`fetch` via adapters injetados.

#### Queries e repositórios

- BibleLibrary: `getBooks(versionId): BibleBook[]`, `getChapter(versionId, bookId, chapter): Verse[]`, `search(versionId, query, limit): Verse[]`, `getVersionName(versionId): string` — read-only, sem SQL exposto.
- InstalledBibleRegistry: `list(): InstalledBible[]`, `get(id): InstalledBible|null`, `set(bible)`, `remove(id)` — storage abstraído.
- BiblePackageSource: `listAvailable(): BibleVersion[]`, `fetchPackage(versionId, signal?): Uint8Array` — opcional, com progresso/cancel.
- Clock: `now(): number` — retorna epoch ms para testabilidade.
- Índices SQLite implícitos: primary em verse(book_id, chapter, verse) e metadata key.

#### Jobs e processamento assíncrono

- Não aplicável no core (sync). Adapter-http usa fetch com AbortSignal e observer de progresso; instalação suporta cancel → cancelled. Sem filas.

#### Estrutura de arquivos

```text
specs/draft/0001-openbible-engine-scripture-library/
  spec.md
  research/legacy-domain-bible/
  research/legacy-tui-parser/
packages/engine-core/src/
  types.ts, errors.ts, validation.ts, normalize.ts, parser.ts, book-meta.ts
packages/engine/src/
  ports.ts (BibleLibrary read-only, InstalledBibleRegistry, BiblePackageSource, Clock,
  InstallationObserver, BibleInstaller, InstallPackageInput), engine.ts (createBibleEngine),
  use-cases/install.ts (re-export BibleInstaller contract)
packages/adapter-sqlite-web/src/
  sqlite-web.ts (planned slice, non-functional boundary)
packages/adapter-sqlite-node/src/
  driver.ts (node:sqlite SqliteDriver), bible-store.ts (NativeBibleLibrary,
  NativeBibleInstaller transacional), registry.ts (SqliteInstalledRegistry persistente),
  fixtures.ts (buildRealSqliteBibleFixture), index.ts (createNativeAdapter)
packages/adapter-http/src/
  http-source.ts
packages/engine-testing/src/
  fakes.ts, fixtures.ts, contract-suite.ts, builders.ts
apps/conformance-cli/src/
  index.ts
pnpm-workspace.yaml, turbo.json, package.json, tsconfig.json, eslint, vitest, .changeset
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| BibleVersion | id (kebab, normalized, sem /..) | name string não vazio, language?, totalBooks? | 1:N BibleBook |
| BibleBook | id (gen, 1co, psa etc) | name, abbreviation, testament old/new, chapters 1..150, chapterVerseCounts? | N:1 BibleVersion, 1:N Verse |
| Verse | id = book-chapter-verse | bookId FK, chapter 1..chapters, verse 1.., text string | N:1 BibleBook, N:1 BibleVersion via library |
| InstalledBible | id = versionId | name, installedAt epoch ms (Clock), versionCode int | 1:1 BibleVersion |
| SearchRequest | versionId+query+limit | query string, limit 1..1000 explícito | referencia Verse |
| InstallationProgress | versionId+stage | stage enum 7 passos, bytes opcionais | evento |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| InstalledBible | ausente | installVersion bytes válidos | instalada | só registra após validação completa |
| InstalledBible | instalada | installVersion mesmos bytes | instalada (idempotente) | sem duplicar |
| InstalledBible | instalada | installVersion bytes inválidos | instalada (preserva anterior) | falha não corrompe |
| InstalledBible | instalada | uninstall | ausente | remove do registry |
| BiblePackage | remoto | fetchPackage | bytes tmp | valida header |
| BiblePackage | tmp | validate header/schema/identidade/sanity | validado | falha limpa tmp |
| BiblePackage | validado | promote rename | promovido | rename atômico |
| BiblePackage | promovido | register | registrado | registry atualizado |

#### Migração e retenção

- Sem migração nesta entrega. Fixture sintética e registry fake em testes. Futuro: migrations versionadas para installed_bibles com add column sem breaking.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não — apps/conformance-cli é ferramenta técnica de conformidade, não interface de produto. Não implementar telas, formulários, menus, breadcrumbs, React, Tailwind, shadcn/ui ou ReUI.

#### Stack e convenções de interface

- Stack: TypeScript strict ESM, Node 22, pnpm, Turborepo, Vitest, ESLint flat, Changesets; CLI Node com `node:fs` e `fetch` injetado via adapters, sem UI framework. Fonte: package.json e turbo.json.

#### Telas e responsabilidades

- Não aplicável — CLI técnico com comandos `check`, `list-books <version>`, `get-chapter <version> <book> <chapter>`, `search <version> <query>`, `parse <query>`, `install <version> <path>` que imprimem JSON e exit 0/1.

#### Fluxo de informação e navegação

- Consumidor compõe engine com library/registry/packageSource/clock concretos, chama operacaos façade e recebe dados/errors; não há navegação de telas.

#### Menus e navegação principal

- Não há menu de produto; CLI expõe comandos via args. Navegação direta por comando é suficiente por ser ferramenta técnica.

#### Formulários e ações

- Não aplicável — CLI valida args (versionId, bookId, chapter, query, limit) e retorna EngineError codes.

#### Composição e disposição

- CLI single file `apps/conformance-cli/src/index.ts` com parser de args, instanciação de fakes/adapters e saída JSON. Sem composição React.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Não aplicável | — | — | — | — | — | — |

#### Estados e acessibilidade

- CLI estados: success (JSON), empty (array vazio), error (EngineError code), loading não se aplica (sync core). Acessibilidade não se aplica.

#### APIs expostas

- `createBibleEngine({library, registry, installer, packageSource?, clock})` → { listAvailableVersions(): Promise<BibleVersion[]>, listInstalledVersions(): Promise<InstalledBible[]>, installVersion(input: {versionId, bytes?, name?, token?}, observer?): Promise<void>, uninstallVersion(versionId): Promise<void>, getBooks(versionId): Promise<BibleBook[]>, getChapter(input: {versionId, bookId, chapter}): Promise<Verse[]>, searchVerses(input: {versionId, query, limit}): Promise<SearchResult>, parseReference(input: {query, books}): BibleReference|null } — erros por code; `token` é um `CancellationToken` portátil (não `AbortSignal`).

#### APIs externas utilizadas

- Nenhuma obrigatória no core/engine. `adapter-http` usa `fetch` injetável para `BiblePackageSource` com timeout e AbortSignal, retry opcional, fallback para fallback static list.

#### Documentação das APIs consultadas

- MDN fetch AbortSignal, SQLite file format header, Turborepo pipeline, Changesets.

#### Eventos e outros contratos

- InstallationProgress via observer `onProgress(progress)`; eventos de domínio futuros (BibleInstalled, BibleRemoved) como types, não como bus.

### 11. Estratégia TDD

- **Unidade**: parser, normalização, validação IDs, erros, book-meta, use-cases com fakes.
- **Integração/contrato**: BibleLibrary + InstalledBibleRegistry via fakes e adapters reais com fixture SQLite sintética (3 livros, 2 caps cada, lista, leitura, busca, ordenação, validação metadata/schema).
- **BDD/aceite**: Gherkin da seção 6 como referência para desenhar testes TDD; não criar .feature.
- **Runner TDD**: Vitest confirmado — `pnpm test` e `pnpm test:coverage` via turbo.
- **E2E**: Conformance CLI smoke que consome exports públicos.
- **Verificação manual**: Nenhuma além de inspeção de imports.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, AC-001 | AC-001 normalização e path traversal | packages/engine-core/src/__tests__/validation.test.ts com marcador SPECSFY: US-001 FR-001 NFR-001 AC-001 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-001, FR-002, NFR-002, AC-002 | AC-002 parser abreviação case-insensitive | packages/engine-core/src/__tests__/parser.test.ts SPECSFY: US-001 FR-002 NFR-002 AC-002 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-001, FR-005, NFR-005, AC-005 | AC-005 instalação atômica header válido | packages/engine/src/__tests__/install.test.ts SPECSFY: US-001 FR-005 NFR-005 AC-005 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-002, FR-008, NFR-001, AC-008 | AC-008 version_not_installed | packages/engine/src/__tests__/engine.test.ts SPECSFY: US-002 FR-008 NFR-001 AC-008 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-005, FR-002, NFR-007, AC-022 | AC-022 prefixo ambíguo rejeitado | packages/engine-core/src/__tests__/parser.test.ts SPECSFY: US-005 FR-002 NFR-007 AC-022 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-003, FR-004, NFR-007, AC-014 | AC-014 schema inválido sem parcial | packages/engine/src/__tests__/install.test.ts SPECSFY: US-003 FR-004 NFR-007 AC-014 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-004, FR-010, NFR-006, AC-020 | AC-020 core sem imports plataforma | tests/arch/core-imports.test.ts SPECSFY: US-004 FR-010 NFR-006 AC-020 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |
| US-005, FR-010, NFR-002, AC-030 | AC-030 conformance CLI | apps/conformance-cli/src/__tests__/conformance.test.ts SPECSFY: US-005 FR-010 NFR-002 AC-030 | 2026-08-26 vitest run | 2026-08-26 vitest run | refactor ok |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Unidade | packages/engine-core/src/__tests__/validation.test.ts | Passed |
| FR-001 | AC-011 | Unidade | packages/engine-core/src/__tests__/validation.test.ts | Passed |
| FR-001 | AC-021 | Unidade | packages/engine-core/src/__tests__/contracts.test.ts | Passed |
| FR-002 | AC-002 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-002 | AC-012 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-002 | AC-016 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-002 | AC-022 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-002 | AC-023 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-003 | AC-003 | Integração | packages/engine/src/__tests__/engine.test.ts | Passed |
| FR-003 | AC-013 | Integração | packages/engine/src/__tests__/engine.test.ts | Passed |
| FR-004 | AC-004 | Unidade | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-004 | AC-014 | Unidade | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-004 | AC-024 | Unidade | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-005 | AC-005 | Integração | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-005 | AC-015 | Integração | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-005 | AC-025 | Integração | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-006 | AC-006 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| FR-006 | AC-026 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| FR-007 | AC-007 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| FR-007 | AC-017 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| FR-007 | AC-027 | Unidade | packages/engine/src/__tests__/search.test.ts | Passed |
| FR-008 | AC-008 | Unidade | packages/engine/src/__tests__/engine.test.ts | Passed |
| FR-008 | AC-018 | Unidade | packages/engine-core/src/__tests__/parser.test.ts | Passed |
| FR-008 | AC-028 | Unidade | packages/engine/src/__tests__/install.test.ts | Passed |
| FR-009 | AC-009 | Unidade | packages/engine/src/__tests__/engine.test.ts | Passed |
| FR-009 | AC-019 | Arquitetural | tests/arch/exports.test.ts | Passed |
| FR-010 | AC-010 | Contrato | packages/adapter-sqlite-node/src/__tests__/adapter.test.ts + web | Passed |
| FR-010 | AC-030 | E2E | apps/conformance-cli/src/__tests__/conformance.test.ts | Passed |
| NFR-001 | AC-001 | Unidade | packages/engine-core/src/__tests__/validation.test.ts | Passed |
| NFR-001 | AC-029 | Integração | packages/engine/src/__tests__/engine.test.ts | Passed |
| NFR-002 | AC-002 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| NFR-002 | AC-030 | E2E | apps/conformance-cli/src/__tests__/conformance.test.ts | Passed |
| NFR-003 | AC-006 | Contrato | packages/engine-testing/src/contract-suite.test.ts | Passed |
| NFR-004 | AC-020 | Arquitetural | tests/arch/core-imports.test.ts | Passed |
| NFR-005 | AC-021 | Unidade | packages/engine-core/src/__tests__/contracts.test.ts | Passed |
| NFR-006 | AC-020 | Pipeline | pnpm turbo run build typecheck lint test | Passed |
| NFR-007 | AC-014 | Integração | packages/engine/src/__tests__/install.test.ts | Passed |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/draft/0001-openbible-engine-scripture-library/spec.md`
- **Achados**: Todos headings presentes, Formato Specsfy/2.0, Interface Não, cada US/FR/NFR com 3+ ACs, 30 ACs com Gherkin e Cobre.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/draft/0001-openbible-engine-scripture-library/spec.md`
- **Achados**: 30 TDD predecessors, cada ID com 3 TDD, CODE com 3 ancestors, checklist canônico, dependências resolvidas.

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0001-openbible-engine-scripture-library/spec.md .`
- **Achados**: Pending até TDD implementado.

### 14. Tarefas

Formato:
`- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Cada tarefa possui exatamente este checklist, atualizado durante a execução:

```markdown
  - [x] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [x] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [x] **VERIFY**: Executar a verificação focal adequada.
  - [x] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [x] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Vitest falhando em packages/engine-core/src/__tests__/validation.test.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T002 [TEST] [TDD] [US-001] Derivar do AC-002 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-001, FR-002, NFR-002, AC-002 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T003 [TEST] [TDD] [US-001] Derivar do AC-003 um caso Vitest falhando em packages/engine/src/__tests__/engine.test.ts — Refs: US-001, FR-003, NFR-003, AC-003 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T004 [TEST] [TDD] [US-001] Derivar do AC-004 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-001, FR-004, NFR-004, AC-004 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T005 [TEST] [TDD] [US-001] Derivar do AC-005 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-001, FR-005, NFR-005, AC-005 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T006 [TEST] [TDD] [US-001] Derivar do AC-006 um caso Vitest falhando em packages/engine-testing/src/contract-suite.test.ts — Refs: US-001, FR-006, NFR-006, AC-006 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T007 [TEST] [TDD] [US-002] Derivar do AC-007 um caso Vitest falhando em packages/engine-testing/src/contract-suite.test.ts — Refs: US-002, FR-007, NFR-007, AC-007 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T008 [TEST] [TDD] [US-002] Derivar do AC-008 um caso Vitest falhando em packages/engine/src/__tests__/engine.test.ts — Refs: US-002, FR-008, NFR-001, AC-008 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T009 [TEST] [TDD] [US-002] Derivar do AC-009 um caso Vitest falhando em packages/engine/src/__tests__/engine.test.ts — Refs: US-002, FR-009, NFR-002, AC-009 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T010 [TEST] [TDD] [US-002] Derivar do AC-010 um caso Vitest falhando em packages/engine-testing/src/contract-suite.test.ts — Refs: US-002, FR-010, NFR-003, AC-010 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T011 [TEST] [TDD] [US-002] Derivar do AC-011 um caso Vitest falhando em packages/engine-core/src/__tests__/validation.test.ts — Refs: US-002, FR-001, NFR-004, AC-011 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T012 [TEST] [TDD] [US-002] Derivar do AC-012 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-002, FR-002, NFR-005, AC-012 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T013 [TEST] [TDD] [US-003] Derivar do AC-013 um caso Vitest falhando em packages/engine/src/__tests__/engine.test.ts — Refs: US-003, FR-003, NFR-006, AC-013 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T014 [TEST] [TDD] [US-003] Derivar do AC-014 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-003, FR-004, NFR-007, AC-014 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T015 [TEST] [TDD] [US-003] Derivar do AC-015 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-003, FR-005, NFR-001, AC-015 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T016 [TEST] [TDD] [US-003] Derivar do AC-016 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-003, FR-006, NFR-002, AC-016 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T017 [TEST] [TDD] [US-003] Derivar do AC-017 um caso Vitest falhando em packages/engine-testing/src/contract-suite.test.ts — Refs: US-003, FR-007, NFR-003, AC-017 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T018 [TEST] [TDD] [US-003] Derivar do AC-018 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-003, FR-008, NFR-004, AC-018 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T019 [TEST] [TDD] [US-004] Derivar do AC-019 um caso Vitest falhando em tests/arch/exports.test.ts — Refs: US-004, FR-009, NFR-005, AC-019 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T020 [TEST] [TDD] [US-004] Derivar do AC-020 um caso Vitest falhando em tests/arch/core-imports.test.ts — Refs: US-004, FR-010, NFR-006, AC-020 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T021 [TEST] [TDD] [US-004] Derivar do AC-021 um caso Vitest falhando em packages/engine-core/src/__tests__/contracts.test.ts — Refs: US-004, FR-001, NFR-007, AC-021 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T022 [TEST] [TDD] [US-004] Derivar do AC-022 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-004, FR-002, NFR-001, AC-022 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T023 [TEST] [TDD] [US-004] Derivar do AC-023 um caso Vitest falhando em packages/engine-core/src/__tests__/parser.test.ts — Refs: US-004, FR-003, NFR-002, AC-023 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T024 [TEST] [TDD] [US-004] Derivar do AC-024 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-004, FR-004, NFR-003, AC-024 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T025 [TEST] [TDD] [US-005] Derivar do AC-025 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-005, FR-005, NFR-004, AC-025 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T026 [TEST] [TDD] [US-005] Derivar do AC-026 um caso Vitest falhando em packages/engine-testing/src/contract-suite.test.ts — Refs: US-005, FR-006, NFR-005, AC-026 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T027 [TEST] [TDD] [US-005] Derivar do AC-027 um caso Vitest falhando em packages/engine/src/__tests__/search.test.ts — Refs: US-005, FR-007, NFR-006, AC-027 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T028 [TEST] [TDD] [US-005] Derivar do AC-028 um caso Vitest falhando em packages/engine/src/__tests__/install.test.ts — Refs: US-005, FR-008, NFR-007, AC-028 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T029 [TEST] [TDD] [US-005] Derivar do AC-029 um caso Vitest falhando em packages/engine/src/__tests__/engine.test.ts — Refs: US-005, FR-009, NFR-001, AC-029 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

- [x] T030 [TEST] [TDD] [US-005] Derivar do AC-030 um caso Vitest falhando em apps/conformance-cli/src/__tests__/conformance.test.ts — Refs: US-005, FR-010, NFR-002, AC-030 — Depends: none
  - [x] **PREP**: Ler o Gherkin da spec e confirmar regra, IDs e nível de teste.
  - [x] **EXECUTE**: Escrever o caso TDD com marcador próprio `SPECSFY:`, sem criar ou executar `.feature`.
  - [x] **VERIFY**: Observar RED válido.
  - [x] **EVIDENCE**: Registrar comando e causa do RED.
  - [x] **IMPROVE**: Revisar a cobertura e registrar aprendizado.

#### Fase 2 — Implementação Core e Engine (depende de TDD)

- [x] T031 [CODE] [US-001] Implementar engine-core tipos, erros, validação e normalização em packages/engine-core/src/types.ts, errors.ts, validation.ts, normalize.ts — Refs: US-001, FR-001, FR-008, NFR-004, NFR-005, AC-001, AC-011, AC-021 — Depends: T001, T011, T021
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T031","refs":["US-001","FR-001","FR-008","NFR-004","NFR-005","AC-001","AC-011","AC-021"],"files":["packages/engine-core/src/types.ts","packages/engine-core/src/errors.ts","packages/engine-core/src/validation.ts","packages/engine-core/src/normalize.ts"],"commands":[{"run":"pnpm exec vitest run packages/engine-core/src/__tests__/validation.test.ts","exit":0},{"run":"pnpm exec vitest run packages/engine-core/src/__tests__/contracts.test.ts","exit":0}]} -->

- [x] T032 [CODE] [US-005] Implementar parser completo em packages/engine-core/src/parser.ts e book-meta.ts — Refs: US-005, FR-002, NFR-002, NFR-003, AC-002, AC-012, AC-016, AC-018, AC-022, AC-023 — Depends: T002, T012, T016, T018, T022, T023
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T032","refs":["US-005","FR-002","NFR-002","NFR-003","AC-002","AC-012","AC-016","AC-018","AC-022","AC-023"],"files":["packages/engine-core/src/parser.ts","packages/engine-core/src/book-meta.ts"],"commands":[{"run":"pnpm exec vitest run packages/engine-core/src/__tests__/parser.test.ts","exit":0}]} -->

- [x] T033 [CODE] [US-001] Implementar portas e casos de uso em packages/engine/src/ports.ts, engine.ts, use-cases/* — Refs: US-001, US-002, US-003, US-004, US-005, FR-003, FR-004, FR-005, FR-006, FR-007, FR-009, NFR-001, NFR-007, AC-003, AC-004, AC-005, AC-008, AC-009, AC-013, AC-014, AC-015, AC-024, AC-025, AC-028, AC-029 — Depends: T003, T004, T005, T008, T009, T013, T014, T015, T024, T025, T028, T029
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T033","refs":["US-001","US-002","US-003","US-004","US-005","FR-003","FR-004","FR-005","FR-006","FR-007","FR-009","NFR-001","NFR-007","AC-003","AC-004","AC-005","AC-008","AC-009","AC-013","AC-014","AC-015","AC-024","AC-025","AC-028","AC-029"],"files":["packages/engine/src/ports.ts","packages/engine/src/engine.ts"],"commands":[{"run":"pnpm exec vitest run packages/engine/src/__tests__/engine.test.ts","exit":0},{"run":"pnpm exec vitest run packages/engine/src/__tests__/install.test.ts","exit":0}]} -->

#### Fase 3 — Fakes, Fixtures e Adapters

- [x] T034 [CODE] [US-001] Implementar fakes, fixtures sintéticas e contract suite em packages/engine-testing/src/* — Refs: US-001, US-002, US-003, US-005, FR-006, FR-007, FR-010, NFR-002, NFR-003, NFR-006, AC-006, AC-007, AC-010, AC-017, AC-026 — Depends: T006, T007, T010, T017, T026
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T034","refs":["US-001","US-002","US-003","US-005","FR-006","FR-007","FR-010","NFR-002","NFR-003","NFR-006","AC-006","AC-007","AC-010","AC-017","AC-026"],"files":["packages/engine-testing/src/fakes.ts","packages/engine-testing/src/fixtures.ts","packages/engine-testing/src/contract-suite.ts","packages/engine-testing/src/builders.ts"],"commands":[{"run":"pnpm exec vitest run packages/engine-testing/src/contract-suite.test.ts","exit":0}]} -->

- [x] T035 [CODE] [US-002] Implementar adapter-sqlite-node compatível com o schema legado (driver injetável, int→canonical, ciclo de conexão, reconciliação best-effort) em packages/adapter-sqlite-node/src/driver.ts — Refs: US-002, FR-010, NFR-002, NFR-003, AC-010, AC-020, AC-030 — Depends: T010, T020, T030
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T035","refs":["US-002","FR-010","NFR-002","NFR-003","AC-010"],"files":["packages/adapter-sqlite-node/src/driver.ts","packages/adapter-sqlite-node/src/legacy-book-map.ts","packages/adapter-sqlite-node/src/bible-store.ts","packages/adapter-sqlite-node/src/registry.ts","packages/adapter-sqlite-node/src/fixtures.ts","packages/adapter-sqlite-node/src/index.ts"],"commands":[{"run":"pnpm exec vitest run packages/adapter-sqlite-node/src/__tests__/sqlite-node.test.ts","exit":0}]} -->

- [x] T036 [CODE] [US-002] Implementar adapter-sqlite-web mínimo testável em packages/adapter-sqlite-web/src/sqlite-web.ts — Refs: US-002, FR-010, NFR-002, NFR-003, AC-010, AC-020, AC-030 — Depends: T010, T020, T030
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T036","refs":["US-002","FR-010","NFR-002","NFR-003","AC-030"],"files":["packages/adapter-sqlite-web/src/sqlite-web.ts"],"commands":[{"run":"pnpm exec vitest run packages/adapter-sqlite-web/src/__tests__/sqlite-web-slice.test.ts","exit":0}]} -->

- [x] T037 [CODE] [US-001] Implementar adapter-http com progresso/cancel em packages/adapter-http/src/http-source.ts — Refs: US-001, FR-003, NFR-001, AC-003, AC-013, AC-023 — Depends: T003, T013, T023
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T037","refs":["US-001","FR-003","NFR-001","AC-003","AC-013"],"files":["packages/adapter-http/src/http-source.ts"],"commands":[{"run":"pnpm exec vitest run packages/adapter-http/src/__tests__/http.test.ts","exit":0}]} -->

#### Fase 4 — CLI e Qualidade

- [x] T038 [CODE] [US-005] Criar conformance-cli com comandos em apps/conformance-cli/src/index.ts — Refs: US-005, FR-010, NFR-002, NFR-006, AC-010, AC-020, AC-030 — Depends: T010, T020, T030
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Implementar a menor mudança.
  - [x] **VERIFY**: Executar testes focais e regressão.
  - [x] **EVIDENCE**: Registrar GREEN e arquivos alterados.
  - [x] **IMPROVE**: Aplicar melhoria de processo ou justificar nenhuma.
  <!-- specsfy:evidence {"task":"T038","refs":["US-005","FR-010","NFR-002","NFR-006","AC-030"],"files":["apps/conformance-cli/src/index.ts"],"commands":[{"run":"pnpm exec vitest run apps/conformance-cli/src/__tests__/conformance.test.ts","exit":0},{"run":"node apps/conformance-cli/dist/index.js check","exit":0}]} -->

- [x] T039 [TEST] [US-001] Testes arquiteturais e exports em tests/arch/* — Refs: US-001, US-004, FR-009, FR-010, NFR-004, NFR-006, AC-019, AC-020 — Depends: T019, T020, T031, T032, T033
  - [x] **PREP**: Confirmar RED TDD e dependências.
  - [x] **EXECUTE**: Escrever casos com marcador SPECSFY.
  - [x] **VERIFY**: Observar GREEN.
  - [x] **EVIDENCE**: Registrar comando e resultado.
  - [x] **IMPROVE**: Revisar cobertura.
  <!-- specsfy:evidence {"task":"T039","refs":["US-001","US-004","FR-009","FR-010","NFR-004","NFR-006","AC-019","AC-020"],"files":["tests/arch/exports.test.ts","tests/arch/core-imports.test.ts"],"commands":[{"run":"pnpm exec vitest run tests/arch","exit":0}]} -->

- [x] T040 [TEST] Executar regressão e rastreabilidade completa em tests/arch/regression.test.ts — Refs: US-001, US-002, US-003, US-004, US-005, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, NFR-007, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-026, AC-027, AC-028, AC-029, AC-030 — Depends: T031, T032, T033, T034, T035, T036, T037, T038, T039
  - [x] **PREP**: Identificar suites, checks e gates.
  - [x] **EXECUTE**: Executar regressão e rastreabilidade.
  - [x] **VERIFY**: Confirmar ausência de gaps.
  - [x] **EVIDENCE**: Registrar contagens e comandos finais.
  - [x] **IMPROVE**: Registrar retrospectiva do processo.
  <!-- specsfy:evidence {"task":"T040","refs":["US-001","US-002","US-003","US-004","US-005","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","FR-008","FR-009","FR-010","NFR-001","NFR-002","NFR-003","NFR-004","NFR-005","NFR-006","NFR-007","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","AC-017","AC-018","AC-019","AC-020","AC-021","AC-022","AC-023","AC-024","AC-025","AC-026","AC-027","AC-028","AC-029","AC-030"],"files":["package.json","turbo.json"],"commands":[{"run":"pnpm turbo run build test typecheck lint","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/draft/0001-openbible-engine-scripture-library/spec.md . --minimum-tests 3","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001-T030 (RED) → T031/T032 (core) → T033 (engine) → T034 (testing) → T035/T036/T037 (adapters) → T038 (CLI) → T039 (arch) → T040 (regressão).
- Tarefas paralelas: T001-T030 podem rodar em paralelo (RED); T035, T036, T037 em paralelo após T034.
- Estratégia de MVP: Entregar US-001→US-005 sequencialmente, mas T031-T033 já viabilizam todas as US; MVP mínimo é T031+T032+T033+T034+T038.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Node 22, pnpm 10+, Turborepo, Vitest, ESLint, TypeScript strict, Changesets; better-sqlite3 isolado no adapter-native; fetch injetável no http.
- Sem rede obrigatória para leitura/busca.

#### Riscos

- Parsing ambíguo entre abreviações (jo/jd/jn) → mitigação: exigir único candidato, rejeitar ambíguo com invalid_reference, teste golden cases.
- Header SQLite falso positivo → mitigação: validar `SQLite format 3\\0`, schema e sanity query.
- Native SDK TypeScript subset incompatível → mitigação: core conservador sync, sem Promise, ADR Zig/C fallback.
- Instalação interrompida corrompe biblioteca → mitigação: tmp + rename atômico + registry só após sucesso + cleanup.
- Fronteiras quebradas por import acidental → mitigação: ESLint no-cross-import + testes arquiteturais.

#### Suposições

- ARA será embarcada pelo consumidor, não distribuída pelo npm.
- TursoDB não entra no milestone 1.
- Legado open-bible será migrado incremental com rollback quando engine estabilizar.

### 17. Decisões

- **DEC-001**: TypeScript portátil em vez de Rust — razão: time domina TS, compilação futura Native SDK mais simples com Zig/C fallback, sem bridge Rust. Trade-off: perde safety de borrow checker, ganha velocidade de entrega.
- **DEC-002**: Arquitetura hexagonal com ports — razão: isolar core de SQLite/OPFS/fetch, adapters substituíveis. Alternativa camadas implicitas rejeitada por acoplamento.
- **DEC-003**: Adapters oficiais — razão: web/native/http como boundaries explícitos, contrato testado por suite única.
- **DEC-004**: SQLite local como fonte operacional — razão: formato observado metadata/book/verse, header validação, leitura read-only, offline-first.
- **DEC-005**: Operação offline-first — razão: leitura/busca nunca tocam rede; packageSource opcional.
- **DEC-006**: ARA embarcada pelo consumidor — razão: evitar distribuir conteúdo bíblico no npm, responsabilidade de empacotamento do app.
- **DEC-007**: Native SDK como consumidor substituível — razão: engine-core conservador, filesystem/rede/SQLite atrás de ports; se driver TS falhar, adapter Zig/C fino.
- **DEC-008**: TursoDB fora do primeiro milestone — razão: foco em biblioteca local; sync futuro sem acoplar core.
- **DEC-009**: Migração strangler futura — razão: open-bible será primeiro consumidor incremental com rollback, validando Web/TUI/Native SDK antes de 1.0.
- **DEC-010**: A engine não interpreta o formato de armazenamento — razão: header/schema/metadata/sanity pertencem ao `BibleInstaller` (adapter); a engine delega o ciclo transacional e permanece livre de SQLite e de codecs DOM. Trade-off: a atomicidade vira responsabilidade do adapter, compensada por invariantes verificáveis em teste.
- **DEC-011**: Port `BibleInstaller` substitui a coordenação frágil de `BibleLibrary`+registry — razão: atomicidade real exige um único escritor transacional com compensação; remove a descoberta dinâmica de `install`/`installPackage`/`save`/`uninstall`/`remove`/`delete`.
- **DEC-012**: Adapter nativo sobre SQLite real (`node:sqlite`) — razão: driver Node/Bun injetável sem addon nativo, com banco temporário real e fixture SQLite real gerada; a prova de persistência exige arquivo real.
- **DEC-013**: Web/OPFS como fatia planejada — razão: sem execução em navegador real não há adapter funcional; critérios de aceite = Worker + SQLite WASM + OPFS/SAHPool + testes de integração em navegador.
- **DEC-014**: Cancelamento e codecs portáteis — razão: `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder` são globals de DOM/navegador; `CancellationToken` (engine-core) e `BibleInstaller` permitem runtimes sem DOM, documentando os suportados.
- **DEC-015**: Adapter SQLite Node compatível com o schema legado — razão: os bancos reais do Open Bible usam `book.id INTEGER`, `verse.book_id INTEGER` e `metadata` com somente `name`; a engine lê via mapa 1..66 → canônico e aceita `versionId` opcional.
- **DEC-016**: Identidade da versão a partir do input/manifest — razão: `metadata.versionId` é opcional em bancos legados; se presente é validado, se ausente não rejeita; checksum de pacote fica como evolução futura.
- **DEC-017**: Ciclo de conexões com `closeVersion`/`close` — razão: fechar a conexão antes de substituir/remover o arquivo evita inode/lock antigo e garante que uma reinstalação leia o conteúdo novo.
- **DEC-018**: Garantia exception-safe + reconciliação best-effort — razão: a instalação/desinstalação é exceção-safe; na inicialização `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash` por heurística, trata `.db` sem registry como órfão (removido) e documenta `.db + .bak` como ambíguo sem journal. **Não** é crash-safe completa: isso fica como spec futura (journal por operação).
- **DEC-019**: Adapter renomeado para `@openbible/adapter-sqlite-node` e reserva de `-native` — razão: `node:fs`/`node:path`/`node:sqlite` não são compartilháveis com o Native SDK; o futuro `@openbible/adapter-sqlite-native` usará outra implementação da mesma port.
- **DEC-020**: Crash-safety completa como spec futura — razão: para crash-safe total seria necessário journal por operação (tipo, versionId, fase, snapshot do registry anterior), atualização antes de cada transição, reconciliação determinística de todas as fases e teste de interrupção após cada rename e após `registry.set`, além de distinguir process crash de power loss (fsync). Fora deste milestone; a garantia atual é *startup reconciliation best-effort*.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
- [x] `@openbible/engine` não interpreta formato SQLite e usa `CancellationToken` portátil (sem `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder`); verificado por teste arquitetural.
- [x] Instalação/remoção são transacionais via `BibleInstaller` com compensação verificável (sem parcial, preserva anterior, limpa temporários, registry/armazenamento não divergem).
- [x] Adapter nativo opera sobre arquivo SQLite real com banco temporário real e remoção ao final; fixture SQLite real gerada (não cabeçalho+JSON).
- [x] Conformance CLI opera sobre SQLite real e prova persistência após fechar e reabrir a engine.
- [x] Web/OPFS permanece fatia planejada (não funcional) com critérios de aceite definidos; `SqliteWebLibrary` não é apresentado como adapter concluído.
- [x] Rastreabilidade é satisfeita por testes comportamentais (marcadores `SPECSFY` reais), não por repetição de marcadores; `traceability-bulk.test.ts` removido.
- [x] `*.tsbuildinfo` ignorados e fora do Git; sem nomes `placeholder.test.ts`.
- [x] Fatia SQLite Node compatível com o schema legado: `book.id`/`verse.book_id` INTEGER, `metadata` com somente `name`, campos adicionais não quebram leitura; IDs 1..66 mapeados para canônicos.
- [x] Identidade da versão vem do input/manifest (`metadata.versionId` opcional, validado se presente); banco legado sem `versionId` não é rejeitado.
- [x] Ciclo de conexões corrigido (`closeVersion`/`close`, fechar antes de substituir/remover, `NodeAdapter.close()` fecha library e registry); reinstalação lê o conteúdo novo sem recriar processo.
- [x] Garantia **exception-safe** e **reconciliação best-effort na inicialização**: `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash`, trata `.db` sem registry como órfão (removido) e documenta `.db + .bak` como ambíguo sem journal; **crash-safety completa** com journal fica como **spec futura** (DEC-020).
- [x] `CancellationToken` consultado em todos os checkpoints da instalação; `SearchResult.total` = `COUNT(*)` antes do LIMIT com ordem canônica.
- [x] Adapter documentado como **Node.js** (`node:fs`/`node:path`/`node:sqlite`), sem afirmação de compatibilidade com Bun (não executada); `@openbible/adapter-sqlite-node` renomeado e `@openbible/adapter-sqlite-native` reservado.
- [x] Conformance CLI usa a fixture compatível com o schema legado e prova persistência após fechar/reabrir.
- [x] A engine **não** é declarada integralmente concluída; declara-se apenas a fatia "SQLite Node compatível com o schema legado".
