# Especificação integrada: Consumer Web/PWA de referência em Next.js

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0004 |
| Slug | 0004-consumer-web-pwa-de-referencia-em-next-js |
| Status | Implementing |
| Effort | 6 |
| Effort updated at | 2026-08-27 |
| Effort rationale | Primeira UI do monorepo (Next.js App Router + React + Tailwind + shadcn/ui + ReUI + PWA), com Biblioteca/Leitor/Busca offline-first; perfil standard-alto. |
| ClickUp Task | |
| Milestones | M02 (proposto; ainda sem arquivo de milestone) |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | In Progress |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-27 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

A engine está pronta como biblioteca headless e distribuível (SPEC-0001/0002/0003), com o `adapter-sqlite-web` funcional (Worker + SQLite WASM + OPFS), mas não existe aplicação real que prove integração de bundler, assets Worker/WASM, lifecycle PWA e operação offline. O monorepo não tem nenhuma UI; a equipe Web precisa de um consumer de referência que valide a migração strangler sem duplicar regras de negócio.

#### Resultado desejado

Um consumer **Next.js** em `apps/consumer-web` (React + Tailwind + shadcn/ui + ReUI + `next-pwa`), instalável como PWA, offline-first via OPFS, com **Biblioteca** (instalar/remover Bíblias), **Leitor** (navegação de livros/capítulos e versículos ordenados) e **Busca** (todas as versões instaladas, marcadas por Bíblia), consumindo apenas os exports públicos da engine.

#### Métricas de sucesso

- Consumer no monorepo (`apps/consumer-web`) compila e os 3 fluxos (Biblioteca, Leitor, Busca) funcionam contra o adapter web real por conformance de browser (Chromium/WebKit).
- O app permanece funcional offline após o primeiro acesso com uma Bíblia instalada (operação via OPFS + service worker).
- Nenhuma regra de parser/leitura/busca implementada no consumer (tudo via `createBibleEngine`/`createWebAdapter`).
- PWA instalável (manifest + service worker via `next-pwa`).

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: O monorepo possui alguma UI/stack React? → Não; `INTERFACE.md` declara "Há interface para pessoas: Não" e o único app é o `conformance-cli` (CLI Node). Impacto: esta é a primeira UI; não há telas a preservar, apenas o legado `/home/claudio/Projects/open-bible/apps/web` como referência de comportamento (somente leitura).
- **R-002**: Stack do legado Web (referência da migração)? → Next.js + React + Tailwind + shadcn + PWA (`@ducanh2912/next-pwa`) + `@sentry/nextjs`. Impacto: Next.js reduz a fricção da migração strangler; decisão já confirmada no refinamento (Pergunta 1).
- **R-003**: Engine expõe a superfície necessária? → `createBibleEngine` (`listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`, `parseReference`) e `createWebAdapter` (+ assets `./worker`). Impacto: o consumer consome só exports públicos; sem duplicação.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193948-consumer-web-pwa-de-referencia-em-astro-ou-next-js.md` — captura de origem.
- `specs/backlog/0004-consumer-web-pwa-de-referencia-em-next-js.md` — backlog refinado (brief).
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — `createWebAdapter`, assets `./worker`, OPFS.
- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` — `createBibleEngine`, guarda, `COMPATIBILITY.md`.
- `INTERFACE.md`, `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`, `PROJECT.md`.
- Legacy (somente leitura): `/home/claudio/Projects/open-bible/apps/web`.

#### Documentação consultada

- Next.js (App Router, Server/Client Components) — `https://nextjs.org/docs` (referência; sem cópia).
- `next-pwa` — `https://github.com/shadowwalker/next-pwa` (referência; sem cópia).
- shadcn/ui e ReUI — primitives/composições (já instalados no núcleo do setup).

#### Artefatos de pesquisa armazenados

- Nenhum artefato externo novo; fontes são públicas e consultadas como referência. Primitives/composições de UI seguem `INTERFACE.md` e `DESIGNSYSTEM.MD`.

#### Dúvidas respondidas

- **Q**: O consumer duplica regras de negócio? → **A**: Não; delega à engine pelos exports públicos (`DEC-004`).
- **Q**: PWA com downloads em segundo plano? → **A**: Não nesta entrega; aparência e offline-first provados por cache de app shell + OPFS.

#### Dúvidas abertas

- Nenhuma lacuna material para o Definition Gate; detalhes finos de composição/estados ficam na seção 10 e em `INTERFACE.md`/`DESIGNSYSTEM.MD`.

### 3. Escopo e atores

#### Incluído

- `apps/consumer-web` (Next.js App Router + React + Tailwind + shadcn/ui + ReUI + `next-pwa`).
- Biblioteca (instalar/remover Bíblias; estados instalada/disponível/instalando).
- Leitor (navegação de livros/capítulos; versículos ordenados).
- Busca (todas as versões instaladas, marcadas por Bíblia, com limite).
- Offline-first via OPFS + PWA instalável (manifest + service worker) com cache de app shell e assets Worker/WASM.
- Origem de dados: fixture local embarcada (SQLite legada) + `adapter-http` configurável.
- `INTERFACE.md` atualizado com blocos ReUI/shadcn e `docs/` via documentator.

#### Fora de escopo

- Personal Study (notas/destaques), Sync/Turso, API pública remota, autenticação/contas.
- UI de outras plataformas (TUI, desktop Native SDK, React Native).
- Publicação npm, push/PR/remoto, alteração do legado (`/home/claudio/Projects/open-bible`).
- Downloads de Bíblia em segundo plano com fila/progresso persistente.

#### Atores

- **[Usuário da PWA]**: instala/remove Bíblias, lê capítulos e busca versículos offline; beneficia-se de operação sem rede e da leitura canônica.
- **[Equipe Web Open Bible]**: usa o consumer para validar a integração real da engine e a migração strangler, sem duplicar regras.
- **[Agente de Conformance]**: executa a conformance de browser (Playwright Chromium/WebKit) provando os fluxos.

### 4. Princípios e restrições do projeto

- **PR-001**: O consumer consome somente exports públicos da engine (`createBibleEngine`/`createWebAdapter`); nunca importa `src/` interno nem duplica regra de parser/leitura/busca.
- **PR-002**: `engine-core`/`engine` permanecem puros e não mudam para servir a UI.
- **PR-003**: A interface é composta por blocos React: shadcn/ui (primitives) + ReUI (`@reui/c-*`) + blocos próprios; a página/rota obtém dados e compõe, não concentra grade/formulário/filtros/overlays.
- **PR-004**: CRUD declarado usa DataGrid/List (Biblioteca), Filters/Form (busca) e Dialog/Sheet para ações; estados ReUI aplicáveis registrados.
- **PR-005**: Assets Worker/WASM continuam relativos ao módulo com overrides; nada depende de caminho fixo em `public/` (decisão de 0002).
- **PR-006**: A operação offline é garantia, não fallback: sem rede após o primeiro acesso o consumer permanece funcional.
- **PR-007**: A Bíblia embarcada/local é responsabilidade do consumidor (ARA não é distribuída pela engine).

### 5. Histórias de usuário

#### US-001 — Instalar e remover Bíblias (P1)

Como usuário da PWA, quero instalar e remover Bíblias na Biblioteca para poder ler offline.

**Por que P1**: sem uma Bíblia instalada, leitura e busca offline não existem; é a base da jornada.
**Teste independente**: a Biblioteca reflete instalar/remover e persiste via OPFS (verificável por conformance de browser).
**Requisitos**: FR-001, FR-004, NFR-001, NFR-002, NFR-004.

#### US-002 — Ler um capítulo navegando livros/capítulos (P1)

Como usuário da PWA, quero ler um capítulo navegando entre livros e capítulos de uma Bíblia instalada.

**Por que P1**: a leitura é o propósito central do produto.
**Teste independente**: abrir `/ler/[versao]/[livro]/[capitulo]` exibe versículos em ordem canônica.
**Requisitos**: FR-002, FR-004, NFR-001, NFR-002, NFR-005.

#### US-003 — Buscar versículos em todas as versões instaladas (P2)

Como usuário da PWA, quero buscar versículos em todas as versões instaladas, com a origem marcada.

**Por que P2**: aprimora a descoberta mas depende de ao menos uma Bíblia instalada.
**Teste independente**: a busca retorna resultados de todas as versões instaladas com a Bíblia de origem.
**Requisitos**: FR-003, NFR-002, NFR-003, NFR-005.

#### US-004 — Usar o app como PWA instalável e offline (P2)

Como usuário da PWA, quero instalar o app e usá-lo offline após o primeiro acesso.

**Por que P2**: valida a entrega PWA, mas depende dos fluxos acima estarem funcionando.
**Teste independente**: com rede removida e uma Bíblia instalada, o app recarregado continua funcional.
**Requisitos**: FR-001, FR-002, FR-004, NFR-001, NFR-003, NFR-004.

### 6. Cenários BDD de aceite

#### AC-001 — Biblioteca instala e remove uma Bíblia com persistência (caminho feliz)

**Cobre**: US-001, US-004, FR-001, FR-004, NFR-001, NFR-004

```gherkin
@US-001 @US-004 @FR-001 @FR-004 @NFR-001 @NFR-004 @AC-001
Feature: Consumer Web/PWA de referência

  Scenario: Instala e remove uma Bíblia
    Given o app aberto com uma Bíblia disponível não instalada e uma instalada
    When a pessoa instala a disponível e remove a instalada
    Then a Biblioteca reflete a mudança, o OPFS persiste a versão e o app segue offline
```

#### AC-002 — Leitor exibe capítulo na ordem canônica (variação)

**Cobre**: US-002, FR-002, FR-004, NFR-001, NFR-002, NFR-005

```gherkin
@US-002 @FR-002 @FR-004 @NFR-001 @NFR-002 @NFR-005 @AC-002
Feature: Consumer Web/PWA de referência

  Scenario: Abre um capítulo pela rota
    Given uma Bíblia instalada
    When a pessoa navega até /ler/[versao]/[livro]/[capitulo]
    Then os versículos aparecem em ordem canônica e a navegação de livros/capítulos funciona
```

#### AC-003 — Busca retorna de todas as versões instaladas (variação)

**Cobre**: US-003, FR-003, NFR-002, NFR-005

```gherkin
@US-003 @FR-003 @NFR-002 @NFR-005 @AC-003
Feature: Consumer Web/PWA de referência

  Scenario: Busca em múltiplas versões
    Given duas Bíblias instaladas
    When a pessoa busca um termo em /busca
    Then os resultados vêm de todas as versões instaladas, marcados por Bíblia, com limite
```

#### AC-004 — PWA funciona offline após o primeiro acesso (falha/limite)

**Cobre**: US-004, FR-004, NFR-001, NFR-004

```gherkin
@US-004 @FR-004 @NFR-001 @NFR-004 @AC-004
Feature: Consumer Web/PWA de referência

  Scenario: Recarrega offline
    Given o app acessado uma vez online com uma Bíblia instalada
    When a rede é removida e o app é recarregado
    Then o app shell, o Worker/WASM e a Bíblia continuam disponíveis sem rede
```

#### AC-005 — Sem duplicação de regras de negócio (variação)

**Cobre**: US-001, US-002, US-003, FR-003, NFR-002

```gherkin
@US-001 @US-002 @US-003 @FR-003 @NFR-002 @AC-005
Feature: Consumer Web/PWA de referência

  Scenario: Consumer delega regras à engine
    Given o consumer composto com a engine
    When a leitura e a busca são exercitadas
    Then nenhuma regra de parser/leitura/busca vive na aplicação (tudo via exports públicos)
```

#### AC-006 — Estados vazio/loading/erro + teclado (material)

**Cobre**: US-001, US-003, FR-001, FR-003, NFR-003, NFR-005

```gherkin
@US-001 @US-003 @FR-001 @FR-003 @NFR-003 @NFR-005 @AC-006
Feature: Consumer Web/PWA de referência

  Scenario: Estados de interface e teclado
    Given a Biblioteca sem Bíblias, uma busca sem termo e uma instalação com erro tipado
    When a pessoa navega por teclado e dispara as ações
    Then estados vazio/loading/erro são claros e o foco/teclado funcionam
```

#### AC-007 — Falha de instalação preserva a versão anterior (falha/limite)

**Cobre**: US-001, FR-001, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @NFR-001 @NFR-003 @AC-007
Feature: Consumer Web/PWA de referência

  Scenario: Instalação interrompida
    Given uma versão instalada e uma instalação que falha
    When a instalação inválida/interrompida é tentada
    Then nenhuma versão parcial é utilizável e a instalação anterior permanece
```

#### AC-008 — Offline sem Bíblia instalada → estado vazio (falha/limite)

**Cobre**: US-004, FR-002, FR-004, NFR-001, NFR-003

```gherkin
@US-004 @FR-002 @FR-004 @NFR-001 @NFR-003 @AC-008
Feature: Consumer Web/PWA de referência

  Scenario: Usa offline sem Bíblia
    Given o app offline e sem nenhuma Bíblia instalada
    When a pessoa tenta ler
    Then um estado vazio orienta a instalar antes do uso offline
```

#### AC-009 — Biblioteca reflete estados instalada/disponível (variação)

**Cobre**: US-001, US-002, FR-001, FR-002, NFR-004

```gherkin
@US-001 @US-002 @FR-001 @FR-002 @NFR-004 @AC-009
Feature: Consumer Web/PWA de referência

  Scenario: Estados na Biblioteca
    Given Bíblias instaladas e disponíveis
    When a Biblioteca é renderizada
    Then cada item indica instalada/disponível/instalando e permite a ação correspondente
```

### 7. Requisitos

#### Funcionais

- **FR-001**: A Biblioteca deve listar Bíblias instaladas e disponíveis e permitir instalar e remover, refletindo os estados e persistindo via OPFS.
- **FR-002**: O Leitor deve navegar entre livros e capítulos de uma Bíblia instalada e exibir os versículos em ordem canônica na rota `/ler/[versao]/[livro]/[capitulo]`.
- **FR-003**: A Busca deve retornar versículos de todas as versões instaladas, marcando a Bíblia de origem e aplicando limite explícito.
- **FR-004**: O app deve ser instalável como PWA (manifest + service worker) e cachear o app shell e os assets Worker/WASM, permanecendo funcional offline após o primeiro acesso.

#### Não funcionais

- **NFR-001**: Offline-first via OPFS — o app funciona sem rede após o primeiro acesso com uma Bíblia instalada. **Verificação**: conformance de browser (Playwright, Chromium/WebKit) com rede desligada.
- **NFR-002**: Sem duplicação de regra de negócio — consumo apenas via exports públicos; nenhum parser/leitura/busca na aplicação; `engine-core`/`engine` puros. **Verificação**: inspeção de imports e testes de fronteira.
- **NFR-003**: Acessibilidade e estados — navegação por teclado e foco visível; estados vazio/loading/erro/offline claros e anunciados. **Verificação**: testes de interação e acessibilidade (keyboard/focus).
- **NFR-004**: Compatibilidade de browser — Chromium e WebKit bloqueantes; Firefox informativo. **Verificação**: conformance de browser com Playwright.
- **NFR-005**: Desempenho e limites — busca com limite explícito, leitura ordenada, bundle enxuto e sem copiar o banco para a thread principal. **Verificação**: testes de contrato e limite de resultados.

#### Erros e casos-limite

- Versão não instalada ao abrir o leitor → navegação de volta à Biblioteca com feedback (`version_not_installed`).
- Instalação falha/interrompida → sem versão parcial utilizável; preserva a instalação anterior.
- Sem OPFS/Worker/WASM → erro público estável da engine (não simular persistência em memória).
- Offline sem Bíblia instalada → estado vazio orientando a instalar antes de usar offline.
- Busca vazia/sem termo → estado vazio com orientação; limite aplicado.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

Monorepo pnpm/Turborepo/TS strict ESM sem frontend (o único app é o `conformance-cli`). A engine é distribuída via `@openbible/engine`/`@openbible/adapter-sqlite-web` (Worker + SQLite WASM + OPFS; assets `./worker` relativos ao módulo). Node 22, Vitest, ESLint, Playwright. `INTERFACE.md`/`DESIGNSYSTEM.MD` ainda sem UI.

#### Arquitetura e módulos

- **App**: `apps/consumer-web` — Next.js (App Router) + TS + Tailwind + shadcn/ui + ReUI + `next-pwa`.
- **Provider da engine**: um contexto client (`src/engine/bible-engine-provider.tsx`) que instancia `createWebAdapter` (com `workerUrl`/`wasmUrl`/overrides) e `createBibleEngine` uma única vez, exposto via hook `useBibleEngine()`. Sempre **Client Component** (OPFS/Worker não existem no servidor).
- **Feature components**: `src/features/library/*`, `src/features/reader/*`, `src/features/search/*` — Client Components que consomem o provider.
- **Páginas**: `src/app/page.tsx` (Biblioteca), `src/app/ler/[versao]/[livro]/[capitulo]/page.tsx`, `src/app/busca/page.tsx` — compõem os features (páginas apenas compõem).
- **PWA**: `next.config.mjs` com `next-pwa` (manifest + service worker), cacheando app shell e assets Worker/WASM; configurações de overrides de URL do worker.
- **Fixtures e origem remota**: asset SQLite legada reutilizável (de 0001/0002) para testes/offline determinístico; `adapter-http` configurável via env para download real direto do bucket público Cloudflare R2 em `https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles/{ARQUIVO}.sqlite`, com proxy HTTP opcional.

#### Migrations

- Não aplicável — nenhum schema/bando gerenciado pela aplicação; persistência de Bíblias/registry é do adapter web (OPFS), definida nas SPEC-0001/0002.

#### Models

- Não aplicável — o consumer não cria modelos de domínio; usa os contratos públicos (`InstalledBible`, `Verse`, etc.) da engine.

#### Controllers e casos de uso

- Os "casos de uso" são os métodos da engine (`installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses`); o consumer chama-os via `useBibleEngine()` e apresenta. Nenhum controller de aplicação novo.

#### Views e experiência

- Ver seção 10: três telas (Biblioteca, Leitor, Busca) com estados loading (Skeleton), vazio (EmptyState), erro (EngineError → mensagem), offline (banner) e sucesso; acessíveis por teclado.

#### Queries e repositórios

- Nenhum repositório novo; consultas à engine via adapter (OPFS). Busca com limite explícito.

#### Jobs e processamento assíncrono

- Não aplicável — nenhum job/worker de aplicação; o Worker do OPFS é do adapter web (engine).

#### Estrutura de arquivos

```text
apps/consumer-web/
  package.json                 # next, react, tailwind, shadcn/ui, ReUI, next-pwa
  next.config.mjs              # App Router + next-pwa (manifest/registro do SW)
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  vitest.config.ts             # componentes + lógica (Vitest)
  playwright.config.ts         # conformance Chromium/WebKit
  src/app/layout.tsx           # shell + provider da engine
  src/app/page.tsx             # Biblioteca
  src/app/ler/[versao]/[livro]/[capitulo]/page.tsx
  src/app/busca/page.tsx
  src/app/manifest.ts          # PWA manifest (App Router metadata)
  src/engine/bible-engine-provider.tsx
  src/features/library/AppLibrary.tsx
  src/features/reader/Reader.tsx
  src/features/search/Search.tsx
  src/components/ui/*          # primitives shadcn/ui (button, card, input, badge, dialog, table, skeleton)
  src/components/reui/*        # composições ReUI (@reui/c-*)
  src/types.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| — | — | Não aplicável — a aplicação não define entidades persistentes novas; Bíblias instaladas e registry são do adapter web (OPFS, specs 0001/0002). Preferências leves (ex.: última leitura) podem usar `localStorage`, sem evoluir `.specsfy/DATABASE.md`. | — |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| — | — | Não aplicável | — | — |

#### Migração e retenção

- Não aplicável — sem novo schema/banco da aplicação; retenção das Bíblias é do OPFS (engine).

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — o consumer é a primeira UI do produto (Next.js + React + Tailwind + shadcn/ui + ReUI), usada por pessoas para ler e buscar a Bíblia offline.

#### Stack e convenções de interface

- Framework: Next.js App Router; componentes React; Client Components nas features (OPFS/Worker é browser). Estilo: Tailwind CSS. Primitives: shadcn/ui. Composições: ReUI (`@reui/c-*`, apenas gratuitas). PWA: `next-pwa`. Testes: Vitest (componentes/lógica) + Playwright (conformance Chromium/WebKit). As features usam `use client` porque consomem a engine via Worker/OPFS. Não há telas existentes no monorepo a preservar; o legado `/home/claudio/Projects/open-bible/apps/web` é referência de comportamento (somente leitura).

#### Telas e responsabilidades

- **Biblioteca** (`/`): gerencia Bíblias; pessoa que a usa: usuário da PWA; tarefa: instalar/remover e iniciar leitura; entrada: versões disponíveis/instaladas; saída: lista com estados e ações.
- **Leitor** (`/ler/[versao]/[livro]/[capitulo]`): ler capítulos; tarefa: navegar livros/capítulos e ver versículos; entrada: parametros da rota; saída: texto canônico + navegação.
- **Busca** (`/busca`): buscar versículos; tarefa: informar termo e ver resultados; entrada: campo de busca; saída: resultados marcados por Bíblia.

#### Fluxo de informação e navegação

- Breadcrumb da biblioteca para o leitor e para a busca. A pessoa chega pela Biblioteca (home), instala uma Bíblia e navega até o Leitor; a partir do Leitor pode ir à Busca. `Breadcrumb`: `openbible-engine → Consumer Web → {Biblioteca|Leitor|Busca}`; links válidos nos itens anteriores e o item atual marcado como página ativa.

#### Menus e navegação principal

- App bar simples com navegação por links: `Biblioteca` (Home) e `Busca`; no Leitor, o breadcrumb e os controles de livro/capítulo. Não há menu multifuncional; a navegação direta por links é suficiente para uma PWA de referência. Comportamento responsivo: no mobile, itens de navegação compactos e acessíveis por toque.

#### Formulários e ações

- **Busca**: campo de input + botão de busca; validação de termo (não vazio), limite aplicado; ação via rota `/busca`. Padrão: página própria (não modal/painel).
- **Instalar/remover**: ação inline no card da Biblioteca (Button) com estado instalar/removendo; feedback de sucesso/erro. Padrão: inline, sem modal (decisão do refinamento).
- Auxílio/erro: mensagens de erro da engine traduzidas (`version_not_installed`, `storage_unavailable`, etc.).

#### Composição e disposição

- Shell: header (app bar) + região principal + (opcional) footer. Biblioteca: lista de cards (DataGrid/List) com filtro/estado; Leitor: navegação de capítulos + conteúdo; Busca: form + lista de resultados. Responsivo; densidade adequada à leitura.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Biblioteca | AppLibrary | Lista de Bíblias instaladas/disponíveis com ações | `src/features/library/AppLibrary.tsx` | List/DataGrid (`@reui/c-list`), filtrar estados | ReUI | Novo — primeira UI |
| Biblioteca | VersionCard | Card de uma versão com estado e ação | `src/features/library/VersionCard.tsx` | Card + Badge + Button + Skeleton | shadcn/ui | Novo |
| Leitor | Reader | Conteúdo do capítulo + navegação | `src/features/reader/Reader.tsx` | Tabs (livros/capítulos) + Card | shadcn/ui + ReUI | Novo |
| Leitor | PrevNextNav | Navegação capítulo anterior/próximo | `src/features/reader/PrevNextNav.tsx` | Button (navegação) | shadcn/ui | Novo |
| Busca | SearchForm | Campo + submit com validação e limite | `src/features/search/SearchForm.tsx` | Form + Input + Button | shadcn/ui + ReUI | Novo |
| Busca | SearchResults | Lista de resultados marcados por Bíblia | `src/features/search/SearchResults.tsx` | List (`@reui/c-list`) + Badge | ReUI + shadcn/ui | Novo |
| Global | AppShell | Header/menu/navegação principal | `src/app/layout.tsx` + `src/components/AppShell.tsx` | Button + Badge + nav | shadcn/ui | Novo |

- A lista deve corresponder a `INTERFACE.md`; usar somente shadcn/ui (primitives) e composições ReUI gratuitas `@reui/c-*`; a página apenas compõe os blocos.

#### Estados e acessibilidade

- Loading: Skeleton em lista/conteúdo/resultados. Vazio: EmptyState (sem Bíblias, sem resultados, sem termo). Erro: mensagem por código de erro da engine. Sucesso: feedback de instalação/remoção. Offline: banner indicando operação offline.
- Teclado: navegação por Tab com foco visível; botões e links com `aria-label`; resultados anunciados; foco gerenciado em abrir conteúdos.

#### APIs expostas

- Nenhuma API de aplicação nova (o consumer é consume da engine). A rota `/ler/[versao]/[livro]/[capitulo]` é rota de UI, não API; a camada de dados é a engine via exports públicos.

#### APIs externas utilizadas

- `@openbible/adapter-http` (configurável) para download de Bíblias reais; `packageBaseUrl` aponta para o diretório público `/bibles` e `baseUrl` permanece disponível para catálogo/proxy HTTP; indisponibilidade → erro tipado da engine e fixture explícita somente em testes.

#### Documentação das APIs consultadas

- Ver seção 2; Next.js, `next-pwa`, shadcn/ui e ReUI como referências; sem cópia de conteúdo protegido.

#### Eventos e outros contratos

- Não aplicável — nenhum evento novo; contratos públicos da engine (`InstalledBible`, `Verse`, `SearchResult` etc.) permanecem.

### 11. Estratégia TDD

- **Unidade**: hooks e blocos de UI (provider da engine, VersionCard, SearchForm, SearchResults) — Vitest.
- **Integração/contrato**: `useBibleEngine()` compondo `createWebAdapter` + `createBibleEngine` (fakes do `engine-testing` no Node) — Vitest.
- **BDD/aceite**: Gherkin de referência `AC-001..AC-009` da seção 6.
- **Runner TDD**: Vitest (confirmado no projeto; Node sem PHP). Nível de browser: Playwright (Chromium/WebKit bloqueantes; Firefox informativo).
- **E2E**: conformance de browser (Playwright) cobrindo instalar→ler→buscar offline.
- **Verificação manual**: mínima (PWA install/manifest — itens de ambiente).

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, US-004, FR-001, FR-004, NFR-001, NFR-004, AC-001 | AC-001 (seção 6) | `apps/consumer-web/tests/library.spec.tsx` (marcador `SPECSFY: US-001 US-004 FR-001 FR-004 NFR-001 NFR-004 AC-001`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; Chromium instalar/remover e persistência local aprovados | Suite consumer e conformance Chromium |
| US-002, FR-002, FR-004, NFR-001, NFR-002, NFR-005, AC-002 | AC-002 (seção 6) | `apps/consumer-web/tests/reader.spec.tsx` (marcador `SPECSFY: US-002 FR-002 FR-004 NFR-001 NFR-002 NFR-005 AC-002`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; Chromium abriu Gênesis 1 e exibiu versículos ordenados | Suite consumer e conformance Chromium |
| US-003, FR-003, NFR-002, NFR-005, AC-003 | AC-003 (seção 6) | `apps/consumer-web/tests/search.spec.tsx` (marcador `SPECSFY: US-003 FR-003 NFR-002 NFR-005 AC-003`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; Chromium buscou e marcou ARA | Suite consumer e conformance Chromium |
| US-004, FR-004, NFR-001, NFR-004, AC-004 | AC-004 (seção 6) | `apps/consumer-web/tests/pwa.spec.ts` (marcador `SPECSFY: US-004 FR-004 NFR-001 NFR-004 AC-004`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Manifest, service worker, Worker/WASM e fixture entram no precache; Chromium aprovado | `pnpm run build` + conformance Chromium |
| US-001, US-002, US-003, FR-003, NFR-002, AC-005 | AC-005 (seção 6) | `apps/consumer-web/tests/boundary.test.ts` (marcador `SPECSFY: US-001 US-002 US-003 FR-003 NFR-002 AC-005`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; imports apenas por exports públicos | `pnpm run test:tdd` |
| US-001, US-003, FR-001, FR-003, NFR-003, NFR-005, AC-006 | AC-006 (seção 6) | `apps/consumer-web/tests/states.a11y.spec.tsx` (marcador `SPECSFY: US-001 US-003 FR-001 FR-003 NFR-003 NFR-005 AC-006`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; label, foco e alert verificados | `pnpm run test:tdd` |
| US-001, FR-001, NFR-001, NFR-003, AC-007 | AC-007 (seção 6) | `apps/consumer-web/tests/install-failure.spec.tsx` (marcador `SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-007`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; erro e retry preservados | `pnpm run test:tdd` |
| US-004, FR-002, FR-004, NFR-001, NFR-003, AC-008 | AC-008 (seção 6) | `apps/consumer-web/tests/offline-empty.spec.tsx` (marcador `SPECSFY: US-004 FR-002 FR-004 NFR-001 NFR-003 AC-008`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; estado vazio orienta instalação | `pnpm run test:tdd` |
| US-001, US-002, FR-001, FR-002, NFR-004, AC-009 | AC-009 (seção 6) | `apps/consumer-web/tests/library-states.spec.tsx` (marcador `SPECSFY: US-001 US-002 FR-001 FR-002 NFR-004 AC-009`) | Materializado após scaffold; histórico RED não foi capturado nesta retomada | Vitest 9/9; estados available/installed/installing/removing cobertos | `pnpm run test:tdd` |
| US-001, FR-001, NFR-001, AC-001 | AC-001 (seção 6) | `packages/adapter-http/src/__tests__/http-source.test.ts` (marcador `SPECSFY: US-001 FR-001 NFR-001 AC-001`) | RED: `packageBaseUrl` era rejeitado e o fallback tinha 3 versões | GREEN: URL R2, catálogo de 16 versões e fallback API cobertos | `pnpm --filter @openbible/adapter-http check` |
| US-001, FR-001, NFR-001, AC-001 | AC-001 (seção 6) | `apps/consumer-web/tests/library-source.spec.tsx` (marcador `SPECSFY: US-001 FR-001 NFR-001 AC-001`) | RED: Biblioteca tentava `/fixtures/ara.db` implicitamente | GREEN: ação delega a resolução remota à engine | `pnpm --filter @openbible/consumer-web check` |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001, AC-006, AC-007, AC-009 | Unidade + browser | `apps/consumer-web/tests/library*.spec.tsx` + `test:tdd` + Playwright | Passed em Vitest/Chromium |
| FR-002 | AC-002, AC-008, AC-009 | Unidade + browser | `apps/consumer-web/tests/reader.spec.tsx` | Passed em Vitest/Chromium |
| FR-003 | AC-003, AC-005, AC-006 | Unidade + browser | `apps/consumer-web/tests/search.spec.tsx` | Passed em Vitest/Chromium |
| FR-004 | AC-001, AC-002, AC-004, AC-008 | Browser + PWA | `apps/consumer-web/tests/pwa.spec.ts` + Playwright offline | Passed em Chromium; WebKit bloqueado por dependências do host |
| NFR-001 | AC-001, AC-002, AC-004, AC-007, AC-008 | Browser | Playwright offline (rede removida) | App shell, Worker/WASM e OPFS preparados; Chromium smoke aprovado |
| NFR-002 | AC-002, AC-003, AC-005 | Unidade | `apps/consumer-web/tests/boundary.test.ts` | Passed, 22/22 IDs |
| NFR-003 | AC-006, AC-007, AC-008 | Unidade + a11y | `apps/consumer-web/tests/states.a11y.spec.tsx` | Passed em Vitest |
| NFR-004 | AC-001, AC-004, AC-009 | Browser | Playwright Chromium/WebKit | Chromium Passed; WebKit não executável no host |
| NFR-005 | AC-002, AC-003, AC-006 | Unidade | `apps/consumer-web/tests/search.spec.tsx` + limite | Passed em Vitest |

### 13. Validações

#### Gate do Ato I — Definição

^- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md`
- **Achados**: Revisão semântica concluída. Sem BLOCKER; cobertura mínima US/FR/NFR ↔ 3 ACs satisfeita (9 cenários AC); Interface para pessoas: Sim com as 9 partes da seção 10 (stack Next/React/Tailwind/shadcn/ReUI, telas, fluxo, menus, formulário, composição, blocos React, estados/acessibilidade).

#### Gate do Ato II — Plano

^- **Resultado**: Passed
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md`; `node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md`
- **Achados**: Plano atualizado com 24 tarefas, 14 predecessores TDD, interface validada e cobertura 22/22 IDs. REDs T018–T020 observados antes da implementação; sem dependências cíclicas.

#### Gate do Ato III — Entrega

^- **Resultado**: In Progress
- **Comando**: `pnpm turbo run build test typecheck lint check --force`; `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md apps/consumer-web`; `node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md . --all`; `node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/in-progress/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md apps/consumer-web`
- **Achados**: Pipeline completo passou (`41/41`), testes consumer `10/10`, adapter HTTP `9/9`, Chromium remoto `2/2`, rastreabilidade `22/22`, evidência strict e QA passaram. A API usada é `https://openbible-prod.vercel.app`; o fallback direto é o bucket R2 `/bibles`. WebKit não executou por dependências nativas ausentes (`libicu74`, `libxml2`, `libflite1`); por isso o Delivery Gate permanece In Progress.

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

- [x] T001 [TEST] [TDD] [US-001] Derivar do AC-001 um caso Vitest falhando em apps/consumer-web/tests/library.spec.ts — Refs: US-001, US-004, FR-001, FR-004, NFR-001, NFR-004, AC-001 — Depends: none
  - [x] **PREP**: Gherkin e IDs confirmados; teste de componente escolhido.
  - [x] **EXECUTE**: Caso Vitest com marcador `SPECSFY:` escrito em `library.spec.tsx`.
  - [x] **VERIFY**: Caso validado em `pnpm --filter @openbible/consumer-web run test:tdd`.
  - [x] **EVIDENCE**: Suite consumer passou com 9 arquivos e 9 testes.
  - [x] **IMPROVE**: O teste foi mantido no menor nível, isolando a ação do card.

- [x] T002 [TEST] [TDD] [US-002] Derivar do AC-002 um caso Vitest falhando em apps/consumer-web/tests/reader.spec.ts — Refs: US-002, FR-002, FR-004, NFR-001, NFR-002, NFR-005, AC-002 — Depends: none
  - [x] **PREP**: Gherkin e IDs confirmados; navegação sequencial escolhida.
  - [x] **EXECUTE**: Caso Vitest com marcador `SPECSFY:` escrito em `reader.spec.tsx`.
  - [x] **VERIFY**: Caso validado em `pnpm --filter @openbible/consumer-web run test:tdd`.
  - [x] **EVIDENCE**: Link anterior/próximo e hrefs canônicos verificados.
  - [x] **IMPROVE**: Navegação foi extraída em bloco próprio, evitando lógica na rota.

- [x] T003 [TEST] [TDD] [US-003] Derivar do AC-003 um caso Vitest falhando em apps/consumer-web/tests/search.spec.ts — Refs: US-003, FR-003, NFR-002, NFR-005, AC-003 — Depends: none
  - [x] **PREP**: Gherkin e IDs confirmados; orquestração multi-versão escolhida.
  - [x] **EXECUTE**: Caso Vitest com marcador `SPECSFY:` escrito em `search.spec.tsx`.
  - [x] **VERIFY**: Caso validado em `pnpm --filter @openbible/consumer-web run test:tdd`.
  - [x] **EVIDENCE**: Teste comprova duas versões e origem preservada.
  - [x] **IMPROVE**: Agregação foi extraída para `search-installed.ts` e ficou testável.

- [x] T004 [TEST] [TDD] [US-004] Derivar do AC-004 um caso Vitest/Playwright falhando em apps/consumer-web/tests/pwa.spec.ts — Refs: US-004, FR-004, NFR-001, NFR-004, AC-004 — Depends: none
  - [x] **PREP**: Gherkin e IDs confirmados; manifest e conformance browser escolhidos.
  - [x] **EXECUTE**: Teste Vitest de manifest e teste Playwright browser escritos.
  - [x] **VERIFY**: Vitest e conformance Chromium passaram; WebKit bloqueado por dependências do host.
  - [x] **EVIDENCE**: `playwright test --project=chromium` terminou 2/2.
  - [x] **IMPROVE**: Worker/WASM oficial passou a ser copiado automaticamente no prebuild.

- [x] T005 [TEST] [TDD] [US-001] Derivar do AC-005 um caso Vitest falhando em apps/consumer-web/tests/boundary.test.ts — Refs: US-001, US-002, US-003, FR-003, NFR-002, AC-005 — Depends: none
  - [x] **PREP**: Gherkin e regra de fronteira confirmados.
  - [x] **EXECUTE**: Teste de imports públicos escrito com marcador `SPECSFY:`.
  - [x] **VERIFY**: Teste passou na suite consumer.
  - [x] **EVIDENCE**: Provider usa `createWebAdapter` e `createBibleEngine` sem imports internos.
  - [x] **IMPROVE**: A regra de boundary fica automatizada contra regressões de caminho.

- [x] T006 [TEST] [TDD] [US-001] Derivar do AC-006 um caso Vitest/Playwright falhando em apps/consumer-web/tests/states.a11y.spec.ts — Refs: US-001, US-003, FR-001, FR-003, NFR-003, NFR-005, AC-006 — Depends: none
  - [x] **PREP**: Gherkin, estados e requisitos de teclado confirmados.
  - [x] **EXECUTE**: Teste de label e role alert escrito em `states.a11y.spec.tsx`.
  - [x] **VERIFY**: Suite Vitest passou.
  - [x] **EVIDENCE**: Campo possui label acessível e erro possui `role=alert`.
  - [x] **IMPROVE**: Estados transversais foram centralizados em `feedback.tsx`.

- [x] T007 [TEST] [TDD] [US-001] Derivar do AC-007 um caso Vitest falhando em apps/consumer-web/tests/install-failure.spec.ts — Refs: US-001, FR-001, NFR-001, NFR-003, AC-007 — Depends: none
  - [x] **PREP**: Gherkin e preservação de erro/retry confirmados.
  - [x] **EXECUTE**: Teste de ErrorState escrito em `install-failure.spec.tsx`.
  - [x] **VERIFY**: Suite Vitest passou.
  - [x] **EVIDENCE**: Erro tipado fica visível e retry permanece disponível.
  - [x] **IMPROVE**: UI não expõe stack trace nem códigos como único texto de recuperação.

- [x] T008 [TEST] [TDD] [US-004] Derivar do AC-008 um caso Vitest/Playwright falhando em apps/consumer-web/tests/offline-empty.spec.ts — Refs: US-004, FR-002, FR-004, NFR-001, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Gherkin e estado offline sem Bíblia confirmados.
  - [x] **EXECUTE**: Teste de EmptyState escrito em `offline-empty.spec.tsx`.
  - [x] **VERIFY**: Suite Vitest passou.
  - [x] **EVIDENCE**: Estado vazio orienta instalação antes da leitura.
  - [x] **IMPROVE**: Mensagem permanece acionável e independente de rede.

- [x] T009 [TEST] [TDD] [US-001] Derivar do AC-009 um caso Vitest falhando em apps/consumer-web/tests/library-states.spec.ts — Refs: US-001, US-002, FR-001, FR-002, NFR-004, AC-009 — Depends: none
  - [x] **PREP**: Gherkin e estados available/installed confirmados.
  - [x] **EXECUTE**: Teste de estados escrito em `library-states.spec.tsx`.
  - [x] **VERIFY**: Suite Vitest passou.
  - [x] **EVIDENCE**: Estados ocupado, instalada e remoção foram verificados.
  - [x] **IMPROVE**: Status foi modelado como union explícita no card.

#### Fase 2 — Consumer Web/PWA

**Objetivo**: entregar o consumer funcional provando os fluxos offline-first sem duplicar regras.
**Teste independente**: conformance de browser (Chromium/WebKit) e testes unitários de componentes/hooks verdes.

- [x] T010 [CODE] [US-001] Criar apps/consumer-web (Next.js App Router + React + Tailwind + shadcn/ui + ReUI + next-pwa) em apps/consumer-web/package.json e next.config.mjs — Refs: US-001, US-004, FR-001, FR-004, NFR-001, NFR-004, AC-001, AC-004 — Depends: T001, T004, T009
  - [x] **PREP**: Stack e dependências locais confirmadas.
  - [x] **EXECUTE**: Scaffold Next, layout, manifest, Tailwind, registry shadcn/ReUI e PWA criados.
  - [x] **VERIFY**: `pnpm --filter @openbible/consumer-web run check` passou.
  - [x] **EVIDENCE**: Check executou typecheck, lint, Vitest e build sem erro.
  - [x] **IMPROVE**: Assets Worker/WASM oficiais são sincronizados no `prebuild`.
  <!-- specsfy:evidence {"task":"T010","refs":["US-001","US-004","FR-001","FR-004","NFR-001","NFR-004","AC-001","AC-004"],"files":["apps/consumer-web/package.json","apps/consumer-web/next.config.mjs","apps/consumer-web/src/app/layout.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run check","exit":0}]} -->

- [x] T011 [CODE] [US-001] Implementar o provider da engine (createWebAdapter + createBibleEngine) em apps/consumer-web/src/engine/bible-engine-provider.tsx — Refs: US-001, US-004, FR-001, FR-004, NFR-001, NFR-002, NFR-004, AC-001, AC-004, AC-005 — Depends: T001, T004, T005, T009
  - [x] **PREP**: API pública da engine e adapter web confirmadas.
  - [x] **EXECUTE**: Provider client inicializa/reconcilia Worker + OPFS e expõe engine/estado/retry.
  - [x] **VERIFY**: `pnpm --filter @openbible/consumer-web run test:tdd` passou.
  - [x] **EVIDENCE**: Boundary e conformance Chromium comprovam integração.
  - [x] **IMPROVE**: Lifecycle fecha adapter em unmount e evita vazamento do Worker.
  <!-- specsfy:evidence {"task":"T011","refs":["US-001","US-004","FR-001","FR-004","NFR-001","NFR-002","NFR-004","AC-001","AC-004","AC-005"],"files":["apps/consumer-web/src/engine/bible-engine-provider.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0}]} -->

- [x] T014 [CODE] [US-004] Configurar PWA (manifest + service worker via next-pwa + cache de app shell/assets) em apps/consumer-web/src/app/manifest.ts e next.config.mjs — Refs: US-004, FR-004, NFR-001, NFR-003, NFR-004, AC-004, AC-008 — Depends: T001, T004, T008
  - [x] **PREP**: Requisitos PWA e assets oficiais confirmados.
  - [x] **EXECUTE**: Manifest, ícone, service worker e precache de app/fixture/Worker/WASM configurados.
  - [x] **VERIFY**: `playwright test --project=chromium` passou 2/2.
  - [x] **EVIDENCE**: Manifest e SW foram servidos pelo build Next.
  - [x] **IMPROVE**: Cache seletivo mantém dependências externas fora do caminho offline principal.
  <!-- specsfy:evidence {"task":"T014","refs":["US-004","FR-004","NFR-001","NFR-003","NFR-004","AC-004","AC-008"],"files":["apps/consumer-web/src/app/manifest.ts","apps/consumer-web/next.config.mjs"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:browser","exit":0}]} -->

#### Fase de interface

- [x] T012 [CODE] [US-001] Implementar a Biblioteca (AppLibrary + VersionCard) em apps/consumer-web/src/features/library/AppLibrary.tsx — Refs: US-001, FR-001, NFR-003, NFR-004, AC-001, AC-006, AC-007, AC-009 — Depends: T001, T006, T007, T009
  - [x] **PREP**: Fluxo Biblioteca, ações inline e estados da seção 10 confirmados.
  - [x] **EXECUTE**: Catálogo, registry, fixture ARA, install/remove, links e estados implementados.
  - [x] **VERIFY**: Vitest, teclado/roles e conformance Chromium passaram.
  - [x] **EVIDENCE**: `VersionCard`, `AppLibrary` e `library*.spec.tsx` registrados.
  - [x] **IMPROVE**: Ações ficam no card e a página permanece somente composição.
  <!-- specsfy:evidence {"task":"T012","refs":["US-001","FR-001","NFR-003","NFR-004","AC-001","AC-006","AC-007","AC-009"],"files":["apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/src/features/library/VersionCard.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test","exit":0}]} -->

- [x] T013 [CODE] [US-002] Implementar o Leitor (Reader + PrevNextNav) em apps/consumer-web/src/features/reader/Reader.tsx — Refs: US-002, FR-002, NFR-001, NFR-005, AC-002, AC-008, AC-009 — Depends: T002, T008, T009
  - [x] **PREP**: Fluxo do leitor e ordenação delegada à engine confirmados.
  - [x] **EXECUTE**: Navegação de livros/capítulos, conteúdo, selects e estados implementados.
  - [x] **VERIFY**: Teste de navegação e conformance Chromium passaram.
  - [x] **EVIDENCE**: `Reader`, `PrevNextNav` e rota dinâmica registrados.
  - [x] **IMPROVE**: Parser, ordenação e acesso ao SQLite não foram duplicados na UI.
  <!-- specsfy:evidence {"task":"T013","refs":["US-002","FR-002","NFR-001","NFR-005","AC-002","AC-008","AC-009"],"files":["apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/PrevNextNav.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test","exit":0}]} -->

- [x] T015 [CODE] [US-003] Implementar a Busca (SearchForm + SearchResults) em apps/consumer-web/src/features/search/Search.tsx — Refs: US-003, FR-003, NFR-002, NFR-005, AC-003, AC-005, AC-006 — Depends: T003, T005, T006
  - [x] **PREP**: Fluxo de busca multi-versão e limite confirmados.
  - [x] **EXECUTE**: Formulário, agregação por versões, origem, limite e links contextuais implementados.
  - [x] **VERIFY**: Vitest e conformance Chromium passaram.
  - [x] **EVIDENCE**: `Search`, `SearchForm`, `SearchResults` e helper registrados.
  - [x] **IMPROVE**: Agregação foi isolada para manter a tela simples e testável.
  <!-- specsfy:evidence {"task":"T015","refs":["US-003","FR-003","NFR-002","NFR-005","AC-003","AC-005","AC-006"],"files":["apps/consumer-web/src/features/search/Search.tsx","apps/consumer-web/src/features/search/SearchForm.tsx","apps/consumer-web/src/features/search/SearchResults.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test","exit":0}]} -->

- [x] T016 [DOC] [US-004] Atualizar INTERFACE.md com os blocos React/ReUI/shadcn criados — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-002, AC-005 — Depends: T012, T013, T015
  - [x] **PREP**: Inventário de blocos e consumidores levantado.
  - [x] **EXECUTE**: `INTERFACE.md` e `DESIGNSYSTEM.MD` atualizados com telas, estados e reuso.
  - [x] **VERIFY**: `inspect_interface.mjs` e documentação reconstruída sem pendência.
  - [x] **EVIDENCE**: Componentes e rotas correspondem à seção 10.
  - [x] **IMPROVE**: Tokens e composição macro foram registrados para evitar divergência visual.

#### Fase final — Qualidade

- [x] T017 [TEST] [US-004] Executar regressão e rastreabilidade (unit + conformance browser + gates) em apps/consumer-web/tests/ e turbo run check — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T011, T014, T012, T013, T015, T016
  - [x] **PREP**: Suites unitárias, browser, typecheck, lint, build e rastreabilidade identificadas.
  - [x] **EXECUTE**: `consumer-web run check`, conformance Chromium e rastreabilidade executados.
  - [x] **VERIFY**: 9 testes Vitest, 2 testes Chromium e 22/22 IDs passaram.
  - [x] **EVIDENCE**: WebKit tentou executar e foi bloqueado por dependências nativas ausentes no host.
  - [x] **IMPROVE**: Vitest exclui explicitamente `tests/browser` para não misturar runners.

- [x] T018 [TEST] [TDD] [US-001] Derivar teste para construir a URL direta R2 com o mapeamento `.sqlite` em packages/adapter-http/src/__tests__/http-source.test.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Contrato de URL R2 e identificação da versão confirmados.
  - [x] **EXECUTE**: Teste falha ao exigir `packageBaseUrl` e o arquivo correto por versão.
  - [x] **VERIFY**: RED observado no adapter antes da implementação: `HttpBiblePackageSource` rejeitou a origem direta.
  - [x] **EVIDENCE**: Marcador SPECSFY e chamada esperada registrados; `pnpm --filter @openbible/adapter-http test` falhou em 2 casos novos.
  - [x] **IMPROVE**: Caso mantém o teste na fronteira HTTP, sem rede real.
- [x] T019 [TEST] [TDD] [US-001] Derivar testes para catálogo completo, payload SQLite e erro de URL ausente em packages/adapter-http/src/__tests__/http-source.test.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Catálogo R2, payload válido e erros tipados identificados.
  - [x] **EXECUTE**: Testes falham ao exigir as 16 versões, bytes válidos e `network_unavailable` sem origem.
  - [x] **VERIFY**: RED observado no adapter antes da implementação: fallback retornou somente 3 versões.
  - [x] **EVIDENCE**: Marcador SPECSFY e casos de fallback registrados; `pnpm --filter @openbible/adapter-http test` falhou em 2 casos novos.
  - [x] **IMPROVE**: Payload permanece in-memory para testar somente o contrato.
- [x] T020 [TEST] [TDD] [US-001] Derivar teste de instalação do consumer sem fixture implícita em apps/consumer-web/tests/library-source.spec.tsx — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none
  - [x] **PREP**: Provider, Biblioteca e resolução de bytes remotos identificados.
  - [x] **EXECUTE**: Teste falha ao exigir que a ação delegue a resolução do pacote à engine.
  - [x] **VERIFY**: RED observado antes da alteração do consumer: a Biblioteca tentou `/fixtures/ara.db`.
  - [x] **EVIDENCE**: Marcador SPECSFY e mock da engine registrados; `pnpm --filter @openbible/consumer-web test:tdd -- tests/library-source.spec.tsx` falhou no caso novo.
  - [x] **IMPROVE**: Teste não acessa R2 real; valida somente a fronteira do consumer.
- [x] T021 [CODE] [US-001] Adicionar suporte a `packageBaseUrl` e mapeamento de arquivos por versão no `HttpBiblePackageSource` em packages/adapter-http/src/http-source.ts — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: T018, T019, T001
  - [x] **PREP**: Port `BiblePackageSource`, URLs R2 e testes T018/T019 revisados.
  - [x] **EXECUTE**: Adapter resolve `{ARQUIVO}.sqlite`, baixa bytes diretos e preserva fallback de API.
  - [x] **VERIFY**: Testes do adapter, typecheck e lint passam (`pnpm --filter @openbible/adapter-http check`).
  - [x] **EVIDENCE**: Comentário `specsfy:evidence` registra arquivos, comando e IDs.
  - [x] **IMPROVE**: Mapeamento fica injetável/configurável sem acoplar `engine-core` a Cloudflare.
  <!-- specsfy:evidence {"task":"T021","refs":["US-001","FR-001","NFR-001","AC-001"],"files":["packages/adapter-http/src/http-source.ts","packages/adapter-http/src/__tests__/http-source.test.ts"],"commands":[{"run":"pnpm --filter @openbible/adapter-http check","exit":0}]} -->
- [x] T022 [CODE] [US-001] Configurar o consumer para a origem R2 e retirar a fixture do caminho padrão de instalação em apps/consumer-web/src/engine/bible-engine-provider.tsx e apps/consumer-web/src/features/library/AppLibrary.tsx — Refs: US-001, US-004, FR-001, FR-004, NFR-001, NFR-004, AC-001, AC-004 — Depends: T018, T019, T020, T021
  - [x] **PREP**: Contrato do adapter e teste de delegação do consumer revisados.
  - [x] **EXECUTE**: Provider injeta URL R2 configurável e Biblioteca chama a engine sem fixture implícita.
  - [x] **VERIFY**: Testes do consumer, typecheck, lint e build passam (`pnpm --filter @openbible/consumer-web check`); Chromium remoto passou.
  - [x] **EVIDENCE**: Comentário `specsfy:evidence` registra arquivos, comandos e IDs.
  - [x] **IMPROVE**: Fixture permanece disponível somente pelo harness/teste explícito.
  <!-- specsfy:evidence {"task":"T022","refs":["US-001","US-004","FR-001","FR-004","NFR-001","NFR-004","AC-001","AC-004"],"files":["apps/consumer-web/src/engine/bible-engine-provider.tsx","apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/tests/library-source.spec.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web check","exit":0},{"run":"CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0}]} -->
- [x] T023 [DOC] [US-001] Registrar a origem R2, o mapeamento, as variáveis de configuração e o fallback de API em INTERFACE.md, .specsfy/STACK.md e documentação técnica — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: T022
  - [x] **PREP**: Arquivos e contratos de origem remota inventariados.
  - [x] **EXECUTE**: Interface, stack e docs descrevem R2 `/bibles`, envs e proxy.
  - [x] **VERIFY**: Documentator e checks de documentação passam.
  - [x] **EVIDENCE**: Caminhos e consumidores do contrato registrados.
  - [x] **IMPROVE**: Nomes de configuração ficam consistentes entre app e adapter.
- [x] T024 [TEST] [US-001] Reexecutar regressão, download por URL, rastreabilidade e checks em apps/consumer-web/tests/, packages/adapter-http/src/__tests__/ e no monorepo — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T022, T023
  - [x] **PREP**: Suite do adapter, consumer, origem R2 e conformance identificadas.
  - [x] **EXECUTE**: Download remoto via `openbible-prod.vercel.app`, fallback R2 direto e regressão preparados para execução.
  - [x] **VERIFY**: Testes unitários, Chromium e checks completos passaram; WebKit foi reportado como indisponível por dependências do host.
  - [x] **EVIDENCE**: URLs, arquivos e IDs registrados na seção 13; `check_traceability` scoped consumer `22/22`, `verify_evidence --all` strict e `verify_acceptance` passaram.
  - [x] **IMPROVE**: Fallback API → R2 direto foi coberto para evitar indisponibilidade de uma única origem.

### 15. Ordem de execução

- Caminho crítico: T001–T009 (RED) → T010 → T011 → T012/T013/T015 → T014 → T016 → T017.
- Tarefas paralelas: os REDs sem interdependência (T001..T009 nos arquivos próprios); T014 (PWA) e a Fase de interface podem avançar após os REDs; T016 depende das telas.
- Estratégia de MVP: primeiro provider + Biblioteca que instala/remove (US-001/AC-001), depois Leitor (US-002), depois Busca (US-003) e PWA offline (US-004).

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- SPEC-0001/0002/0003 concluídas (engine + adapter-sqlite-web + prontidão de distribuição).
- Tooling: Next.js, React, Tailwind, shadcn/ui, ReUI, `next-pwa`, Playwright (Chromium/WebKit), Vitest, Node 22.
- Fixture SQLite legada reutilizável (de 0001/0002) para instalação local sem rede.

#### Riscos

- Bundling de Worker/WASM no Next → mitigado por assets relativos ao módulo + overrides (0002) e por teste de browser.
- Duplicação de regras de negócio → mitigado por teste de fronteira (AC-005) e consumo só via exports públicos.
- PWA/cache impreciso (assets grandes) → mitigado por cache seletivo de app shell + assets; avaliação de volume.
- Diferenças Chromium/WebKit → mitigado por conformance de browser (bloqueantes).

#### Suposições

- A ARA (conteúdo bíblico) é fornecida pelo consumidor (fixture/fonte), não distribuída pela engine.
- `apps/consumer-web` é uma app de referência; a publicação npm da engine não é afetada.
- Shadcn/ui e ReUI entram como primeira camada de UI do repositório (antes inexistente); `INTERFACE.md`/`DESIGNSYSTEM.MD` passam a refletir reuses.
- Downloads em segundo plano e Personal Study ficam fora desta entrega.

### 17. Decisões

- **DEC-001**: Aplicativo em Next.js App Router dentro do monorepo (`apps/consumer-web`) — razão: reduz a fricção da migração strangler do legado Web (Next.js) e prova a integração local; alternativas rejeitadas: Astro (diverge do legado) e consumer externo.
- **DEC-002**: Fatia = Biblioteca + Leitor + Busca, offline via OPFS, instalável como PWA — razão: prova a jornada offline-first; busca em todas as versões instaladas marcadas por Bíblia.
- **DEC-003**: Origens de dados = fixture local embarcada para testes + `adapter-http` configurável — razão: prova offline-first sem dependência externa e habilita download real direto do bucket R2 ou via proxy HTTP.
- **DEC-004**: Sem duplicação de regra — cada comportamento via exports públicos (`createBibleEngine`/`createWebAdapter`); nenhum parser/leitura/busca no consumer.
- **DEC-005**: UI composta por shadcn/ui (primitives) + ReUI (composições `@reui/c-*`) + blocos próprios; CRUD registrado com List/DataGrid, Form/Filters e ações inline.
- **DEC-006** (aberta): Detalhes finos de composição/estados a consolidar em `INTERFACE.md`/`DESIGNSYSTEM.MD` durante a implementação; downloads em segundo plano podem entrar depois.
- **DEC-007** (aberta): Estratégia exata de cache PWA (runtime vs build-time, pre-cache de assets) a afinar com os especialistas de UI/PWA na implementação.
- **DEC-008**: `HttpBiblePackageSource` aceita `packageBaseUrl` para baixar diretamente o SQLite correspondente à versão (`{ARQUIVO}.sqlite`), mantendo `baseUrl` para catálogo/proxy — razão: a engine deve consumir a origem R2 do app de referência sem acoplar o core a Cloudflare.

### 18. Definition of Done

  - [x] `Definition Gate` está `Passed`.
  - [x] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
  - [x] Todas as tarefas na seção 14 estão concluídas.
  - [x] Testes e checks estáticos disponíveis passam.
