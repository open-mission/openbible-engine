# Especificação integrada: Migração da TUI para consumir openbible-engine

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0006 |
| Slug | 0006-migracao-da-tui-para-consumir-openbible-engine |
| Status | Complete |
| Effort | 7 |
| Effort updated at | 2026-08-28 |
| Effort rationale | Prova vertical com integração HTTP, adapter SQLite Node, UI OpenTUI em Node, preservação de atalhos, isolamento de dados e conformance offline. |
| ClickUp Task | |
| Milestones | M02 (proposto) |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-28 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

A TUI legada mantém parser, leitura, busca, registry, download e acesso SQLite próprios. Ela executa principalmente com Bun e OpenTUI, enquanto o `openbible-engine` possui contratos públicos e um adapter SQLite comprovado em Node.js, mas ainda não há um consumer TUI independente que prove essa integração. Essa duplicação mantém regras divergentes e torna a migração strangler arriscada.

#### Resultado desejado

Entregar um consumer TUI privado dentro de `openbible-engine`, executado em Node.js 26.4+ com `--experimental-ffi`, que use `@openbible/engine`, `@openbible/adapter-http` e `@openbible/adapter-sqlite-node` somente por exports públicos. A pessoa deve conseguir adquirir uma versão por origem remota configurável, instalar em namespace isolado, listar, ler, navegar por referência, buscar e remover a Bíblia offline, mantendo os atalhos essenciais da TUI sem alterar o projeto legado.

#### Métricas de sucesso

- O novo consumer compila, faz typecheck, passa lint e executa em Node.js 26.4+ com `--experimental-ffi` e a capacidade OpenTUI efetivamente verificada; Node.js 22 permanece fora do suporte do consumer TUI.
- Uma conformance ponta a ponta comprova aquisição, instalação, listagem, leitura, referência, busca e remoção usando o adapter e a engine públicos.
- Após uma instalação concluída, Biblioteca, Leitor, referências, busca e remoção executam sem nova chamada de rede.
- Falhas de rede, pacote, cancelamento ou armazenamento não deixam dados parciais e preservam o estado anterior no namespace isolado.
- A conformance de fronteira confirma que o consumer não importa fontes internas, não adiciona dependências de plataforma ao core e não altera `/home/claudio/Projects/open-bible`.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: Qual é a implementação atual da TUI? → A inspeção local confirmou OpenTUI React `0.5.8`, scripts para Node e Bun, `better-sqlite3`, `bun:sqlite`, parser próprio, `InstalledStore`, download remoto e painéis de Biblioteca/Leitor/Busca. Impacto: preservar comportamento observável, mas substituir acesso e regras internas pelos contratos do engine.
- **R-002**: Quais contratos estão disponíveis no engine? → A inspeção de `@openbible/engine` confirmou `createBibleEngine`, `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses` e `parseReference`. Impacto: o consumer pode permanecer fino, sem novo caso de uso de domínio.
- **R-003**: Como o armazenamento deve ser composto? → `createNodeAdapter({ dataDir, registryPath })` compõe `BibleLibrary`, `InstalledBibleRegistry` e `BibleInstaller` com reconciliação best-effort. Impacto: usar diretório e registry próprios, sem reutilizar o armazenamento legado.
- **R-004**: Como a origem remota deve ser consumida? → `HttpBiblePackageSource` aceita `baseUrl`, `packageBaseUrl` e `fetchImpl`, resolve catálogo/pacotes e traduz falhas para erros da engine. Impacto: o consumer não terá fetch, mapeamento ou fallback próprio.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193948-migracao-da-tui-para-consumir-openbible-engine.md` — captura original.
- `specs/backlog/0006-migracao-da-tui-para-consumir-openbible-engine.md` — brief refinado e decisões confirmadas.
- `PROJECT.md`, `INTERFACE.md`, `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md` e `.specsfy/PACKAGES.md` — contexto persistente.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — contratos e parser do Scripture Library.
- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` — exports e consumibilidade dos packages.
- `specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md` — precedente de consumer, estados e isolamento.
- `/home/claudio/Projects/open-bible/apps/tui/package.json` e fontes de parser, banco, download, serviço e UI — legado somente para leitura.

#### Documentação consultada

- Código e testes locais do monorepo — ports públicos, adapter Node, adapter HTTP, fixture, contract suite e consumer Native.
- Código e testes locais da TUI legada — OpenTUI, atalhos, SQLite, registry, download e navegação.
- A documentação instalada de `@opentui/core@0.5.8` foi consultada localmente: declara Bun `1.3.0+` ou Node.js `26.4.0+` com ESM e `--experimental-ffi`.

#### Artefatos de pesquisa armazenados

- `specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/research/legacy-tui-context.md`: registro de proveniência e síntese da inspeção do projeto legado; fonte local, sem cópia de código.

#### Dúvidas respondidas

- **Q1**: Qual runtime? → **A**: Node.js 26.4+ com `--experimental-ffi`, conforme a capacidade efetiva do OpenTUI 0.5.8; Bun continua fora da primeira fatia.
- **Q2**: Qual menor fluxo? → **A**: Fluxo ponta a ponta: instalar, listar, ler, buscar e remover offline.
- **Q3**: Como tratar dados existentes? → **A**: Namespace isolado; não ler, copiar ou alterar armazenamento da TUI legada.
- **Q4**: Onde vive a prova? → **A**: Novo app privado dentro do monorepo do engine; o caminho proposto é `apps/consumer-tui`.
- **Q5**: Qual fidelidade de interface? → **A**: Manter jornada e atalhos essenciais, permitindo simplificação visual.
- **Q6**: Qual origem da instalação? → **A**: Download remoto configurável; operações posteriores são locais.
- **Q7**: Quais atalhos? → **A**: `Tab`, setas, `Enter`, `n/p`, `d/D`, `:`, `h`, `Esc`, `b`, `?` e `q`.
- **Q8**: Qual contrato remoto? → **A**: `@openbible/adapter-http` oficial, com URLs configuráveis.

#### Dúvidas abertas

- Nenhuma lacuna de produto bloqueia a definição. A compatibilidade efetiva do OpenTUI com Node.js 26.4+ e `--experimental-ffi` é uma spike técnica obrigatória; Node.js 22.23.2 foi comprovado como incompatível e permanece fora do suporte.

### 3. Escopo e atores

#### Incluído

- Spike e matriz de capacidade do OpenTUI executando em Node.js 26.4+ com `--experimental-ffi`.
- Consumer TUI privado em `apps/consumer-tui`, com scripts de desenvolvimento, build, start, test, typecheck e conformance.
- Composição por exports públicos de `@openbible/engine`, `@openbible/adapter-http`, `@openbible/adapter-sqlite-node` e, nos testes, `@openbible/engine-testing`.
- Catálogo e aquisição remota configuráveis por `HttpBiblePackageSource`.
- Namespace de armazenamento e registry próprios do consumer.
- Instalação, listagem, leitura ordenada, parsing de referência, busca limitada e remoção.
- Interface TUI com Biblioteca, Leitor e Busca, estados operacionais e atalhos atuais.
- Operação local offline após instalação, rollback/cleanup em falha, testes e documentação técnica.

#### Fora de escopo

- Alterar, migrar, importar ou ler diretamente `/home/claudio/Projects/open-bible`.
- Reutilizar o registry ou os bancos existentes da TUI.
- Suporte a Bun nesta primeira fatia ou declaração de compatibilidade de plataformas não executadas.
- Substituir a TUI legada em produção ou remover seu caminho de rollback.
- Personal Study, Sync/Turso, API pública, React Native, autenticação, contas e publicação npm.
- Banco bíblico real ou credenciais versionados no repositório.
- Downloads em segundo plano persistentes, sincronização ou operação multiusuário.

#### Atores

- **Usuário da TUI**: instala versões, navega por livros/capítulos, consulta referências, busca e remove Bíblias offline.
- **Equipe Open Bible**: valida a migração strangler e a reutilização dos contratos do engine sem duplicação de regras.
- **Origem remota configurada**: fornece catálogo e bytes dos pacotes; não recebe dados de leitura nem de uso local.
- **Conformance do consumer**: comprova runtime, integração, falhas, offline, fronteiras e preservação do legado.

### 4. Princípios e restrições do projeto

- **PR-001**: O consumer importa somente exports públicos; fontes internas dos packages e o projeto legado não são dependências de execução.
- **PR-002**: `engine-core` e `engine` continuam portáveis e sem dependências de UI, SQLite ou filesystem.
- **PR-003**: `BibleInstaller` permanece o único escritor do armazenamento bíblico e do registry; a UI não implementa transação.
- **PR-004**: Node.js 26.4+ com `--experimental-ffi` é o runtime-alvo do consumer TUI; Node.js 22 não é suportado para OpenTUI 0.5.8 e a capacidade deve ser comprovada antes de declarar suporte.
- **PR-005**: O namespace do consumer é isolado e nenhum dado legado é copiado, migrado ou alterado.
- **PR-006**: A rede participa da aquisição remota; listagem de instalados, leitura, referência, busca e remoção não provocam rede.
- **PR-007**: A TUI conserva atalhos e jornada essenciais, mas regras de parser, ordenação, instalação, busca e persistência ficam na engine/adapters.
- **PR-008**: Testes usam fixtures sintéticas, doubles de transporte e armazenamento temporário; conteúdo bíblico protegido, credenciais e `.env` ficam fora do repositório.

### 5. Histórias de usuário

#### US-001 — Instalar e gerenciar versões offline (P1)

Como usuário da TUI, quero adquirir, instalar, listar e remover versões, para manter uma biblioteca local utilizável sem depender do legado.

**Por que P1**: sem uma versão instalada, leitura e busca não têm dados; esse é o início e o fim do fluxo ponta a ponta.
**Teste independente**: conformance instala uma versão por origem configurada, verifica o registry isolado e remove a versão sem resíduos.
**Requisitos**: FR-001, FR-004, FR-005, NFR-001, NFR-003.

#### US-002 — Ler e navegar por referências (P1)

Como usuário da TUI, quero escolher livro/capítulo e informar referências com os atalhos atuais, para ler versículos na ordem correta sem duplicar o parser.

**Por que P1**: leitura é o valor principal do Scripture Library e demonstra a substituição do acesso SQLite da TUI.
**Teste independente**: conformance abre capítulo, verifica ordenação e resolve referências válidas e inválidas pela engine.
**Requisitos**: FR-002, NFR-004, NFR-005.

#### US-003 — Buscar versículos na versão instalada (P1)

Como usuário da TUI, quero buscar um termo na versão selecionada, para localizar conteúdo bíblico offline com limite e contexto.

**Por que P1**: busca é uma jornada central já existente e prova que o consumer delega a consulta ao contrato público.
**Teste independente**: conformance executa busca com resultado, limite e termo vazio depois de desligar a rede.
**Requisitos**: FR-003, NFR-002, NFR-005.

#### US-004 — Operar com segurança e recuperação (P1)

Como usuário e mantenedor, quero receber estados claros e recuperar falhas sem perder a instalação, para confiar na migração incremental.

**Por que P1**: a migração só é reversível se falhas e operações offline não corromperem dados nem esconderem o estado do sistema.
**Teste independente**: testes interrompem aquisição/instalação, removem a rede após o commit e verificam estados, retry, isolamento e ausência de parcial.
**Requisitos**: FR-001, FR-004, NFR-002, NFR-003, NFR-005.

### 6. Cenários BDD de aceite

#### AC-001 — Instalação remota bem-sucedida

**Cobre**: US-001, FR-001, FR-005, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-005 @NFR-001 @NFR-003 @AC-001
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Instala uma versão remota no namespace isolado
    Given Node.js 26.4+ com `--experimental-ffi` e uma origem HTTP configurada com uma versão disponível
    When a pessoa solicita a instalação pela TUI
    Then o adapter HTTP obtém o pacote, a engine valida e instala a versão no namespace do consumer
```

#### AC-002 — Falha de aquisição ou validação

**Cobre**: US-001, US-004, FR-001, FR-005, NFR-002, NFR-003

```gherkin
@US-001 @US-004 @FR-001 @FR-005 @NFR-002 @NFR-003 @AC-002
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Falha durante o download ou a validação
    Given uma versão anterior instalada e uma origem indisponível ou um pacote inválido
    When a pessoa tenta instalar a nova versão
    Then a TUI mostra erro recuperável, preserva a versão anterior e não deixa arquivo ou registro parcial
```

#### AC-003 — Biblioteca e remoção

**Cobre**: US-001, US-004, FR-001, FR-004, NFR-003, NFR-004

```gherkin
@US-001 @US-004 @FR-001 @FR-004 @NFR-003 @NFR-004 @AC-003
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Lista e remove uma versão instalada
    Given uma versão instalada somente no namespace do consumer
    When a pessoa abre a Biblioteca e solicita a remoção
    Then o registry e o arquivo da versão são removidos pelo engine sem tocar no legado
```

#### AC-004 — Leitura ordenada e navegação

**Cobre**: US-002, FR-002, NFR-004

```gherkin
@US-002 @FR-002 @NFR-004 @AC-004
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Abre um capítulo pela Biblioteca
    Given uma versão instalada e um livro com capítulos disponíveis
    When a pessoa seleciona livro e capítulo
    Then o Leitor obtém os versículos pela engine e os exibe em ordem canônica com navegação anterior e próxima
```

#### AC-005 — Referência válida e inválida

**Cobre**: US-002, FR-002, NFR-005

```gherkin
@US-002 @FR-002 @NFR-005 @AC-005
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Resolve ou rejeita uma referência
    Given uma versão instalada e o campo de referência ativo
    When a pessoa informa uma referência válida ou inválida e confirma
    Then uma referência válida abre o contexto correspondente e uma inválida mostra erro tipado com orientação sem quebrar a sessão
```

#### AC-006 — Busca com limite e estado vazio

**Cobre**: US-003, FR-003, NFR-002, NFR-005

```gherkin
@US-003 @FR-003 @NFR-002 @NFR-005 @AC-006
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Busca na versão selecionada
    Given uma versão instalada e a área Busca aberta
    When a pessoa informa um termo ou deixa o campo vazio
    Then a engine retorna resultados limitados com referência e texto, ou a TUI mostra estado vazio orientativo
```

#### AC-007 — Busca offline

**Cobre**: US-003, US-004, FR-003, NFR-002, NFR-005

```gherkin
@US-003 @US-004 @FR-003 @NFR-002 @NFR-005 @AC-007
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Busca depois de desligar a rede
    Given uma versão instalada após uma aquisição concluída
    When a rede fica indisponível e a pessoa busca um termo
    Then a busca usa somente o armazenamento local e retorna o mesmo contrato sem nova chamada HTTP
```

#### AC-008 — Leitura, remoção e navegação offline

**Cobre**: US-004, FR-004, NFR-002, NFR-003

```gherkin
@US-004 @FR-004 @NFR-002 @NFR-003 @AC-008
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Continua usando o consumer sem rede
    Given uma versão instalada e a TUI iniciada após a aquisição
    When a rede é removida e a pessoa navega, lê e remove a versão
    Then todas as ações locais terminam sem rede e o namespace fica consistente
```

#### AC-009 — Atalhos e estados da TUI

**Cobre**: US-004, NFR-001, NFR-005

```gherkin
@US-004 @NFR-001 @NFR-005 @AC-009
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Opera pelos atalhos preservados
    Given a TUI aberta com foco em uma área operável
    When a pessoa usa Tab, setas, Enter, n/p, d/D, :, h, Esc, b, ? e q
    Then a navegação, as ações e os estados carregando, vazio, erro, sucesso e bloqueado são comunicados de forma previsível
```

#### AC-010 — Fronteira pública

**Cobre**: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-005, NFR-004

```gherkin
@US-001 @US-002 @US-003 @US-004 @FR-001 @FR-002 @FR-003 @FR-005 @NFR-004 @AC-010
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Executa pelos exports públicos
    Given o consumer construído no monorepo
    When a conformance inspeciona imports e executa o fluxo
    Then nenhum package interno é importado, o core permanece puro e a jornada usa a engine e os adapters públicos
```

#### AC-011 — Isolamento do legado

**Cobre**: US-001, US-004, FR-001, NFR-003, NFR-004

```gherkin
@US-001 @US-004 @FR-001 @NFR-003 @NFR-004 @AC-011
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Mantém o legado intacto
    Given o consumer configurado com diretório e registry próprios
    When a pessoa instala, reinstala ou remove uma versão
    Then somente o namespace do consumer muda e um teste de integridade confirma que o projeto legado não foi alterado
```

#### AC-012 — Compatibilidade do runtime

**Cobre**: US-001, US-004, FR-001, FR-004, NFR-001, NFR-005

```gherkin
@US-001 @US-004 @FR-001 @FR-004 @NFR-001 @NFR-005 @AC-012
Feature: Consumer TUI sobre o openbible-engine

  Scenario: Executa a prova no runtime alvo
    Given Node.js 26.4+ com `--experimental-ffi` e a versão do OpenTUI fixada na matriz da spike
    When o consumer inicia, recebe uma ação e encerra
    Then a UI renderiza, responde aos atalhos, fecha recursos e a capacidade executada é registrada sem declarar hosts não testados
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O consumer deve listar versões disponíveis pelo `BibleEngine`, instalar uma versão escolhida via `HttpBiblePackageSource` e refletir o registry instalado somente após commit completo.
- **FR-002**: O consumer deve permitir selecionar versão, livro e capítulo, resolver referências pelo `parseReference` da engine e renderizar capítulos ordenados com navegação anterior/próxima.
- **FR-003**: O consumer deve executar `searchVerses` na versão selecionada, respeitar o limite configurado, apresentar referência/texto e tratar termo vazio ou zero resultados.
- **FR-004**: O consumer deve remover versões pelo `uninstallVersion`, fechar recursos antes da remoção e refletir a ausência no registry e no armazenamento isolado.
- **FR-005**: O consumer deve configurar `@openbible/adapter-http` com `baseUrl` e/ou `packageBaseUrl`, sem implementar fetch, mapeamento de arquivos ou fallback paralelo.

#### Não funcionais

- **NFR-001**: O consumer deve compilar e executar em Node.js 26.4+ com `--experimental-ffi` e a versão do OpenTUI registrada na spike; Node.js 22 permanece sem suporte e qualquer outro host não executado deve permanecer sem declaração de suporte. **Verificação**: matriz de capacidade, build, start smoke e teste de conformance.
- **NFR-002**: Depois do commit de uma versão, operações locais não devem provocar rede e devem continuar funcionando com o transporte indisponível. **Verificação**: teste com fetch bloqueado após a instalação e inspeção de chamadas.
- **NFR-003**: Falhas de aquisição, validação, cancelamento, instalação e remoção devem manter registry/armazenamento consistentes, sem parcial, e limitar alterações ao namespace isolado. **Verificação**: testes de rollback, cleanup, reabertura e snapshot de integridade do legado.
- **NFR-004**: O consumer deve usar somente exports públicos e não pode adicionar dependência de plataforma a `engine-core` ou `engine`. **Verificação**: teste de fronteira, inspeção de imports e testes arquiteturais existentes.
- **NFR-005**: A UI deve manter foco previsível, labels/ajuda claros, estados loading, vazio, erro, sucesso e ação bloqueada, respondendo aos atalhos definidos. **Verificação**: testes de navegação/estado e smoke manual no terminal.

#### Erros e casos-limite

- Origem remota ausente ou indisponível → erro `network_unavailable` ou equivalente tipado, sem alterar o armazenamento local.
- Resposta remota inexistente ou bytes sem header/schema compatível → `invalid_package` ou `unsupported_schema`, sem registro parcial.
- Cancelamento durante aquisição ou instalação → `cancelled`, cleanup e preservação da versão anterior.
- Runtime OpenTUI, driver SQLite ou filesystem incompatível → capacidade marcada como não suportada; não simular persistência em memória.
- Versão não instalada → `version_not_installed` e retorno orientado à Biblioteca.
- Referência inválida, capítulo fora do limite ou termo vazio → erro/estado vazio contextual, sem encerrar a TUI.
- Falha de storage ou remoção → erro traduzido, retry quando recuperável e nenhuma divergência entre registry e arquivo.
- Ação incompatível durante instalação/remoção → bloqueio visível até a operação terminar.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

O monorepo usa pnpm 10, Turborepo, TypeScript strict ESM, Node.js 22 para os packages existentes, Vitest, ESLint e Changesets. O consumer TUI exige Node.js 26.4+ com `--experimental-ffi` por causa do OpenTUI `0.5.8`. `@openbible/engine` oferece a façade e ports; `@openbible/adapter-sqlite-node` fornece `createNodeAdapter({ dataDir, registryPath })`; `@openbible/adapter-http` fornece `HttpBiblePackageSource`; `@openbible/engine-testing` fornece fixtures e fakes. O consumer Web usa Next.js e o Native usa Native markup; não existe TUI no monorepo. A TUI legada usa OpenTUI React `0.5.8`, `better-sqlite3`, `bun:sqlite`, parser próprio, registry SQLite e download remoto.

#### Arquitetura e módulos

- `apps/consumer-tui/src/index.ts` inicializa a aplicação e o ciclo de encerramento.
- `apps/consumer-tui/src/config.ts` lê somente configuração não sensível da origem remota e do namespace isolado, como `OPENBIBLE_TUI_API_URL`, `OPENBIBLE_TUI_PACKAGE_BASE_URL`, `OPENBIBLE_TUI_DATA_DIR` e `OPENBIBLE_TUI_REGISTRY_PATH`.
- `apps/consumer-tui/src/engine.ts` compõe `HttpBiblePackageSource`, `createNodeAdapter` e `createBibleEngine`; o diretório default é próprio do consumer e não pode apontar para a árvore legada por acidente.
- `apps/consumer-tui/src/services/scripture-library.ts` coordena estado de tela, `InstallationObserver`, `CancellationToken` e chamadas da façade; não contém parser, SQL ou transação.
- `apps/consumer-tui/src/ui/App.tsx` e `src/ui/components/*` compõem Biblioteca, Leitor, Busca, pickers, feedback e navegação OpenTUI/React.
- `apps/consumer-tui/tests/*` cobre unidade, contrato, conformance, imports públicos, offline, rollback e interação de teclado.
- O legado permanece somente como referência e rollback operacional; não é workspace dependency nem fonte de runtime.

#### Migrations

Não aplicável ao banco legado. O adapter Node cria e reconcilia somente o registry e os arquivos do namespace novo. Não haverá migração de dados; reinstalação ou rollback atua apenas no namespace isolado.

#### Models

Não serão criados modelos de domínio novos. O consumer usa `BibleVersion`, `InstalledBible`, `BibleBook`, `Verse`, `SearchResult`, `BibleReference`, `InstallationProgress` e `EngineError` dos exports públicos. Estado de UI como área ativa, versão selecionada, livro, capítulo, termo e fase da operação é efêmero e não persistido.

#### Controllers e casos de uso

`scripture-library.ts` será um orchestrator fino: `listAvailableVersions`, `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`, `getChapter`, `searchVerses` e `parseReference`. A autorização é a posse local da aplicação; não existe conta ou permissão remota. A entrada é validada pela engine e os códigos de erro são traduzidos somente na UI.

#### Views e experiência

Uma janela única contém as áreas Biblioteca, Leitor e Busca. Biblioteca mostra versões disponíveis/instaladas e download/remover; Leitor mostra selectors de versão/livro/capítulo, anterior/próximo e versículos; Busca mostra campo, resultados e contexto. Loading, vazio, erro com retry, sucesso, offline e bloqueio de ações ficam em área de feedback compartilhada.

#### Queries e repositórios

Não haverá query SQL no consumer. Registry, leitura, busca, reconciliação e instalação pertencem aos adapters. A busca delegada usa limite explícito e a engine garante ordenação; o consumer apenas apresenta os resultados.

#### Jobs e processamento assíncrono

Não haverá job persistente ou fila. Aquisição é uma operação assíncrona iniciada pela pessoa, com `InstallationObserver` para progresso e `CancellationToken` para cancelamento. Retry é explícito na UI; não há retry automático que possa repetir uma instalação sem ação da pessoa.

#### Estrutura de arquivos

```text
apps/consumer-tui/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts
    config.ts
    engine.ts
    services/scripture-library.ts
    ui/App.tsx
    ui/components/LibraryPanel.tsx
    ui/components/ReaderPanel.tsx
    ui/components/SearchPanel.tsx
    ui/components/VersionPicker.tsx
    ui/components/BookPicker.tsx
    ui/components/FeedbackArea.tsx
  tests/
    runtime-spike.test.ts
    engine-composition.test.ts
    install-lifecycle.test.ts
    reader-reference.test.ts
    search-offline.test.ts
    ui-navigation.test.ts
    boundary.test.ts
    conformance.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| `BibleVersion` | `id` normalizado | nome, idioma e metadados do catálogo; origem remota | uma versão pode resultar em um `InstalledBible` |
| `InstalledBible` | `id` da versão | nome, `installedAt`, `versionCode`; só existe após commit do installer | aponta para um arquivo SQLite no namespace do consumer |
| `BibleBook` | `id` canônico | nome, abreviação, testamento e quantidade de capítulos | pertence logicamente a uma versão instalada |
| `Verse` | versão + livro + capítulo + número | texto e referência; ordenação canônica | pertence a um capítulo de uma versão instalada |
| `TuiSessionState` | uma execução da aplicação | área, seleção, termo, fase, erro e foco; efêmero | referencia objetos públicos sem persistir estado de UI |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Versão | disponível | instalar | instalando → instalada | só registrar após validação/commit |
| Versão | instalando | sucesso | instalada | sem temporário utilizável pendente |
| Versão | instalando | erro/cancelamento | disponível ou instalada anterior | rollback/cleanup e anterior preservada |
| Versão | instalada | remover | removendo → disponível | fechar recursos antes de remover arquivo |
| TUI | carregando | resposta local/remota | pronta | ações incompatíveis bloqueadas durante operação |
| TUI | pronta | erro recuperável | erro com retry | código tipado e contexto preservado |

#### Migração e retenção

Não há migração do legado. O namespace novo retém arquivos SQLite e registry enquanto a pessoa não remover a versão; a remoção elimina o arquivo e o registro. O estado da sessão não é retido após o encerramento, salvo qualquer preferência futura explicitamente especificada.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim — a entrega é um consumer TUI usado por pessoas no terminal para instalar, ler, buscar e remover Bíblias offline.

#### Stack e convenções de interface

O alvo é TypeScript strict ESM em Node.js 26.4+ com `--experimental-ffi` e OpenTUI React `0.5.8`. Não há rotas web; a navegação é uma janela única com áreas e teclado. O comportamento a preservar vem de `/home/claudio/Projects/open-bible/apps/tui/src/ui/app.tsx` e componentes relacionados. A composição será própria do novo app; os componentes Native markup não são reutilizados diretamente. Testes usam Vitest e um smoke manual de terminal fica limitado à validação de renderização e foco que não tenha harness estável.

#### Telas e responsabilidades

- **Biblioteca**: lista versões disponíveis/instaladas, inicia download, remove e seleciona versão; entrada é catálogo/registry e saída é estado da biblioteca.
- **Leitor**: seleciona versão, livro e capítulo, aceita referência e exibe versículos; entrada são parâmetros e contratos da engine e saída é conteúdo ordenado.
- **Busca**: recebe termo, executa busca na versão selecionada e mostra resultados com referência/texto; entrada é o campo e saída é a lista ou estado vazio.
- **Feedback compartilhado**: mostra progresso, sucesso, offline, erro e retry; não é uma tela independente, mas acompanha as três áreas.

#### Fluxo de informação e navegação

A pessoa inicia na Biblioteca. `D` abre o catálogo remoto; após instalar, a versão aparece no registry e pode abrir o Leitor. `Tab` alterna painéis; setas e `Enter` selecionam; `d` abre o picker de livro/referência conforme o contexto; `:` abre referência; `h` abre histórico; `n/p` navegam capítulos; `b` volta à Biblioteca; `Esc` fecha o contexto atual; `?` mostra ajuda; `q` encerra. O estado atual e o próximo passo ficam no status bar/feedback. Não há breadcrumb visual web; o título da janela e a indicação da área ativa cumprem o papel de contexto no terminal.

#### Menus e navegação principal

O menu principal é uma barra de áreas com três itens e destinos: `Biblioteca` leva ao painel de versões e ações de instalar/remover; `Leitor` leva aos selectors de versão/livro/capítulo e versículos; `Busca` leva ao campo e aos resultados. O catálogo e o picker de livros são overlays/áreas expandidas acessíveis pelos atalhos `D` e `d`; referência e histórico são entradas/overlays acionados por `:` e `h`. Durante instalação/remoção, ações incompatíveis ficam desabilitadas e o foco permanece no feedback. Não existe permissão por papel nem comportamento responsivo web; a densidade se adapta à largura disponível do terminal sem ocultar o status.

#### Formulários e ações

- **Catálogo/download**: seleção de versão, ação instalar e cancelar; mensagens de origem configurada e progresso; falhas mostram código traduzido e retry.
- **Biblioteca**: ação instalar/remover junto da versão; remoção é diferenciada e bloqueada enquanto houver operação concorrente.
- **Leitor**: selectors de versão/livro/capítulo, entrada de referência e anterior/próximo; capítulo inválido ou versão ausente retorna orientação à Biblioteca.
- **Busca**: campo de termo, submit por Enter ou botão equivalente; termo vazio não chama a engine e mostra orientação; resultados podem abrir o contexto no Leitor.
- **Histórico/ajuda**: ações de consulta sem alteração persistente; `Esc` retorna ao contexto anterior.

#### Composição e disposição

A janela usa cabeçalho com `Scripture Library`, indicador `OFFLINE-FIRST` e área ativa; abaixo ficam tabs/atalhos, painel principal rolável e feedback/status. Biblioteca prioriza lista de versões; Leitor prioriza selectors e texto; Busca prioriza input e resultados. A composição mantém contraste, espaçamento e labels do terminal, com conteúdo longo quebrado e foco visível. A densidade é adaptável ao terminal, sem cards decorativos ou cópia literal da UI legada.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Global | `App` | Estado da janela, áreas e lifecycle | `apps/consumer-tui/src/ui/App.tsx` | OpenTUI React `useKeyboard` e layout próprio | Próprio | Novo; substitui composição acoplada do legado |
| Biblioteca | `LibraryPanel` | Lista, seleção, instalar/remover e estados | `apps/consumer-tui/src/ui/components/LibraryPanel.tsx` | Lista/ações OpenTUI | Próprio | Novo; delega ao service |
| Biblioteca | `VersionPicker` | Catálogo remoto e progresso | `apps/consumer-tui/src/ui/components/VersionPicker.tsx` | Picker/lista OpenTUI | Próprio | Novo; não reutiliza download legado |
| Leitor | `ReaderPanel` | Selectors, navegação e versículos | `apps/consumer-tui/src/ui/components/ReaderPanel.tsx` | Select/list/scroll OpenTUI | Próprio | Novo; usa resultados ordenados da engine |
| Leitor | `BookPicker` | Livro, capítulo e referência | `apps/consumer-tui/src/ui/components/BookPicker.tsx` | Picker/input OpenTUI | Próprio | Novo; parser permanece na engine |
| Busca | `SearchPanel` | Campo, submit e resultados | `apps/consumer-tui/src/ui/components/SearchPanel.tsx` | Input/list OpenTUI | Próprio | Novo; chama `searchVerses` |
| Global | `FeedbackArea` | Loading, erro, retry, sucesso e offline | `apps/consumer-tui/src/ui/components/FeedbackArea.tsx` | Status/alert OpenTUI | Próprio | Novo; contrato comum entre áreas |

#### Estados e acessibilidade

Loading mostra progresso e bloqueia ações incompatíveis; vazio explica instalar ou informar termo; erro mostra mensagem segura, código traduzido quando útil e retry; sucesso confirma a ação; offline informa que operações locais continuam disponíveis. Acessibilidade de terminal será verificada por foco previsível, ordem de navegação, labels claros, ajuda de atalhos, contraste/visibilidade de foco e comunicação textual dos estados. Permissão insuficiente não é aplicável nesta entrega porque não há contas ou autorização remota.

#### APIs expostas

Não há API de aplicação para terceiros. O entrypoint CLI do consumer expõe somente execução local e configuração por ambiente. Internamente, o app usa `createBibleEngine` e tipos/erros exportados; não expõe o caminho físico do namespace, SQL ou stack trace.

#### APIs externas utilizadas

`@openbible/adapter-http` usa `baseUrl` para catálogo/proxy e `packageBaseUrl` para pacotes diretos, ambas configuráveis. Não há autenticação nesta fatia. `fetchImpl` é injetável em testes. Falha de catálogo pode usar o fallback previsto pelo adapter; falha de pacote retorna erro tipado e não há retry automático. O consumer não envia dados de leitura ou registry.

#### Documentação das APIs consultadas

- `packages/engine/src/index.ts`, `engine.ts` e `ports.ts` — façade, ports, observer, cancelamento e erros.
- `packages/adapter-sqlite-node/src/index.ts` — composição Node, `dataDir`, `registryPath`, reconciliação e close.
- `packages/adapter-http/src/http-source.ts` — `baseUrl`, `packageBaseUrl`, catálogo, aquisição e erros.
- `/home/claudio/Projects/open-bible/apps/tui/src/ui/app.tsx` — áreas, atalhos e estados a preservar.

#### Eventos e outros contratos

O adapter emite `InstallationProgress` via `InstallationObserver`; a UI o transforma em status. `CancellationToken` interrompe pontos de aquisição/instalação. `EngineError` e seus códigos são o contrato de falha. Não há eventos persistentes, fila ou sincronização.

### 11. Estratégia TDD

- **Unidade**: configuração segura, composição da engine, mapeamento de estado, bloqueio de ações, tradução de erros e componentes/painéis OpenTUI.
- **Integração/contrato**: `createBibleEngine` com `createNodeAdapter` em armazenamento temporário e `HttpBiblePackageSource` com `fetchImpl` controlado; conformance usa fixture SQLite sintética.
- **BDD/aceite**: AC-001 a AC-012 orientam testes de aquisição, rollback, leitura, referência, busca, offline, teclado, fronteira, isolamento e runtime.
- **Runner TDD**: Vitest, conforme a regra do monorepo e scripts `test`/`test:tdd` do consumer.
- **E2E**: smoke do processo Node/OpenTUI e conformance do fluxo ponta a ponta; rede bloqueada depois do commit.
- **Verificação manual**: executar a janela no terminal para confirmar renderização, foco e legibilidade quando o harness não puder representar o terminal real.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-005, NFR-001, NFR-003, AC-001 | AC-001 | `apps/consumer-tui/tests/install-lifecycle.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/install-lifecycle.test.ts` — exit 1; falha porque `createConsumerTuiEngine` ainda não existe | `pnpm --filter @openbible/consumer-tui exec vitest run tests/install-lifecycle.test.ts -t "instala a versão adquirida"` — 1 passou | Passed: regressão do consumer e monorepo passaram |
| US-001, US-004, FR-001, FR-005, NFR-002, NFR-003, AC-002 | AC-002 | `apps/consumer-tui/tests/install-lifecycle.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; engine ausente para observar rollback | Passed: 1 caso de pacote SQLite inválido preservou registry, arquivo e leitura anterior | Passed: regressão do consumer e monorepo passaram |
| US-001, US-004, FR-001, FR-004, NFR-003, NFR-004, AC-003 | AC-003 | `apps/consumer-tui/tests/install-lifecycle.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; serviço de biblioteca ausente | Passed: instalação, listagem e remoção verificadas sem arquivo residual | Passed: regressão do consumer e monorepo passaram |
| US-002, FR-002, NFR-004, AC-004 | AC-004 | `apps/consumer-tui/tests/reader-reference.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; painel do leitor ausente | Passed: livros e versículos foram verificados em ordem canônica | Passed: regressão do consumer e monorepo passaram |
| US-002, FR-002, NFR-005, AC-005 | AC-005 | `apps/consumer-tui/tests/reader-reference.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; picker de referência ausente | Passed: referência válida resolveu e inválida retornou null | Passed: regressão do consumer e monorepo passaram |
| US-003, FR-003, NFR-002, NFR-005, AC-006 | AC-006 | `apps/consumer-tui/tests/search-offline.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; painel de busca ausente | Passed: resultados respeitaram limite e termo vazio retornou estado vazio | Passed: regressão do consumer e monorepo passaram |
| US-003, US-004, FR-003, NFR-002, NFR-005, AC-007 | AC-007 | `apps/consumer-tui/tests/search-offline.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; serviço local ausente | Passed: busca offline concluiu com uma única chamada HTTP de aquisição | Passed: regressão do consumer e monorepo passaram |
| US-004, FR-004, NFR-002, NFR-003, AC-008 | AC-008 | `apps/consumer-tui/tests/conformance.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; composição do ciclo offline ausente | Passed: leitura, busca, reabertura e remoção concluíram sem rede | Passed: regressão do consumer e monorepo passaram |
| US-004, NFR-001, NFR-005, AC-009 | AC-009 | `apps/consumer-tui/tests/ui-navigation.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; shell e atalhos ausentes | Passed: renderer, ajuda, Esc e q foram exercitados no harness OpenTUI | Passed: regressão do consumer e monorepo passaram |
| US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, NFR-004, AC-010 | AC-010 | `apps/consumer-tui/tests/boundary.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; composição pública ausente | Passed: imports e dependências foram limitados aos três packages públicos | Passed: regressão do consumer e monorepo passaram |
| US-001, US-004, FR-001, NFR-003, NFR-004, AC-011 | AC-011 | `apps/consumer-tui/tests/conformance.test.ts` com marcador `SPECSFY:` | `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; configuração isolada ausente | Passed: paths legados foram rejeitados sem alterar seus mtimes | Passed: regressão do consumer e monorepo passaram |
| US-001, US-004, FR-001, FR-004, NFR-001, NFR-005, AC-012 | AC-012 | `apps/consumer-tui/tests/runtime-spike.test.ts` com marcador `SPECSFY:` | `pnpm --filter @openbible/consumer-tui exec vitest run tests/runtime-spike.test.ts` — exit 1 em Node.js 22.23.2; host não suportado | `PATH=.../node/26.7.0/bin NODE_OPTIONS=--experimental-ffi pnpm --filter @openbible/consumer-tui exec vitest run tests/runtime-spike.test.ts` — exit 0 em Node.js 26.7.0 | Passed: a flag é obrigatória para OpenTUI 0.5.8 |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Integração | `tests/install-lifecycle.test.ts` | Passed: 1 teste de instalação remota passou após composição oficial |
| FR-001 | AC-002 | Integração/falha | `tests/install-lifecycle.test.ts` | Passed: rollback preservou instalação anterior |
| FR-001 | AC-003 | Conformance | `tests/conformance.test.ts` | Passed: registry e remoção verificadas |
| FR-002 | AC-004 | Integração/UI | `tests/reader-reference.test.ts` | Passed: capítulo canônico verificado |
| FR-002 | AC-005 | Unidade/UI | `tests/reader-reference.test.ts` | Passed: referências válida e inválida verificadas |
| FR-002 | AC-010 | Arquitetural | `tests/boundary.test.ts` | Passed: somente imports públicos verificados |
| FR-003 | AC-006 | Integração/UI | `tests/search-offline.test.ts` | Passed: limite e estado vazio verificados |
| FR-003 | AC-007 | Conformance offline | `tests/search-offline.test.ts` | Passed: busca sem chamada HTTP adicional |
| FR-003 | AC-010 | Arquitetural | `tests/boundary.test.ts` | Passed: boundary do consumer verificada |
| FR-004 | AC-003 | Integração | `tests/install-lifecycle.test.ts` | Passed: uninstall e ausência de arquivo verificadas |
| FR-004 | AC-008 | Conformance offline | `tests/conformance.test.ts` | Passed: leitura e remoção offline verificadas |
| FR-004 | AC-012 | Runtime/UI | `tests/runtime-spike.test.ts` | Passed: renderer iniciou e encerrou em Node.js 26.7.0 |
| FR-005 | AC-001 | Integração HTTP | `tests/install-lifecycle.test.ts` | Passed: aquisição via `HttpBiblePackageSource` verificada |
| FR-005 | AC-002 | Integração HTTP/falha | `tests/install-lifecycle.test.ts` | Passed: falha de validação não criou pacote parcial |
| FR-005 | AC-010 | Arquitetural | `tests/boundary.test.ts` | Passed: composição usa exports públicos |
| NFR-001 | AC-001 | Runtime/conformance | `tests/runtime-spike.test.ts` | Passed: Node.js 26.7.0 com `--experimental-ffi` |
| NFR-001 | AC-009 | UI smoke | `tests/ui-navigation.test.ts` | Passed: foco e atalhos OpenTUI verificados |
| NFR-001 | AC-012 | Runtime smoke | `tests/runtime-spike.test.ts` | Passed: capacidade efetiva registrada |
| NFR-002 | AC-002 | Falha/offline | `tests/install-lifecycle.test.ts` | Passed: erro tipado e rollback verificados |
| NFR-002 | AC-007 | Conformance offline | `tests/search-offline.test.ts` | Passed: rede bloqueada após aquisição |
| NFR-002 | AC-008 | Conformance offline | `tests/conformance.test.ts` | Passed: ciclo local sem rede verificado |
| NFR-003 | AC-001 | Integração | `tests/install-lifecycle.test.ts` | Passed: commit refletiu registry instalado |
| NFR-003 | AC-002 | Rollback | `tests/install-lifecycle.test.ts` | Passed: arquivo anterior e registry preservados |
| NFR-003 | AC-003 | Isolamento/remoção | `tests/conformance.test.ts` | Passed: namespace removido sem resíduos |
| NFR-004 | AC-003 | Arquitetural/conformance | `tests/boundary.test.ts` | Passed: fronteira pública verificada |
| NFR-004 | AC-010 | Arquitetural | `tests/boundary.test.ts` | Passed: nenhum import interno detectado |
| NFR-004 | AC-011 | Integridade do legado | `tests/conformance.test.ts` | Passed: mtimes do legado permaneceram iguais |
| NFR-005 | AC-005 | UI/teclado | `tests/ui-navigation.test.ts` | Passed: foco e fechamento de overlay verificados |
| NFR-005 | AC-006 | UI/estado | `tests/search-offline.test.ts` | Passed: estado vazio orientativo verificado |
| NFR-005 | AC-009 | UI/teclado | `tests/ui-navigation.test.ts` | Passed: atalhos principais verificados |
| NFR-005 | AC-012 | Smoke manual automatizado | `tests/runtime-spike.test.ts` | Passed: smoke OpenTUI executado no host suportado |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed (2026-08-28)
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md`
- **Achados**: A definição atual foi validada após registrar o runtime suportado pelo OpenTUI 0.5.8: Node.js 26.4+ com `--experimental-ffi`. Node.js 22.23.2 permanece explicitamente fora do suporte. Problema, resultado, escopo, riscos, decisões, interface, BDD, pesquisa local e cobertura dos IDs permanecem consistentes; revisão especializada passou sem `P1 Open`.
- **Revisão especializada**: `review_findings.mjs` — `Reviews: PASSED`; nenhum finding `P1 Open`.
- Findings especializados, quando aplicáveis, seguem `FIND-PROD|ARCH|SEC-NNN`, severidade `P1|P2|P3`, estado `Open|Resolved|Accepted`, refs e evidência.

#### Gate do Ato II — Plano

- **Resultado**: Passed (2026-08-28)
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md` e `node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md`
- **Achados**: O plano foi reconciliado com o runtime Node.js 26.4+ e `--experimental-ffi`. Há 23 tarefas concluídas, 14 predecessores TDD, cobertura dos 26 IDs e a subseção de interface validada, sem dependência cíclica ou predecessor TDD aberto para código.
- **RED inicial**: `T001` e os demais casos TDD foram materializados em `apps/consumer-tui/tests/`; o conjunto executou 12 testes e falhou somente pela ausência das capacidades de produção previstas.

#### Gate do Ato III — Entrega

- **Resultado**: Passed (2026-08-28)
- **Comando**: `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md apps/consumer-tui`, `node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md /home/claudio/Projects/openbible-engine --json`, `node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs specs/completed/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md /home/claudio/Projects/openbible-engine`
- **Achados**: Os 26/26 IDs estão cobertos em 7 arquivos; os 12 ACs possuem resultado `Passed`; as 23 tarefas possuem evidência estrita; a suíte atual da TUI passou com 7 arquivos e 14 testes; a regressão completa do monorepo passou com 52 tarefas Turbo, e o smoke OpenTUI passou em Node.js 26.7.0 com `--experimental-ffi`. Node.js 22.23.2 permanece documentado somente como host incompatível, não como suporte.

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

- [x] T001 [TEST] [TDD] [US-001] Derivar o RED do AC-001 para instalação remota bem-sucedida em `apps/consumer-tui/tests/install-lifecycle.test.ts` — Refs: US-001, FR-001, FR-005, NFR-001, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Isolar fixture SQLite, transporte HTTP controlado, namespace temporário e runtime Node.js 26.4+ com `--experimental-ffi`.
  - [x] **EXECUTE**: Escrever o caso de instalação com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado: Vitest executou 1 teste e falhou porque `createConsumerTuiEngine` ainda não existe.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/install-lifecycle.test.ts` — exit 1, runtime Node.js 22.23.2, na seção 11.
  - [x] **IMPROVE**: O caso exige instalação/commit no registry, não apenas bytes recebidos; nenhuma melhoria adicional foi necessária.

- [x] T002 [TEST] [TDD] [US-001] Derivar o RED do AC-002 para falha de aquisição ou validação em `apps/consumer-tui/tests/install-lifecycle.test.ts` — Refs: US-001, US-004, FR-001, FR-005, NFR-002, NFR-003, AC-002 — Depends: none
  - [x] **PREP**: Definir respostas HTTP indisponível/inválida e uma versão anterior instalada no namespace isolado.
  - [x] **EXECUTE**: Escrever o caso de rollback com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: caso falhou porque a composição do consumer ainda não existe.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; estado de rollback permanece não implementado.
  - [x] **IMPROVE**: O caso separa falha de rede de falha de pacote inválido; nenhuma melhoria adicional foi necessária.

- [x] T003 [TEST] [TDD] [US-001] Derivar o RED do AC-003 para listagem e remoção pela Biblioteca em `apps/consumer-tui/tests/install-lifecycle.test.ts` — Refs: US-001, US-004, FR-001, FR-004, NFR-003, NFR-004, AC-003 — Depends: none
  - [x] **PREP**: Confirmar que o cenário lê somente registry e arquivos do namespace do consumer.
  - [x] **EXECUTE**: Escrever listagem, remoção e reabertura com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: serviço de biblioteca ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; namespace legado não foi acessado.
  - [x] **IMPROVE**: O cenário exige fechar recursos antes da remoção; nenhuma melhoria adicional foi necessária.

- [x] T004 [TEST] [TDD] [US-002] Derivar o RED do AC-004 para leitura ordenada em `apps/consumer-tui/tests/reader-reference.test.ts` — Refs: US-002, FR-002, NFR-004, AC-004 — Depends: none
  - [x] **PREP**: Selecionar fixture com livro, capítulos e versículos fora de ordem física.
  - [x] **EXECUTE**: Escrever seleção e leitura canônica com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: painel do leitor ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1 e ordem canônica esperada.
  - [x] **IMPROVE**: O teste mantém ordenação como responsabilidade da engine/adapter.

- [x] T005 [TEST] [TDD] [US-002] Derivar o RED do AC-005 para referências válidas e inválidas em `apps/consumer-tui/tests/reader-reference.test.ts` — Refs: US-002, FR-002, NFR-005, AC-005 — Depends: none
  - [x] **PREP**: Definir referências válidas, inválidas e mensagens seguras esperadas.
  - [x] **EXECUTE**: Escrever confirmação e erro tipado com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: picker de referência ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1, entrada e erro esperados.
  - [x] **IMPROVE**: O teste não reimplementa aliases ou normalização.

- [x] T006 [TEST] [TDD] [US-003] Derivar o RED do AC-006 para busca com limite e estado vazio em `apps/consumer-tui/tests/search-offline.test.ts` — Refs: US-003, FR-003, NFR-002, NFR-005, AC-006 — Depends: none
  - [x] **PREP**: Definir termo com resultados, limite explícito e termo vazio na fixture.
  - [x] **EXECUTE**: Escrever busca e estado orientativo com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: painel de busca ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1, limite e estado vazio esperados.
  - [x] **IMPROVE**: O caso cobre zero resultados sem exigir exceção não tratada.

- [x] T007 [TEST] [TDD] [US-003] Derivar o RED do AC-007 para busca sem rede em `apps/consumer-tui/tests/search-offline.test.ts` — Refs: US-003, US-004, FR-003, NFR-002, NFR-005, AC-007 — Depends: none
  - [x] **PREP**: Instalar uma fixture antes de bloquear qualquer chamada HTTP.
  - [x] **EXECUTE**: Escrever busca offline e contador de chamadas com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: serviço local ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1 e zero chamadas esperadas após commit.
  - [x] **IMPROVE**: A prova permanece independente da disponibilidade externa.

- [x] T008 [TEST] [TDD] [US-004] Derivar o RED do AC-008 para leitura, navegação e remoção offline em `apps/consumer-tui/tests/conformance.test.ts` — Refs: US-004, FR-004, NFR-002, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Preparar ciclo completo com rede removida após a instalação.
  - [x] **EXECUTE**: Escrever o cenário local ponta a ponta com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: composição do ciclo offline ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1 e sequência instalar → ler → buscar → remover.
  - [x] **IMPROVE**: O caso permite isolar a etapa local que falhar.

- [x] T009 [TEST] [TDD] [US-004] Derivar o RED do AC-009 para atalhos e estados da TUI em `apps/consumer-tui/tests/ui-navigation.test.ts` — Refs: US-004, NFR-001, NFR-005, AC-009 — Depends: none
  - [x] **PREP**: Mapear `Tab`, setas, `Enter`, `n/p`, `d/D`, `:`, `h`, `Esc`, `b`, `?` e `q` para destinos.
  - [x] **EXECUTE**: Escrever a sequência de teclado e estados loading/vazio/erro/sucesso/bloqueado com `SPECSFY:`.
  - [x] **VERIFY**: RED válido observado no conjunto: shell, foco e feedback ausentes.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1, sequência e estados esperados.
  - [x] **IMPROVE**: A prova permanece comportamental, sem acoplamento ao markup interno.

- [x] T010 [TEST] [TDD] [US-001] Derivar o RED do AC-010 para imports públicos e core puro em `apps/consumer-tui/tests/boundary.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-005, NFR-004, AC-010 — Depends: none
  - [x] **PREP**: Enumerar exports permitidos e padrões de import proibidos.
  - [x] **EXECUTE**: Escrever inspeção arquitetural com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: composição pública ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1 e imports esperados.
  - [x] **IMPROVE**: A regra será capaz de falhar quando dependência proibida for adicionada.

- [x] T011 [TEST] [TDD] [US-001] Derivar o RED do AC-011 para isolamento do legado em `apps/consumer-tui/tests/conformance.test.ts` — Refs: US-001, US-004, FR-001, NFR-003, NFR-004, AC-011 — Depends: none
  - [x] **PREP**: Capturar baseline de integridade do projeto legado sem acessá-lo como runtime.
  - [x] **EXECUTE**: Escrever instalação/reinstalação/remoção isoladas com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no conjunto: configuração isolada ausente.
  - [x] **EVIDENCE**: Registrar `pnpm exec vitest run apps/consumer-tui/tests/*.test.ts` — exit 1; baseline e namespace permanecem não alterados.
  - [x] **IMPROVE**: O caso detectará escrita fora do diretório temporário.

- [x] T012 [TEST] [TDD] [US-001] Derivar o RED do AC-012 para runtime Node/OpenTUI em `apps/consumer-tui/tests/runtime-spike.test.ts` — Refs: US-001, US-004, FR-001, FR-004, NFR-001, NFR-005, AC-012 — Depends: none
  - [x] **PREP**: Fixar Node.js 26.4+ com `--experimental-ffi`, versão OpenTUI observada e host efetivamente executado.
  - [x] **EXECUTE**: Escrever smoke de iniciar, responder a uma ação e encerrar com marcador `SPECSFY:` e script `test:tdd`.
  - [x] **VERIFY**: RED válido observado no smoke real: OpenTUI 0.5.8 não inicializa em Node.js 22.23.2 porque `node:ffi` não existe nesse runtime.
  - [x] **EVIDENCE**: Registrar `pnpm --filter @openbible/consumer-tui exec vitest run tests/runtime-spike.test.ts` — exit 1; a documentação local do OpenTUI exige Bun 1.3+ ou Node.js 26.4+ com `--experimental-ffi`.
  - [x] **IMPROVE**: O caso separa falhas de OpenTUI, SQLite e composição da engine.

#### Fase 2 — Fundação e integração do engine

- [x] T013 [CODE] [US-001] Criar package, configuração e namespace seguro em `apps/consumer-tui/package.json`, `apps/consumer-tui/tsconfig.json` e `apps/consumer-tui/src/config.ts` — Refs: US-001, US-004, FR-001, FR-005, NFR-001, NFR-003, AC-001, AC-002, AC-012 — Depends: T001, T002, T012
  - [x] **PREP**: Dependências workspace, Node.js 26.4+ com `--experimental-ffi`, variáveis não sensíveis e defaults fora do legado confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Manifest, TypeScript strict e validação de paths sem credenciais implementados.
  - [x] **VERIFY**: `build`, `typecheck`, `lint` e o teste focal de configuração passaram; o restante do TDD continua RED para T014–T019.
  - [x] **EVIDENCE**: Arquivos, comandos e namespace resolvido registrados no comentário `specsfy:evidence`; documentação reconstruída e `--check` passou.
  - [x] **IMPROVE**: A configuração rejeita paths dentro do projeto legado e normaliza URLs HTTP(S); nenhuma melhoria adicional foi necessária.
  <!-- specsfy:evidence {"task":"T013","refs":["US-001","US-004","FR-001","FR-005","NFR-001","NFR-003","AC-001","AC-002","AC-012"],"files":["apps/consumer-tui/package.json","apps/consumer-tui/tsconfig.json","apps/consumer-tui/src/config.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui build","exit":0},{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui exec vitest run tests/conformance.test.ts -t \"mantém o legado\"","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T014 [CODE] [US-001] Compor a façade com adapters oficiais em `apps/consumer-tui/src/engine.ts` — Refs: US-001, US-004, FR-001, FR-004, FR-005, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-011, AC-012 — Depends: T001, T002, T003, T011, T012
  - [x] **PREP**: `createNodeAdapter`, `HttpBiblePackageSource`, `createBibleEngine`, lifecycle e fechamento confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Composição somente por exports públicos e URLs configuráveis implementada.
  - [x] **VERIFY**: Typecheck, lint, documentação e o teste focal de instalação passaram; o smoke OpenTUI depende de Node.js 26.4+ com `--experimental-ffi`.
  - [x] **EVIDENCE**: Adapter, registry, source, reconcile e close registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Storage, HTTP e engine permanecem atrás das ports existentes; nenhum wrapper de domínio duplicado foi criado.
  <!-- specsfy:evidence {"task":"T014","refs":["US-001","US-004","FR-001","FR-004","FR-005","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-011","AC-012"],"files":["apps/consumer-tui/src/engine.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui exec vitest run tests/install-lifecycle.test.ts -t \"instala a versão adquirida\"","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T015 [CODE] [US-001] Implementar o serviço fino da biblioteca em `apps/consumer-tui/src/services/scripture-library.ts` — Refs: US-001, US-003, US-004, FR-001, FR-003, FR-004, FR-005, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-006, AC-007, AC-008, AC-011 — Depends: T001, T002, T003, T006, T007, T008, T011
  - [x] **PREP**: Façade, observer, cancelamento, limites e tradução de `EngineError` confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Catálogo, instalação, listagem, leitura, busca e remoção são encaminhados sem SQL, parser ou transação local.
  - [x] **VERIFY**: Typecheck, lint, documentação e 6 testes focais do serviço/conformance passaram; o teste de `SearchPanel` permanece para T018.
  - [x] **EVIDENCE**: Estados, códigos, chamadas locais e cleanup registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: O serviço fecha o engine de forma idempotente e mantém a busca vazia local; nenhuma melhoria adicional foi necessária.
  <!-- specsfy:evidence {"task":"T015","refs":["US-001","US-003","US-004","FR-001","FR-003","FR-004","FR-005","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-006","AC-007","AC-008","AC-011"],"files":["apps/consumer-tui/src/services/scripture-library.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui exec vitest run tests/install-lifecycle.test.ts tests/search-offline.test.ts tests/conformance.test.ts -t \"instala a versão adquirida|preserva a versão anterior|lista e remove|busca no armazenamento local|completa leitura|mantém o legado\"","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase de interface

- [x] T016 [CODE] [US-001] Implementar a tela Biblioteca e o catálogo em `apps/consumer-tui/src/ui/components/LibraryPanel.tsx` e `apps/consumer-tui/src/ui/components/VersionPicker.tsx` — Refs: US-001, US-004, FR-001, FR-004, NFR-005, AC-001, AC-003, AC-009, AC-011 — Depends: T003, T009, T011
  - [x] **PREP**: Itens/destinos do menu Biblioteca, foco, instalação, remoção e feedback confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Lista, picker, ações por atalhos, progresso e estados compostos sem acesso direto ao storage.
  - [x] **VERIFY**: Typecheck, build, lint, documentação e os 12 testes TDD do consumer passaram.
  - [x] **EVIDENCE**: Sequência de teclado, estado da versão e feedback estão cobertos pelos componentes e registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Instalar/remover são diferenciados visualmente e operações incompatíveis ficam bloqueadas durante busy.
  <!-- specsfy:evidence {"task":"T016","refs":["US-001","US-004","FR-001","FR-004","NFR-005","AC-001","AC-003","AC-009","AC-011"],"files":["apps/consumer-tui/src/ui/components/LibraryPanel.tsx","apps/consumer-tui/src/ui/components/VersionPicker.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui build","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui test:tdd","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T017 [CODE] [US-002] Implementar a tela Leitor e seus pickers em `apps/consumer-tui/src/ui/components/ReaderPanel.tsx` e `apps/consumer-tui/src/ui/components/BookPicker.tsx` — Refs: US-002, FR-002, NFR-005, AC-004, AC-005, AC-009, AC-012 — Depends: T005, T009, T012
  - [x] **PREP**: Destinos Leitor, selectors, referência, anterior/próxima, foco e conteúdo longo confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Selectors, entrada de referência, versículos e navegação compostos delegando ao serviço.
  - [x] **VERIFY**: Typecheck, lint, documentação e os 2 testes de leitura/referência passaram com fixture SQLite real.
  - [x] **EVIDENCE**: Conteúdo, referência válida/ inválida, ordem canônica e contratos registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Aliases, ordenação e limites continuam responsabilidade do parser/engine; o componente apenas apresenta e encaminha.
  <!-- specsfy:evidence {"task":"T017","refs":["US-002","FR-002","NFR-005","AC-004","AC-005","AC-009","AC-012"],"files":["apps/consumer-tui/src/ui/components/ReaderPanel.tsx","apps/consumer-tui/src/ui/components/BookPicker.tsx","apps/consumer-tui/tests/reader-reference.test.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui exec vitest run tests/reader-reference.test.ts","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T018 [CODE] [US-003] Implementar a tela Busca em `apps/consumer-tui/src/ui/components/SearchPanel.tsx` — Refs: US-003, US-004, FR-003, NFR-002, NFR-005, AC-006, AC-007, AC-008 — Depends: T006, T007, T008
  - [x] **PREP**: Campo, submit por Enter, limite, zero resultados e indicador offline confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Input, resultados selecionáveis com referência/texto e estado vazio compostos usando o serviço.
  - [x] **VERIFY**: Typecheck, lint, os 2 testes de busca e a regressão OpenTUI do texto dos versículos passaram com limite, termo vazio e rede bloqueada após instalação.
  - [x] **EVIDENCE**: Chamadas HTTP, resultados, limite e mensagens registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Busca permanece local após o commit e submissão de termo vazio não chama a engine; o seletor ocupa o espaço disponível e exibe o texto dos versículos.
  <!-- specsfy:evidence {"task":"T018","refs":["US-003","US-004","FR-003","NFR-002","NFR-005","AC-006","AC-007","AC-008"],"files":["apps/consumer-tui/src/ui/components/SearchPanel.tsx","apps/consumer-tui/tests/search-offline.test.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"pnpm --filter @openbible/consumer-tui exec vitest run tests/search-offline.test.ts","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T019 [CODE] [US-004] Implementar shell, navegação, feedback e lifecycle em `apps/consumer-tui/src/ui/App.tsx` e `apps/consumer-tui/src/ui/components/FeedbackArea.tsx` — Refs: US-001, US-003, US-004, NFR-001, NFR-002, NFR-005, AC-002, AC-006, AC-007, AC-008, AC-009, AC-012 — Depends: T006, T009, T012
  - [x] **PREP**: Três itens de menu, destinos, atalhos, estados e encerramento confirmados; reconstrução independente de `docs/` por `$specsfy-documentator` preparada antes de EXECUTE.
  - [x] **EXECUTE**: Janela única, tabs, status, overlays, bloqueios, retry e close de recursos compostos.
  - [x] **VERIFY**: Navegação, feedback, busca offline e smoke de inicialização/encerramento passaram em Node.js 26.7.0 com `--experimental-ffi`.
  - [x] **EVIDENCE**: Foco, status, sequência de teclas e lifecycle estão cobertos pelos testes OpenTUI e registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: O shell mantém o próximo passo visível, bloqueia ações incompatíveis e apresenta erro recuperável com retry.
  <!-- specsfy:evidence {"task":"T019","refs":["US-001","US-003","US-004","NFR-001","NFR-002","NFR-005","AC-002","AC-006","AC-007","AC-008","AC-009","AC-012"],"files":["apps/consumer-tui/package.json","apps/consumer-tui/src/index.ts","apps/consumer-tui/src/ui/App.tsx","apps/consumer-tui/src/ui/components/FeedbackArea.tsx","apps/consumer-tui/tests/ui-navigation.test.ts","apps/consumer-tui/tests/runtime-spike.test.ts"],"commands":[{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui build","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui test:tdd","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH NODE_OPTIONS=--experimental-ffi pnpm --filter @openbible/consumer-tui exec vitest run tests/runtime-spike.test.ts","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T020 [DOC] [US-001] Atualizar o inventário da interface em `INTERFACE.md` — Refs: US-001, US-002, US-003, US-004, NFR-001, NFR-005, AC-009, AC-012 — Depends: T016, T017, T018, T019
  - [x] **PREP**: Telas, menus, componentes, APIs, estados, consumer e capacidade OpenTUI/Node 26.7.0 comprovada com `--experimental-ffi` conferidos.
  - [x] **EXECUTE**: Biblioteca, Leitor, Busca, Feedback, shell TUI, runtime e regra de reaproveitamento registrados no arquivo canônico.
  - [x] **VERIFY**: Blocos, telas, estados, atalhos, API interna e host validado conferidos contra a seção 10; `git diff --check` passou.
  - [x] **EVIDENCE**: Diff de `INTERFACE.md`, comando de verificação e host Node.js 26.7.0 com `--experimental-ffi` registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Claims genéricos de ausência de componentes foram removidos; o inventário agora separa Web, Native e TUI e não declara suporte a Node.js 22.
  <!-- specsfy:evidence {"task":"T020","refs":["US-001","US-002","US-003","US-004","NFR-001","NFR-005","AC-009","AC-012"],"files":["INTERFACE.md"],"commands":[{"run":"git diff --check -- INTERFACE.md","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase 4 — Conformance e documentação

- [x] T021 [TEST] [US-001] Executar conformance ponta a ponta em `apps/consumer-tui/tests/conformance.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-002, NFR-003, NFR-004, AC-001, AC-002, AC-003, AC-004, AC-006, AC-007, AC-008, AC-010, AC-011 — Depends: T014, T015, T016, T017, T018, T019
  - [x] **PREP**: Fixture SQLite, diretório temporário, transporte controlado, rede bloqueada e baseline de isolamento do legado preparados.
  - [x] **EXECUTE**: Executar instalar → listar → ler → referenciar → buscar → remover → reabrir sobre SQLite real e exports públicos.
  - [x] **VERIFY**: Conformance passou confirmando persistência após reabertura, rede bloqueada após aquisição, resultado limitado, remoção e rejeição de paths do legado.
  - [x] **EVIDENCE**: Contagens, arquivos temporários, uma chamada HTTP exclusiva de aquisição e IDs de aceite registrados no teste e no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: O teste separa aquisição, leitura local, persistência, remoção e fronteira de configuração para diagnosticar cada camada.
  <!-- specsfy:evidence {"task":"T021","refs":["US-001","US-002","US-003","US-004","FR-001","FR-002","FR-003","FR-004","FR-005","NFR-002","NFR-003","NFR-004","AC-001","AC-002","AC-003","AC-004","AC-006","AC-007","AC-008","AC-010","AC-011"],"files":["apps/consumer-tui/tests/conformance.test.ts","apps/consumer-tui/src/config.ts"],"commands":[{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui exec vitest run tests/conformance.test.ts","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T022 [DOC] [US-004] Atualizar contexto técnico e dependências em `PROJECT.md`, `.specsfy/STACK.md` e `.specsfy/PACKAGES.md` — Refs: US-001, US-002, US-003, US-004, NFR-001, NFR-002, NFR-004, AC-010, AC-012 — Depends: T013, T014, T015, T016, T017, T018, T019, T020
  - [x] **PREP**: Manifest, scripts, packages, runtime, origem remota, suporte e ausência de alteração no legado inventariados; `DATABASE.md` não requer alteração porque nenhum schema foi modificado.
  - [x] **EXECUTE**: `PROJECT.md` e `.specsfy/STACK.md` atualizados; `docs/` e `.specsfy/PACKAGES.md` reconstruídos com `$specsfy-documentator`.
  - [x] **VERIFY**: Documentator, `--check`, monitor e `git diff --check` passaram; `.specsfy/DATABASE.md` permanece sem alteração porque nenhum schema foi modificado.
  - [x] **EVIDENCE**: Caminhos, inventário, runtime Node.js 26.7.0 e resultados dos comandos registrados no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Documentação separa o Node.js 22 global do consumer TUI Node.js 26.4+ e remove claims de suporte não executados.
  <!-- specsfy:evidence {"task":"T022","refs":["US-001","US-002","US-003","US-004","NFR-001","NFR-002","NFR-004","AC-010","AC-012"],"files":["PROJECT.md",".specsfy/STACK.md",".specsfy/PACKAGES.md","docs/README.md","docs/application.md","docs/architecture.md","docs/frontend.md","docs/packages.md","docs/testing.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"git diff --check -- PROJECT.md .specsfy/STACK.md .specsfy/PACKAGES.md docs","exit":0}]} -->

- [x] T023 [TEST] Executar regressão, rastreabilidade e checks do monorepo em `apps/consumer-tui/tests/` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012 — Depends: T020, T021, T022
  - [x] **PREP**: Build, typecheck, lint, Vitest, smoke Node/OpenTUI, rastreabilidade, monitor e verificação de evidência identificados.
  - [x] **EXECUTE**: Checks focais, regressão do monorepo e comandos dos três gates executados.
  - [x] **VERIFY**: Ausência de gaps confirmada: 26/26 IDs, 12/12 ACs, 23/23 tarefas, 7 arquivos e 14 testes da TUI; somente Node.js 26.7.0 com `--experimental-ffi` é declarado como host suportado.
  - [x] **EVIDENCE**: Contagens, comandos, exits, resultados e IDs registrados nas seções 11–13 e no comentário `specsfy:evidence`.
  - [x] **IMPROVE**: Probes de importação de rollback, remoção e boundary foram substituídos por asserções reais; não há limitação residual aberta nesta fatia.
  <!-- specsfy:evidence {"task":"T023","refs":["US-001","US-002","US-003","US-004","FR-001","FR-002","FR-003","FR-004","FR-005","NFR-001","NFR-002","NFR-003","NFR-004","NFR-005","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012"],"files":["apps/consumer-tui/tests/install-lifecycle.test.ts","apps/consumer-tui/tests/boundary.test.ts","apps/consumer-tui/tests/conformance.test.ts","apps/consumer-tui/tests/reader-reference.test.ts","apps/consumer-tui/tests/search-offline.test.ts","apps/consumer-tui/tests/ui-navigation.test.ts","apps/consumer-tui/tests/runtime-spike.test.ts"],"commands":[{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui test:tdd","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui build","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui typecheck","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm --filter @openbible/consumer-tui lint","exit":0},{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH pnpm turbo run build test typecheck lint check","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md apps/consumer-tui","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md /home/claudio/Projects/openbible-engine --json","exit":0},{"run":"node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md","exit":0},{"run":"node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md --json","exit":0},{"run":"node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/in-progress/0006-migracao-da-tui-para-consumir-openbible-engine/spec.md","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001–T012 (RED TDD) → T013 → T014 → T015 → T016/T017/T018/T019 → T020/T021 → T022 → T023.
- T001–T012 são tarefas TDD distintas, uma por AC; não criam arquivos `.feature` nem step definitions e usam somente o runner Vitest confirmado pelo monorepo.
- T016, T017, T018 e T019 compõem a subseção obrigatória de interface: Biblioteca, Leitor, Busca e Feedback/shell, respectivamente; só começam após o serviço e seus três predecessores TDD rastreáveis.
- O MVP é uma versão adquirida remotamente e usada ponta a ponta em namespace isolado: instalar, listar, ler, referenciar, buscar, remover e repetir offline; nenhum dado do legado participa.
- O fechamento exige `INTERFACE.md`, `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/PACKAGES.md`, `docs/`, conformance, regressão e evidência de apenas Node.js/OpenTUI efetivamente executados.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- Specs 0001, 0002, 0003 e 0005 como contratos e precedentes entregues.
- `@openbible/engine`, `@openbible/adapter-http`, `@openbible/adapter-sqlite-node`, `@openbible/engine-testing` e toolchain Node/Vitest disponíveis no workspace.
- OpenTUI compatível com Node.js 26.4+ e `--experimental-ffi`, ou uma capacidade equivalente comprovada pela spike, sem mover UI para outro runtime por inferência.

#### Riscos

- OpenTUI pode depender de Bun ou de capacidades de terminal ausentes em Node → mitigar com spike executável, matriz explícita e sem declarar suporte não comprovado.
- Download remoto pode falhar ou variar → mitigar com URLs configuráveis, `fetchImpl` controlado em testes, erros tipados e ausência de retry automático.
- Namespace isolado pode ser configurado para path indevido → mitigar com defaults próprios, validação de configuração e teste de integridade do legado.
- UI pode duplicar lógica da TUI legada → mitigar por boundary test, service fino e conformance pelos exports públicos.
- Terminal real pode divergir do harness → mitigar com smoke manual mínimo e registrar host/capacidade executados.

#### Suposições

- `apps/consumer-tui` é o nome técnico adotado para o novo app privado, sem modificar o legado.
- O contrato atual de `@openbible/adapter-http` é suficiente para catálogo e aquisição sem novo serviço.
- A origem remota ou seu double de teste fornece uma fixture compatível com o schema aceito pelo adapter Node.
- O significado de offline nesta fatia começa após uma instalação concluída; aquisição inicial pode exigir rede.
- Não há autenticação, dados pessoais ou retenção de sessão além dos arquivos locais da Bíblia.

### 17. Decisões

- **DEC-001**: Usar Node.js 26.4+ com `--experimental-ffi` na primeira fatia — requisito efetivo do OpenTUI 0.5.8; o adapter SQLite Node continua sendo reutilizado e Bun permanece fora do escopo.
- **DEC-002**: Entregar fluxo ponta a ponta — maximiza a prova do consumer real, embora exija coordenar aquisição, storage, leitura, busca e UI.
- **DEC-003**: Usar namespace isolado — reduz risco de corrupção e torna rollback por troca para o legado simples; não há migração automática de dados.
- **DEC-004**: Criar `apps/consumer-tui` no monorepo — mantém o legado intocado e transforma a prova em consumer substituível e reproduzível.
- **DEC-005**: Preservar jornada e atalhos atuais com liberdade visual — protege a aprendizagem da pessoa sem prender a implementação nova à estrutura legada.
- **DEC-006**: Permitir download remoto configurável — cobre a jornada real de aquisição, enquanto todas as operações após o commit permanecem locais.
- **DEC-007**: Usar `@openbible/adapter-http` oficial — evita duplicar fetch, mapeamento e fallback no consumer e mantém a integração atrás do port `BiblePackageSource`.
- **DEC-008**: Manter o Definition Gate pendente até validar a spike OpenTUI/Node — separa decisão confirmada de capacidade técnica ainda não executada.
- **DEC-009**: Atualizar o runtime mínimo do consumer para Node.js 26.4+ com `--experimental-ffi` — decisão confirmada em 2026-08-28 após o smoke em Node.js 22.23.2 falhar e a documentação instalada do OpenTUI declarar esse requisito; a resposta foi dada pela pessoa responsável e Bun permanece fora da primeira fatia.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
