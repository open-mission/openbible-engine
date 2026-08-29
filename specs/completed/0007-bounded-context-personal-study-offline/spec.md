# Especificação integrada: Bounded context Personal Study offline

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0007 |
| Slug | 0007-bounded-context-personal-study-offline |
| Status | Complete |
| Effort | 7 |
| Effort updated at | 2026-08-29 |
| Effort rationale | Novo bounded context com contratos portáveis, ciclo de vida local, referência bíblica sem versão e port de persistência; alta incerteza de armazenamento e integração. |
| ClickUp Task | |
| Milestones | M03 (proposto; ainda sem arquivo de milestone) |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não — esta fatia entrega domínio, contratos e port de armazenamento para consumidores; nenhuma tela ou fluxo visual novo pertence ao package. |
| Atualizada em | 2026-08-29 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O `openbible-engine` já centraliza o bounded context Scripture Library, mas as
regras de estudo pessoal continuam acopladas às aplicações legadas. Isso impede
que consumidores Web, desktop, TUI e mobile compartilhem notas sem misturar
dados privados ao catálogo bíblico ou antecipar sincronização remota.

#### Resultado desejado

Entregar uma primeira fatia portátil do bounded context Personal Study para
criar, consultar, alterar e excluir notas locais vinculadas a um versículo ou a
um intervalo contíguo. A nota terá título opcional, conteúdo Markdown original,
datas de criação e alteração, ownership anônimo da instalação ou dispositivo e
permanecerá preservada quando nenhuma Bíblia instalada puder resolver a
referência.

#### Métricas de sucesso

- 100% das operações locais da primeira fatia funcionam sem rede e usam somente
  o port de armazenamento fornecido pelo consumidor.
- Criação, consulta, alteração e exclusão permanente são comprovadas por testes
  de contrato com a mesma nota e armazenamento local de teste.
- Referências individuais e intervalos válidos são aceitos; referências
  inválidas, conteúdo vazio e conteúdo acima de 10.000 caracteres são rejeitados
  sem alterar a nota anterior.
- Uma referência válida não resolvida por nenhuma Bíblia instalada aparece na
  lista normal com o aviso `texto bíblico indisponível`.
- Conteúdo Markdown com HTML arbitrário ou scripts não é executado quando
  renderizado por consumidores que cumpram o contrato de segurança.

### 2. Research e esclarecimentos

#### Researchs executados

- Nenhuma pesquisa externa foi executada. A definição usa a Inbox, o backlog, a
  descoberta de dados e fontes locais do monorepo.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193949-bounded-context-personal-study-offline.md` —
  formulação original, escopo candidato, riscos e lacunas.
- `specs/backlog/0007-bounded-context-personal-study-offline.md` — decisões
  refinadas, critérios de aceite preliminares e referências.
- `.specsfy/DATABASE.md` — informações confirmadas a guardar, ownership e ciclo
  de vida.
- `PROJECT.md`, `.specsfy/STACK.md` e `.specsfy/RULES.md` — finalidade,
  arquitetura, limites e convenções do monorepo.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — fronteira
  do Scripture Library e contratos de referência existentes.
- `packages/engine-core/package.json`, `packages/engine/package.json`,
  `packages/engine-core/src/types.ts` e testes arquiteturais — convenções de
  packages, pureza e formato de `BibleReference`.

#### Documentação consultada

- `.specsfy/Spec.md` — fluxo Specsfy/2.0, gates, rastreabilidade e regras de
  persistência documental.
- `.agents/skills/specsfy-specialist-data-modeling` — invariantes, relações,
  ciclo de vida e retenção.
- `.agents/skills/specsfy-specialist-domain-modeling` — bounded contexts,
  comandos, fatos e ownership.
- `.agents/skills/specsfy-specialist-software-architecture` — dependências,
  ports, seams e atributos de qualidade.

#### Artefatos de pesquisa armazenados

- `specs/completed/0007-bounded-context-personal-study-offline/research/local-context.md`:
  nota de proveniência das fontes locais consultadas em 2026-08-29; nenhum
  conteúdo externo, credencial ou dado bíblico real foi copiado.

#### Dúvidas respondidas

- **Q**: Qual a primeira fatia? → **A**: Notas vinculadas a um versículo ou
  intervalo contíguo.
- **Q**: Quem possui a nota? → **A**: A instalação ou dispositivo local, sem
  conta ou autenticação remota.
- **Q**: Qual o conteúdo? → **A**: Markdown original, com título opcional e
  máximo de 10.000 caracteres não vazios.
- **Q**: O que acontece ao excluir? → **A**: Exclusão permanente e imediata.
- **Q**: O que acontece sem Bíblia resolvendo a referência? → **A**: A nota
  permanece na lista normal com o aviso `texto bíblico indisponível`.
- **Q**: Como tratar falhas e segurança? → **A**: Referências e conteúdo
  inválidos são rejeitados; armazenamento indisponível gera erro recuperável
  sem fallback em memória; consumidores renderizam somente Markdown seguro.

#### Dúvidas abertas

- O volume total de notas por instalação ainda não possui limite confirmado.
- A forma persistente concreta e o adapter local serão escolhidos no Ato II sem
  alterar o contrato de domínio; nenhum adapter específico entra nesta fatia.
- A política detalhada de telemetria e observabilidade permanece fora do
  bounded context local e precisa ser confirmada antes do Delivery Gate.

### 3. Escopo e atores

#### Incluído

- Domínio portátil para notas de estudo pessoal.
- Referências por livro, capítulo e versículo individual ou intervalo contíguo,
  sem vínculo a versão bíblica específica.
- Criação, consulta, alteração e exclusão permanente de notas locais.
- Título opcional, Markdown original não vazio e limitado a 10.000 caracteres.
- Datas de criação e última alteração em epoch milliseconds.
- Port de armazenamento local e port de verificação de disponibilidade da
  referência, ambos fornecidos pelo consumidor.
- Estado de referência disponível ou `texto bíblico indisponível` na leitura.

#### Fora de escopo

- Destaques, categorias e outras ferramentas de Personal Study.
- Sincronização multidispositivo, TursoDB, identidade remota, contas e login.
- Exportação e importação.
- Adapter concreto de SQLite, OPFS, filesystem ou outro runtime.
- Interface, telas, rotas, componentes ou renderizador Markdown.
- Conteúdo bíblico, alteração do Scripture Library ou dependência de rede.
- Limite de volume total de notas enquanto não houver decisão específica.

#### Atores

- **Consumidor local**: integra o package e fornece armazenamento e resolução de
  referência para permitir que a pessoa use notas offline.
- **Pessoa leitora**: por meio de um consumidor, cria, consulta, altera e exclui
  suas próprias notas no dispositivo local.
- **Armazenamento local**: port técnico que confirma leitura e persistência das
  operações; não possui rede nem fallback implícito.

### 4. Princípios e restrições do projeto

- **PR-001**: Personal Study permanece bounded context separado de Scripture
  Library; dados de notas não são gravados no catálogo bíblico.
- **PR-002**: O core é TypeScript estrito, ESM, portátil e serializável; não usa
  `Date`, `Map`, `Set`, SQLite, DOM, React ou rede.
- **PR-003**: A referência da nota não possui `versionId`; qualquer Bíblia
  instalada que consiga resolver a referência pode fornecer o contexto de
  leitura.
- **PR-004**: O engine preserva e devolve o Markdown original; consumidores são
  responsáveis por renderizar somente Markdown seguro.
- **PR-005**: O armazenamento é local e injetado; operação indisponível falha
  explicitamente e nunca é confirmada por uma cópia temporária em memória.
- **PR-006**: Erros são discriminados por códigos estáveis e não contêm texto de
  apresentação específico de uma aplicação.
- **PR-007**: A exclusão solicitada é permanente e não possui lixeira ou
  recuperação nesta fatia.

### 5. Histórias de usuário

#### US-001 — Gerenciar notas pessoais offline (P1)

Como pessoa leitora, quero criar, consultar, alterar e excluir notas Markdown
ligadas a referências bíblicas, para registrar meu estudo no dispositivo sem
depender de conta ou rede.

**Por que P1**: esta é a menor capacidade útil do bounded context e estabelece
o contrato que futuros consumidores podem compartilhar.
**Teste independente**: executar o contrato do serviço com armazenamento local
de teste, cobrindo ciclo de vida, referência válida/órfã, validação e falha de
persistência.
**Requisitos**: FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003.

### 6. Cenários BDD de aceite

#### AC-001 — Criar e consultar nota com referência válida

**Cobre**: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-003 @AC-001
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa cria e consulta uma nota
    Given um armazenamento local disponível e uma referência bíblica válida
    When a pessoa salva uma nota com título opcional e Markdown não vazio
    Then a nota é persistida e pode ser consultada com o mesmo conteúdo e referência
```

#### AC-002 — Alterar nota e atualizar data

**Cobre**: US-001, FR-001, FR-003, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-003 @NFR-001 @NFR-003 @AC-002
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa altera o título ou o Markdown
    Given uma nota existente e persistida localmente
    When a pessoa altera seu título ou conteúdo Markdown válido
    Then a consulta retorna a alteração e uma data de última alteração atualizada
```

#### AC-003 — Excluir nota permanentemente

**Cobre**: US-001, FR-001, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @NFR-001 @NFR-003 @AC-003
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa exclui uma nota
    Given uma nota existente no armazenamento local
    When a pessoa solicita a exclusão
    Then a nota deixa de ser consultável permanentemente
```

#### AC-004 — Aceitar versículo ou intervalo contíguo

**Cobre**: US-001, FR-002, NFR-001, NFR-003

```gherkin
@US-001 @FR-002 @NFR-001 @NFR-003 @AC-004
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa salva nota sobre um intervalo
    Given uma referência com livro, capítulo e início e fim de versículos contíguos
    When a pessoa salva a nota
    Then a referência é preservada sem incluir uma versão bíblica específica
```

#### AC-005 — Rejeitar referência inválida

**Cobre**: US-001, FR-002, FR-004, NFR-002, NFR-003

```gherkin
@US-001 @FR-002 @FR-004 @NFR-002 @NFR-003 @AC-005
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa informa referência inválida
    Given uma nota nova ou existente e uma referência inválida
    When a pessoa tenta salvar a nota
    Then a operação falha com erro discriminado e não cria nem altera a nota
```

#### AC-006 — Preservar referência sem Bíblia disponível

**Cobre**: US-001, FR-002, FR-004, NFR-001, NFR-002

```gherkin
@US-001 @FR-002 @FR-004 @NFR-001 @NFR-002 @AC-006
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa consulta nota sem Bíblia que resolva a referência
    Given uma nota com referência válida e nenhuma Bíblia instalada que a resolva
    When a pessoa consulta suas notas
    Then a nota aparece na lista normal com o aviso texto bíblico indisponível
```

#### AC-007 — Rejeitar conteúdo inválido ou acima do limite

**Cobre**: US-001, FR-003, FR-004, NFR-002, NFR-003

```gherkin
@US-001 @FR-003 @FR-004 @NFR-002 @NFR-003 @AC-007
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa informa conteúdo vazio ou acima do limite
    Given uma tentativa de criar ou alterar uma nota
    When o Markdown é vazio, somente espaço ou maior que 10000 caracteres
    Then a operação falha e a nota anterior permanece sem alteração
```

#### AC-008 — Exibir Markdown sem conteúdo ativo

**Cobre**: US-001, FR-003, NFR-002, NFR-003

```gherkin
@US-001 @FR-003 @NFR-002 @NFR-003 @AC-008
Feature: Notas de estudo pessoal offline

  Scenario: Consumidor renderiza Markdown não confiável
    Given uma nota cujo Markdown contém HTML arbitrário ou script
    When um consumidor renderiza o conteúdo
    Then HTML e scripts não autorizados não são executados nem exibidos como conteúdo ativo
```

#### AC-009 — Falhar sem fallback quando armazenamento está indisponível

**Cobre**: US-001, FR-004, NFR-001, NFR-003

```gherkin
@US-001 @FR-004 @NFR-001 @NFR-003 @AC-009
Feature: Notas de estudo pessoal offline

  Scenario: Armazenamento local não está disponível
    Given uma criação ou alteração e um armazenamento local indisponível
    When a operação é executada
    Then o sistema informa erro recuperável e não confirma persistência em memória
```

#### AC-010 — Operar sem rede e preservar dados locais

**Cobre**: US-001, FR-001, FR-004, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-004 @NFR-001 @NFR-003 @AC-010
Feature: Notas de estudo pessoal offline

  Scenario: Pessoa reabre o consumidor sem rede
    Given uma nota persistida localmente e a rede indisponível
    When o consumidor é reaberto e consulta as notas
    Then a nota permanece disponível sem solicitar operação de rede
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O serviço deve criar, consultar, alterar e excluir permanentemente
  notas no armazenamento local fornecido pelo consumidor, preservando título,
  Markdown e datas.
- **FR-002**: O serviço deve aceitar referências por livro, capítulo e versículo
  individual ou intervalo contíguo, sem `versionId`, rejeitar referências
  inválidas e marcar como `texto bíblico indisponível` a referência válida que
  nenhuma Bíblia instalada consiga resolver.
- **FR-003**: O serviço deve aceitar título opcional e Markdown original não
  vazio de até 10.000 caracteres, devolvendo o conteúdo sem renderizá-lo.
- **FR-004**: O serviço deve retornar erros discriminados para entrada inválida,
  nota inexistente e armazenamento indisponível, sem criar, alterar ou confirmar
  dados quando uma operação falhar.

#### Não funcionais

- **NFR-001**: A primeira fatia deve operar somente sobre ports locais injetados,
  sem rede obrigatória ou fallback em memória. **Verificação**: testes de
  contrato com armazenamento controlado e inspeção arquitetural sem imports de
  rede/plataforma no core.
- **NFR-002**: Markdown original não pode ser executado como HTML ou script pelo
  consumidor. **Verificação**: teste de contrato de renderização segura e
  inspeção do boundary que separa texto persistido de apresentação.
- **NFR-003**: Operações bem-sucedidas devem preservar a nota completa, atualizar
  `updatedAt` em alteração e manter a operação anterior intacta quando houver
  erro. **Verificação**: testes de mutação, falha de armazenamento, exclusão e
  persistência após reabertura.

#### Erros e casos-limite

- `invalid_reference` → rejeitar a criação ou alteração sem persistir.
- `invalid_note_content` → rejeitar conteúdo vazio, somente espaço ou acima de
  10.000 caracteres sem alterar a nota existente.
- `note_not_found` → retornar erro discriminado ao alterar ou excluir nota
  inexistente.
- `storage_unavailable` → retornar erro recuperável, sem fallback em memória e
  sem confirmar a operação.
- Referência válida sem Bíblia resolvida → manter a nota e expor o estado
  `text_unavailable`; isso não é falha de persistência.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

O monorepo usa pnpm 10, Turborepo 2, TypeScript 5.7 strict ESM, Vitest 3 e
ESLint 9. `@openbible/engine-core` concentra Scripture Library sem dependências
de runtime; `@openbible/engine` concentra seus ports e casos de uso. A nova
capacidade não deve adicionar tipos de Personal Study ao core bíblico nem
importar SQLite, DOM, React ou rede.

#### Arquitetura e módulos

- `packages/personal-study-core/` será um package portátil, sem dependências de
  runtime, responsável por `StudyReference`, `StudyNote`, validação, estados de
  disponibilidade e erros do domínio.
- `packages/personal-study/` será o package de aplicação do bounded context,
  dependente somente de `personal-study-core`, expondo a fachada de notas e os
  ports `PersonalStudyStore`, `ReferenceAvailability` e `Clock`/`NoteIdFactory`.
- O consumidor fornecerá o armazenamento local e a consulta que informa se
  alguma Bíblia instalada resolve a referência. O serviço não acessará o
  catálogo diretamente, não escolherá versão e não fará rede.
- O armazenamento deverá confirmar cada criação ou alteração antes que o
  serviço retorne sucesso. Falha não poderá ser convertida em estado em memória.
- A lista retornará a nota persistida junto de um estado derivado de referência:
  `available` ou `text_unavailable`. O estado derivado não será gravado como
  propriedade permanente da nota.

#### Migrations

Não haverá migration nesta fatia: não existe persistência de Personal Study no
monorepo e nenhum adapter concreto será criado. Um adapter futuro deverá
introduzir sua própria migration e preservar as regras de retenção e exclusão
definidas nesta spec.

#### Models

- `StudyNote`: entidade identificada por `id`, com título opcional, Markdown,
  `reference`, `createdAt` e `updatedAt`.
- `StudyReference`: valor serializável com `bookId`, `chapter`, `verseStart` e
  `verseEnd` opcional; não possui `versionId`; `verseEnd` não pode ser menor que
  `verseStart`.
- `NoteAvailability`: projeção de leitura derivada do resolver, com `available`
  ou `text_unavailable`; não altera o conteúdo persistido.

#### Controllers e casos de uso

Não haverá controller HTTP. A fachada `createPersonalStudy` exporá casos de uso
locais síncronos: `createNote`, `listNotes`, `getNote`, `updateNote` e
`deleteNote`. Cada entrada será validada antes do port de armazenamento; cada
saída será serializável e cada falha será um erro discriminado.

#### Views e experiência

Não aplicável. Esta fatia não cria tela, rota, formulário ou componente. Um
consumer futuro deverá apresentar os estados e a mensagem de referência órfã
usando sua própria camada de interface.

#### Queries e repositórios

`PersonalStudyStore` terá operações para salvar, listar, consultar, substituir e
remover `StudyNote`. `ReferenceAvailability` receberá uma referência e informará
se alguma Bíblia instalada consegue resolvê-la. O serviço não fará paginação,
busca textual ou limite total de notas nesta fatia; o volume total continua uma
decisão aberta.

#### Jobs e processamento assíncrono

Não aplicável. A primeira fatia é local e síncrona; não há fila, retry
automático, evento ou dead-letter. A nova tentativa após erro fica sob controle
do consumidor.

#### Estrutura de arquivos

```text
packages/personal-study-core/
  package.json
  tsconfig.json
  vitest.config.ts
  src/types.ts
  src/errors.ts
  src/validation.ts
  src/index.ts
  src/__tests__/validation.test.ts
packages/personal-study/
  package.json
  tsconfig.json
  vitest.config.ts
  src/ports.ts
  src/personal-study.ts
  src/index.ts
  src/__tests__/personal-study.test.ts
tests/arch/
  personal-study-boundary.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| `StudyNote` | `id` opaco e estável no armazenamento local | `title` opcional; `markdown` obrigatório, original, não vazio e com até 10.000 caracteres; `reference`; `createdAt`; `updatedAt`; exclusão permanente explícita | Uma nota possui exatamente uma `StudyReference` e pertence à instalação/dispositivo local |
| `StudyReference` | `bookId` + `chapter` + `verseStart` + `verseEnd` opcional | livro canônico, capítulo positivo, início positivo; fim maior ou igual ao início; sem versão específica | Uma nota aponta para um versículo individual ou intervalo no mesmo capítulo |
| `NoteAvailability` | derivada por consulta | `available` ou `text_unavailable`; não é persistida; `text_unavailable` não remove a nota | Derivada de uma `StudyReference` e do conjunto de Bíblias instaladas |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| `StudyNote` | inexistente | criar com entrada válida e storage disponível | persistida | Markdown válido, referência válida e `createdAt = updatedAt` |
| `StudyNote` | persistida | alterar com entrada válida e storage disponível | persistida alterada | `id` e `createdAt` preservados; `updatedAt` atualizado |
| `StudyNote` | persistida | consultar sem Bíblia resolvendo a referência | persistida com projeção `text_unavailable` | conteúdo e referência não mudam |
| `StudyNote` | persistida | excluir explicitamente | removida | não pode ser recuperada nesta fatia |
| `StudyNote` | persistida | entrada inválida ou storage indisponível | persistida sem mudança | nenhuma mutação parcial é confirmada |

#### Migração e retenção

Notas permanecem no armazenamento local enquanto não houver exclusão explícita;
não expiram automaticamente. A exclusão é permanente e imediata. Referências
órfãs continuam retendo a nota e seu Markdown. Exportação, importação e
conversão de dados legados não fazem parte desta fatia.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não — a entrega é um bounded context de domínio
  e contratos para consumidores. Pessoas usarão as notas por interfaces futuras,
  que não são criadas ou alteradas nesta fatia.

#### Stack e convenções de interface

Não aplicável à entrega. Consumidores React, Native, TUI ou outros devem manter
suas próprias convenções e renderizar Markdown seguro; nenhum framework de UI é
introduzido neste package.

#### Telas e responsabilidades

Não aplicável: não há telas novas. A responsabilidade entregue é a API local de
notas e seu port de persistência.

#### Fluxo de informação e navegação

Não aplicável: não há navegação. O consumidor chama a fachada, apresenta o
resultado e decide como levar a pessoa de volta ao contexto bíblico.

#### Menus e navegação principal

Não aplicável: não há menus, rotas ou destinos nesta fatia.

#### Formulários e ações

Não aplicável: não há formulário. A camada consumidora deve validar e apresentar
os campos `title`, `markdown` e `reference`, enquanto o contrato do serviço
revalida as invariantes.

#### Composição e disposição

Não aplicável: não há composição visual, responsividade ou Breadcrumb.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | Não aplicável; nenhuma interface é entregue nesta fatia. | — | — | — | Consumidores futuros definem seus próprios componentes. |

#### Estados e acessibilidade

Não há estado visual nesta entrega. O contrato fornece `available` ou
`text_unavailable`, além de erros discriminados, para que consumidores futuros
possam apresentar loading, vazio, erro, sucesso, foco e teclado conforme sua
própria interface.

#### APIs expostas

- `@openbible/personal-study-core`: `StudyNote`, `StudyReference`,
  `NoteAvailability`, erros e validadores serializáveis.
- `@openbible/personal-study`: `createPersonalStudy`, `PersonalStudyStore`,
  `ReferenceAvailability`, `Clock`, `NoteIdFactory` e operações
  `createNote`, `listNotes`, `getNote`, `updateNote`, `deleteNote`.
- Não há autenticação, rota HTTP ou `versionId` na referência. Erros públicos
  usam códigos estáveis: `invalid_reference`, `invalid_note_content`,
  `note_not_found` e `storage_unavailable`.

#### APIs externas utilizadas

Nenhuma. A operação é local; o consumidor fornece os ports e nenhuma chamada de
rede é feita pelo core ou pela fachada.

#### Documentação das APIs consultadas

- `packages/engine-core/src/types.ts` — formato serializável de
  `BibleReference`, IDs canônicos e epoch milliseconds.
- `PROJECT.md`, `.specsfy/STACK.md` e `.specsfy/RULES.md` — fronteiras,
  pureza, offline-first e convenções de teste.

#### Eventos e outros contratos

Não aplicável: não há eventos novos. O contrato de mutação é síncrono, local e
confirmado pelo `PersonalStudyStore` antes de retornar sucesso.

### 11. Estratégia TDD

- **Unidade**: validar `StudyReference`, conteúdo Markdown, título opcional,
  datas, códigos de erro e transições de `StudyNote` no `personal-study-core`.
- **Integração/contrato**: executar a fachada contra um `PersonalStudyStore` de
  teste que simule persistência, falha de storage e reabertura.
- **BDD/aceite**: os cenários `AC-001` a `AC-010` da seção 6 orientam os casos;
  não serão criados arquivos `.feature`.
- **Runner TDD**: Vitest, já confirmado pela stack e pelos scripts dos packages.
- **E2E**: não aplicável nesta fatia sem interface; consumers futuros devem
  testar suas telas e seu adapter.
- **Verificação manual**: não necessária para o package; inspeção de exports e
  fronteiras será automatizada.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, FR-003, NFR-001, NFR-003, AC-001 | AC-001 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-003 AC-001` | RED — `pnpm exec vitest run packages/personal-study/src/__tests__/personal-study.test.ts --config /dev/null --reporter=verbose` executou 2 testes e falhou porque a fachada pública está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-001, FR-003, NFR-001, NFR-003, AC-002 | AC-002 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-001 FR-003 NFR-001 NFR-003 AC-002` | RED — o mesmo comando executou 2 testes e o caso de alteração falhou pela ausência da fachada pública: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-001, NFR-001, NFR-003, AC-003 | AC-003 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-003` | RED — o mesmo comando executou 3 testes e o caso de exclusão falhou pela ausência da fachada pública: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-002, NFR-001, NFR-003, AC-004 | AC-004 (seção 6) | `packages/personal-study-core/src/__tests__/validation.test.ts` com marcador `SPECSFY: US-001 FR-002 NFR-001 NFR-003 AC-004` | RED — `pnpm exec vitest run packages/personal-study-core/src/__tests__/validation.test.ts --config /dev/null --reporter=verbose` executou 2 testes e falhou porque o validador público está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study-core check` passou com 3 testes | Passed — regressão incluída no check focal |
| US-001, FR-002, FR-004, NFR-002, AC-005 | AC-005 (seção 6) | `packages/personal-study-core/src/__tests__/validation.test.ts` com marcador `SPECSFY: US-001 FR-002 FR-004 NFR-002 AC-005` | RED — o mesmo comando executou 2 testes e o caso de referência inválida falhou pela ausência do validador público: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study-core check` passou com 3 testes | Passed — regressão incluída no check focal |
| US-001, FR-002, FR-004, NFR-001, AC-006 | AC-006 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-002 FR-004 NFR-001 AC-006` | RED — `pnpm exec vitest run packages/personal-study/src/__tests__/personal-study.test.ts --config /dev/null --reporter=verbose` executou 4 testes e falhou porque a fachada pública está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-003, FR-004, NFR-002, NFR-003, AC-007 | AC-007 (seção 6) | `packages/personal-study-core/src/__tests__/validation.test.ts` com marcador `SPECSFY: US-001 FR-003 FR-004 NFR-002 NFR-003 AC-007` | RED — `pnpm exec vitest run packages/personal-study-core/src/__tests__/validation.test.ts --config /dev/null --reporter=verbose` executou 3 testes e falhou porque o validador público está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study-core check` passou com 3 testes | Passed — regressão incluída no check focal |
| US-001, FR-003, NFR-002, NFR-003, AC-008 | AC-008 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-003 NFR-002 NFR-003 AC-008` | RED — `pnpm exec vitest run packages/personal-study/src/__tests__/personal-study.test.ts --config /dev/null --reporter=verbose` executou 5 testes e falhou porque a fachada pública está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-004, NFR-001, NFR-003, AC-009 | AC-009 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-004 NFR-001 NFR-003 AC-009` | RED — `pnpm exec vitest run packages/personal-study/src/__tests__/personal-study.test.ts --config /dev/null --reporter=verbose` executou 6 testes e falhou porque a fachada pública está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |
| US-001, FR-001, FR-004, NFR-001, NFR-003, AC-010 | AC-010 (seção 6) | `packages/personal-study/src/__tests__/personal-study.test.ts` com marcador `SPECSFY: US-001 FR-001 FR-004 NFR-001 NFR-003 AC-010` | RED — `pnpm exec vitest run packages/personal-study/src/__tests__/personal-study.test.ts --config /dev/null --reporter=verbose` executou 7 testes e falhou porque a fachada pública está ausente: `expected undefined to be type of 'function'` | GREEN — `pnpm --filter @openbible/personal-study check` passou com 7 testes | Passed — regressão incluída no check focal |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001, AC-002, AC-003 | Unidade/contrato | `packages/personal-study/src/__tests__/personal-study.test.ts` | Passed — 7 testes do package em `pnpm --filter @openbible/personal-study check` |
| FR-002 | AC-001, AC-004, AC-005, AC-006 | Unidade/contrato | `packages/personal-study/src/__tests__/personal-study.test.ts` e `packages/personal-study-core/src/__tests__/validation.test.ts` | Passed — validação estrutural e disponibilidade derivada cobertas pelos checks dos dois packages |
| FR-003 | AC-001, AC-002, AC-007, AC-008 | Unidade | `packages/personal-study-core/src/__tests__/validation.test.ts` e `packages/personal-study/src/__tests__/personal-study.test.ts` | Passed — limite de conteúdo e preservação de Markdown cobertos pelos checks dos dois packages |
| FR-004 | AC-005, AC-007, AC-009 | Unidade/contrato | `packages/personal-study/src/__tests__/personal-study.test.ts` | Passed — códigos de erro e falha de storage cobertos em 7 testes |
| NFR-001 | AC-001, AC-006, AC-009, AC-010 | Arquitetural/contrato | `tests/arch/personal-study-boundary.test.ts` e `pnpm turbo run build test typecheck lint check` | Passed — 3 testes arquiteturais e 62 tarefas Turbo passaram |
| NFR-002 | AC-005, AC-007, AC-008 | Contrato/inspeção | `packages/personal-study/src/__tests__/personal-study.test.ts` e `tests/arch/personal-study-boundary.test.ts` | Passed — Markdown permanece original/inativo e o core não possui renderer ou dependência de plataforma |
| NFR-003 | AC-002, AC-003, AC-009 | Unidade/contrato | `packages/personal-study/src/__tests__/personal-study.test.ts` | Passed — identidade, datas, exclusão e falha sem mutação cobertas em 7 testes |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed — 2026-08-29.
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/completed/0007-bounded-context-personal-study-offline/spec.md` e `node .agents/skills/specsfy-04-validate/scripts/review_findings.mjs specs/completed/0007-bounded-context-personal-study-offline/spec.md --root /home/claudio/Projects/openbible-engine`.
- **Achados**: nenhum BLOCKER; cobertura mínima `US/FR/NFR ↔ 3 ACs` satisfeita
  (10 cenários AC). Permanecem três avisos P2 registrados abaixo sobre volume,
  adapter concreto e renderização no consumer.
- **FIND-PROD-001** [P2] [Open] O volume total de notas por instalação não tem meta confirmada — Refs: NFR-003 — Evidence: specs/completed/0007-bounded-context-personal-study-offline/spec.md:113 — Effect: adapters futuros podem adotar limites diferentes — Suggestion: definir uma quota antes de prometer capacidade de volume.
- **FIND-ARCH-001** [P2] [Open] A fatia entrega ports e não um adapter concreto de persistência — Refs: FR-001 — Evidence: specs/completed/0007-bounded-context-personal-study-offline/spec.md:406 — Effect: cada consumer precisa fornecer a persistência local para obter uso real — Suggestion: validar a fachada com contrato e agendar adapters por runtime em specs próprias.
- **FIND-SEC-001** [P2] [Open] A proteção de Markdown ocorre no boundary do consumer e não no engine — Refs: NFR-002 — Evidence: specs/completed/0007-bounded-context-personal-study-offline/spec.md:355 — Effect: um consumer que renderizar sem sanitização pode executar conteúdo ativo — Suggestion: exigir teste de renderização segura em cada consumer antes de expor notas.

#### Gate do Ato II — Plano

- **Resultado**: Passed — 2026-08-29.
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0007-bounded-context-personal-study-offline/spec.md`.
- **Achados**: 15 tarefas válidas, 10 predecessores TDD concluídos com RED,
  18/18 IDs cobertos e todos os predecessores TDD dos dois itens de código
  concluídos. T011–T015 permanecem abertos para a entrega; nenhum código de
  produção foi escrito.

#### Gate do Ato III — Entrega

- **Resultado**: Passed — 2026-08-29.
- **Comandos**: `pnpm turbo run build test typecheck lint check`,
  `node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs
  specs/completed/0007-bounded-context-personal-study-offline/spec.md
  /home/claudio/Projects/openbible-engine --json`,
  `node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs
  specs/completed/0007-bounded-context-personal-study-offline/spec.md
  /home/claudio/Projects/openbible-engine --json`, checks documentais e monitor.
- **Achados**: 15/15 tarefas concluídas, evidências materiais aprovadas, 10/10
  ACs aceitos e `18/18` IDs desta spec cobertos com o mínimo de três casos para
  feature/US/FR/NFR. A auditoria ampla lista marcadores órfãos pertencentes a
  outras specs, sem lacuna nos IDs da SPEC-0007.
- **Baseline**: a suíte ampla anterior tinha 4 falhas do OpenTUI no Node 22;
  nesta execução Turbo, com Node 26.7.0 e `--experimental-ffi`, `62/62` tarefas
  passaram. Os checks focais dos packages também passaram.

### 14. Tarefas

Formato: `- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar o caso RED de criação e consulta em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-001, FR-002, FR-003, NFR-001, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Ler AC-001 e confirmar criação, consulta, referência e conteúdo válidos.
  - [x] **EXECUTE**: Escrever um caso Vitest com marcador `SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-003 AC-001`, sem criar `.feature`.
  - [x] **VERIFY**: Observar RED causado pela ausência da implementação.
  - [x] **EVIDENCE**: Registrar comando, saída e IDs nas seções 11–13.
  - [x] **IMPROVE**: Revisar se o caso falha quando a criação ou consulta é removida.

- [x] T002 [TEST] [TDD] [US-001] Derivar o caso RED de alteração em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-001, FR-003, NFR-001, NFR-003, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002 e confirmar preservação da identidade e das datas.
  - [x] **EXECUTE**: Escrever um caso Vitest com marcador `SPECSFY: US-001 FR-001 FR-003 NFR-001 NFR-003 AC-002`.
  - [x] **VERIFY**: Observar RED para alteração e atualização de `updatedAt`.
  - [x] **EVIDENCE**: Registrar comando, saída e motivo do RED nas seções 11–13.
  - [x] **IMPROVE**: Revisar que o caso não dependa de relógio global.

- [x] T003 [TEST] [TDD] [US-001] Derivar o caso RED de exclusão permanente em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-001, NFR-001, NFR-003, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003 e confirmar remoção sem recuperação.
  - [x] **EXECUTE**: Escrever um caso Vitest com marcador `SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-003`.
  - [x] **VERIFY**: Observar RED para exclusão permanente.
  - [x] **EVIDENCE**: Registrar comando, saída e motivo do RED nas seções 11–13.
  - [x] **IMPROVE**: Garantir que a consulta posterior use o mesmo storage.

- [x] T004 [TEST] [TDD] [US-001] Derivar o caso RED de referência em intervalo em `packages/personal-study-core/src/__tests__/validation.test.ts` — Refs: US-001, FR-002, NFR-001, NFR-003, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004 e confirmar início, fim e mesmo capítulo.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-002 NFR-001 NFR-003 AC-004`.
  - [x] **VERIFY**: Observar RED para aceitar referência individual e intervalo contíguo.
  - [x] **EVIDENCE**: Registrar comando e saída nas seções 11–13.
  - [x] **IMPROVE**: Manter o caso independente da implementação do storage.

- [x] T005 [TEST] [TDD] [US-001] Derivar o caso RED de referência inválida em `packages/personal-study-core/src/__tests__/validation.test.ts` — Refs: US-001, FR-002, FR-004, NFR-002, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005 e listar referência inválida sem inventar códigos adicionais.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-002 FR-004 NFR-002 AC-005`.
  - [x] **VERIFY**: Observar RED para rejeitar a entrada sem mutação.
  - [x] **EVIDENCE**: Registrar comando, saída e código de erro observado.
  - [x] **IMPROVE**: Cobrir alteração e criação sem duplicar o mesmo caso.

- [x] T006 [TEST] [TDD] [US-001] Derivar o caso RED de referência órfã em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-002, FR-004, NFR-001, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006 e preparar resolver que não encontra Bíblia compatível.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-002 FR-004 NFR-001 AC-006`.
  - [x] **VERIFY**: Observar RED para manter a nota e derivar `text_unavailable`.
  - [x] **EVIDENCE**: Registrar comando, saída e estado derivado.
  - [x] **IMPROVE**: Garantir que o estado órfão não seja gravado na nota.

- [x] T007 [TEST] [TDD] [US-001] Derivar o caso RED de conteúdo inválido em `packages/personal-study-core/src/__tests__/validation.test.ts` — Refs: US-001, FR-003, FR-004, NFR-002, NFR-003, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007 e confirmar vazio, espaços e limite de 10.000 caracteres.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-003 FR-004 NFR-002 NFR-003 AC-007`.
  - [x] **VERIFY**: Observar RED sem criar ou alterar nota.
  - [x] **EVIDENCE**: Registrar comando e exemplos de limite usados.
  - [x] **IMPROVE**: Usar dados pequenos e um caso exato de fronteira.

- [x] T008 [TEST] [TDD] [US-001] Derivar o caso RED de renderização segura em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-003, NFR-002, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008 e separar Markdown armazenado da apresentação do consumer.
  - [x] **EXECUTE**: Escrever o contrato de conteúdo com marcador `SPECSFY: US-001 FR-003 NFR-002 NFR-003 AC-008`.
  - [x] **VERIFY**: Observar RED quando HTML ou script puder ser tratado como conteúdo ativo.
  - [x] **EVIDENCE**: Registrar comando e boundary verificado.
  - [x] **IMPROVE**: Não mover um renderizador para o engine apenas para satisfazer o teste.

- [x] T009 [TEST] [TDD] [US-001] Derivar o caso RED de storage indisponível em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-004, NFR-001, NFR-003, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009 e preparar port que falha sem simular sucesso.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-004 NFR-001 NFR-003 AC-009`.
  - [x] **VERIFY**: Observar RED para erro recuperável e ausência de fallback em memória.
  - [x] **EVIDENCE**: Registrar comando, falha e nota anterior preservada.
  - [x] **IMPROVE**: Garantir que nova tentativa possa reutilizar o mesmo contrato.

- [x] T010 [TEST] [TDD] [US-001] Derivar o caso RED de operação offline em `packages/personal-study/src/__tests__/personal-study.test.ts` — Refs: US-001, FR-001, FR-004, NFR-001, NFR-003, AC-010 — Depends: none
  - [x] **PREP**: Ler AC-010 e confirmar que o port local não exige rede.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador `SPECSFY: US-001 FR-001 FR-004 NFR-001 NFR-003 AC-010`.
  - [x] **VERIFY**: Observar RED para consulta após reabertura sem chamada de rede.
  - [x] **EVIDENCE**: Registrar comando e inspeção de chamadas externas.
  - [x] **IMPROVE**: Manter o teste determinístico e independente de ambiente conectado.

#### Fase 2 — Implementação do domínio e dos ports

- [x] T011 [CODE] [US-001] Criar `packages/personal-study-core` com tipos, validação e erros — Refs: US-001, FR-002, FR-003, FR-004, NFR-002, NFR-003, AC-004, AC-005, AC-007, AC-008 — Depends: T001, T002, T003, T004, T005, T006, T007, T008, T009, T010
  - [x] **PREP**: Confirmar o RED de validação e a ausência de dependências de plataforma.
  - [x] **EXECUTE**: Implementar `StudyReference`, `StudyNote`, validadores e erros em `packages/personal-study-core/src/`.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/personal-study-core check` e `pnpm --filter @openbible/personal-study-core build`; ambos passaram.
  - [x] **EVIDENCE**: Registrar arquivos, comandos e GREEN nas seções 11–13 e no comentário `specsfy:evidence` abaixo.
  - [x] **IMPROVE**: Adicionar configuração Vitest própria do package para descobrir `src/__tests__` sem alterar a suíte raiz.
  <!-- specsfy:evidence {"task":"T011","refs":["US-001","FR-002","FR-003","FR-004","NFR-002","NFR-003","AC-004","AC-005","AC-007"],"files":["packages/personal-study-core/package.json","packages/personal-study-core/tsconfig.json","packages/personal-study-core/vitest.config.ts","packages/personal-study-core/src/types.ts","packages/personal-study-core/src/errors.ts","packages/personal-study-core/src/validation.ts","packages/personal-study-core/src/index.ts"],"commands":[{"run":"pnpm --filter @openbible/personal-study-core check","exit":0},{"run":"pnpm --filter @openbible/personal-study-core build","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T012 [CODE] [US-001] Criar `packages/personal-study` com ports e fachada de casos de uso — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-009, AC-010 — Depends: T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011
  - [x] **PREP**: Confirmar os REDs de ciclo de vida, disponibilidade e falha de storage.
  - [x] **EXECUTE**: Implementar `PersonalStudyStore`, `ReferenceAvailability`, `Clock`, `NoteIdFactory` e `createPersonalStudy` em `packages/personal-study/src/`.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/personal-study check` e `pnpm --filter @openbible/personal-study build`; ambos passaram com 7 testes.
  - [x] **EVIDENCE**: Registrar arquivos, comandos e GREEN nas seções 11–13 e no comentário `specsfy:evidence` abaixo.
  - [x] **IMPROVE**: Separar a projeção `availability` da entidade persistida, mantendo o estado derivado fora do storage.
  <!-- specsfy:evidence {"task":"T012","refs":["US-001","FR-001","FR-002","FR-003","FR-004","NFR-001","NFR-003","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-009","AC-010"],"files":["packages/personal-study/package.json","packages/personal-study/tsconfig.json","packages/personal-study/vitest.config.ts","packages/personal-study/src/ports.ts","packages/personal-study/src/personal-study.ts","packages/personal-study/src/index.ts","packages/personal-study/src/__tests__/personal-study.test.ts"],"commands":[{"run":"pnpm --filter @openbible/personal-study check","exit":0},{"run":"pnpm --filter @openbible/personal-study build","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T013 [TEST] [US-001] Adicionar testes arquiteturais de boundary em `tests/arch/personal-study-boundary.test.ts` — Refs: US-001, FR-001, NFR-001, NFR-002, NFR-003, AC-008, AC-009, AC-010 — Depends: T011, T012
  - [x] **PREP**: Identificar imports e pacotes que o core não pode acessar.
  - [x] **EXECUTE**: Testar exports públicos, pureza, ausência de rede/plataforma e não uso de fallback em memória.
  - [x] **VERIFY**: Executar `pnpm exec vitest run tests/arch/personal-study-boundary.test.ts --reporter=verbose`; 3 testes passaram.
  - [x] **EVIDENCE**: Registrar o resultado e os IDs de rastreabilidade na matriz de testes e neste checklist.
  - [x] **IMPROVE**: Manter a guarda baseada em contratos públicos e dependências observáveis, sem fixar detalhes internos.

#### Fase de interface

Não aplicável: esta especificação não cria interface, tela ou componente; os
consumidores futuros serão responsáveis por formulários, estados visuais e
renderização segura.

#### Fase final — Qualidade e documentação

- [x] T014 [DOC] [US-001] Documentar os packages e contratos em `docs/` e `.specsfy/PACKAGES.md` — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003 — Depends: T013
  - [x] **PREP**: Conferir os exports, contratos, limites e decisões implementadas.
  - [x] **EXECUTE**: Executar `node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine` e reconstruir a arquitetura e o inventário derivados.
  - [x] **VERIFY**: Executar o mesmo script com `--check`; a documentação representa o código atual e o monitor está `CURRENT`.
  - [x] **EVIDENCE**: Registrar os caminhos atualizados (`docs/`, `.specsfy/PACKAGES.md`) e os comandos nas seções 11–13.
  - [x] **IMPROVE**: Preservar as observações humanas fora dos blocos gerados durante a reconstrução.

- [x] T015 [TEST] [US-001] Executar regressão, rastreabilidade e checks com `tests/arch/personal-study-boundary.test.ts` — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010 — Depends: T013, T014
  - [x] **PREP**: Identificar todos os comandos e gates aplicáveis.
  - [x] **EXECUTE**: Executar `pnpm turbo run build test typecheck lint check`, `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/completed/0007-bounded-context-personal-study-offline/spec.md .` e o monitor.
  - [x] **VERIFY**: Confirmar `62/62` tarefas Turbo aprovadas e `18/18` IDs da SPEC-0007 cobertos; a saída GAPS do auditor contém somente marcadores órfãos de outras specs.
  - [x] **EVIDENCE**: Registrar contagens, saídas e o estado final dos gates nas seções 11–13.
  - [x] **IMPROVE**: Corrigir os caminhos de evidência após cada transição de estado e separar o resultado da spec dos marcadores globais não relacionados.

### 15. Ordem de execução

- Caminho crítico: T001–T010 (RED TDD, com execução serial por arquivo) → T011 → T012 → T013 → T014 → T015.
- Tarefas paralelas: nenhum marcador `[P]` foi usado porque os predecessores TDD compartilham os dois arquivos de teste; T011 só começa depois de T001–T010.
- Estratégia de MVP: entregar `personal-study-core` e `personal-study` com CRUD local, validação de referência/conteúdo, estado órfão derivado e falhas explícitas; nenhum adapter concreto ou UI.

### 16. Dependências, riscos e suposições

#### Dependências

- TypeScript strict ESM, pnpm workspaces, Turborepo, Vitest e ESLint já presentes.
- Contratos canônicos de livro, capítulo e versículo do Scripture Library, consumidos por valor e sem armazenar `versionId`.
- Um consumidor ou fake deve fornecer `PersonalStudyStore` e `ReferenceAvailability`.

#### Riscos

- Sem versão específica, a disponibilidade depende do resolver do consumidor → manter `NoteAvailability` derivada e não persistida.
- Markdown bruto pode ser exibido de forma insegura → manter o engine sem renderizador e exigir sanitização/escape no consumer.
- Falha do storage pode parecer sucesso se houver estado transitório → retornar sucesso somente após confirmação do port.
- Volume total não definido pode gerar comportamento divergente entre adapters → não declarar capacidade além do limite de 10.000 caracteres por nota até decisão posterior.

#### Suposições

- `personal-study-core` e `personal-study` são a menor separação compatível com a regra de bounded contexts e poderão ser reavaliados antes do Plan Gate.
- O `NoteIdFactory` e o `Clock` serão injetados para manter o core portátil e determinístico.
- O consumer futuro decide a apresentação da mensagem `texto bíblico indisponível`, sem alterar a nota persistida.

### 17. Decisões

- **DEC-001**: Manter Personal Study em packages próprios, separados de `engine-core` — evita misturar dados e regras privadas ao Scripture Library; alternativa rejeitada: adicionar notas ao core bíblico.
- **DEC-002**: Expor um port local de armazenamento sem criar adapter concreto nesta fatia — preserva a substituição entre Web, Native, TUI e mobile; adapters específicos ficam para entregas posteriores.
- **DEC-003**: Representar a referência sem `versionId` e calcular disponibilidade com um resolver fornecido pelo consumidor — permite reutilizar a nota entre versões e preserva o caso órfão.
- **DEC-004**: Persistir e devolver Markdown original, sem renderizar no engine — mantém o domínio headless; consumidores devem bloquear HTML arbitrário e scripts.
- **DEC-005**: Rejeitar entradas inválidas, excluir permanentemente sob solicitação e nunca usar fallback em memória — protege consistência e privacidade local.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes e checks estáticos disponíveis passam.
