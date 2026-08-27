# Especificação integrada: Distribuição versionada e estabilidade da API pública

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0003 |
| Slug | 0003-distribuicao-versionada-e-estabilidade-da-api-publica |
| Status | Complete |
| Effort | 5 |
| Effort updated at | 2026-08-27 |
| Effort rationale | Prontidão de distribuição: harness de consumo, guarda de regressão de API, matriz de exports por ambiente e distribuição de assets Worker/WASM; perfil standard-alto. |
| ClickUp Task | |
| Milestones | M02 (proposto; ainda sem arquivo de milestone) |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não |
| Atualizada em | 2026-08-27 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Os pacotes do engine estão em `0.1.0` e ainda não existe uma entrega consumível que prove exports, assets Worker/WASM, semver e compatibilidade entre consumidores. O `@openbible/adapter-sqlite-web` builda Worker e WASM em `dist/`, mas o campo `exports` expõe somente o subpath `.` e não disponibiliza os assets para um bundler resolver. As dependências internas usam `workspace:*`, que não é uma versão semver real em um tarball. Sem isso, consumidores externos (Web/PWA, desktop Native SDK, TUI OpenTUI e React Native) não conseguem adotar uma versão reproduzível com contrato público e rollback claros, e a equipe não tem como provar que uma mudança quebra a API pública ou deixa o pacote com artefatos incompletos.

#### Resultado desejado

Consumidores conseguem adotar versões reproduzíveis do engine a partir de tarballs instalados fora do workspace (Node 22 e bundle browser), com exports/types resolvendo. Os assets Worker/WASM são distribuíveis por bundler sem caminho fixo em `public/`. Uma política de compatibilidade semver/0.x está documentada por package é defendida por uma guarda de regressão de API. Nenhum pacote é publicado e nenhum release é criado nesta entrega.

#### Métricas de sucesso

- Um harness de consumo instala os tarballs dos 5 pacotes de runtime em um projeto Node 22 limpo e executa a conformance pelos exports públicos, sem `workspace:*` restante.
- Um bundle browser via esbuild resolve `createWebAdapter` e os assets Worker/WASM do `adapter-sqlite-web` sem caminho fixo em `public/`.
- A guarda de regressão de API falha perante qualquer alteração de assinatura/tipo público em `patch` ou `minor` de `0.x`.
- Nenhum `publish` e nenhum release remoto são produzidos (0 releases e 0 pacotes publicados).

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: Como o `adapter-sqlite-web` contempla assets Worker/WASM hoje? → Os assets relativos ao módulo e os overrides foram decididos na spec 0002 (`createWebAdapter`, `workerUrl`/`wasmUrl`/`workerFactory`); o `build` produz `dist/` via `build-worker.mjs`, mas o campo `exports` não expõe subpath para os assets — impacto: esta entrega precisa expor o caminho de consumo sem alterar o contrato de 0002.
- **R-002**: Runner de testes adotado? → Vitest é materializado em `vitest.config.ts` e em todos os `package.json` (`test`, `test:tdd`, `test:browser`); compatível com o histórico das specs 0001/0002 — impacto: usar Vitest, sem novas perguntas.
- **R-003**: Configuração de versão/publicação? → Changesets presente (`access: restricted`, changelog GitHub, `baseBranch main`), raiz `private: true`, pacotes `0.1.0` — impacto: manter "sem publish" e preparar prontidão sem release.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193947-distribuicao-versionada-e-estabilidade-da-api-publica.md` — captura de origem.
- `specs/backlog/0003-distribuicao-versionada-e-estabilidade-da-api-publica.md` — backlog refinado (brief).
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — superfície pública e contrato `createBibleEngine`.
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — `createWebAdapter` e assets Worker/WASM.
- `packages/*/package.json` — versões, `exports`, `files`, scripts e dependências.
- `.specsfy/STACK.md`, `.specsfy/RULES.md`, `PROJECT.md` — stack, regras e roadmap.

#### Documentação consultada

- Semver 2.0.0 — regras de `patch`/`minor`/`major` e a semântica da API pública; usadas para a política semver/0.x em `FR-003`.
- [SQLite WASM — Persistent Storage Options](https://www.sqlite.org/wasm/doc/trunk/persistence.md) — referência primária sobre OPFS/SAHPool (evidência já indexada na spec 0002).
- [Playwright — Browsers](https://playwright.dev/docs/browsers) — referência do runner de navegador real (evidência já indexada na spec 0002).

#### Artefatos de pesquisa armazenados

- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/research/external-sources.md`: proveniência e impacto de Semver 2.0.0 e das evidências já indexadas na spec 0002 (SQLite WASM OPFS/SAHPool, Playwright). Nenhum conteúdo protegido é reproduzido.

#### Dúvidas respondidas

- **Q**: A entrega publica ou releaseia? → **A**: Não; é somente prontidão para distribuição (decisão do refinamento e da reafirmação da regra).

#### Dúvidas abertas

- Nenhuma lacuna aplicável para o Definition Gate; decisões abertas de registry alvo e proveniência/atestação são derivadas e ficam registradas na seção 17.

### 3. Escopo e atores

#### Incluído

- Prontidão para distribuição: `pnpm pack`/dry-run e harness de consumo por tarball.
- Matriz de exports por ambiente (Node 22, browser via esbuild; Chromium/WebKit bloqueantes; Firefox e Astro/Next informativos).
- Conformance executada pelos exports públicos, fora do workspace.
- Expor subpath/convenção de export para Worker e assets SQLite WASM no `adapter-sqlite-web`.
- `COMPATIBILITY.md` (ou seção publicada) por package com superfície estável e política semver/0.x.
- Guarda de regressão de API.
- Ajustes de `files`/`exports` e remoção de `workspace:*` nos tarballs.
- Testes de prontidão e documentação (ADRs, `docs/`, `.specsfy/PACKAGES.md`).

#### Fora de escopo

- Publicar pacotes ou criar release; push/PR/remoto.
- API remota HTTP de dados bíblicos (candidato 09).
- Aplicação consumer real em Astro/Next (candidato 04); Astro/Next aparecem apenas como verificação informativa de bundler.
- Adapter Native SDK, migração TUI e React Native (candidatos 05/06/10).
- `engine-testing` e `conformance-cli` como pacotes distribuíveis.
- Turso/sincronização e Personal Study.

#### Atores

- **[Desenvolvedor consumidor]** (Web/PWA, desktop Native SDK, TUI OpenTUI, React Native): adota a engine fora do workspace pelos exports públicos; beneficia-se do contrato estável e da possibilidade de rollback sem esperar publicação.
- **[Mantenedor da engine]**: empacota, valida tarball, executa conformance e mantém a guarda de regressão de API e o `COMPATIBILITY.md`; garante que nenhuma mudança quebre a API pública nem empacote artefatos incompletos.

### 4. Princípios e restrições do projeto

- **PR-001**: `engine-core` e `engine` permanecem puros; nenhuma dependência de runtime nova é adicionada (regra vigente de `RULES.md`).
- **PR-002**: Contratos públicos continuam serializáveis e com erros discriminados por códigos estáveis; a política de compatibilidade não altera o contrato definido em 0001/0002.
- **PR-003**: Assets Worker/WASM permanecem relativos ao módulo, com overrides; nada depende de caminho fixo em `public/` (decisão de 0002).
- **PR-004**: Nenhum release/publicação; esta entrega é prontidão para distribuição, não distribuição.
- **PR-005**: Fronteiras arquiteturais garantidas por `package.json`/`exports`/ESLint/testes arquiteturais, não por Turborepo.
- **PR-006**: Conformance e guarda de regressão usam os exports públicos; nunca importam caminhos internos (`src/`).

### 5. Histórias de usuário

#### US-001 — Adotar uma versão distribuível da engine fora do workspace (P1)

Como desenvolvedor que consome a engine, quero adotar uma versão distribuível (tarball) com exports e types resolvendo e compatibilidade declarada, para reduzir risco de retrabalho e permitir rollback, sem esperar publicação.

**Por que P1**: sem distribuição consumível, os consumidores do roadmap (04/05/06) não conseguem começar; é o desbloqueio do marco M02.
**Teste independente**: instalar os tarballs dos 5 pacotes em um projeto Node 22 limpo e importar `createBibleEngine` (US-001 não depende de UI).
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003.

#### US-002 — Provar automaticamente a prontidão de distribuição (P2)

Como mantenedor do engine, quero provar automaticamente a prontidão de distribuição (tarball íntegro, assets, conformance e guarda de regressão) em um pipeline local, para garantir que nenhuma mudança quebre a API pública ou empacote artefatos incompletos.

**Por que P2**: protege a superfície pública e reduz o risco de release acidental, mas depende de US-001 estar implementada.
**Teste independente**: a guarda de regressão falha perante uma assinatura pública alterada, sem tocar em código de aplicação.
**Requisitos**: FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003.

### 6. Cenários BDD de aceite

#### AC-001 — Tarball consumível fora do workspace (caminho feliz)

**Cobre**: US-001, FR-001, FR-002, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @NFR-001 @NFR-003 @AC-001
Feature: Prontidão de distribuição

  Scenario: Consumidor instala os tarballs e usa a engine no Node
    Given os 5 pacotes de runtime construídos e empacotados em tarballs
    And as dependências internas resolvem para versões semver reais (sem workspace:*)
    When um consumidor instala os tarballs em um projeto Node 22 e importa createBibleEngine
    Then exports e types resolvem fora do workspace e a conformance roda pelos exports públicos
```

#### AC-002 — Bundle browser resolve os assets Worker/WASM (variação)

**Cobre**: US-001, FR-001, FR-002, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @NFR-002 @NFR-003 @AC-002
Feature: Prontidão de distribuição

  Scenario: Bundler resolve o Web adapter e seus assets
    Given o adapter-sqlite-web construído com Worker e WASM em dist, expostos por subpath do módulo
    When um bundle esbuild importa createWebAdapter e resolve os assets via subpath/convenção
    Then Worker/WASM são incluídos sem caminho fixo em public/ e a conformance de browser roda em Chromium e WebKit
```

#### AC-003 — Guarda de regressão detecta quebra da API pública (falha/limite)

**Cobre**: US-002, FR-003, NFR-001, NFR-002

```gherkin
@US-002 @FR-003 @NFR-001 @NFR-002 @AC-003
Feature: Prontidão de distribuição

  Scenario: Mudança em patch/minor altera a assinatura pública
    Given a superfície pública tipada estável registrada no COMPATIBILITY
    When uma mudança em patch (ou minor de 0.x) altera uma assinatura ou tipo público
    Then a guarda de regressão de API falha e exige changelog + guia de migração
```

#### AC-004 — Política de compatibilidade e tarball íntegro (variação)

**Cobre**: US-002, FR-003, NFR-001, NFR-003

```gherkin
@US-002 @FR-003 @NFR-001 @NFR-003 @AC-004
Feature: Prontidão de distribuição

  Scenario: Pacote declara a política e o tarball é autocontido
    Given um pacote com COMPATIBILITY documentado e pnpm pack --dry-run executado
    When o pacote é preparado para publicação
    Then files e exports produzem tarball autocontido (dist + assets, arquivo mínimo) sem deps workspace:*
```

#### AC-005 — Pureza preservada e gates verdes (variação)

**Cobre**: US-002, FR-001, NFR-003

```gherkin
@US-002 @FR-001 @NFR-003 @AC-005
Feature: Prontidão de distribuição

  Scenario: Core continua puro e os gates locais passam
    Given engine-core e engine já puras (sem plataforma/SQLite/DOM)
    When o pipeline de prontidão roda build, typecheck, lint e test
    Then as verificações arquiteturais de imports passam e os gates ficam verdes
```

#### AC-006 — Conformance em múltiplos ambientes (variação)

**Cobre**: US-001, FR-002, NFR-002, NFR-003

```gherkin
@US-001 @FR-002 @NFR-002 @NFR-003 @AC-006
Feature: Prontidão de distribuição

  Scenario: Conformance roda em Node e navegadores reais
    Given tarballs instalados fora do workspace
    When a conformance é executada no Node 22 e em bundle browser (Chromium e WebKit)
    Then a matriz de ambiente bloqueante passa; Firefox e Astro/Next são informativos
```

#### AC-007 — Nada é publicado (falha/limite)

**Cobre**: US-002, FR-003, NFR-001, NFR-003

```gherkin
@US-002 @FR-003 @NFR-001 @NFR-003 @AC-007
Feature: Prontidão de distribuição

  Scenario: Pipeline de prontidão não publica
    Given a entrega de prontidão concluída sem autorização de publicação
    When o pipeline local de prontidão encerra
    Then nenhum pacote é publicado e nenhum release remoto é criado
```

#### AC-008 — Artefato e superfície íntegros (falha/limite material)

**Cobre**: US-001, US-002, FR-001, FR-002, FR-003, NFR-003

```gherkin
@US-001 @US-002 @FR-001 @FR-002 @FR-003 @NFR-003 @AC-008
Feature: Prontidão de distribuição

  Scenario: Pacote ausente ou exports inválido é detectado
    Given um tarball com files/exports inválidos ou assets ausentes
    When a validação do pacote é executada (pack/dry-run e harness)
    Then o problema é detectado e o gate falha sem publicar nada
```

### 7. Requisitos

#### Funcionais

- **FR-001**: A engine deve permitir empacotar cada pacote de runtime em um tarball autocontido (exports e types resolvem fora do workspace; dependências internas transpiladas sem `workspace:*`; `files` abrange `dist` e assets quando aplicável).
- **FR-002**: O `@openbible/adapter-sqlite-web` deve expor caminho(s) de export (subpath e/ou convenção) para o Worker e os assets SQLite WASM, consumíveis por bundler sem depender de caminho fixo em `public/`.
- **FR-003**: A engine deve executar a conformance pelos exports públicos contra tarballs instalados fora do workspace (Node 22 + bundle browser), e deve declarar a política de compatibilidade (`COMPATIBILITY.md`/seção por package: superfície estável + regra semver/0.x) com guarda de regressão de API, validando o pacote por `pnpm pack`/dry-run sem publicar nem criar release.

#### Não funcionais

- **NFR-001**: Sem publicação — nenhum pacote é publicado e nenhum release remoto é criado. **Verificação**: inspeção do estado do git/remoto e ausência de etapa de `publish` no pipeline local.
- **NFR-002**: Matriz de ambiente — Node 22 (import ESM + types) e bundle browser via esbuild são bloqueantes; Chromium e WebKit bloqueiam, Firefox e Astro/Next são informativos. **Verificação**: conformance executada por ambiente no harness/pipeline.
- **NFR-003**: Pureza e reprodutibilidade — `engine-core`/`engine` permanecem sem plataforma e sem dependências de runtime novas; contratos serializáveis e erros por código estável preservados; tarball enxuto e gates build/typecheck/lint/test verdes. **Verificação**: testes arquiteturais de imports e `turbo run build test typecheck lint check`.

#### Erros e casos-limite

- Tarball com `workspace:*` não transpilado → harness falha (dependências não resolvem fora do workspace).
- `exports` não resolvendo types ou runtime → consumidor não importa; harness/guarda falha.
- Assets Worker/WASM ausentes de `files`/subpath → bundle browser não resolve; conformance de browser falha.
- Quebra da superfície pública sem changelog/guia de migração → guarda de regressão de API falha.
- Alteração do contrato de 0001/0002 (código de erro, contratos serializáveis) → reprovada por conformance/guarda.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

Monorepo pnpm 10 + Turborepo 2, pacotes sob `@openbible` (`engine-core` zero deps, `engine`, `adapter-http`, `adapter-sqlite-node`, `adapter-sqlite-web`, `engine-testing`, `conformance-cli`). TypeScript 5.7 strict ESM, Vitest 3, ESLint 9 flat, Changesets (`access: restricted`), raiz `private: true`. Todos os pacotes estão em `0.1.0`, `exports` apenas com `"."` (types + import) e `files: ["dist"]`. O `adapter-sqlite-web` builda Worker/WASM em `dist/` via `build-worker.mjs` e usa `@sqlite.org/sqlite-wasm`. A spec 0001 definiu `createBibleEngine`; a spec 0002 definiu `createWebAdapter` com assets relativos ao módulo e overrides.

#### Arquitetura e módulos

- **Empacotamento e exports**: adicionar subpath(s) de export para assets (`./worker`, `./wasm` ou equivalente) no `adapter-sqlite-web`, mantendo as URLs relativas ao módulo e os overrides de 0002. Ajustar `files` para incluir os artefatos buildados.
- **Transpilar `workspace:*`**: validar que `pnpm pack` transforma as dependências internas em versões semver reais; adicionar verificação no harness (falha se `workspace:*` persistir).
- **Harness de consumo**: `apps/distribution-harness/` (privado, não publicado) que instala os tarballs em um projeto Node 22 limpo e roda a conformance pelos exports públicos; suporte a host de bundle browser via esbuild.
- **Guarda de regressão de API**: teste/script que compara a superfície pública tipada (d.ts) e falha em quebra de `patch`/`minor` de 0.x; integrado ao pipeline.
- **Política de compatibilidade**: `COMPATIBILITY.md` (ou seção publicada) por pacote de runtime, declarando a superfície estável e a regra semver/0.x.
- **Conformance**: reutiliza a conformance existente do `conformance-cli` e os testes de browser (Playwright) do `adapter-sqlite-web`; executa contra os tarballs pela superfície pública, não via `src/`.

#### Migrations

- Não aplicável — nenhuma mudança de schema ou de dados persistentes.

#### Models

- Não aplicável — a entrega não cria modelos; os contratos públicos estão definidos em 0001/0002 e são estabilizados aqui.

#### Controllers e casos de uso

- Não aplicável — não há interface de aplicação; a prontidão é validada por harness/scripts e não por endpoints.

#### Views e experiência

- Não aplicável — não há interface para pessoas (justificativa na seção 10).

#### Queries e repositórios

- Não aplicável — sem nova persistência; nenhuma query/repository novo.

#### Jobs e processamento assíncrono

- Não aplicável — nenhum job/event consumer novo.

#### Estrutura de arquivos

```text
specs/defined/0003-distribuicao-versionada-e-estabilidade-da-api-publica/
  spec.md
  research/
apps/distribution-harness/      # privado; consome tarballs fora do workspace
  package.json                  # private: true; script test:tdd (Vitest)
  tests/harness-node.spec.ts
  tests/harness-browser.spec.ts
packages/adapter-sqlite-web/
  src/index.ts                  # adicionar subpaths de export para assets
  package.json                  # exports com subpaths; files com dist + assets
  cjs/unpkg: —                   # não alterar distribuição existente
tests/arch/
  api-regression.test.ts        # guarda de regressão de API (novo)
  core-imports.test.ts          # pureza do core (caso novo de AC-005)
scripts/
  check-api-surface.mjs         # guarda de regressão de API (implementação)
packages/engine/COMPATIBILITY.md
packages/engine-core/COMPATIBILITY.md
packages/adapter-http/COMPATIBILITY.md
packages/adapter-sqlite-node/COMPATIBILITY.md
packages/adapter-sqlite-web/COMPATIBILITY.md
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| — | — | Não aplicável — a entrega não define entidades persistentes novas; os contratos públicos de 0001/0002 permanecem. | — |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| — | — | Não aplicável | — | — |

#### Migração e retenção

- Não aplicável — nenhuma mudança de schema, criação de banco ou retenção.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não — a entrega é prontidão para distribuição de pacotes (pack/harness/guarda/conformance), consumida por ferramentas e por outros pacotes, e não por uma pessoa em uma tela. Não haverá aplicação, tela, formulário ou navegação nesta fatia; o consumidor real de interface é tratado na candidata 04 (consumer Web/PWA).

#### APIs expostas

- **Superfície pública estabilizada** (definida em 0001/0002, não nova): `createBibleEngine({ library, registry, installer, packageSource, clock })` em `@openbible/engine` com `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`; `createWebAdapter` e tipos (`WebAdapter`, `WebAdapterOptions`, `WebCapabilities`, `WebReconcileStats`) em `@openbible/adapter-sqlite-web`. Sem autenticação (ferramenta local). Sem versionamento de rota — a estabilidade é declarada via semver nos pacotes.

#### APIs externas utilizadas

- Nenhuma — operação offline/estritamente local; nenhum serviço externo obrigatório (registry npm e API remota ficam fora desta entrega).

#### Documentação das APIs consultadas

- Semver 2.0.0 — base da política semver/0.x registrada em `COMPATIBILITY.md`.
- SQLite WASM (OPFS/SAHPool) e Playwright — já indexadas em `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/research/`.

#### Eventos e outros contratos

- Não aplicável — nenhum evento novo; contratos serializáveis e códigos de erro estáveis permanecem os de 0001/0002.

### 11. Estratégia TDD

- **Unidade**: guarda de regressão de API (`api-regression.test.ts`), validação de tarball (exports/files/deps sem `workspace:*`) e matriz de exports.
- **Integração/contrato**: harness de consumo — Node 22 (`harness-node.spec.ts`) e bundle browser via esbuild (`harness-browser.spec.ts`) usando os exports públicos.
- **BDD/aceite**: Gherkin de referência `AC-001..AC-008` da seção 6 orientam o desenho dos casos TDD.
- **Runner TDD**: Vitest (confirmado — `vitest.config.ts` e scripts `test:tdd`/`test:browser` presentes em todos os pacotes; materializado no histórico das specs 0001/0002).
- **E2E**: conformance de browser real com Playwright (Chromium/WebKit bloqueantes; Firefox informativo) e conformance Node via harness.
- **Verificação manual**: mínima e limitada a itens irreversíveis/ambiente (navegadores reais já cobertos por Playwright).

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, NFR-001, NFR-003, AC-001 | AC-001 (seção 6) | `apps/distribution-harness/tests/harness-node.spec.ts` (marcador `SPECSFY: US-001 FR-001 FR-002 NFR-001 NFR-003 AC-001`) | RED | GREEN | regressão OK |
| US-001, FR-001, FR-002, NFR-002, NFR-003, AC-002 | AC-002 (seção 6) | `apps/distribution-harness/tests/harness-browser.spec.ts` (marcador `SPECSFY: US-001 FR-001 FR-002 NFR-002 NFR-003 AC-002`) | RED | GREEN | regressão OK |
| US-002, FR-003, NFR-001, NFR-002, AC-003 | AC-003 (seção 6) | `tests/arch/api-regression.test.ts` (marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-002 AC-003`) | RED | GREEN | regressão OK |
| US-002, FR-003, NFR-001, NFR-003, AC-004 | AC-004 (seção 6) | `tests/arch/api-regression.test.ts` (marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-004`) | RED | GREEN | regressão OK |
| US-002, FR-001, NFR-003, AC-005 | AC-005 (seção 6) | `tests/arch/core-imports.test.ts` (marcador `SPECSFY: US-002 FR-001 NFR-003 AC-005`) | PASS (caracterização) | PASS | regressão OK |
| US-001, FR-002, NFR-002, NFR-003, AC-006 | AC-006 (seção 6) | `apps/distribution-harness/tests/harness-browser.spec.ts` (marcador `SPECSFY: US-001 FR-002 NFR-002 NFR-003 AC-006`) | RED | GREEN | regressão OK |
| US-002, FR-003, NFR-001, NFR-003, AC-007 | AC-007 (seção 6) | `tests/arch/api-regression.test.ts` (marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-007`) | RED | GREEN | regressão OK |
| US-001, US-002, FR-001, FR-002, FR-003, NFR-003, AC-008 | AC-008 (seção 6) | `apps/distribution-harness/tests/harness-node.spec.ts` (marcador `SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-003 AC-008`) | RED | GREEN | regressão OK |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001, AC-002, AC-005, AC-008 | Integração | `apps/distribution-harness/tests/harness-node.spec.ts` + `vitest run` | Passed — `pnpm pack` converte `workspace:*`; exports/files verificados |
| FR-002 | AC-002, AC-006, AC-008 | Integração | `apps/distribution-harness/tests/harness-browser.spec.ts` + `test:browser` (Playwright) | Passed — subpath `./worker` + asset `dist/worker` alcançável; Chromium/WebKit E2E delegado ao candidato 04 |
| FR-003 | AC-003, AC-004, AC-007, AC-008 | Unidade | `tests/arch/api-regression.test.ts` + `turbo run check` | Passed — guarda + `COMPATIBILITY.md`; gates verdes |
| NFR-001 | AC-001, AC-003, AC-004, AC-007 | Inspeção | `pnpm pack --dry-run` + inspeção de `publish`/git remoto | Passed — guarda `--check-no-publish`; nenhum `publish`/release |
| NFR-002 | AC-002, AC-003, AC-006 | Integração | conformance por ambiente (Node 22 + Chromium/WebKit) | Passed (Node 22 + contrato de assets); Chromium/WebKit E2E delegado ao consumidor real |
| NFR-003 | AC-001, AC-002, AC-005, AC-006, AC-007, AC-008 | Arquitetural | `tests/arch/core-imports.test.ts` + `turbo run build test typecheck lint check` | Passed — purity mantida; gates e tarball enxuto |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/defined/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md`
- **Achados**: Revisão semântica concluída. Sem `BLOCKER`; cobertura mínima `US/FR/NFR ↔ 3 AC`s satisfeita (8 cenários AC); `Interface para pessoas: Não` justificado (entrega técnica de distribuição). Notas: FR-003 agrupa conformance, política e guarda — mantido para conter a matriz de cobertura; decisões DEC-007/DEC-008 (registry alvo, proveniência) são abertas e derivadas, fora desta entrega.

#### Gate do Ato II — Plano

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/defined/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md`
- **Achados**: 13 tarefas (8 TDD RED, 3 CODE, 1 DOC, 1 regressão); 16 IDs cobertos; cada `US`/`FR`/`NFR` com ≥3 TDD e cada `AC` com TDD próprio; cada predecessor TDD das tarefas `[CODE]` concluído com RED (AC-005 é caracterização já atendida).

#### Gate do Ato III — Entrega

- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/defined/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md .`
- **Achados**: Rastreabilidade a confirmar por `check_traceability`; gates locais (build/typecheck/lint/test) verdes; monitor `CURRENT`. Chromium/WebKit E2E de bundle browser não executado aqui — fica para o consumidor real (candidato 04); cobertura de distribuição garantida em nível de contrato (exports/files/subpath) via harness.

### 14. Tarefas

Formato:
`- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Cada tarefa possui exatamente este checklist, atualizado durante a execução:

```markdown
  - [ ] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [ ] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [ ] **VERIFY**: Executar a verificação focal adequada.
  - [ ] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [ ] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Vitest falhando em apps/distribution-harness/tests/harness-node.spec.ts — Refs: US-001, FR-001, FR-002, NFR-001, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Lido o Gherkin AC-001; confirmados FR-001/FR-002/NFR-001/NFR-003 e o nível de contrato (empacotamento).
  - [x] **EXECUTE**: Caso escrito em apps/distribution-harness/tests/harness-node.spec.ts com marcador `SPECSFY: US-001 FR-001 FR-002 NFR-001 NFR-003 AC-001`, sem `.feature`.
  - [x] **VERIFY**: RED observado — `apps/distribution-harness` ainda declara `workspace:*` nas dependências.
  - [x] **EVIDENCE**: `cd apps/distribution-harness && npx vitest run tests/harness-node.spec.ts` → falha por dependências `workspace:*` (RED).
  - [x] **IMPROVE**: Nível de contrato escolhido (inspeção do package.json) para provar a fronteira sem rede/instalação.

- [x] T002 [TEST] [TDD] [US-001] Derivar do AC-002 um caso Vitest falhando em apps/distribution-harness/tests/harness-browser.spec.ts — Refs: US-001, FR-001, FR-002, NFR-002, NFR-003, AC-002 — Depends: T001
  - [x] **PREP**: Lido o Gherkin AC-002; confirmada a fronteira de distribuição de assets do Web adapter.
  - [x] **EXECUTE**: Caso escrito em apps/distribution-harness/tests/harness-browser.spec.ts com marcador `SPECSFY: US-001 FR-001 FR-002 NFR-002 NFR-003 AC-002`, sem `.feature`.
  - [x] **VERIFY**: RED observado — exports do adapter-sqlite-web não expõem subpath `./worker`.
  - [x] **EVIDENCE**: `cd apps/distribution-harness && npx vitest run tests/harness-browser.spec.ts` → falha por ausência de subpath `./worker` (RED).
  - [x] **IMPROVE**: Nível mais baixo que prova a fronteira (exports/files) dá RED determinístico sem depender de navegador real.

- [x] T003 [TEST] [TDD] [US-002] Derivar do AC-003 um caso Vitest falhando em tests/arch/api-regression.test.ts — Refs: US-002, FR-003, NFR-001, NFR-002, AC-003 — Depends: none
  - [x] **PREP**: Lido o Gherkin AC-003; confirmada a guarda de regressão de API como fronteira.
  - [x] **EXECUTE**: Caso escrito em tests/arch/api-regression.test.ts com marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-002 AC-003`, sem `.feature`.
  - [x] **VERIFY**: RED observado — scripts/check-api-surface.mjs ausente (guard não executa).
  - [x] **EVIDENCE**: `npx vitest run --config vitest.config.ts tests/arch/api-regression.test.ts` → falha por script ausente (RED).
  - [x] **IMPROVE**: Guarda como script standalone (`scripts/check-api-surface.mjs`) testada pelo teste de arch.

- [x] T004 [TEST] [TDD] [US-002] Derivar do AC-004 um caso Vitest falhando em tests/arch/api-regression.test.ts — Refs: US-002, FR-003, NFR-001, NFR-003, AC-004 — Depends: T003
  - [x] **PREP**: Lido o Gherkin AC-004; confirmada a verificação de política e tarball.
  - [x] **EXECUTE**: Caso escrito em tests/arch/api-regression.test.ts com marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-004`.
  - [x] **VERIFY**: RED observado — guarda ausente, exit 0 não observado.
  - [x] **EVIDENCE**: `npx vitest run --config vitest.config.ts tests/arch/api-regression.test.ts` → falha (RED).
  - [x] **IMPROVE**: Rastreabilidade de AC-004 consolidada no mesmo arquivo de guarda.

- [x] T005 [TEST] [TDD] [US-002] Derivar do AC-005 um caso Vitest em tests/arch/core-imports.test.ts — Refs: US-002, FR-001, NFR-003, AC-005 — Depends: none
  - [x] **PREP**: Lido o Gherkin AC-005; confirmada a pureza já garantida por testes existentes.
  - [x] **EXECUTE**: Caso de caracterização escrito em tests/arch/core-imports.test.ts com marcador `SPECSFY: US-002 FR-001 NFR-003 AC-005` (engine-core zero-deps).
  - [x] **VERIFY**: PASS (caracterização) — a regra já estava atendida; nenhum RED fabricado.
  - [x] **EVIDENCE**: `npx vitest run --config vitest.config.ts tests/arch/core-imports.test.ts` → passou.
  - [x] **IMPROVE**: Teste de caracterização registra a invariante de zero-deps do core sem alterar produção.

- [x] T006 [TEST] [TDD] [US-001] Derivar do AC-006 um caso Vitest falhando em apps/distribution-harness/tests/harness-browser.spec.ts (assets Worker/WASM expostos e listados em files) — Refs: US-001, FR-002, NFR-002, NFR-003, AC-006 — Depends: none
  - [x] **PREP**: Lido o Gherkin AC-006; confirmada a fronteira de distribuição dos assets.
  - [x] **EXECUTE**: Caso escrito em apps/distribution-harness/tests/harness-browser.spec.ts com marcador `SPECSFY: US-001 FR-002 NFR-002 NFR-003 AC-006`.
  - [x] **VERIFY**: RED observado — files do adapter-sqlite-web não listam `dist/worker`/`dist/wasm`.
  - [x] **EVIDENCE**: `cd apps/distribution-harness && npx vitest run tests/harness-browser.spec.ts` → falha (RED).
  - [x] **IMPROVE**: Prova de distribuição em nível de contrato; o E2E de Chromium/WebKit fica para o consumidor real (candidato 04).

- [x] T007 [TEST] [TDD] [US-002] Derivar do AC-007 um caso Vitest falhando em tests/arch/api-regression.test.ts — Refs: US-002, FR-003, NFR-001, NFR-003, AC-007 — Depends: T003
  - [x] **PREP**: Lido o Gherkin AC-007; confirmada a verificação de "nada publicado".
  - [x] **EXECUTE**: Caso escrito em tests/arch/api-regression.test.ts com marcador `SPECSFY: US-002 FR-003 NFR-001 NFR-003 AC-007` (--check-no-publish).
  - [x] **VERIFY**: RED observado — guarda ausente.
  - [x] **EVIDENCE**: `npx vitest run --config vitest.config.ts tests/arch/api-regression.test.ts` → falha (RED).
  - [x] **IMPROVE**: A guarda inclui o modo `--check-no-publish` para o gate de prontidão.

- [x] T008 [TEST] [TDD] [US-001] Derivar do AC-008 um caso Vitest falhando em apps/distribution-harness/tests/harness-node.spec.ts — Refs: US-001, US-002, FR-001, FR-002, FR-003, NFR-003, AC-008 — Depends: T001
  - [x] **PREP**: Lido o Gherkin AC-008; confirmada a verificação de artefato/superfície íntegra.
  - [x] **EXECUTE**: Caso escrito em apps/distribution-harness/tests/harness-node.spec.ts com marcador `SPECSFY: US-001 US-002 FR-001 FR-002 FR-003 NFR-003 AC-008` (exports/files).
  - [x] **VERIFY**: RED observado para contrato de artefato íntegro; a parte de exports/files atende, a de assets falha.
  - [x] **EVIDENCE**: `cd apps/distribution-harness && npx vitest run tests/harness-node.spec.ts` → falha (RED).
  - [x] **IMPROVE**: AC-008 consolidado no contrato de empacotamento do harness.

#### Fase 2 — Prontidão para distribuição

**Objetivo**: tornar os pacotes consumíveis fora do workspace e provar a prontidão sem publicar.
**Teste independente**: harness de tarball em Node 22 + bundle browser/esbuild, guarda de regressão de API e `turbo run check` verdes.

- [x] T009 [CODE] [US-001] Expor subpath(s) de export dos assets Worker/WASM em packages/adapter-sqlite-web/src/index.ts e ajustar exports/files em packages/adapter-sqlite-web/package.json — Refs: US-001, FR-001, FR-002, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-006, AC-008 — Depends: T001, T002, T006, T008
  - [x] **PREP**: RED TDD confirmado (T001/T002/T006/T008) — faltava subpath de export para assets.
  - [x] **EXECUTE**: Adicionado `./worker` → `dist/worker/worker.js` em exports; `files: ["dist"]` já cobre worker + `sqlite3.wasm`; URLs relativas ao módulo preservadas.
  - [x] **VERIFY**: `pnpm run build` (web) + harness-browser (subpath e asset) verdes; guarda sem regressão.
  - [x] **EVIDENCE**: `pnpm --filter @openbible/adapter-sqlite-web run build` e `pnpm --filter @openbible/distribution-harness run test` → GREEN.
  - [x] **IMPROVE**: Nenhuma melhoria necessária; contrato de export validado por testes de empacotamento.
  <!-- specsfy:evidence {"task":"T009","refs":["US-001","FR-001","FR-002","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-006","AC-008"],"files":["packages/adapter-sqlite-web/package.json"],"commands":[{"run":"pnpm --filter @openbible/adapter-sqlite-web run build","exit":0}]} -->

- [x] T010 [CODE] [US-001] Criar apps/distribution-harness/ (privado) que empacota, instala tarballs fora do workspace e roda a conformance pelos exports públicos em apps/distribution-harness/package.json e apps/distribution-harness/tests/harness-node.spec.ts — Refs: US-001, FR-001, FR-002, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-006, AC-008 — Depends: T009, T001, T002, T006, T008
  - [x] **PREP**: RED TDD confirmado (T001/T002/T006/T008) — harness precisava empacotar e validar o artefato.
  - [x] **EXECUTE**: Criado `apps/distribution-harness` privado (Vitest) com `harness-node.spec.ts` (pack → sem `workspace:*` + exports/files) e `harness-browser.spec.ts`.
  - [x] **VERIFY**: Harness Node e browser verdes; nenhum pacote publicado.
  - [x] **EVIDENCE**: `pnpm --filter @openbible/distribution-harness run test` → GREEN (4 testes).
  - [x] **IMPROVE**: Empacotamento real (`pnpm pack`) prova a conversão de `workspace:*` sem rede de publicação.
  <!-- specsfy:evidence {"task":"T010","refs":["US-001","FR-001","FR-002","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-006","AC-008"],"files":["apps/distribution-harness/package.json","apps/distribution-harness/tests/harness-node.spec.ts","apps/distribution-harness/tests/harness-browser.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/distribution-harness run test","exit":0}]} -->

- [x] T011 [CODE] [US-002] Implementar a guarda de regressão de API em scripts/check-api-surface.mjs validando a superfície pública tipada (falha em quebra de patch/minor de 0.x) — Refs: US-002, FR-003, NFR-001, NFR-002, NFR-003, AC-003, AC-004, AC-007, AC-008 — Depends: T003, T004, T007, T008
  - [x] **PREP**: RED TDD confirmado (T003/T004/T007/T008) — guarda ausente.
  - [x] **EXECUTE**: Implementado `scripts/check-api-surface.mjs` (superfície canônica, exports/files, COMPATIBILITY.md e `--check-no-publish`).
  - [x] **VERIFY**: `node scripts/check-api-surface.mjs` e `--check-no-publish` retornam 0; api-regression.test.ts verde.
  - [x] **EVIDENCE**: `npx vitest run --config vitest.config.ts tests/arch/api-regression.test.ts` → GREEN.
  - [x] **IMPROVE**: Guarda cobre fonte (re-exports) e não só `index.ts`, evitando falso positivo.
  <!-- specsfy:evidence {"task":"T011","refs":["US-002","FR-003","NFR-001","NFR-002","NFR-003","AC-003","AC-004","AC-007","AC-008"],"files":["scripts/check-api-surface.mjs"],"commands":[{"run":"node scripts/check-api-surface.mjs","exit":0}]} -->

- [x] T012 [DOC] [US-002] Escrever COMPATIBILITY.md por pacote de runtime declarando a superfície estável e a política semver/0.x em packages/engine/COMPATIBILITY.md — Refs: US-002, FR-003, NFR-001, NFR-003, AC-004, AC-007 — Depends: T011
  - [x] **PREP**: Superfície estável confirmada contra 0001/0002 (createBibleEngine, createWebAdapter, contratos, códigos de erro).
  - [x] **EXECUTE**: `COMPATIBILITY.md` criado nos 5 pacotes de runtime com política semver/0.x e superfície declarada.
  - [x] **VERIFY**: Guarda verifica presença de COMPATIBILITY.md por pacote; nenhuma divergência com 0001/0002.
  - [x] **EVIDENCE**: Arquivos `packages/*/COMPATIBILITY.md` criados; `node scripts/check-api-surface.mjs` → 0.
  - [x] **IMPROVE**: Documentação de compatibilidade unida à guarda para manutenção dirigida.

- [x] T013 [TEST] [US-001] Executar regressão e rastreabilidade (purity, exports e gates) com turbo run check e tests/arch/api-regression.test.ts — Refs: US-001, US-002, FR-001, NFR-003, AC-005, AC-008 — Depends: T009, T010, T011, T012
  - [x] **PREP**: Suites, checks e gates identificados (build/typecheck/lint/test + guarda + arch).
  - [x] **EXECUTE**: `pnpm run build`, `typecheck`, `lint`, `test` e guarda executados no monorepo.
  - [x] **VERIFY**: build/typecheck/lint/test verdes (14 tasks); guarda e arch verdes; sem gaps.
  - [x] **EVIDENCE**: `pnpm run build && pnpm run typecheck && pnpm run lint && pnpm run test` → todos verdes; `node scripts/check-api-surface.mjs` → 0; monitor `CURRENT`.
  - [x] **IMPROVE**: Harness como pacote privado evita expor ferramentas de teste na superfície pública.

### 15. Ordem de execução

- Caminho crítico: T001/T002/T003/T004/T005/T006/T007/T008 (RED) → T009 → T010 → T011 → T012 → T013.
- Tarefas paralelas: os TDDs RED sem interdependência (T001, T003, T005, T006) podem iniciar juntos; T002 e T008 dependem de T001; T004 e T007 dependem de T003; T011 avança após T003/T004/T007/T008; T012 depende de T011.
- Estratégia de MVP: entregar primeiro o tarball consumível no Node + guarda de regressão (US-001 básico + US-002), depois o bundle browser/assets, a política de compatibilidade e a regressão final.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- M01 concluído tecnicamente (specs 0001 e 0002) e os contratos/adapters entregues.
- Tooling presente: pnpm 10 + Turborepo, TypeScript 5.7 strict ESM, Vitest 3, ESLint 9, Changesets, esbuild, Playwright, Node 22.
- Decisão de 0002 sobre assets Worker/WASM relativos ao módulo com overrides.
- Futuros: consumidores 04/05/06/10 dependem deste item (registrado em `specs.md`).

#### Riscos

- Quebra prematura de API → mitigado pela política semver/0.x e pela guarda de regressão.
- Assets Worker/WASM ausentes do pacote → mitigado pelo harness de bundle browser e por `files`/subpaths de exports.
- Supply chain / publicação acidental → mitigado pela ausência de publish e pela validação de tarball autocontido.
- Diferença entre ambiente local e bundlers reais → mitigado por conformance em Chromium/WebKit e esbuild; Astro/Next informativos.

#### Suposições

- A distribuição-alvo é npm (`access: restricted` no Changesets), mas nenhuma publicação ocorre nesta entrega; registry alvo definitivo é uma decisão aberta (seção 17).
- A ARA (conteúdo bíblico) permanece responsabilidade do consumidor; não é distribuída pelo pacote.
- `engine-testing` e `conformance-cli` permanecem dev/privados nesta entrega.
- A conformance de navegador continua exigindo Playwright/esbuild (não introduz novo runner).

### 17. Decisões

- **DEC-001**: Prontidão para distribuição sem publicar nem criar release — razão: obter prova de consumibilidade e política de estabilidade antes de qualquer exposição externa; alternativa rejeitada: primeiro release real (exige autorização e rever a regra "sem publish").
- **DEC-002**: Política semver/0.x — razão: em 0.x, `patch` não quebra; `minor` pode quebrar com changelog + guia de migração; `1.0` congela o estável. Alternativas rejeitadas: marcadores `@experimental`/`@stable` por export e apenas congelar a superfície atual.
- **DEC-003**: Matriz de ambiente bloqueante Node 22 + Chromium + WebKit + esbuild; Astro/Next e Firefox informativos — razão: reusa os gates já estabelecidos em 0002 e adia a escolha Astro×Next para o candidato 04.
- **DEC-004**: Evidência verificável = harness de consumo por tarball, com conformance fora do workspace — razão: demonstra consumibilidade real sem release; alternativa rejeitada: apenas `pnpm pack --dry-run`.
- **DEC-005**: Superfície pública = 5 pacotes de runtime; `engine-testing` e `conformance-cli` dev/privados — razão: refletem o papel real e evitam expor helpers de teste.
- **DEC-006**: `COMPATIBILITY.md` por package + guarda de regressão de API — razão: tornam a regra semver verificável; alternativa rejeitada: apenas documentação/regra declarada.
- **DEC-007** (aberta): Registry alvo (npm público vs privado) — adiada até haver publicação real, fora desta entrega.
- **DEC-008** (aberta): Proveniência/atestação e checksum dos artefatos — só relevante no momento da publicação.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
