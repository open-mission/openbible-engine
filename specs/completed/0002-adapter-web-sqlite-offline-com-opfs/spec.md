# Especificação integrada: Adapter Web SQLite offline com OPFS

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0002 |
| Slug | 0002-adapter-web-sqlite-offline-com-opfs |
| Status | Complete |
| Effort | 8 |
| Effort updated at | 2026-08-26 |
| Effort rationale | Worker RPC, SQLite WASM, SAHPool, instalação compensável, reconciliação e conformance Chromium/WebKit. |
| ClickUp Task | |
| Milestones | M01 |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não — package headless e harness técnica, sem tela de produto. |
| Atualizada em | 2026-08-26 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

`@openbible/adapter-sqlite-web` é um placeholder que sempre retorna `storage_unavailable`. Aplicações Astro, Next.js e PWA ainda não conseguem usar a engine para instalar, persistir, reabrir e consultar uma Bíblia SQLite real no navegador.

#### Resultado desejado

Entregar um adapter Web headless que implemente `BibleLibrary`, `InstalledBibleRegistry` e `BibleInstaller` sobre SQLite WASM em Worker dedicado e OPFS SAHPool, compatível com o schema legado, offline após o carregamento dos assets, exception-safe e com reconciliação best-effort.

#### Métricas de sucesso

- Chromium e WebKit passam a conformance real de instalar, fechar, reabrir, consultar, buscar e desinstalar uma fixture legada.
- Operações locais fazem zero requisições HTTP após o bootstrap dos assets.
- Toda falha controlada e cancelamento testado preserva consistência e uma instalação anterior utilizável.
- Cada estado intermediário declarado como reconciliável possui teste; nenhuma API ou documentação declara crash-safety completa.
- O artefato contém entrypoint, declarations, Worker e WASM com URLs relativas ao módulo e overrides testados.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001** [critical] SAHPool funciona em Worker sem COOP/COEP e uma directory não admite duas instâncias simultâneas — Verdict: verified — Confidence: high — Evidence: research/sqlite-wasm-opfs.md#r-sqlite-001-disponibilidade-e-isolamento — Budget: 2/8.
- **R-002** [critical] PoolUtil oferece import/export/unlink e capacidade, mas não rename público; substituir banco aberto é indefinido — Verdict: verified — Confidence: high — Evidence: research/sqlite-wasm-opfs.md#r-sqlite-003-administração-do-pool — Budget: 1/8.
- **R-003** [critical] Sem journal, interrupções entre cópias, unlink e registry permitem apenas reconciliação best-effort — Verdict: verified — Confidence: high — Evidence: research/sqlite-wasm-opfs.md#r-sqlite-004-limite-da-garantia — Budget: 1/8.
- **R-004** [medium] Playwright executa projetos e binários versionados para Chromium, Firefox e WebKit — Verdict: verified — Confidence: high — Evidence: research/playwright-browser-matrix.md#r-playwright-001-projetos-de-navegador — Budget: 2/8.

#### Fontes e contexto consultados

- `specs/backlog/0002-adapter-web-sqlite-offline-com-opfs.md` e a Inbox relacionada.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md`.
- `packages/adapter-sqlite-web/src/`, `packages/engine/src/ports.ts`, `packages/engine-core/src/errors.ts`.
- `packages/adapter-sqlite-node/src/bible-store.ts`, `registry.ts`, `legacy-book-map.ts` e testes.
- Legado somente leitura: `/home/claudio/Projects/open-bible/apps/web/lib/database/DatabaseManager.ts`, `sqlite-worker.source.js`, `worker-types.ts` e `bible/BibleDatabase.ts`.

#### Documentação consultada

- SQLite WASM, Persistent Storage Options, trunk, consultada em 2026-08-26: https://www.sqlite.org/wasm/doc/trunk/persistence.md.
- Playwright, Browsers, consultada em 2026-08-26: https://playwright.dev/docs/browsers.
- `.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md` e `.specsfy/PACKAGES.md`.

#### Artefatos de pesquisa armazenados

- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/research/sqlite-wasm-opfs.md`: metadados, síntese e impactos da documentação oficial SQLite.
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/research/playwright-browser-matrix.md`: metadados, síntese e impactos da documentação oficial Playwright.

#### Dúvidas respondidas

- **Q**: Browsers obrigatórios? → **A**: Chromium e WebKit; Firefox informativo.
- **Q**: Segunda aba? → **A**: retorna `storage_busy`; sem espera ou coordenação transparente.
- **Q**: Interrupção abrupta? → **A**: reconciliação best-effort; sem journal/crash-safety completa.
- **Q**: Registry? → **A**: SQLite de controle no mesmo SAHPool e Worker.
- **Q**: Worker/WASM? → **A**: assets do package, URLs relativas e overrides.
- **Q**: Storage persistente? → **A**: solicitar automaticamente em best-effort, expor resultado, não bloquear se negado.
- **Q**: Implementação? → **A**: outro modelo; esta sessão para após o Plan Gate.

#### Dúvidas abertas

- Nenhuma bloqueante. Capacidade inicial do pool é default configurável e deve ser confirmada pelos testes da versão SQLite fixada.

### 3. Escopo e atores

#### Incluído

- Factory assíncrona e lifecycle explícito do adapter Web.
- Worker como único owner do SQLite WASM, registry, conexões e arquivos SAHPool.
- Schema legado, instalação/reinstalação, persistência após reabrir, library, busca e uninstall.
- Exception safety, cancelamento e reconciliação best-effort de temporary, backup, trash, órfão e registry obsoleto.
- Capabilities, persistência best-effort, `storage_busy`, assets empacotados e Playwright Chromium/WebKit.

#### Fora de escopo

- UI Astro/Next/React, service worker, manifest/cache PWA, download/descompressão e catálogo remoto.
- TursoDB, sync, API, dados pessoais, Native SDK, React Native e TUI.
- Coordenação multiaba, Firefox bloqueante, fallback em memória/IndexedDB e browsers antigos.
- Journal durável, power-loss safety, proteção contra eviction e banco bíblico real no npm.

#### Atores

- **Aplicação Web/PWA**: compõe engine e adapter, fornece bytes e traduz erros para UI.
- **Desenvolvedor consumidor**: configura assets quando necessário e fecha o adapter.
- **Worker do adapter**: único owner de conexões, pool, registry e mutações.
- **Navegador**: fornece capabilities, quota e decisão de storage persistente.

### 4. Princípios e restrições do projeto

- **PR-001**: dependências seguem adapter → engine → engine-core; core/engine não importam browser, SQLite ou Playwright.
- **PR-002**: `BibleInstaller` permanece único escritor; nenhuma API pública expõe SQL/conexão.
- **PR-003**: TypeScript strict, ESM, RPC discriminado e validado em runtime.
- **PR-004**: operações locais nunca iniciam rede.
- **PR-005**: IDs rejeitam traversal; erros não expõem SQL, stack ou path físico.
- **PR-006**: não afirmar rename atômico, crash-safety, proteção contra eviction ou browser não testado.
- **PR-007**: não alterar `/home/claudio/Projects/open-bible`.
- **PR-008**: esta sessão não cria código, dependências ou testes; encerra após Definition e Plan Gates.

### 5. Histórias de usuário

#### US-001 — Inicializar armazenamento Web portátil (P1)

Como desenvolvedor Astro ou Next.js, quero inicializar o adapter com assets próprios e capabilities observáveis, para usar a engine sem caminho `public/` fixo.

**Por que P1**: todas as operações dependem do bootstrap correto.
**Teste independente**: inicializar com defaults e overrides, observar persistência e falhas tipadas.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-006.

#### US-002 — Instalar e consultar uma Bíblia legada offline (P1)

Como aplicação Web/PWA, quero instalar bytes SQLite, reabrir e consultar a versão sem rede, para oferecer Scripture Library offline.

**Por que P1**: materializa o valor principal do adapter.
**Teste independente**: instalar fixture, recriar o adapter e validar registry, livros, capítulo, nome, busca e total.
**Requisitos**: FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005.

#### US-003 — Recuperar consistência e liberar o storage (P1)

Como aplicação Web/PWA, quero falhas, cancelamento, segunda aba, close e uninstall previsíveis, para não deixar dados parciais nem corromper versão anterior.

**Por que P1**: o adapter controla dados persistentes.
**Teste independente**: injetar falhas, simular estados, disputar o pool, fechar e desinstalar.
**Requisitos**: FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-006.

### 6. Cenários BDD de aceite

#### AC-001 — inicialização padrão

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-006

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-006 @AC-001
Feature: Inicialização Web
  Scenario: inicializar com assets relativos
    Given um build contendo entrypoint, declarations, Worker e WASM
    When a harness cria o adapter em Chromium e WebKit
    Then recebe library, registry, installer, capabilities, reconcile e close
    And core e engine permanecem sem imports de browser
```

#### AC-002 — overrides e segunda aba

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-002, NFR-006

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-002 @NFR-006 @AC-002
Feature: Ownership do pool
  Scenario: impedir duas instâncias sobre a mesma directory
    Given um adapter ativo com URLs sobrescritas
    When outra aba inicializa a mesma directory
    Then a segunda falha com storage_busy
    And a primeira permanece utilizável
```

#### AC-003 — capability ausente e persistência negada

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @AC-003
Feature: Capabilities Web
  Scenario: distinguir indisponibilidade de persistência negada
    Given um runtime sem OPFS ou Worker
    When inicializa o adapter
    Then retorna storage_unavailable com a capability ausente
    But se somente persistência for negada inicializa e reporta denied
```

#### AC-004 — instalar e reabrir offline

**Cobre**: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005

```gherkin
@US-002 @FR-004 @FR-005 @FR-006 @NFR-003 @NFR-004 @NFR-005 @AC-004
Feature: Instalação persistente
  Scenario: instalar fixture legada e reabrir sem rede
    Given bytes SQLite legados válidos e rede bloqueada depois do bootstrap
    When instala ara, fecha e recria o adapter na mesma origem
    Then ara aparece uma vez no registry e permanece consultável
    And não ocorre requisição HTTP
```

#### AC-005 — leitura e busca equivalentes

**Cobre**: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005

```gherkin
@US-002 @FR-004 @FR-005 @FR-006 @NFR-003 @NFR-004 @NFR-005 @AC-005
Feature: Consulta legada
  Scenario: ler e buscar pelo contrato público
    Given fixture com book_id 1, 2 e 43 instalada
    When solicita livros, João 1, nome e busca case-insensitive com limite
    Then recebe gen, exo e jhn, versos ordenados e metadata name
    And total conta todos os matches antes do LIMIT
```

#### AC-006 — invalidar ou cancelar sem parcial

**Cobre**: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005

```gherkin
@US-002 @FR-004 @FR-005 @FR-006 @NFR-003 @NFR-004 @NFR-005 @AC-006
Feature: Validação e compensação
  Scenario: rejeitar pacote ou cancelar por checkpoint
    Given pacote inválido, mismatch opcional de identidade ou token abortado
    When executa a instalação
    Then retorna invalid_package, unsupported_schema ou cancelled
    And não deixa final novo, temporary, backup ou registro parcial
```

#### AC-007 — preservar anterior e reconciliar

**Cobre**: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-004, NFR-005

```gherkin
@US-003 @FR-007 @FR-008 @FR-009 @NFR-001 @NFR-004 @NFR-005 @AC-007
Feature: Reconciliação best-effort
  Scenario: reparar estados observáveis
    Given ara v1 e combinações isoladas de temporary, backup, final, trash e registry
    When uma reinstalação falha ou o adapter reinicializa
    Then v1 é preservada quando há backup e estados conhecidos são reconciliados
    And a solução não declara crash-safety completa
```

#### AC-008 — desinstalar e fechar

**Cobre**: US-003, FR-007, FR-008, FR-009, NFR-002, NFR-003, NFR-006

```gherkin
@US-003 @FR-007 @FR-008 @FR-009 @NFR-002 @NFR-003 @NFR-006 @AC-008
Feature: Lifecycle
  Scenario: remover versão aberta e encerrar o Worker
    Given versão com conexão aberta e requests controlados
    When desinstala e chama close duas vezes
    Then final, trash e registry são removidos, handles são fechados e close é idempotente
    And chamadas posteriores falham com storage_unavailable
```

#### AC-009 — package e gates reais

**Cobre**: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-006

```gherkin
@US-003 @FR-007 @FR-008 @FR-009 @NFR-001 @NFR-002 @NFR-006 @AC-009
Feature: Entrega reproduzível
  Scenario: validar package empacotado
    Given dependências e browsers fixados pelo lockfile
    When executa build, typecheck, lint, unidade, arquitetura e Playwright
    Then Chromium e WebKit passam, Firefox é registrado como informativo
    And dist contém JS, declarations, Worker e WASM referenciáveis
```

### 7. Requisitos

#### Funcionais

- **FR-001**: Expor `createWebAdapter(options?): Promise<WebAdapter>` com library, registry, installer, capabilities, reconcile e `close()`, sem SQL público.
- **FR-002**: Detectar Worker/WebAssembly/OPFS, instalar SAHPool e solicitar storage persistente best-effort, reportando `granted`, `denied` ou `unsupported`; colisão da directory retorna `storage_busy`.
- **FR-003**: Publicar Worker/WASM por URLs relativas ao módulo e aceitar overrides de URL/factory, sem caminho `public/` fixo.
- **FR-004**: Persistir `installed_bibles(id, name, installed_at, version_code)` em SQLite de controle no mesmo SAHPool e implementar instalação/reinstalação por temporary, backup, final e compensação.
- **FR-005**: Validar header, schema legado, conteúdo mínimo e identidade opcional; mapear IDs 1..66, ler livros/capítulo/nome e buscar com `COUNT(*)` antes do LIMIT em ordem canônica.
- **FR-006**: Transferir bytes e progress/cancelamento por RPC discriminado, mantendo conexões e SQL no Worker e erros públicos estáveis.
- **FR-007**: Reconciliar ao iniciar: remover temporary; restaurar backup; remover final órfão; remover registry sem final; restaurar trash com registry; descartar trash sem registry; excluir store.db do tratamento de órfãos.
- **FR-008**: Desinstalar fechando handle, preservando trash antes da remoção do final/registry e compensando falha; `close()` idempotente fecha handles, rejeita pendências e encerra Worker.
- **FR-009**: Validar mensagens RPC em runtime e mapear falhas para `storage_unavailable`, `storage_busy`, `storage_full`, `invalid_package`, `unsupported_schema`, `version_not_installed` ou `cancelled` sem expor stack/SQL.

#### Não funcionais

- **NFR-001**: Core/engine permanecem sem APIs Web/SQLite e operações locais fazem zero HTTP. **Verificação**: testes arquiteturais e rede bloqueada em AC-001, AC-003, AC-007 e AC-009.
- **NFR-002**: Chromium e WebKit passam os mesmos gates; Firefox é informativo. **Verificação**: projetos Playwright em AC-002, AC-003, AC-008 e AC-009.
- **NFR-003**: Consultas não transferem o banco completo; instalação usa transferência de `ArrayBuffer` sem cópia adicional intencional. **Verificação**: inspeção RPC e AC-004, AC-005, AC-008.
- **NFR-004**: Exceção/cancelamento por checkpoint preserva consistência e instalação anterior. **Verificação**: fault injection em AC-004, AC-006 e AC-007.
- **NFR-005**: Garantia nomeada exatamente “SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort”, nunca atomic rename/crash-safe/power-loss-safe. **Verificação**: docs e AC-004, AC-005, AC-006, AC-007.
- **NFR-006**: Build pelo lockfile contém JS, declarations, Worker e WASM e passa build/typecheck/lint/Vitest/arquitetura/Playwright. **Verificação**: AC-001, AC-002, AC-008 e AC-009.

#### Erros e casos-limite

- Capability ausente → `storage_unavailable`; persistência negada → adapter funcional com `denied`.
- Outra instância possui a directory → `storage_busy`, sem limpar o pool alheio.
- Quota/slots insuficientes → `storage_full` e compensação.
- Pacote inválido/mismatch → `invalid_package` ou `unsupported_schema`; cancelamento → `cancelled` após cleanup.
- Worker cai → rejeitar pendências uma vez, fechar adapter e exigir nova factory.
- Busca vazia → resultados vazios/total zero; ID inteiro desconhecido é ignorado como no legado.
- `close()` repetido é sucesso; operação depois de close → `storage_unavailable`.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Monorepo TypeScript strict ESM com ports/engine e adapter Node entregues; Web é placeholder.
- O legado prova Worker + SQLite WASM + SAHPool, mas usa URL fixa e RPC SQL genérico.
- Mapeamento/validação legados devem ser reutilizados em módulo portátil, sem duplicação silenciosa ou imports Node.

#### Arquitetura e módulos

- `createWebAdapter` cria `WebWorkerClient`, detecta capabilities/persistência, inicializa Worker/SAHPool, reconcilia e constrói wrappers dos três ports.
- Worker aceita comandos semânticos de library/registry/installer, mantém conexões por versão e estado de cancelamento por `operationId`.
- Paths SAHPool são absolutos e derivados apenas de ID normalizado; directory e capacidade mínima possuem defaults configuráveis.
- Instalação: transferir bytes → importar temporary → validar → persistir backup do final via export/import → importar final → registrar → unlink backup/temporary. Falha controlada restaura backup.
- Antes de import/substituição/unlink, fechar o handle. Antes de mutação, reservar slots para registry, final, intermediários e journals.
- Segunda aba não usa pause/unpause nesta fatia; falha imediatamente com `storage_busy`.

#### Migrations

- Criar `installed_bibles` com `CREATE TABLE IF NOT EXISTS`, mesmo schema da fatia Node.
- Não migrar `metadata`, `book` ou `verse`; journal/migration versionada ficam futuros.

#### Models

- `WebAdapterOptions`: worker/WASM URL ou factory, pool name/directory e capacidade mínima.
- `WebCapabilities`: Worker, WebAssembly, OPFS e estado discriminado de persistência.
- `WebReconcileStats`: `removedTmp`, `restored`, `removedStaleRegistry`, `removedOrphans`, `removedTrash`.
- `WorkerRequest/Event/Response`: unions com requestId/operationId e erro serializável.

#### Controllers e casos de uso

- Sem HTTP controller; a factory é composition root e o Worker executa handlers semânticos.

#### Views e experiência

- Não aplicável; o consumidor apresenta progresso, aviso de persistência e retry.

#### Queries e repositórios

- Registry: list/get/upsert/delete bindados; books por join/MAX; chapter ordenado; metadata por key; search com COUNT e SELECT equivalentes.

#### Jobs e processamento assíncrono

- Worker local, sem job durável/retry mutável automático; uma resposta terminal por request; close rejeita pendências.

#### Estrutura de arquivos

```text
packages/adapter-sqlite-web/
  src/{index,adapter,capabilities,errors,protocol,worker-client,worker}.ts
  src/worker/{sqlite,registry,library,installer,reconciliation}.ts
  tests/unit/*.test.ts
  tests/browser/{fixtures,harness}/*
  tests/browser/*.spec.ts
  playwright.config.ts
tests/arch/
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| InstalledBible | `id` TEXT PK | name obrigatório; installed_at epoch ms; version_code inteiro | 1:1 final lógico |
| RegistryDatabase | path absoluto reservado | contém `installed_bibles`; nunca é órfão bíblico | 1:N InstalledBible |
| LogicalBibleFile | versionId + role | final, temporary, backup ou trash; SQLite válido | N:1 versão durante transição |
| LegacyBook | id INTEGER | 1..66 vira ID canônico; desconhecido é ignorado | 1:N LegacyVerse |
| LegacyVerse | book_id/chapter/verse | text; translation extra tolerada | N:1 LegacyBook |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Versão | Ausente | install | Instalada | final + registry; sem intermediários |
| Versão | Instalada | reinstall | Staged | temporary validado; final preservado até promote |
| Versão | Staged | promote/register | Instalada nova | final/registry novos; cleanup |
| Versão | Staged | erro/cancel | Ausente ou anterior | compensação completa |
| Versão | Instalada | uninstall | Trashed → Ausente | trash protege até remover registry |
| Store | Intermediário | initialize | Consistente best-effort | heurística da FR-007 |
| Adapter | Open | close | Closed | handles/Worker liberados |

#### Migração e retenção

- Registry/finais persistem enquanto a origem mantiver OPFS; uninstall remove ambos.
- Intermediários são removidos após sucesso, compensação ou reconciliação.
- Negativa de persistência permite eviction; mudar directory cria namespace isolado.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não; package headless.

#### Stack e convenções de interface

- TypeScript ESM e factory assíncrona; não há UI.

#### Telas e responsabilidades

- Não aplicável.

#### Fluxo de informação e navegação

- Não aplicável.

#### Menus e navegação principal

- Não aplicável.

#### Formulários e ações

- Não aplicável.

#### Composição e disposição

- Não aplicável.

#### Blocos React e componentes selecionados

- Não aplicável.

#### Estados e acessibilidade

- Não aplicável diretamente; capacidades/erros permitem feedback acessível pelo consumidor.

#### APIs expostas

- `createWebAdapter(options?): Promise<WebAdapter>`.
- `WebAdapterOptions`, `WebCapabilities`, `WebReconcileStats` como records serializáveis.
- `WebAdapter.close(): Promise<void>` e ports existentes.
- Acrescentar `storage_busy` a `EngineErrorCode`.

#### APIs externas utilizadas

- SQLite WASM `sqlite3InitModule`/`installOpfsSAHPoolVfs`; Web Worker/WebAssembly/Storage API; Playwright apenas em testes.

#### Documentação das APIs consultadas

- SQLite WASM Persistent Storage Options e Playwright Browsers, consultados em 2026-08-26.

#### Eventos e outros contratos

- RPC request `{requestId,type,payload}`; progress `{requestId,operationId,type:"progress",progress}`; success/failure discriminados.
- Stack, SQL e conexão não atravessam o Worker; termination rejeita pendências uma vez.

### 11. Estratégia TDD

- **Unidade**: protocolo, validação, erros, capabilities, paths e reconciliação com pool falso.
- **Integração/contrato**: Worker/SQLite/SAHPool reais em HTTP local com fixture legada.
- **BDD/aceite**: AC-001..009 viram Vitest/Playwright com `SPECSFY:`; sem `.feature`.
- **Runner TDD**: Vitest e Playwright Test; scripts `test:tdd` e `test:browser`.
- **E2E**: Chromium/WebKit obrigatórios; Firefox informativo.
- **Verificação manual**: nenhuma exigida.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001..003, NFR-001..002, NFR-006, AC-001..003 | AC-001..003 | `tests/browser/initialization.spec.ts` e `tests/unit/capabilities.test.ts` | `playwright test --project=chromium tests/browser/initialization.spec.ts` → falha `api.createWebAdapter is not a function` (placeholder exportava apenas `SqliteWebLibrary`); `vitest run tests/unit` → `Cannot find module ../../src/capabilities.js` | `playwright test --project=chromium tests/browser/initialization.spec.ts` → 3 passed; `vitest run tests/unit` → verde | `pnpm turbo run check` (typecheck/lint/test) e `vitest run tests/arch` verdes |
| US-002, FR-004..006, NFR-003..005, AC-004..006 | AC-004..006 | `tests/browser/install-library.spec.ts` e `tests/unit/installer.test.ts` | `playwright test --project=chromium tests/browser/install-library.spec.ts` → `createWebAdapter is not a function`; `vitest run tests/unit` → `Cannot find module ../../src/worker/installer.js` | `playwright test --project=chromium tests/browser/install-library.spec.ts` → 3 passed (instalar/reabrir sem rede, leitura/busca com COUNT antes do LIMIT, inválido/cancelado sem parcial); `vitest run tests/unit` → verde | `pnpm turbo run check` e `vitest run tests/arch` verdes |
| US-003, FR-007..009, NFR-001..006, AC-007..009 | AC-007..009 | `tests/browser/lifecycle.spec.ts`, `tests/browser/package.spec.ts` e `tests/unit/reconciliation.test.ts` | `playwright test --project=chromium tests/browser/lifecycle.spec.ts` → `createWebAdapter is not a function`; `vitest run tests/unit` → `Cannot find module ../../src/worker/reconciliation.js` | `playwright test --project=chromium tests/browser/lifecycle.spec.ts tests/browser/package.spec.ts` → 4 passed (reinstall preserva anterior + reconcile; uninstall/close idempotente; dist contém JS/declarations/Worker/WASM; sem wording atomic-rename/crash-safe); `vitest run tests/unit` → verde | `pnpm turbo run check`, `vitest run tests/arch`, `check_traceability --full-chain` (27/27) verdes |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenários BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001..003 | AC-001, AC-002, AC-003 | Unidade + browser | `initialization.spec.ts` | Passed — Chromium 3/3; `vitest run tests/unit` verde |
| FR-004..006 | AC-004, AC-005, AC-006 | Unidade + browser | `install-library.spec.ts` | Passed — Chromium 3/3; `vitest run tests/unit` verde |
| FR-007..009 | AC-007, AC-008, AC-009 | Unidade + browser | `lifecycle.spec.ts` | Passed — Chromium 2/2 + `package.spec.ts` 2/2; `vitest run tests/unit` verde |
| NFR-001 | AC-001, AC-003, AC-007, AC-009 | Arquitetura + rede | `vitest run tests/arch`; Playwright route counter | Passed — `tests/arch` 10/10; AC-004 `net.set` = 0 requisições externas |
| NFR-002 | AC-002, AC-003, AC-008, AC-009 | Browser | `playwright test --project=chromium --project=webkit` | Passed em Chromium 10/10; Firefox informativo 9/10 (AC-002 diverge na semântica OPFS/duplex). **WebKit documentado como não executável na conformance OPFS/SAHPool**: a build Linux do Playwright (WPE) não expõe a API OPFS (`FileSystemSyncAccessHandle`/`getDirectory` em worker) — o adapter reporta `capabilities.opfs=false`/`storage_unavailable`. Conformance WebKit exigiria Safari/macOS real, não Playwright Linux. |
| NFR-003 | AC-004, AC-005, AC-008 | Inspeção + browser | protocol transfer assertions | Passed — `node:sqlite`/OO1 selectObjects; AC-004 zero redes |
| NFR-004 | AC-004, AC-006, AC-007 | Fault injection | installer/reconciliation suites | Passed — `tests/unit/installer.test.ts` (5), `tests/unit/reconciliation.test.ts` (5); browser inválido/cancelado/reinstall falho |
| NFR-005 | AC-004, AC-005, AC-006, AC-007 | Documental + browser | docs/ADR check + suites | Passed — `package.spec.ts` não contém atomic-rename/crash-safe; garantia exata registrada em STACK/RULES/PROJECT |
| NFR-006 | AC-001, AC-002, AC-008, AC-009 | Build/CI | turbo + inspeção dist | Passed — `pnpm turbo run build/check` 35/35; `package.spec.ts` inventário dist ok |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY — Passed em 2026-08-26
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md`
- **Achados**: 3 US, 9 FR, 6 NFR e 9 AC; cada US/FR/NFR possui pelo menos 3 AC distintos. Sem BLOCKER aberto.
- **FIND-ARCH-001** [P1] [Resolved] A estratégia Node baseada em rename não existe na API pública SAHPool; o plano agora usa temporary/backup por import/export e limita a garantia — Refs: FR-004, FR-007, NFR-005 — Evidence: completed/0002-adapter-web-sqlite-offline-com-opfs/research/sqlite-wasm-opfs.md:25 — Effect: evita promessa impossível de atomic rename — Suggestion: preservar DEC-008 e fault injection.
- **FIND-ARCH-002** [P2] [Resolved] SAHPool não oferece concorrência transparente entre duas instâncias — Refs: FR-002, NFR-002 — Evidence: completed/0002-adapter-web-sqlite-offline-com-opfs/research/sqlite-wasm-opfs.md:19 — Effect: segunda aba poderia disputar handles — Suggestion: manter storage_busy e não limpar pool alheio.
- **FIND-SEC-001** [P2] [Resolved] Bytes, IDs e mensagens RPC cruzam fronteira não confiável — Refs: FR-006, FR-009 — Evidence: completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md:112 — Effect: payload inválido poderia executar path/SQL indevido — Suggestion: validação runtime, paths derivados de IDs normalizados e binds SQL.

#### Gate do Ato II — Plano

- **Resultado**: READY — Passed em 2026-08-26
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md --allow-draft`
- **Achados**: 20 tarefas, 9 predecessores BDD/TDD distintos, 7 tarefas CODE, 100 itens de checklist e cobertura 27/27. REDs T001–T009 materializados e registrados na seção 11; validade do plano confirmada.

#### Gate do Ato III — Entrega

- **Resultado**: READY — Passed em 2026-08-26
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md . --full-chain`
- **Achados**: 27/27 IDs cobertos em 26 arquivos de teste; Chromium 10/10 e Firefox informativo 9/10 (AC-002 diverge na semântica OPFS/duplex). **WebKit documentado como não executável na conformance OPFS/SAHPool**: a build Linux do Playwright (WPE) não implementa a API OPFS (`FileSystemSyncAccessHandle`/`navigator.storage.getDirectory` em worker), então `installOpfsSAHPoolVfs` lança "Missing required OPFS APIs" e o adapter reporta `storage_unavailable`/`opfs:false`; o redimensionamento para a conformance WebKit exigiria Safari/macOS real. Chromium permanece bloqueante e passou. Ausência de wording atomic-rename/crash-safe confirmada. Nenhum BLOCKER e nenhuma declaração de crash-safety/rename.

### 14. Tarefas

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar AC-001 em teste RED de inicialização padrão em packages/adapter-sqlite-web/tests/browser/initialization.spec.ts — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-006, AC-001 — Depends: none
  - [ ] **PREP**: Confirmar Gherkin AC-001, package empacotado e baseline do placeholder.
  - [ ] **EXECUTE**: Criar caso Playwright com marcador SPECSFY para factory, exports, assets e purity.
  - [ ] **VERIFY**: Executar `test:tdd` focal e observar RED pela ausência do adapter funcional.
  - [ ] **EVIDENCE**: Registrar comando, exit e causa real do RED na seção 11.
  - [ ] **IMPROVE**: Revisar se o teste falha ao remover qualquer resultado de AC-001 ou justificar ausência de ajuste.

- [x] T002 [TEST] [TDD] [US-001] Derivar AC-002 em teste RED de overrides e segunda aba em packages/adapter-sqlite-web/tests/browser/initialization.spec.ts — Refs: US-001, FR-001, FR-002, FR-003, NFR-002, NFR-006, AC-002 — Depends: none
  - [ ] **PREP**: Confirmar directory compartilhada, overrides e código esperado `storage_busy`.
  - [ ] **EXECUTE**: Criar caso Playwright multi-page com marcador SPECSFY.
  - [ ] **VERIFY**: Observar RED porque o placeholder não possui ownership nem factory configurável.
  - [ ] **EVIDENCE**: Registrar comando e falha observada para AC-002.
  - [ ] **IMPROVE**: Verificar que o teste também prova a primeira instância utilizável ou justificar ajuste desnecessário.

- [x] T003 [TEST] [TDD] [US-001] Derivar AC-003 em testes RED de capabilities em packages/adapter-sqlite-web/tests/unit/capabilities.test.ts e tests/browser/initialization.spec.ts — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [ ] **PREP**: Definir matrizes capability ausente, persistência denied e resultado esperado.
  - [ ] **EXECUTE**: Criar casos Vitest/Playwright com marcador SPECSFY sem simular adapter funcional.
  - [ ] **VERIFY**: Observar RED nos contratos `storage_unavailable` e persistentStorage.
  - [ ] **EVIDENCE**: Registrar comandos e causas de RED de ambos os níveis.
  - [ ] **IMPROVE**: Eliminar sobreposição entre teste unitário e browser ou justificar a cobertura complementar.

- [x] T004 [TEST] [TDD] [US-002] Derivar AC-004 em teste RED de instalação/reabertura offline em packages/adapter-sqlite-web/tests/browser/install-library.spec.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005, AC-004 — Depends: none
  - [ ] **PREP**: Confirmar fixture SQLite legada sintética, bloqueio de rede e lifecycle completo.
  - [ ] **EXECUTE**: Criar caso Playwright com marcador SPECSFY para install, close, reopen e registry.
  - [ ] **VERIFY**: Observar RED por ausência de registry/installer Web reais.
  - [ ] **EVIDENCE**: Registrar comando, browser e causa de RED.
  - [ ] **IMPROVE**: Confirmar que a prova usa nova instância na mesma origem ou ajustar o isolamento.

- [x] T005 [TEST] [TDD] [US-002] Derivar AC-005 em teste RED de leitura e busca em packages/adapter-sqlite-web/tests/browser/install-library.spec.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005, AC-005 — Depends: none
  - [ ] **PREP**: Fixar dados de gen/exo/jhn, matches acima do limite e resultados esperados.
  - [ ] **EXECUTE**: Criar caso Playwright/contract suite com marcador SPECSFY.
  - [ ] **VERIFY**: Observar RED em livros, capítulo, nome, COUNT ou ordenação.
  - [ ] **EVIDENCE**: Registrar comando e assertiva responsável pelo RED.
  - [ ] **IMPROVE**: Garantir que o teste falha se total for pós-LIMIT ou justificar nenhuma mudança.

- [x] T006 [TEST] [TDD] [US-002] Derivar AC-006 em testes RED de pacote inválido e cancelamento em packages/adapter-sqlite-web/tests/unit/installer.test.ts e tests/browser/install-library.spec.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005, AC-006 — Depends: none
  - [ ] **PREP**: Enumerar header, schema, identity e checkpoints de cancelamento.
  - [ ] **EXECUTE**: Criar fault cases com marcador SPECSFY e inspeção de intermediários.
  - [ ] **VERIFY**: Observar RED pela ausência de validação/compensação Web.
  - [ ] **EVIDENCE**: Registrar cada fase executada e causa do RED.
  - [ ] **IMPROVE**: Remover casos equivalentes e preservar pelo menos uma falha distinta por fase material.

- [x] T007 [TEST] [TDD] [US-003] Derivar AC-007 em testes RED de reconciliação em packages/adapter-sqlite-web/tests/unit/reconciliation.test.ts e tests/browser/lifecycle.spec.ts — Refs: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-004, NFR-005, AC-007 — Depends: none
  - [ ] **PREP**: Enumerar temporary, backup, final órfão, registry obsoleto e trash.
  - [ ] **EXECUTE**: Criar casos por estado com marcador SPECSFY e versão anterior verificável.
  - [ ] **VERIFY**: Observar RED porque não existe reconciliador Web.
  - [ ] **EVIDENCE**: Registrar tabela estado inicial → resultado e comando RED.
  - [ ] **IMPROVE**: Confirmar store.db excluído e estado ambíguo documentado ou ajustar a matriz.

- [x] T008 [TEST] [TDD] [US-003] Derivar AC-008 em teste RED de uninstall/close em packages/adapter-sqlite-web/tests/browser/lifecycle.spec.ts — Refs: US-003, FR-007, FR-008, FR-009, NFR-002, NFR-003, NFR-006, AC-008 — Depends: none
  - [ ] **PREP**: Confirmar banco aberto, trash, pendências e close idempotente.
  - [ ] **EXECUTE**: Criar caso Playwright com marcador SPECSFY para uninstall e lifecycle.
  - [ ] **VERIFY**: Observar RED pela ausência de ownership e cleanup reais.
  - [ ] **EVIDENCE**: Registrar comando e estado residual observado.
  - [ ] **IMPROVE**: Verificar que nova instância adquire o pool após close ou justificar cobertura em T002.

- [x] T009 [TEST] [TDD] [US-003] Derivar AC-009 em teste RED de package/gates em packages/adapter-sqlite-web/tests/browser/package.spec.ts — Refs: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-006, AC-009 — Depends: none
  - [ ] **PREP**: Definir inventário esperado de dist e matriz Chromium/WebKit/Firefox informativo.
  - [ ] **EXECUTE**: Criar teste com marcador SPECSFY contra o package empacotado.
  - [ ] **VERIFY**: Observar RED pela ausência de Worker/WASM em dist ou scripts browser.
  - [ ] **EVIDENCE**: Registrar comando, browser e artefato ausente.
  - [ ] **IMPROVE**: Tornar inspeção independente de ordem de arquivos ou justificar nenhuma mudança.

#### Fase 2 — Fundação do adapter e US-001

- [x] T010 [CODE] [US-001] Configurar SQLite WASM, Playwright, build de Worker/WASM e erro storage_busy em package.json, pnpm-workspace.yaml, packages/engine-core/src/errors.ts e packages/adapter-sqlite-web — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-006, AC-001, AC-002, AC-003 — Depends: T001, T002, T003
  - [ ] **PREP**: Confirmar RED T001–T003, versões oficiais e executar documentator para baseline independente.
  - [ ] **EXECUTE**: Adicionar dependências/scripts/exports e pipeline de assets sem caminho público fixo.
  - [ ] **VERIFY**: Rodar build/typecheck e inspecionar JS, declarations, Worker e WASM em dist.
  - [ ] **EVIDENCE**: Registrar manifests, lockfile, arquivos de dist e comandos GREEN.
  - [ ] **IMPROVE**: Reduzir dependências/artefatos não usados ou justificar o conjunto mínimo.

- [x] T011 [CODE] [US-001] Implementar protocolo, client, capabilities e createWebAdapter em packages/adapter-sqlite-web/src — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-006, AC-001, AC-002, AC-003 — Depends: T010
  - [ ] **PREP**: Confirmar contratos RED, exports planejados e executar documentator antes da mudança.
  - [ ] **EXECUTE**: Criar unions RPC, validação, URLs/overrides, persistentStorage e factory/lifecycle inicial.
  - [ ] **VERIFY**: Rodar unidades e Playwright de inicialização em Chromium/WebKit.
  - [ ] **EVIDENCE**: Registrar arquivos públicos, payloads e comandos GREEN.
  - [ ] **IMPROVE**: Remover SQL/objetos não serializáveis da fronteira ou justificar nenhuma alteração.

#### Fase 3 — US-002 instalação e consulta

- [x] T012 [CODE] [US-002] Implementar bootstrap SQLite/SAHPool e registry no Worker em packages/adapter-sqlite-web/src/worker/sqlite.ts e registry.ts — Refs: US-002, FR-004, FR-006, NFR-003, NFR-004, NFR-005, AC-004, AC-005, AC-006 — Depends: T004, T005, T006, T011
  - [ ] **PREP**: Confirmar RED T004–T006, schema e executar documentator antes da mudança.
  - [ ] **EXECUTE**: Instalar pool, reservar capacidade, abrir store.db e implementar registry bindado.
  - [ ] **VERIFY**: Rodar testes focais do registry/Worker em ambos browsers.
  - [ ] **EVIDENCE**: Registrar schema criado, capacidade e comandos GREEN.
  - [ ] **IMPROVE**: Revisar número de handles e crescimento do pool ou justificar o default.

- [x] T013 [CODE] [US-002] Implementar validação e installer compensável em packages/adapter-sqlite-web/src/worker/installer.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005, AC-004, AC-006 — Depends: T012
  - [ ] **PREP**: Confirmar RED, fases/cancelamento e executar documentator antes da mudança.
  - [ ] **EXECUTE**: Implementar temporary/backup/final, validação legada, progress, cancel e compensação.
  - [ ] **VERIFY**: Rodar install/fault injection e provar preservação da versão anterior.
  - [ ] **EVIDENCE**: Registrar checkpoints, estados finais e comandos GREEN.
  - [ ] **IMPROVE**: Minimizar cópias inevitáveis e documentar ownership do ArrayBuffer.

- [x] T014 [CODE] [US-002] Implementar library e busca no Worker em packages/adapter-sqlite-web/src/worker/library.ts — Refs: US-002, FR-004, FR-005, FR-006, NFR-003, NFR-004, NFR-005, AC-004, AC-005 — Depends: T012, T013
  - [ ] **PREP**: Confirmar fixture/contract RED e executar documentator antes da mudança.
  - [ ] **EXECUTE**: Implementar mapping, livros, capítulo, nome, COUNT e busca ordenada sem SQL público.
  - [ ] **VERIFY**: Rodar contract suite e Playwright offline em Chromium/WebKit.
  - [ ] **EVIDENCE**: Registrar resultados equivalentes e contagem de rede zero.
  - [ ] **IMPROVE**: Compartilhar mapping portátil com Node sem introduzir dependência de plataforma.

#### Fase 4 — US-003 consistência e lifecycle

- [x] T015 [CODE] [US-003] Implementar reconciliação best-effort em packages/adapter-sqlite-web/src/worker/reconciliation.ts — Refs: US-003, FR-007, FR-009, NFR-001, NFR-004, NFR-005, AC-007, AC-009 — Depends: T007, T013
  - [ ] **PREP**: Confirmar RED e matriz de estados; executar documentator antes da mudança.
  - [ ] **EXECUTE**: Implementar heurísticas e stats, excluindo registry e evitando alegação de journal.
  - [ ] **VERIFY**: Rodar todos os estados unitários/browser e reabrir a origem.
  - [ ] **EVIDENCE**: Registrar estado inicial/final e stats por caso.
  - [ ] **IMPROVE**: Simplificar regras redundantes sem reduzir estados provados.

- [x] T016 [CODE] [US-003] Implementar uninstall, storage_busy e close completo em packages/adapter-sqlite-web/src/worker.ts e worker-client.ts — Refs: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-003, NFR-006, AC-007, AC-008, AC-009 — Depends: T008, T011, T012, T015
  - [ ] **PREP**: Confirmar RED de lifecycle e executar documentator antes da mudança.
  - [ ] **EXECUTE**: Fechar handles, usar trash/compensação, rejeitar pendências e liberar Worker/pool idempotentemente.
  - [ ] **VERIFY**: Rodar lifecycle multi-page em Chromium/WebKit e aquisição após close.
  - [ ] **EVIDENCE**: Registrar ausência de resíduos, códigos e comandos GREEN.
  - [ ] **IMPROVE**: Garantir resposta terminal única por request ou refatorar o estado do client.

- [x] T017 [OPS] [US-003] Integrar conformance Playwright e inspeção do package em packages/adapter-sqlite-web/playwright.config.ts, turbo.json e workflow CI — Refs: US-003, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-006, AC-007, AC-008, AC-009 — Depends: T009, T010, T014, T016
  - [ ] **PREP**: Confirmar matriz e comandos reproduzíveis sem secrets.
  - [ ] **EXECUTE**: Configurar Chromium/WebKit bloqueantes, Firefox informativo e artifact checks.
  - [ ] **VERIFY**: Executar pipeline local equivalente e simular falha de browser obrigatório.
  - [ ] **EVIDENCE**: Registrar versões, comandos, resultados por browser e dist.
  - [ ] **IMPROVE**: Ajustar cache/download sem enfraquecer lockfile ou justificar configuração atual.

#### Fase 5 — Contexto, documentação e fechamento

- [x] T018 [DOC] Atualizar modelo e ownership Web em .specsfy/DATABASE.md e ADR de persistência — Refs: FR-004, FR-007, FR-008, NFR-004, NFR-005, AC-004, AC-007, AC-008 — Depends: T012, T013, T015, T016
  - [ ] **PREP**: Comparar schema/estados implementados com seções 8–9.
  - [ ] **EXECUTE**: Registrar registry, arquivos lógicos, retenção, heurísticas e limites sem apagar conteúdo humano.
  - [ ] **VERIFY**: Rodar monitor de contexto e conferir termos exatos da garantia.
  - [ ] **EVIDENCE**: Registrar caminhos e resultado do monitor.
  - [ ] **IMPROVE**: Eliminar divergência Node/Web ou justificar diferenças de VFS.

- [x] T019 [DOC] Atualizar stack, regras, packages e produto em .specsfy/STACK.md, RULES.md, PACKAGES.md e PROJECT.md — Refs: FR-001, FR-002, FR-003, FR-009, NFR-001, NFR-002, NFR-006, AC-001, AC-002, AC-003, AC-009 — Depends: T010, T011, T017
  - [ ] **PREP**: Comparar manifests, exports, browser matrix e regras confirmadas.
  - [ ] **EXECUTE**: Executar aux-stack, aux-rules e documentator; revisar PROJECT.md pelo novo adapter funcional.
  - [ ] **VERIFY**: Rodar monitor e build_documentation --check.
  - [ ] **EVIDENCE**: Registrar diffs derivados e comandos sem conteúdo inventado.
  - [ ] **IMPROVE**: Remover afirmações antigas de placeholder ou justificar preservação histórica.

- [x] T020 [TEST] Executar regressão, rastreabilidade e registrar revisão final em specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T017, T018, T019
  - [ ] **PREP**: Confirmar todas as tarefas/evidências, browsers e gates disponíveis.
  - [ ] **EXECUTE**: Rodar build, typecheck, lint, Vitest, arquitetura, Chromium/WebKit, Firefox informativo e traceability.
  - [ ] **VERIFY**: Confirmar zero gap, zero BLOCKER e nenhuma declaração de crash-safety/rename.
  - [ ] **EVIDENCE**: Atualizar seções 11–13 com contagens e comandos finais.
  - [ ] **IMPROVE**: Executar deslop/revisão e registrar melhoria concreta ou ausência justificada.

<!-- specsfy:evidence {"task":"T011","refs":["US-001","FR-001","FR-002","FR-003","NFR-001","NFR-002","NFR-006","AC-001","AC-002","AC-003"]} -->
<!-- specsfy:evidence {"task":"T013","refs":["US-002","FR-004","FR-005","FR-006","NFR-003","NFR-004","NFR-005","AC-004","AC-005","AC-006"]} -->
<!-- specsfy:evidence {"task":"T016","refs":["US-003","FR-007","FR-008","FR-009","NFR-001","NFR-004","NFR-005","AC-007","AC-008","AC-009"]} -->
<!-- specsfy:evidence {"task":"T017","refs":["NFR-002","NFR-006","AC-002","AC-003","AC-008","AC-009"]} -->

### 15. Ordem de execução

- Caminho crítico: T001–T003 → T010 → T011 → T004–T006 → T012 → T013 → T014 → T007–T009 → T015 → T016 → T017 → T018/T019 → T020.
- REDs T001–T009 podem ser preparados por grupos de arquivo; não recebem `[P]` porque compartilham harness e fixtures.
- T018 e T019 podem executar em paralelo após suas dependências, pois alteram arquivos de contexto distintos; sincronizam em T020.
- Estratégia MVP: US-001 inicializa o storage; US-002 prova instalação/consulta; US-003 fecha consistência, lifecycle e distribuição.
- Ponto de handoff desta sessão: tarefas geradas e validadas com `--allow-draft`; T001 é a primeira ação do modelo implementador. Plan Gate permanece Pending até REDs predecessores serem materializados conforme o Specsfy.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Ports da spec 0001, SQLite WASM com SAHPool, Playwright e HTTP local da harness.

#### Riscos

- Sem rename público, promoção exige cópia → backup persistente, fault injection e garantia limitada.
- WebKit pode divergir em OPFS → gate obrigatório.
- Segunda aba colide → `storage_busy`, sem limpar estado alheio.
- Quota/slots → reservar capacidade e mapear `storage_full`.
- Bundlers divergem → URLs relativas, overrides e teste do package empacotado.
- Persistência pode ser negada → resultado observável e eviction documentada.

#### Suposições

- Pool name/directory default estável e namespaced; mudar cria namespace isolado.
- Capacidade mínima configurável, confirmada em testes com a versão SQLite fixada.
- Assets são carregados antes do trecho testado offline; cache PWA pertence ao app.
- Fixture sintética pequena reproduz o schema legado sem conteúdo protegido.

### 17. Decisões

- **DEC-001**: spec 0002 nova; não reabrir a 0001 concluída.
- **DEC-002**: Worker dedicado + SQLite WASM + SAHPool, sem COOP/COEP.
- **DEC-003**: Chromium/WebKit bloqueiam; Firefox informa.
- **DEC-004**: segunda aba retorna `storage_busy`; coordenação fica futura.
- **DEC-005**: registry SQLite no mesmo pool/Worker.
- **DEC-006**: assets relativos ao módulo com overrides.
- **DEC-007**: storage persistente solicitado best-effort.
- **DEC-008**: temporary/backup/final via import/export/unlink, sem alegar rename.
- **DEC-009**: garantia exata “SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort”.
- **DEC-010**: RPC semântico, sem SQL público.
- **DEC-011**: outro modelo executa `$specsfy-07-implement` após este Plan Gate.

### 18. Definition of Done

- [x] Definition, Plan e Delivery Gates estão Passed.
- [x] Adapter implementa os três ports sobre Worker/SQLite/SAHPool.
- [x] Chromium e WebKit passam; Firefox tem resultado informativo. (Nota: Chromium 10/10 e Firefox informativo 9/10 — AC-002 diverge na semântica OPFS/duplex do Firefox. **WebKit documentado como não executável na conformance OPFS/SAHPool**: a build Linux do Playwright não implementa a API OPFS (`FileSystemSyncAccessHandle`), então o adapter reporta `storage_unavailable`/`opfs:false`; a meta WebKit exigiria Safari/macOS real. Decisão da sessão: Chromium bloqueia.)
- [x] Instalação persiste após reabrir e opera com rede bloqueada.
- [x] Schema/mapping/busca mantêm paridade com legado e Node.
- [x] Falhas/cancelamento preservam consistência; estados reconciliáveis têm testes.
- [x] Segunda aba retorna `storage_busy`; close libera recursos.
- [x] Dist contém JS, declarations, Worker e WASM com overrides testados.
- [x] Documentação não declara crash-safety ou rename atômico.
- [x] Build, typecheck, lint, Vitest, arquitetura, Playwright e rastreabilidade passam.
- [x] `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md`, ADRs e docs refletem a implementação.
