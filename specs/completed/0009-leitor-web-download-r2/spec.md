# Especificação integrada: Leitor Web e download de versões R2 com a engine

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0009 |
| Slug | 0009-leitor-web-download-r2 |
| Status | Complete |
| Effort | 4 |
| Effort updated at | 2026-08-30 |
| Effort rationale | A seleção de versículos é uma extensão localizada do Reader, com estado efêmero, popover acessível e cópia para clipboard; não altera engine, persistência ou APIs. |
| ClickUp Task | |
| Milestones | M02 |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim |
| Atualizada em | 2026-08-30 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O consumer Web precisa iniciar a migração do aplicativo legado sem copiar sua
implementação, seu banco ou seus artefatos. A primeira jornada precisa provar
que uma pessoa consegue obter uma versão bíblica oficial do R2, instalá-la pelo
contrato público da engine e ler um capítulo no mesmo consumer Web depois de
reabrir o contexto e perder a rede. Durante a leitura, ela também precisa
selecionar um ou mais versículos e agir sobre a seleção sem perder o contexto do
capítulo.

Hoje a aplicação já compõe Biblioteca, Leitor e Busca, mas a primeira fatia da
migração ainda não tem uma especificação normativa que fixe a origem R2, o ciclo
de instalação, o cancelamento, a recuperação de falhas e a fronteira entre UI e
engine.

#### Resultado desejado

Uma pessoa abre `apps/consumer-web`, vê o catálogo de versões, inicia e pode
cancelar o download de uma versão publicada no R2, acompanha o estado da
instalação, abre livro e capítulo e lê versículos em ordem canônica. A tela de
leitura deve ter a mesma linguagem visual do aplicativo Web legado: shell em
tela cheia, dock flutuante, toolbar compacta de livro/capítulo/versão, coluna de
leitura centralizada e composição responsiva equivalente. Ao selecionar um ou
mais versículos, o Reader exibe um popover flutuante próximo à seleção com as
ações de copiar o texto selecionado ou copiar a referência bíblica com a versão.
Após fechar e reabrir
o contexto sem rede, a versão instalada e o mesmo capítulo continuam
disponíveis localmente. Falhas não deixam arquivo, registro ou versão parcial.

#### Métricas de sucesso

- 100% dos cenários AC-001 a AC-017 passam no teste focal e nos gates finais.
- Uma versão instalada permanece legível após reabrir o adapter Web e bloquear a
  rede no teste Playwright do Chromium; o cenário WebKit é executado e seu
  resultado é registrado conforme a matriz existente.
- 0 imports, fetches de fixture, consultas SQL ou caminhos internos do legado em
  `apps/consumer-web`; a guarda arquitetural e a inspeção textual não encontram
  acoplamentos proibidos.
- Toda falha de aquisição, validação, cancelamento ou storage apresenta ação de
  recuperação e não altera uma instalação anterior utilizável.
- A seleção de um ou mais versículos abre o popover correto, produz formatos de
  cópia determinísticos e não cria persistência paralela.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001**: Qual é a fronteira pública para aquisição e instalação? →
  `BiblePackageSource`, `BibleInstaller` e a fachada `BibleEngine` já expõem o
  fluxo; a UI deve chamar somente `listAvailableVersions`, `listInstalledVersions`
  e `installVersion`.
- **R-002**: Como o R2 é resolvido? → `HttpBiblePackageSource` usa o catálogo
  configurável, tenta o endpoint de download e faz fallback para o bucket R2
  configurável com o mapeamento público de nomes; o pacote é validado pelo
  cabeçalho SQLite antes de retornar.
- **R-003**: A leitura depende da rede ou de banco na thread principal? → o
  adapter Web mantém Worker, SQLite WASM, OPFS e registry dentro da fronteira
  pública do adapter; a engine lê somente pelos ports e ordena livros/capítulos.
- **R-004**: Qual comportamento do consumer e da interface deve ser preservado?
  → Next.js App Router, React 19, Tailwind CSS 4, shell escuro, Biblioteca em
  Leitor em `/`, Biblioteca em `/library`, Busca em `/search`, Leitor profundo em
  `/<version>/<book>/<chapter>`, Breadcrumbs, cards, estados
  de feedback e navegação anterior/próxima já publicados.
- **R-005**: Qual ajuste visual foi pedido depois da conclusão? → Reproduzir no
  consumer a interface do `/home/claudio/Projects/open-bible/apps/web`, usando
  somente a aparência e os padrões de interação do shell/Leitor como referência;
  dados, leitura, instalação e persistência continuam vindo da engine e dos
  adapters públicos.
- **R-006**: Qual é a entrada principal e como selecionar contexto? → `/` abre o
  Leitor; `/library` mantém o catálogo. O Leitor usa um picker de livro/capítulo
    e um picker de versão com modal central no desktop e drawer inferior no mobile,
    sempre preenchidos por contratos públicos da engine.

- **R-007**: Qual apresentação visual deve ser preservada no ajuste pedido? → O
  controle de capítulo da toolbar exibe somente o número do capítulo, enquanto
  os pickers usam os tokens semânticos Tailwind/shadcn (`background`, `card`,
  `muted`, `accent`, `border`, `primary`, `foreground`) e os valores neutros do
  tema padrão do aplicativo Web legado.
- **R-008**: Quais correções visuais e de feedback foram solicitadas após a
  conclusão? → A seleção de versão deve ter hover visível; o download deve
  atualizar um Sonner com progresso, sucesso e erro; `Exibição` deve usar a
  mesma cor dos controles da toolbar; o carregamento do capítulo deve ter um
  skeleton de leitura mais representativo; e a mensagem offline deve ficar
  recolhida em um badge fixo no canto inferior esquerdo, expandindo ao clique.

- **R-009**: Qual estrutura de URL deve identificar uma leitura profunda? → A rota
  canônica usa somente os segmentos de contexto `/<versao>/<livro>/<capitulo>`;
  `/` continua sendo a entrada padrão e não existe namespace `/ler`.

- **R-010**: Qual representação deve ser usada para o livro na URL? → O segmento
  usa a abreviação pública do `BibleBook`, normalizada em minúsculas e sem acentos
  para manter URLs curtas e legíveis; assim, Gênesis é `gn` e a engine continua
  recebendo o ID canônico `gen`.
- **R-011**: Como a seleção de versículos funciona na referência? → Cada clique
  alterna o versículo na seleção; a seleção pode conter um ou mais versículos do
  capítulo atual. O popover fica ancorado visualmente à área selecionada e oferece
  somente `Copiar referência` e `Copiar texto` nesta fatia. A referência agrupa
  números contíguos em intervalos e inclui a versão; o texto inclui a referência
  na primeira linha e os versículos numerados em ordem canônica.

#### Análise MCR-10

| Lente | Afirmação verificável desta fatia |
| --- | --- |
| Finalidade | A pessoa instala uma Bíblia para ler sem depender da rede. |
| Substância | Pessoa, versão bíblica, pacote SQLite oficial, engine, adapter Web e R2 são atores ou entidades distintos. |
| Quantidade | O catálogo retorna versões; um download possui bytes recebidos e, quando fornecido, total; um capítulo possui uma sequência de versículos. |
| Qualidade | A versão tem identidade, nome e pacote com header/schema válidos; o capítulo tem versículos ordenados. |
| Relação | A versão instalada relaciona-se ao arquivo local e ao registro do adapter; livro e capítulo pertencem à versão. |
| Lugar | R2 é origem remota; Worker/OPFS é armazenamento local; UI não acessa SQLite nem o legado. |
| Tempo | O ciclo é receber → validar → promover → registrar; leitura após reabertura ocorre sem rede. |
| Posição | A instalação passa por estados de progresso; a versão passa de disponível para instalada ou retorna a recuperável. |
| Posse | Nenhuma conta, permissão, nota ou identidade remota é necessária nesta fatia. |
| Ação e afecção | Instalar, cancelar, reabrir e ler produzem progresso, conteúdo local ou erro recuperável sem parcialidade. |
| Seleção | Um clique alterna um versículo selecionado; a seleção pode conter vários versículos do capítulo e é somente estado de interface. |
| Cópia | A referência e o texto selecionados são formatos determinísticos, copiados pelo clipboard com fallback seguro e feedback de sucesso/erro. |

#### Fontes e contexto consultados

- Pedido confirmado na conversa de 2026-08-30: começar pelo Leitor bíblico e pelo
  download das versões do R2.
- Pedido literal incorporado nesta atualização: "seguindo o specsfy eu quero que
  desenolva no @apps/consumer-web/ a funcionalidade de selecionar os versos da
  biblia, seguindo o projeto de referencia open-bible/apps/web precisamos poder
  selecionar os versos ao selecionar mostre o popover com as opcoes, ele j foi
  implementado no app de referencia, precisamos implementar no projeto atual,
  seguindo a mesma identidade visual e components com as opcoes de copiar o
  texto selecionaod ou a referencia biblia + versao."
- `specs/backlog/0009-migracao-integral-consumer-web-legado.md`.
- `specs/milestones/M02.md`.
- `PROJECT.md`, `DESIGNSYSTEM.MD`, `INTERFACE.md`, `.specsfy/STACK.md`,
  `.specsfy/RULES.md`, `.specsfy/DATABASE.md` e `.specsfy/PACKAGES.md`.
- Código existente de `apps/consumer-web`, `packages/adapter-http`,
  `packages/adapter-sqlite-web`, `packages/engine` e `packages/engine-core`.
- `/home/claudio/Projects/open-bible/apps/web`, consultado somente como
  referência de comportamento; nenhuma alteração ou import interno será feito.
  A implementação de referência está em `features/bible-reader/components/verse-row.tsx`,
  `features/bible-reader/components/verse-selection-popover.tsx` e
  `features/bible-reader/utils/verse-reference.ts`.

#### Documentação consultada

- `docs/architecture.md`, `docs/application.md`, `docs/frontend.md`,
  `docs/database.md`, `docs/integrations.md` e `docs/testing.md`.
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — Worker,
  SQLite WASM, OPFS, reconciliação e limitações de crash-safety.
- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md`
  — exports públicos e assets distribuíveis.
- `specs/completed/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md` —
  telas, PWA, Biblioteca, Leitor, Busca e conformance Web.

#### Artefatos de pesquisa armazenados

- `specs/in-progress/0009-leitor-web-download-r2/research/local-contracts.md` —
  índice das evidências locais dos contratos consultados. Nenhum documento
  externo foi copiado.

#### Dúvidas respondidas

- **Q**: Qual é o primeiro recorte da migração Web? → **A**: Leitor bíblico Web
  e download/instalação de versões publicadas no R2; workspace, estudo pessoal,
  autenticação e Sync ficam para evoluções posteriores.
- **Q**: Qual é o destino e qual é o tratamento do legado? → **A**: O destino é
  `apps/consumer-web`; o legado em `/home/claudio/Projects/open-bible/apps/web`
  permanece somente leitura.
- **Q**: Onde ficam as regras de Bíblia e persistência? → **A**: Nos exports
  públicos da engine e dos adapters oficiais; a UI não interpreta SQLite nem
  cria armazenamento paralelo.
- **Q**: O que significa download R2 nesta fatia? → **A**: Aquisição usando a
  configuração pública de `HttpBiblePackageSource`, com catálogo/API e fallback
  para o bucket R2 já suportado, sem credenciais no consumer.
- **Q**: O que significa “mesma interface do open-bible web”? → **A**: Reproduzir
  o shell de tela cheia, o dock flutuante responsivo, a toolbar pill do Leitor,
  a coluna tipográfica centralizada e os estados de seleção/configuração visíveis
  no legado, sem copiar banco, contexts ou regras de Personal Study.
- **Q**: Qual rota deve abrir ao iniciar o consumer? → **A**: `/` abre o Leitor;
  a Biblioteca fica disponível em `/library`, a Busca em `/search`, e uma
  instalação local existente determina a primeira versão disponível.
- **Q**: Como o capítulo deve aparecer na toolbar e quais cores os pickers devem
  usar? → **A**: mostrar somente o número do capítulo e usar os tokens neutros do
  Tailwind/shadcn do aplicativo Web legado, sem alterar dados ou contratos.
- **Q**: Como devem aparecer progresso, carregamento e disponibilidade offline? →
  **A**: usar Sonner para o ciclo de download, skeleton representativo para o
  capítulo e um badge offline recolhido no canto inferior esquerdo que expande a
  mensagem completa ao clique.
- **Q**: Como selecionar e copiar versículos? → **A**: seguir a interação do
  legado com seleção alternável de um ou mais versículos e popover contextual;
  oferecer copiar referência com livro/capítulo/intervalos e versão, ou copiar
  texto com referência e versículos numerados. Highlights, notas e persistência
  permanecem fora desta fatia.

#### Dúvidas abertas

- Nenhuma dúvida bloqueante. O conjunto de versões, os textos de produto e o
  detalhe de progresso são definidos pelos defaults já existentes: catálogo
  público/fallback do adapter, mensagens em português e bytes recebidos quando
  o response fornecer progresso.

### 3. Escopo e atores

#### Incluído

- Catálogo público de versões e fallback R2 por configuração existente.
- Download com progresso quando o response permitir, cancelamento e retry.
- Instalação através da fachada pública da engine e persistência no adapter Web.
- Biblioteca com estados disponível, instalando, instalada, removendo e falha.
- Leitor com versão, livro, capítulo, versículos ordenados e navegação sequencial.
- Reabertura do adapter e leitura offline de versões instaladas.
- Estados loading, vazio, erro, offline, storage indisponível e feedback
  acessível em desktop e mobile.
- Shell visual do legado no consumer: navegação principal em dock flutuante,
  comportamento de tela cheia, versão mobile da navegação, toolbar do Leitor em
  formato pill e coluna de leitura com tipografia/espaçamento equivalentes.
- Ajuste visual dos pickers: o gatilho do capítulo mostra somente seu número e os
  estados de modal, livro/capítulo e versão usam os tokens neutros do tema
  Tailwind/shadcn do aplicativo Web legado.
- Feedback de instalação: downloads iniciados na Biblioteca ou no picker de
  versão exibem progresso, sucesso e falha em notificações Sonner; percentual só
  aparece quando `totalBytes` estiver disponível.
- Feedback de leitura e offline: o Leitor exibe skeleton com toolbar, cabeçalho e
  linhas de versículos durante a carga; a mensagem de disponibilidade offline não
  fica expandida por padrão e é acessível por um badge fixo clicável.
- Seleção no Leitor: cada versículo pode ser alternado individualmente; um ou mais
  versículos selecionados exibem um popover contextual com cópia de referência ou
  de texto. A seleção vive somente durante a leitura do capítulo.
- Pickers do Leitor: seleção de livro/capítulo baseada nos livros retornados pela
  engine e seleção de versão com instaladas/disponíveis, busca, instalação e
  seleção; modal central no desktop e drawer inferior no mobile.
- Testes Vitest, Playwright, conformance, fronteira arquitetural e documentação.

#### Fora de escopo

- Migração integral do workspace legado.
- Notas, destaques, categorias, Personal Study, autenticação ou Sync.
- Alterações em `/home/claudio/Projects/open-bible/apps/web`.
- Cópia de `.next`, `out`, bancos reais, segredos, fixtures de execução ou
  imports internos do legado.
- API pública nova, publicação de pacotes, Tauri, Native SDK ou React Native.
- Parser, ordenação, validação, queries SQLite, instalação ou persistência
  implementados na camada React.
- Highlights, notas, categorias, seleção entre capítulos ou versões e qualquer
  persistência da seleção.

#### Atores

- **Pessoa leitora**: instala uma versão, escolhe livro/capítulo e lê offline.
- **Consumer Web**: compõe a interface e traduz códigos de erro para feedback;
  não interpreta o formato do pacote.
- **Engine e adapters oficiais**: resolvem aquisição, validação, instalação,
  registry, leitura, ordenação, reconciliação e armazenamento local.
- **R2/API de Bíblia**: fornece catálogo e bytes dos pacotes públicos; não recebe
  conta, notas ou dados pessoais.
- **Projeto legado**: fonte de referência somente leitura, sem participação na
  execução do consumer.

### 4. Princípios e restrições do projeto

- **PR-001**: A UI usa somente exports públicos de `@openbible/engine`,
  `@openbible/engine-core`, `@openbible/adapter-http` e
  `@openbible/adapter-sqlite-web`.
- **PR-002**: `BibleInstaller` é o único escritor da instalação bíblica e do
  registry; o fluxo é stage → validate → commit → rollback/cleanup.
- **PR-003**: Operações de leitura depois da instalação são locais e não fazem
  rede; R2 é somente uma origem opcional de aquisição.
- **PR-004**: O Worker é o único owner de SQLite WASM, OPFS, registry e
  conexões; nenhum SQL, conexão ou arquivo bruto atravessa a fronteira da UI.
- **PR-005**: Códigos de erro estáveis são tratados na aplicação sem expor
  mensagens internas, paths, SQL, credenciais ou detalhes do legado.
- **PR-006**: O consumer preserva Next.js App Router, React 19, Tailwind CSS 4,
  tema escuro, Breadcrumbs, componentes locais e rotas existentes.
- **PR-007**: A garantia declarada do Web é exception-safe com reconciliação
  best-effort; não se declara atomic rename, power-loss safety ou crash-safety
  completa.
- **PR-008**: Toda alteração de tela reutiliza ou registra componentes em
  `INTERFACE.md`; não cria biblioteca de UI incompatível com a stack.
- **PR-009**: A seleção de versículos é estado efêmero do Reader; o popover usa
  somente dados já retornados pela engine e não introduz persistência, parser ou
  regra bíblica no consumer.

### 5. Histórias de usuário

#### US-001 — Instalar uma versão oficial para leitura local (P1)

Como pessoa leitora, quero escolher uma versão disponível e instalá-la a partir
do R2, para ler seu conteúdo sem depender da rede.

**Por que P1**: sem uma versão instalada, o Leitor não tem fonte local; esta é a
prova operacional da migração strangler e do valor offline.
**Teste independente**: executar os testes de catálogo/instalação e instalar ARA
em navegador real, verificando o registry e a abertura do primeiro capítulo.
**Requisitos**: FR-001, NFR-001, NFR-003.

#### US-002 — Ler e navegar por uma versão instalada (P1)

Como pessoa leitora, quero escolher livro e capítulo e navegar pelo conteúdo,
para consultar a Bíblia instalada com versículos legíveis e na ordem correta.

**Por que P1**: leitura é o resultado principal desta primeira fatia, não apenas
um download concluído.
**Teste independente**: abrir `/ara/gn/1`, conferir o título, os versículos
ordenados e os links de capítulo anterior/próximo nos testes de componente e E2E.
**Requisitos**: FR-002, NFR-002, NFR-003.

#### US-003 — Retomar a leitura após falha ou reabertura (P1)

Como pessoa leitora, quero receber orientação quando a instalação ou o storage
falhar e continuar usando uma instalação anterior, para não perder meu acesso ao
conteúdo local.

**Por que P1**: a promessa offline exige preservar dados já instalados e tornar
falhas recuperáveis.
**Teste independente**: simular resposta inválida, cancelamento, storage
indisponível e rede bloqueada; verificar erro, retry, ausência de parcial e
leitura após reabertura.
**Requisitos**: FR-003, NFR-001, NFR-002, NFR-003.

### 6. Cenários BDD de aceite

#### AC-001 — Instalação bem-sucedida a partir do catálogo R2

**Cobre**: US-001, FR-001, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @NFR-001 @NFR-003 @AC-001
Feature: Instalação de versão bíblica oficial

  Scenario: Pessoa instala uma versão disponível no catálogo R2
    Given a Biblioteca exibe ARA como versão disponível e o bucket R2 está configurado
    When a pessoa seleciona "Instalar" e o download termina com um pacote SQLite válido
    Then a engine valida, promove e registra ARA sem parcialidade
    And a Biblioteca exibe ARA como instalada e oferece a ação "Ler"
    And uma notificação Sonner acompanha o progresso e informa a conclusão
```

#### AC-002 — Catálogo disponível com fallback de origem

**Cobre**: US-001, FR-001, NFR-001

```gherkin
@US-001 @FR-001 @NFR-001 @AC-002
Feature: Catálogo configurável de versões

  Scenario: API de catálogo falha mas o mapeamento público R2 está configurado
    Given a API de catálogo responde com erro ou está indisponível
    When a Biblioteca solicita as versões disponíveis
    Then a origem HTTP retorna o catálogo fallback suportado
    And a pessoa pode iniciar a instalação de uma versão cujo arquivo R2 esteja mapeado
```

#### AC-003 — Cancelamento ou falha não cria instalação parcial

**Cobre**: US-001, US-003, FR-001, FR-003, NFR-001, NFR-003

```gherkin
@US-001 @US-003 @FR-001 @FR-003 @NFR-001 @NFR-003 @AC-003
Feature: Recuperação do download

  Scenario: Pessoa cancela o download ou o pacote falha na validação
    Given ARA já está instalada e uma nova tentativa de instalação está em andamento
    When a pessoa cancela ou o pacote recebido não possui header/schema válido
    Then a engine retorna o código de erro correspondente sem registrar a tentativa
    And a instalação anterior continua utilizável
    And a Biblioteca oferece retry sem arquivo temporário exposto
```

#### AC-004 — Abertura de capítulo ordenado

**Cobre**: US-002, FR-002, FR-004, NFR-002, NFR-003

```gherkin
@US-002 @FR-002 @NFR-002 @NFR-003 @AC-004
Feature: Leitura de capítulo

  Scenario: Pessoa abre Gênesis 1 em uma versão instalada
    Given ARA está instalada no adapter Web
    When a pessoa abre /ara/gn/1
    Then o Leitor exibe "Gênesis 1", os versículos retornados pela engine e a quantidade do capítulo
    And os versículos aparecem em ordem crescente pelo número canônico
```

#### AC-005 — Seleção e navegação nos limites do cânone

**Cobre**: US-002, FR-002, NFR-002, NFR-003

```gherkin
@US-002 @FR-002 @FR-004 @NFR-002 @NFR-003 @AC-005
Feature: Navegação do Leitor

  Scenario: Pessoa muda livro/capítulo e percorre os limites válidos
    Given o Leitor está aberto em uma versão instalada com sua lista de livros
    When a pessoa seleciona outro livro ou capítulo e usa anterior/próximo
    Then a rota aponta para o destino canônico correspondente
    And nenhum link é exibido para capítulo ou livro inexistente
```

#### AC-006 — Reabertura e leitura offline

**Cobre**: US-002, US-003, FR-002, FR-003, NFR-002, NFR-003

```gherkin
@US-002 @US-003 @FR-002 @FR-003 @NFR-002 @NFR-003 @AC-006
Feature: Leitura local offline

  Scenario: Pessoa reabre o consumer sem rede
    Given ARA foi instalada e Gênesis 1 foi lido anteriormente
    When o adapter é fechado e reaberto e a rede fica indisponível
    Then ARA continua listada como instalada
    And /ara/gn/1 exibe o mesmo conteúdo sem nova requisição de pacote
```

#### AC-007 — Storage Web indisponível

**Cobre**: US-003, FR-003, NFR-001, NFR-003

```gherkin
@US-003 @FR-003 @NFR-001 @NFR-003 @AC-007
Feature: Falha do armazenamento local

  Scenario: Adapter não consegue inicializar o storage Web
    Given OPFS, Worker ou SQLite WASM não pode ser inicializado
    When o consumer inicia o BibleEngineProvider
    Then a tela exibe um alerta com erro seguro e ação "Tentar novamente"
    And a aplicação não simula uma instalação em memória nem oferece leitura falsa
```

#### AC-008 — Estados vazios, loading e erro acessíveis

**Cobre**: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-003

```gherkin
@US-001 @US-002 @US-003 @FR-001 @FR-002 @FR-003 @NFR-003 @AC-008
Feature: Feedback da jornada Web

  Scenario: Pessoa encontra uma transição ou ausência de conteúdo
    Given a Biblioteca ou o Leitor está carregando, vazio ou em erro
    When a interface renderiza o estado correspondente
    Then há skeleton representativo, EmptyState ou ErrorState em português com foco e alerta acessíveis
    And a pessoa encontra uma ação válida para instalar, voltar ou tentar novamente
    And a disponibilidade offline aparece em um badge recolhido que expande a mensagem ao clique
```

#### AC-009 — Fronteira pública e legado somente leitura

**Cobre**: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @US-002 @US-003 @FR-001 @FR-002 @FR-003 @NFR-001 @NFR-002 @NFR-003 @AC-009
Feature: Consumer desacoplado

  Scenario: Consumer Web executa a jornada usando os contratos do engine
    Given a aplicação é construída a partir deste monorepo
    When a inspeção arquitetural e os testes de fronteira são executados
    Then não há import interno, banco, fixture de execução ou alteração do legado
    And a UI não contém SQL, parser de SQLite ou regra de ordenação bíblica
```

#### AC-010 — Paridade visual do shell e do Leitor

**Cobre**: US-002, FR-002, FR-004, NFR-003

```gherkin
@US-002 @FR-002 @FR-004 @NFR-003 @AC-010
Feature: Interface do aplicativo Web

  Scenario: Pessoa abre o Leitor no consumer integrado
    Given uma versão instalada e uma rota válida de capítulo
    When a interface renderiza o Leitor em desktop ou mobile
    Then o shell ocupa a tela, exibe o dock de navegação e a toolbar compacta
    And o conteúdo aparece em uma coluna centralizada com controles refluídos
    And `Exibição` usa a mesma cor dos controles de livro, capítulo e versão
      And nenhuma regra, persistência ou componente interno do legado é importado
```

#### AC-011 — Entrada do Leitor e pickers responsivos

**Cobre**: US-002, FR-002, FR-004, NFR-002, NFR-003

```gherkin
@US-002 @FR-002 @FR-004 @NFR-002 @NFR-003 @AC-011
Feature: Entrada do Leitor e seleção de contexto

  Scenario: Pessoa abre o Leitor e escolhe livro, capítulo ou versão
    Given existe ao menos uma versão instalada e o consumer foi aberto em /
    When a pessoa abre o picker de livro/capítulo ou o picker de versão
    Then o picker exibe somente livros, capítulos e versões fornecidos pelos contratos públicos
    And o desktop usa um modal central e o mobile usa um drawer inferior
    And a seleção válida atualiza a rota do Leitor sem consultar ou importar o legado
    And os estados de hover da seleção de versão são visíveis no desktop e no mobile
```

#### AC-012 — Namespace antigo de leitura

**Cobre**: FR-004, NFR-003

```gherkin
@FR-004 @NFR-003 @AC-012
Feature: Namespace canônico do Leitor

  Scenario: Pessoa acessa o namespace antigo de leitura
    Given a rota principal do Leitor é `/`
    When a pessoa acessa `/ler/`
    Then o consumer responde com recurso não encontrado
```

#### AC-013 — Rota profunda sem namespace de recurso

**Cobre**: FR-002, FR-004, NFR-002, NFR-003

```gherkin
@US-002 @FR-002 @FR-004 @NFR-002 @NFR-003 @AC-013
Feature: Rota canônica do Leitor

  Scenario: Pessoa abre uma leitura com versão, livro e capítulo
    Given ARA está instalada e o livro Gênesis possui o capítulo 2
    When a pessoa acessa `/ara/gn/2`
    Then o consumer abre Gênesis 2 sem o segmento `/ler`
    And a seleção de livro, capítulo, versão e navegação mantém a mesma estrutura de URL
```

#### AC-014 — Rotas de navegação em inglês

**Cobre**: FR-004, NFR-003

```gherkin
@FR-004 @NFR-003 @AC-014
Feature: Rotas públicas do consumer

  Scenario: Pessoa navega pela Biblioteca e pela Busca
    When a pessoa acessa `/library` ou `/search`
    Then o consumer exibe a tela correspondente
    And `/biblioteca` e `/busca` não são rotas canônicas do consumer
```

#### AC-015 — Seleção de um versículo e popover contextual

**Cobre**: US-002, FR-002, FR-005, NFR-003

```gherkin
@US-002 @FR-002 @FR-005 @NFR-003 @AC-015
Feature: Seleção de versículos

  Scenario: Pessoa seleciona um versículo no capítulo
    Given o Leitor exibe um capítulo com versículos retornados pela engine
    When a pessoa clica no versículo 1
    Then o versículo fica visualmente selecionado
    And um popover contextual acessível aparece próximo à seleção
    And o popover oferece "Copiar referência" e "Copiar texto"
```

#### AC-016 — Seleção múltipla e formatos de cópia

**Cobre**: US-002, FR-002, FR-005, NFR-003

```gherkin
@US-002 @FR-002 @FR-005 @NFR-003 @AC-016
Feature: Cópia de versículos selecionados

  Scenario: Pessoa seleciona versículos contíguos e copia a referência ou o texto
    Given os versículos 1 e 2 estão selecionados em Gênesis 1 na versão ARA
    When a pessoa escolhe "Copiar referência"
    Then o clipboard recebe "Gênesis 1:1-2 (ARA)"
    When a pessoa escolhe "Copiar texto"
    Then o clipboard recebe a referência na primeira linha e os textos numerados em ordem
```

#### AC-017 — Limpeza da seleção e recuperação do clipboard

**Cobre**: US-002, FR-005, NFR-003

```gherkin
@US-002 @FR-005 @NFR-003 @AC-017
Feature: Controle da seleção de versículos

  Scenario: Pessoa limpa a seleção ou o clipboard recusa a cópia
    Given o popover de seleção está aberto
    When a pessoa escolhe "Limpar seleção" ou o clipboard não pode receber o conteúdo
    Then a seleção é removida no primeiro caso
    And uma mensagem acessível de erro é exibida no segundo caso
    And nenhum dado é persistido ou enviado pela aplicação
```

### 7. Requisitos

#### Funcionais

- **FR-001**: A Biblioteca deve listar as versões retornadas pela origem pública
  configurada e permitir instalar uma versão pelo `BibleEngine`, exibindo
  progresso, sucesso, cancelamento, erro e retry sem interpretar o pacote. O
  progresso, sucesso e erro do download devem ser apresentados em Sonner, com
  percentual somente quando houver total confiável.
- **FR-002**: O Leitor deve obter livros e capítulos pelos métodos públicos da
  engine, exibir os versículos retornados em ordem canônica, permitir selecionar
  livro/capítulo e oferecer navegação anterior/próxima somente para destinos
  válidos, usando a composição visual de toolbar, conteúdo e navegação do
  aplicativo Web legado.
- **FR-005**: O Leitor deve permitir alternar a seleção de um ou mais versículos
  do capítulo atual e exibir um popover contextual com as ações `Copiar referência`,
  `Copiar texto` e `Limpar seleção`. A referência deve usar nome do livro,
  capítulo, intervalos contíguos e versão; o texto deve incluir essa referência e
  os versículos numerados em ordem canônica. A cópia deve usar o clipboard com
  fallback seguro e feedback acessível, sem persistir a seleção.
- **FR-004**: `/` deve abrir o Leitor com a primeira versão instalada disponível,
  enquanto `/library` deve compor o catálogo e `/search` deve compor a Busca. O
  Leitor deve abrir um picker de livro/capítulo e um picker de versão; ambos devem
  usar dados da engine, permitir seleção válida e renderizar modal no desktop ou
  drawer no mobile. A rota profunda deve usar
  `/<version>/<book>/<chapter>`, com o livro representado por sua abreviação
  pública normalizada e sem o segmento `/ler`.
- **FR-003**: O consumer deve preservar uma instalação válida ao ocorrer falha de
  rede, cancelamento, pacote inválido ou storage indisponível, permitir reabrir o
  adapter e exibir estados recuperáveis sem criar fallback em memória.

#### Não funcionais

- **NFR-001**: Integridade e isolamento: nenhuma operação malsucedida pode deixar
  instalação parcial, registro divergente ou destruir uma versão anterior; a UI
  não pode acessar SQLite, SQL, paths internos ou dados do legado. **Verificação**:
  testes de installer/adapter, testes de falha e cancelamento, inspeção
  arquitetural e conformance de reabertura.
- **NFR-002**: Offline e persistência: depois do commit de uma versão, leitura e
  navegação devem funcionar após reabrir o adapter e sem rede, sem novo download
  do pacote. **Verificação**: Playwright com contexto persistente, bloqueio de
  rede após reload, teste de lifecycle do adapter e observação das requisições.
- **NFR-003**: Interface acessível, responsiva e visualmente compatível: Biblioteca
  e Leitor devem funcionar em viewport desktop e mobile, preservando a linguagem
  visual do shell legado, com foco visível, labels associados, `aria-live` para
  progresso/estado, `role=alert` para erro, teclado e ações recuperáveis. O
  carregamento do capítulo deve usar skeleton representativo, o controle
  `Exibição` deve compartilhar a cor dos controles da toolbar e a disponibilidade
  offline deve iniciar como badge fixo expansível no canto inferior esquerdo. O
  popover de seleção deve ter nome acessível, foco visível, ações por teclado,
  fechamento explícito e não bloquear a leitura em desktop ou mobile.
  **Verificação**: testes Testing Library, Playwright desktop/mobile, inspeção de
  acessibilidade e regressão visual/manual somente quando necessário.

#### Erros e casos-limite

- Catálogo não-2xx, JSON inválido ou rede indisponível → usar o fallback R2
  suportado; se nenhum pacote puder ser resolvido, exibir erro recuperável.
- Arquivo R2 ausente ou resposta não-2xx → retornar `invalid_package` para 404
  conhecido ou `network_unavailable` para indisponibilidade, sem commit.
- Header, schema, identidade ou sanity inválidos → retornar `invalid_package`,
  limpar temporários e manter a versão anterior.
- Cancelamento antes, durante ou depois do recebimento → retornar `cancelled`,
  interromper o fluxo e manter o estado anterior.
- Colisão de storage → retornar `storage_busy`, não substituir o final e permitir
  retry após a condição desaparecer.
- OPFS/Worker/WASM indisponível → retornar `storage_unavailable`, não simular
  persistência e exibir `ErrorState` com retry.
- Versão não instalada, livro inexistente ou capítulo fora do limite → retornar
  código público apropriado e mostrar EmptyState/retorno à Biblioteca, sem link
  inválido.
- Resposta sem `Content-Length` → mostrar estado de recebimento sem percentual;
  nunca inventar uma porcentagem.
- Nenhum versículo selecionado → não renderizar popover nem habilitar ações de
  cópia.
- Seleção com versículos contíguos ou não contíguos → formatar intervalos e
  segmentos na ordem numérica, sem alterar os dados retornados pela engine.
- Clipboard indisponível, recusado ou falha no fallback → manter o Reader e a
  seleção utilizáveis e anunciar erro seguro; não expor exceção interna.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Monorepo pnpm/Turborepo em TypeScript strict ESM, Next.js 15 App Router, React
  19, Tailwind CSS 4, Vitest/Testing Library e Playwright.
- `BibleEngineProvider` cria `createWebAdapter`, executa reconciliação e compõe
  `createBibleEngine` com `HttpBiblePackageSource` e URLs públicas configuráveis.
- `AppLibrary`, `VersionCard`, `Reader`, `PrevNextNav`, feedback states e
  `AppShell` já existem; alterações devem ser incrementais.
- O adapter Web usa Worker + SQLite WASM + OPFS SAHPool e possui testes de
  lifecycle, instalação, reconciliação, capacidades e API pública.

#### Arquitetura e módulos

- `packages/adapter-http/src/http-source.ts`: catálogo, resolução de URL R2,
  streaming/progresso, cancelamento e validação básica de header; manter sem
  lógica de UI.
- `packages/engine/src/engine.ts` e ports públicos: normalização, resolução de
  bytes, chamada ao installer e leitura local; não adicionar dependência de
  Next, DOM ou SQLite.
- `packages/adapter-sqlite-web`: Worker, OPFS, registry, reconciliação e
  installer; ajustar somente se testes da jornada revelarem contrato faltante.
- `apps/consumer-web/src/engine/bible-engine-provider.tsx`: ciclo de abertura,
  reconciliação, erro seguro, retry e fechamento do adapter.
- `apps/consumer-web/src/features/library`: catálogo, ações, progresso e
  cancelamento; a UI cria um token portátil e passa observer público à engine.
- `apps/consumer-web/src/features/reader`: carregamento, seleção, conteúdo,
  navegação e pickers responsivos; todos os dados vêm da engine.
- `apps/consumer-web/src/features/reader/VerseRow.tsx`: renderiza um versículo
  como controle de seleção acessível, sem conhecer a origem persistente dos dados.
- `apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx` e
  `verse-reference.ts`: compõem as ações contextuais e os formatos determinísticos
  de cópia; não dependem de engine, SQLite ou Personal Study.
- `apps/consumer-web/src/components`: shell, dock, notificações e toolbar de leitura próprios do
  consumer; a composição visual pode seguir o legado sem importar seus módulos.
- `apps/consumer-web/src/components/ui`: primitives/feedback locais e a integração
  Sonner; a dependência fica restrita ao consumer e não contém regra de engine.

#### Migrations

Não aplicável. Esta fatia usa o schema SQLite legado já suportado pelo adapter
Web e não cria ou altera tabelas de aplicação. Qualquer mudança de persistência
deveria ser uma nova especificação e passar pelo mapa `.specsfy/DATABASE.md`.

#### Models

- `BibleVersion`: item de catálogo com `id`, `name`, idioma e metadados opcionais;
  é somente leitura na UI.
- `InstalledBible`: registro persistido com `id`, `name`, `installedAt` e
  `versionCode`; só a engine/registry pode gravá-lo.
- `InstallationProgress`: evento serializável com versão, estágio e bytes; a UI
  apenas o apresenta.
- `CancellationToken`: objeto portátil com `aborted` e `reason`; a UI controla o
  cancelamento sem passar `AbortSignal` ao core.
- `EngineError`: código estável usado para selecionar mensagem segura e ação de
  recuperação; mensagens internas não são contrato de produto.
- `VerseSelection`: estado efêmero do Reader contendo os IDs dos versículos
  selecionados e uma âncora visual calculada a partir dos elementos renderizados;
  não é persistido nem enviado a qualquer serviço.

#### Controllers e casos de uso

Não há controller HTTP novo. As rotas App Router apenas compõem componentes.
`AppLibrary` chama `engine.listAvailableVersions`, `listInstalledVersions`,
`installVersion` e `uninstallVersion`; `Reader` chama `getBooks`, `getChapter` e
`listInstalledVersions`. A engine aplica normalização e a exigência de versão
instalada antes da leitura.

#### Views e experiência

- Leitor `/`: abre a jornada principal e resolve a primeira versão instalada;
  mantém toolbar, conteúdo e estados de ausência.
- Biblioteca `/library`: mantém Breadcrumb, OfflineBanner, título, cards e ações inline;
  acrescenta ou ajusta progresso textual/indeterminado e cancelamento sem modal.
- Leitor `/[version]/[book]/[chapter]`: mantém Breadcrumb, versão, título,
  toolbar e card de versículos; cada versículo é selecionável e o popover de
  ações aparece próximo à seleção. Pickers, popover e navegação continuam válidos
  em mobile.
- Estado de inicialização: skeleton sem ações falsas.
- Estado vazio: orienta instalar ou voltar à Biblioteca.
- Estado de erro: `ErrorState` com mensagem segura, `role=alert` e retry quando a
  operação for recuperável.
- Estado de sucesso: badge instalada, link Ler e conteúdo ordenado.
- Estado offline: OfflineBanner persistente explica que leitura local continua;
  aquisição indisponível não oculta versões já instaladas.
- Paridade visual: o shell ocupa `100dvh`, o dock fica flutuante no rodapé em
  desktop e vira uma barra inferior segura no mobile; o Leitor usa uma toolbar
  pill sticky e uma coluna tipográfica centralizada. Notas, destaques e ajustes
  avançados não ganham implementação de domínio nesta fatia.
- Ao selecionar versículos, o Reader mostra uma barra flutuante arredondada,
  visualmente alinhada ao popover do legado, ancorada acima da seleção quando há
  espaço e abaixo quando necessário. A barra contém `Copiar referência`,
  `Copiar texto` e `Limpar seleção`; no mobile ela se ajusta à largura disponível
  sem retirar os rótulos acessíveis.

#### Queries e repositórios

Não há query ou repository novo no consumer. A engine delega listagem e leitura
ao `BibleLibrary`/registry do adapter Web. O consumer não recebe conexão, SQL,
bytes ou path. O `HttpBiblePackageSource` permanece a única ponte para R2.

#### Jobs e processamento assíncrono

Não há job persistente. Download e instalação são operações assíncronas iniciadas
no cliente; o observer atualiza progresso, o token cancela e o installer faz
rollback/cleanup. Retry é explícito pela pessoa, não automático e ilimitado.

#### Estrutura de arquivos

```text
  specs/in-progress/0009-leitor-web-download-r2/
  spec.md
apps/consumer-web/src/engine/bible-engine-provider.tsx
apps/consumer-web/src/features/library/AppLibrary.tsx
apps/consumer-web/src/features/library/VersionCard.tsx
apps/consumer-web/src/features/reader/Reader.tsx
apps/consumer-web/src/features/reader/reader-route.ts
apps/consumer-web/src/features/reader/PrevNextNav.tsx
  apps/consumer-web/src/features/reader/ReaderToolbar.tsx
apps/consumer-web/src/features/reader/BookChapterPicker.tsx
apps/consumer-web/src/features/reader/VersionPicker.tsx
apps/consumer-web/src/features/reader/ResponsivePicker.tsx
apps/consumer-web/src/features/reader/VerseRow.tsx
apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx
apps/consumer-web/src/features/reader/verse-reference.ts
apps/consumer-web/src/components/NavigationDock.tsx
apps/consumer-web/src/components/AppShell.tsx
apps/consumer-web/src/components/ui/download-toast.tsx
apps/consumer-web/src/components/ui/sonner.tsx
apps/consumer-web/src/styles/globals.css
apps/consumer-web/src/components/ui/feedback.tsx
apps/consumer-web/tests/
packages/adapter-http/src/http-source.ts
packages/adapter-sqlite-web/
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| BibleVersion | `id` normalizado | nome, idioma e `totalBooks` opcional; vem do catálogo e não é persistida pela UI | pode originar uma InstalledBible |
| InstalledBible | `id` de versão | nome, `installedAt`, `versionCode`; só existe após commit consistente | referencia o arquivo final local gerido pelo adapter |
| BibleBook | `id` canônico | nome e quantidade de capítulos; ordem canônica definida pela engine | pertence a uma versão instalada |
| Verse | versão + livro + capítulo + número | texto e número; leitura ordenada ASC pela engine | pertence a um capítulo de uma versão |
| InstallationProgress | versão + emissão | estágio, bytes recebidos e total opcional; não é persistido | emitido por source/engine para a Biblioteca |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Versão no catálogo | disponível | iniciar instalação | instalando | id e URL resolvidos pela origem pública |
| Versão no catálogo | instalando | receber progresso | instalando | ação fica ocupada e pode cancelar |
| Versão no catálogo | instalando | validar e promover | instalada | final e registry consistentes |
| Versão no catálogo | instalando | cancelar/falhar | disponível ou instalada anterior | nenhum parcial e estado anterior preservado |
| InstalledBible | instalada | reabrir adapter | instalada | registry e arquivo final reconciliados |
| InstalledBible | instalada | remover | disponível | installer fecha, remove e atualiza registry |
| Leitor | loading | engine retorna capítulo | conteúdo ou vazio | dados vieram somente da versão instalada |
| Leitor | loading | engine retorna erro | erro recuperável | código é seguro e não expõe implementação |
| Leitor | sem seleção | pessoa alterna um versículo | seleção ativa | o versículo pertence ao capítulo renderizado |
| Leitor | seleção ativa | pessoa alterna outro versículo | seleção com um ou mais itens | somente IDs do capítulo atual são considerados |
| Seleção | ativa | pessoa copia referência ou texto | feedback de sucesso/erro | nenhum dado é persistido ou enviado |
| Seleção | ativa | pessoa limpa, muda capítulo ou fecha o popover | sem seleção | popover e ações deixam de ser renderizados |

#### Migração e retenção

Não há migração de schema nem retenção nova. Pacotes bíblicos permanecem no
storage local até remoção explícita da versão ou eviction do ambiente Web. O
registry é reconstruído/reconciliado pelo adapter; nenhuma conta ou dado pessoal
é introduzido nesta fatia.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim. A entrega altera a Biblioteca e o Leitor do
  consumer Web para concluir instalação, leitura e recuperação offline.

#### Stack e convenções de interface

- Next.js 15 App Router com rotas `/`, `/library`, `/search` e
  `/[version]/[book]/[chapter]`; componentes interativos são Client
  Components em `src/features`.
- React 19, TypeScript strict e Tailwind CSS 4; Sonner 2.0.7 para notificações;
  primitives locais no padrão
  shadcn/ui-style (`Button`, `Card`, `Badge`, `Skeleton`, `Breadcrumbs`,
  `Input`/feedback) e composições próprias de domínio em `features`.
- Tema escuro `slate-950`/`slate-900`, ação `sky-600`, corpo bíblico amplo,
  coluna de leitura com largura máxima e reflow de cards/controles para uma
  coluna no mobile.
- Vitest com Testing Library cobre componentes/estados; Playwright cobre
  jornada real, persistência, R2 e offline.
- Preservar AppShell, Breadcrumbs, OfflineBanner, ErrorState, EmptyState,
  VersionCard, Reader e PrevNextNav; estender apenas as responsabilidades
  necessárias desta fatia.

#### Telas e responsabilidades

- **Biblioteca `/library`**: pessoa leitora consulta catálogo, vê instaladas, inicia,
   acompanha/cancela instalação, tenta novamente, remove e abre o Leitor.
- **Leitor `/`**: pessoa leitora abre a primeira versão instalada e pode escolher
  livro, capítulo e versão pelos pickers responsivos.
- **Leitor `/[version]/[book]/[chapter]`**: pessoa leitora consulta uma
   versão instalada, escolhe livro/capítulo, lê versículos, seleciona um ou mais
   itens, copia o texto ou a referência e navega pela sequência.
- **Erro de storage/global**: o provider mantém o shell e oferece alerta seguro e
  retry; não apresenta dados simulados.

#### Fluxo de informação e navegação

- Entrada principal: `/` abre o provider e o Leitor. `BibleEngineProvider`
  inicializa/reconcilia o adapter antes de habilitar ações; `/library` abre o
  catálogo e `/search` abre a Busca.
- A rota profunda recebe versão, livro e capítulo diretamente na URL; o namespace
  `/ler` não é usado pelo consumer. O segmento `book` é a abreviação pública
  normalizada, convertida pela UI para o ID canônico antes de chamar a engine.
- Biblioteca consulta catálogo remoto e registry local em paralelo; cada card
  mostra origem pública, estado e ação. Após commit, `Ler` leva a
  `/<version>/gn/1`.
- Leitor consulta livros, capítulo e nome da versão local; os pickers mudam a rota,
  e `PrevNextNav` segue o cânone sem gerar destino inválido.
- A pessoa alterna versículos diretamente no conteúdo. O Reader mantém os IDs
  selecionados, calcula a área visual comum dos elementos e renderiza o popover
  contextual sem nova consulta à engine. Copiar usa o nome do livro, capítulo,
  números selecionados e a versão atual; limpar ou trocar de capítulo remove a
  seleção.
- Breadcrumb da Biblioteca: `Open Bible / Biblioteca` com tela atual sem link.
- Breadcrumb do Leitor: `Open Bible / Biblioteca / <livro> <capítulo>`; Biblioteca
  é link válido e a tela atual usa semântica de página.
- Falha de operação permanece na tela de origem; retry repete a operação. Falha
  de leitura oferece retorno à Biblioteca.
- Instalação atualiza uma notificação Sonner persistente durante o recebimento e
  troca para sucesso ou erro ao terminar; sem total, a notificação permanece
  indeterminada.

#### Menus e navegação principal

- AppShell reproduz o menu principal do legado com dock flutuante, ação de Leitura,
  Busca, Configurações e alternância de tema; os itens de Notas e Destaques
  permanecem explicitamente indisponíveis até suas specs de domínio/UI.
- A Biblioteca é o destino do fluxo R2; não há menu novo nem permissão de conta.
- O Leitor usa links para Busca e Biblioteca, pickers para livro/capítulo/versão e
  navegação anterior/próxima. Em mobile, itens refluem verticalmente sem ocultar
  instalação, leitura, retry ou retorno.
- O popover do Leitor é contextual, não adiciona item ao dock e não altera a rota;
  suas ações são `Copiar referência`, `Copiar texto` e `Limpar seleção`.

#### Formulários e ações

- Não há formulário de dados pessoais. As ações são `Instalar`, `Cancelar`,
  `Tentar novamente`, `Remover`, `Ler`, pickers de `Livro`/`Capítulo`/`Versão` e links.
- `Instalar` é ação primária inline no card; enquanto ocupa, mostra progresso
  textual ou indeterminado e `Cancelar`, desabilitando ações conflitantes.
- Cancelamento não usa modal: é imediato, seguro e retorna o card ao estado
  recuperável depois da limpeza do installer.
- Pickers têm nomes acessíveis, exibem somente opções válidas retornadas pela
  engine e fecham após uma seleção válida.
- Erros são exibidos junto da ação em `role=alert`; retry não perde o estado de
  versões anteriormente instaladas.
- Cada versículo é um controle focável com `aria-pressed`; a seleção mantém o
  texto legível e o popover informa sucesso ou erro de cópia em região viva. Escape,
  clique fora ou `Limpar seleção` fecham o contexto sem navegar.
- O aviso offline é um badge fixo recolhido no canto inferior esquerdo; clique ou
  teclado alterna a expansão da mensagem completa sem retirar a leitura da tela.

#### Composição e disposição

- AppShell fornece shell de tela cheia e dock flutuante; Biblioteca e Busca
  preservam Breadcrumbs e conteúdo centrado, enquanto o Leitor ocupa o espaço
  disponível. `OfflineBanner` é renderizado como badge fixo expansível.
- Biblioteca usa título/descrição, lista vertical de cards e ações inline; o
  progresso fica no card sem modal ou drawer.
- Leitor usa toolbar sticky em formato pill com livro, capítulo, versão e ação de
  exibição; livro/capítulo e versão abrem pickers em modal desktop ou drawer
  mobile. O gatilho de capítulo mostra somente o número; os pickers usam os
  tokens neutros `background`, `card`, `muted`, `accent`, `border`, `primary` e
  `foreground` do tema Tailwind/shadcn legado. O texto fica em coluna serifada
  centralizada e a navegação flutuante
  refluindo para a barra inferior no mobile.
- Durante o carregamento, o Leitor preserva a composição da tela com skeleton de
  toolbar, cabeçalho e linhas de versículos, evitando um bloco genérico isolado.
- Densidade prioriza leitura: espaçamento amplo, número do versículo em `sup`,
  line-height 8 e foco visível em links, botões e selects.
- A seleção usa destaque discreto por `accent`/`primary` sem substituir a
  tipografia serifada. O popover usa a mesma superfície `popover`, borda, sombra,
  cantos arredondados e foco visível do restante do consumer; em desktop flutua
  acima ou abaixo da seleção e em mobile ocupa somente a largura necessária.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Biblioteca | AppLibrary | Orquestrar catálogo, registry, ações e estados | `apps/consumer-web/src/features/library/AppLibrary.tsx` | Lista/Card de domínio | Próprio existente | Estender para observer/token e retry; não mover regra da engine |
| Biblioteca | VersionCard | Exibir versão, progresso, cancelamento, instalar/remover e Ler | `apps/consumer-web/src/features/library/VersionCard.tsx` | Card + Badge + Button | shadcn/ui-style existente | Estender estados; reutilizar no catálogo |
| Biblioteca | OfflineBanner | Explicar disponibilidade local | `apps/consumer-web/src/components/ui/feedback.tsx` | Feedback | Próprio existente | Reutilizar |
| Biblioteca | ErrorState | Mostrar erro seguro e retry | `apps/consumer-web/src/components/ui/feedback.tsx` | Alert/feedback | shadcn/ui-style existente | Reutilizar |
| Leitor | Reader | Orquestrar dados e compor conteúdo | `apps/consumer-web/src/features/reader/Reader.tsx` | Card + pickers responsivos | Próprio existente | Estender somente estados/rotas; engine mantém regra |
| Leitor | PrevNextNav | Exibir destinos válidos anterior/próximo | `apps/consumer-web/src/features/reader/PrevNextNav.tsx` | Button + Link | shadcn/ui-style existente | Reutilizar |
| Leitor | EmptyState | Orientar versão/livro/capítulo ausente | `apps/consumer-web/src/components/ui/feedback.tsx` | Feedback | Próprio existente | Reutilizar |
| Global | AppShell | Shell em tela cheia e navegação global | `apps/consumer-web/src/components/AppShell.tsx` | Shell + dock flutuante | Próprio existente, alinhado ao legado | Estender sem regra de Bíblia; itens de domínio futuro não simulam dados |
| Global | NavigationDock | Leitura, Busca, Configurações e tema em desktop/mobile | `apps/consumer-web/src/components/NavigationDock.tsx` | Dock responsivo | Nova composição própria baseada na referência visual legada | Reutilizar no shell; ações sem suporte ficam desabilitadas |
| Global | Toaster | Notificações Sonner de instalação e feedback | `apps/consumer-web/src/components/ui/sonner.tsx` | Toaster global | Componente de terceiros adaptado aos tokens locais | Reutilizar no layout; não conter regra de engine |
| Leitor | ReaderToolbar | Livro, capítulo, versão e ajustes de exibição | `apps/consumer-web/src/features/reader/ReaderToolbar.tsx` | Toolbar pill sticky | Nova composição própria baseada em `reader-header.tsx` legado | Reutilizar no Reader; engine continua dono dos dados |
| Leitor | BookChapterPicker | Buscar e selecionar livro/capítulo | `apps/consumer-web/src/features/reader/BookChapterPicker.tsx` | Modal desktop + drawer mobile | Nova composição própria baseada no picker legado | Reutilizar no Reader; livros/capítulos vêm da engine |
| Leitor | VersionPicker | Buscar, instalar e selecionar versão | `apps/consumer-web/src/features/reader/VersionPicker.tsx` | Modal desktop + drawer mobile | Nova composição própria baseada no picker legado | Reutilizar no Reader; aquisição delegada à engine |
| Global | DownloadToast | Exibir recebimento, progresso, sucesso e erro de uma versão | `apps/consumer-web/src/components/ui/download-toast.tsx` | Toast customizado | Composição própria com Sonner e tokens locais | Reutilizar na Biblioteca e no Reader; recebe somente eventos públicos |
| Leitor | VerseRow | Exibir um versículo e alternar sua seleção | `apps/consumer-web/src/features/reader/VerseRow.tsx` | Controle React + tipografia do Reader | Nova composição própria baseada na referência visual legada | Reutilizar somente no Reader; não adicionar regra de engine |
| Leitor | VerseSelectionPopover | Exibir ações da seleção e copiar referência/texto | `apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx` | Popover contextual + Button shadcn/ui-style | Nova composição própria baseada no popover do legado | Reutilizar no Reader; manter estado e clipboard locais |

#### Estados e acessibilidade

- Loading usa skeleton representativo de toolbar, cabeçalho e versículos, com
  `aria-label`/texto compreensível, sem botões que
  aparentem funcionar antes do engine estar pronto.
- EmptyState explica como instalar ou voltar; não oferece conteúdo inventado.
- ErrorState usa `role=alert`, mensagem traduzida por código e botão focável de
  retry quando aplicável.
- Sucesso anuncia mudança de instalação em região `aria-live="polite"`; progresso
  sem total não exibe percentual falso e também atualiza o Sonner da instalação.
- OfflineBanner informa que leitura local continua, mas aquisição depende da
  origem; por padrão, o componente é um badge inferior expansível e versões
  instaladas continuam com ação Ler.
- Todos os controles têm nome acessível, foco visível, ordem de tabulação natural
  e contraste compatível com o tema. Ações ficam disponíveis por teclado.
- Cada versículo selecionável é focável, possui nome acessível e comunica seu
  estado com `aria-pressed`; o popover tem nome, ações focáveis, estado de cópia
  em `aria-live`, Escape e fechamento explícito.
- Viewport mobile reorganiza cards, pickers e ações em coluna; desktop conserva
  leitura centralizada e ações alinhadas.
- O dock usa `aria-current` na área ativa e `aria-disabled`/texto explicativo para
  ações de Notas e Destaques ainda não entregues, sem criar conteúdo falso.

#### APIs expostas

- Não há endpoint novo. A composição usa os métodos públicos de `BibleEngine`:
  `listAvailableVersions`, `listInstalledVersions`, `installVersion` com
  `InstallationObserver` e `CancellationToken`, `uninstallVersion`, `getBooks`
  e `getChapter`.
- O contrato de erro é `EngineError.code`; a interface mapeia códigos para
  mensagens em português sem expor `cause`.
- A seleção e a cópia não criam API de aplicação: o popover recebe `BibleBook`,
  `Verse[]`, capítulo e identificador da versão já obtidos pelo Reader. O clipboard
  é acessado somente no client e a falha é traduzida em feedback seguro.

#### APIs externas utilizadas

- `HttpBiblePackageSource` → `GET <baseUrl>/api/bibles` para catálogo, com
  fallback estático quando indisponível; sem autenticação, timeout novo ou
  credencial.
- `HttpBiblePackageSource` → `GET <baseUrl>/api/bibles/download/:version` e/ou
  `GET <packageBaseUrl>/bibles/<arquivo>` para bytes; aceita streaming, usa
  `Content-Length` quando presente e converte cancelamento para o token público.
- Bucket R2 é público e configurado por `NEXT_PUBLIC_BIBLE_BUCKET_URL`; o
  consumer não faz upload, não envia dados pessoais e não presume CORS além do
  contrato já testado.

#### Documentação das APIs consultadas

- `packages/engine/src/ports.ts` e `packages/engine/src/engine.ts`, contrato
  local atual em 2026-08-30: ports de leitura, source, installer, observer e
  token.
- `packages/adapter-http/src/http-source.ts`, contrato local atual em
  2026-08-30: URLs, mapeamento R2, fallback, streaming e erros.
- `packages/adapter-sqlite-web/src/index.ts` e documentação SPEC-0002: exports
  públicos, Worker, OPFS e limitações de persistência.

#### Eventos e outros contratos

- `InstallationProgress` é evento em memória produzido por source/engine e
  consumido pela Biblioteca; campos `versionId`, `stage`, `receivedBytes` e
  `totalBytes` são serializáveis e opcionais conforme a origem.
- `CancellationToken` é contrato de leitura consultado pela engine; a UI não
  expõe `AbortSignal` ao core.
- `EngineError.code` é contrato de erro entre engine e consumer; os códigos
  previstos nesta fatia são `cancelled`, `invalid_package`,
  `network_unavailable`, `storage_busy`, `storage_unavailable` e
  `version_not_installed`.

### 11. Estratégia TDD

- **Unidade**: `HttpBiblePackageSource` para fallback, streaming, cancelamento e
  header; componentes `VersionCard`, `AppLibrary`, `Reader`, feedback,
  `PrevNextNav`, `VerseRow`, `VerseSelectionPopover` e o formatador de
  referência para estados, ações e limites.
- **Interface**: `AppShell`, `NavigationDock` e `ReaderToolbar` para shell em tela
  cheia, dock responsivo, toolbar pill, foco, `aria-current` e ações futuras
  explicitamente indisponíveis.
- **Integração/contrato**: fachada `BibleEngine` com fake source/installer e
  adapter Web com fake pool/registry para lifecycle, rollback, reconciliação e
  persistência após reopen.
- **BDD/aceite**: AC-001 a AC-014 são a referência Gherkin para os testes; cada
  teste deve preservar seu marcador `// SPECSFY:` com IDs reais.
- **BDD/aceite de seleção**: AC-015 a AC-017 são a referência para seleção
  alternável, popover contextual, formatos de clipboard, limpeza e recuperação;
  os testes devem preservar seus marcadores `// SPECSFY:`.
- **BDD/aceite visual**: AC-010 é a referência para o teste de composição do shell
  e do Leitor em desktop/mobile; a verificação não compara pixels frágeis, mas
  prova as regiões, roles e classes estruturais da interface.
- **BDD/aceite de seleção**: AC-011 cobre a entrada `/`, a rota `/library` e
  os modos modal desktop/drawer mobile dos pickers sem comparar pixels frágeis.
- **Runner TDD**: Vitest 3 com `pnpm --filter @openbible/consumer-web run test:tdd`
  e suites dos packages; não criar `.feature`.
- **E2E**: Playwright do consumer Web para instalação R2, leitura, reload,
  service worker/offline, estados e manifest; Chromium é bloqueante, WebKit é
  executado conforme a matriz documentada.
- **Verificação manual**: somente conferir visualização mobile/desktop e foco
  real se a automação não cobrir a dimensão; registrar viewport e resultado.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, NFR-001, NFR-003, AC-001 | AC-001 na seção 6 | `apps/consumer-web/tests/library-source.spec.tsx` e teste browser com marcador `SPECSFY` | Falhou porque `AppLibrary` chamava `installVersion` sem `InstallationObserver` (exit 1 em 2026-08-30) | Focal consumer passou após observer/token; build e fluxo Chromium também passaram | Progresso indeterminado, cleanup e foco foram mantidos na regressão |
| US-001, FR-001, NFR-001, AC-002 | AC-002 na seção 6 | `packages/adapter-http/src/__tests__/http-source.test.ts` com marcador `SPECSFY` | Fallback já existente; caso foi caracterizado sem RED novo | `pnpm --filter @openbible/adapter-http exec vitest run src/__tests__/http-source.test.ts` exit 0 | Sem duplicar catálogo na UI |
| US-001, US-003, FR-001, FR-003, NFR-001, NFR-003, AC-003 | AC-003 na seção 6 | `apps/consumer-web/tests/install-failure.spec.tsx` e suite installer | Falhou porque `VersionCard` não oferecia `Cancelar` (exit 1 em 2026-08-30) | Consumer e installer Web passaram; ponte HTTP cancelável passou | Token, AbortSignal e Worker são observados até cleanup |
| US-002, FR-002, NFR-002, NFR-003, AC-004 | AC-004 na seção 6 | `apps/consumer-web/tests/reader.spec.tsx` e teste browser | Caracterização do Reader existente passou; novo caso cobriu renderização | Reader e Chromium passaram com capítulo, quantidade e versículos | UI não reimplementa ordenação |
| US-002, FR-002, NFR-002, NFR-003, AC-005 | AC-005 na seção 6 | `apps/consumer-web/tests/reader.spec.tsx` | Caso novo passou após trocar navegação documental por `router.push` | Reader passou com seleção, hrefs e limites finais | `PrevNextNav` continua composição única |
| US-002, US-003, FR-002, FR-003, NFR-002, NFR-003, AC-006 | AC-006 na seção 6 | `apps/consumer-web/tests/browser/consumer.spec.ts` e lifecycle Web | RED aguardando build antes da execução E2E | Chromium passou em `test:browser`; WebKit não iniciou por dependências do host | Caso usa contexto persistente e bloqueio de rede; não usa fallback em memória |
| US-003, FR-003, NFR-001, NFR-003, AC-007 | AC-007 na seção 6 | `apps/consumer-web/tests/offline-empty.spec.tsx` e provider state | Caso novo falharia sem provider traduzir `storage_unavailable` | Consumer passou com alerta seguro, retry e sem instalação falsa | Mensagens internas não atravessam a UI |
| US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-003, AC-008 | AC-008 na seção 6 | `apps/consumer-web/tests/library-states.spec.tsx` e `states.a11y.spec.tsx` | Caso novo de progresso sem total e foco protegeu a lacuna | Componentes focais passaram | `Button` recebeu foco visível e progresso não inventa percentual |
| US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003, AC-009 | AC-009 na seção 6 | `apps/consumer-web/tests/boundary.test.ts` e `tests/arch/*` | Guarda ampliada para SQL/fixture/legado | Boundary passou | Varredura permanece somente em `src` e mantém exports públicos |
| US-002, FR-002, NFR-003, AC-010 | AC-010 na seção 6 | `apps/consumer-web/tests/app-shell.spec.tsx`, `tests/reader-toolbar.spec.tsx` | RED observado em 2026-08-30: shell sem `data-testid="app-shell"`/dock e Reader sem botão `Exibição`; exit 1 | GREEN: 34 testes do consumer passaram, incluindo shell full-viewport, dock, toolbar pill, troca de versão e coluna do Reader | Chromium passou; WebKit não iniciou por dependências ausentes do host |
| US-002, FR-002, FR-004, NFR-002, NFR-003, AC-011 | AC-011 na seção 6 | `apps/consumer-web/tests/reader-pickers.spec.tsx`, `tests/browser/consumer.spec.ts` | Registro inicial da mudança tardia, superseded pela linha GREEN abaixo | Preservado como histórico de planejamento | Evidência histórica do shell não é usada como prova dos pickers |
| US-002, FR-002, FR-004, NFR-002, NFR-003, AC-011 | AC-011 na seção 6 | `apps/consumer-web/tests/reader-pickers.spec.tsx`, `tests/version-picker.spec.tsx`, `tests/reader-root.spec.tsx`, `tests/browser/consumer.spec.ts` | RED válido em 2026-08-30: módulos dos pickers ausentes e `/` ainda renderizava o erro de referência inválida | GREEN em 2026-08-30: 4 testes focais, Chromium com modal desktop, drawer mobile, seleção e leitura offline | Três testes unitários separados preservam a fronteira de livro/capítulo, versão e entrada raiz; a falha de chunk da rota dinâmica foi corrigida tornando a página client-side |
| US-002, FR-002, NFR-003, AC-010, AC-011 | Ajuste visual de AC-010/AC-011 | `apps/consumer-web/tests/reader-toolbar.spec.tsx`, `apps/consumer-web/tests/reader-pickers.spec.tsx` | RED válido em 2026-08-30: a toolbar renderizou `Cap. 1` e a grade usou `hover:bg-primary` em vez do token visual legado | GREEN em 2026-08-30: 3 testes focais, typecheck, lint, build autenticado e Chromium 2/2 passaram | O teste preserva o nome acessível `Capítulo`, verifica tokens sem comparar pixels e a implementação mantém a responsividade existente |
| US-001, FR-001, NFR-003, AC-001, AC-008 | Feedback Sonner de download | `apps/consumer-web/tests/download-toast.spec.tsx` | RED válido em 2026-08-30: módulo `download-toast` ausente; o teste de ciclo exige criação, atualização por id e estados finais | GREEN em 2026-08-30: criação, atualização por id, progresso determinado/indeterminado, sucesso e erro passaram | O teste protege o estado indeterminado sem percentual |
| US-002, FR-003, NFR-003, AC-006, AC-008 | Badge offline expansível | `apps/consumer-web/tests/feedback.spec.tsx` | RED válido em 2026-08-30: `OfflineBanner` ainda não expõe botão, estado fechado nem `aria-expanded` | GREEN em 2026-08-30: badge inicia fechado e alterna a mensagem com `aria-expanded` | A mensagem integral permanece o conteúdo normativo após expansão |
| US-002, FR-002, NFR-003, AC-008 | Skeleton de capítulo | `apps/consumer-web/tests/reader.spec.tsx` | RED válido em 2026-08-30: Reader renderiza `page-frame` com dois blocos genéricos sem regiões de toolbar, cabeçalho e versículos | GREEN em 2026-08-30: regiões estruturais de loading passaram enquanto a promise do capítulo estava pendente | O teste deixa a promise do capítulo pendente para observar a composição de loading |
| US-002, FR-004, NFR-003, AC-011 | Hover da seleção de versão | `apps/consumer-web/tests/version-picker.spec.tsx` | RED válido em 2026-08-30: container de versão disponível não possui `hover:bg-accent/60` | GREEN em 2026-08-30: container usa hover semântico e transição de cor | O caso verifica token estrutural sem comparar pixels |
| FR-004, NFR-003, AC-012 | Namespace antigo `/ler` | `apps/consumer-web/tests/browser/consumer.spec.ts` | RED histórico: `/ler/` permaneceu em `/ler` antes do alias; superseded pela decisão de remover o namespace | GREEN no Chromium: `/ler/`, `/biblioteca` e `/busca` respondem 404 | A rota profunda canônica passa a ser `/<version>/<book>/<chapter>` |
| FR-002, FR-004, NFR-002, NFR-003, AC-013 | Rota profunda `/<version>/<book>/<chapter>` | `apps/consumer-web/tests/reader.spec.tsx`, `tests/browser/consumer.spec.ts` | RED em 2026-08-30: Reader ainda gerava `/ler/<versao>/<livro>/<capitulo>` e lia o segmento interno `gen` | GREEN: seleção abre `/ara/gn/2`, exibe Gênesis 2 e a engine recebe `gen` | A engine continua usando IDs canônicos internos |
| FR-004, NFR-003, AC-014 | Rotas estáticas em inglês | `apps/consumer-web/tests/app-shell.spec.tsx`, `tests/browser/consumer.spec.ts` | RED em 2026-08-30: páginas e links ainda usavam `/biblioteca` e `/busca` | GREEN no Chromium: `/library` e `/search` respondem com sucesso e o dock aponta para elas | Não criar aliases em português |
| US-002, FR-002, FR-005, NFR-003, AC-015 | AC-015 na seção 6 | `apps/consumer-web/tests/verse-selection.spec.tsx` | RED em 2026-08-30: Reader não oferecia controle focável de versículo nem popover contextual | GREEN em 2026-08-30: botão com `aria-pressed`, seleção visual, dialog nomeado e ações passaram |
| US-002, FR-005, NFR-003, AC-016 | AC-016 na seção 6 | `apps/consumer-web/tests/verse-reference.test.ts`, `tests/verse-selection.spec.tsx` | RED em 2026-08-30: formatador não existia e o Reader não escrevia os formatos esperados no clipboard | GREEN em 2026-08-30: intervalos, referência com versão e texto numerado foram copiados |
| US-002, FR-005, NFR-003, AC-017 | AC-017 na seção 6 | `apps/consumer-web/tests/verse-selection.spec.tsx` | RED em 2026-08-30: Reader não tinha limpeza, Escape, clique fora ou recuperação do clipboard | GREEN em 2026-08-30: erro preserva seleção e Escape, clique fora e limpeza fecham o popover |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Integração/browser | `apps/consumer-web/tests/library-source.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed após correção; RED registrado antes (observer ausente, exit 1, 2026-08-30) |
| FR-001 | AC-002 | Unidade/contrato | `packages/adapter-http/src/__tests__/http-source.test.ts` | Passed: fallback R2 após HTTP 503 |
| FR-001 | AC-003 | Integração | `apps/consumer-web/tests/install-failure.spec.tsx`, suite installer | Passed: cancelamento, rollback e preservação |
| FR-001 | AC-008 | Componente | `apps/consumer-web/tests/library-states.spec.tsx` | Passed: estados instalando/instalada |
| FR-002 | AC-004 | Componente/browser | `apps/consumer-web/tests/reader.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: capítulo e versículos canônicos |
| FR-002 | AC-005 | Componente | `apps/consumer-web/tests/reader.spec.tsx` | Passed: seleção e limites de navegação |
| FR-002 | AC-006 | Browser/lifecycle | `apps/consumer-web/tests/browser/consumer.spec.ts`, adapter Web lifecycle | Passed no Chromium com rede bloqueada; lifecycle Web preservado |
| FR-002 | AC-010 | Componente/browser | `apps/consumer-web/tests/app-shell.spec.tsx`, `tests/reader-toolbar.spec.tsx` | Passed: gatilho numérico, shell `100dvh`, dock, toolbar pill e Reader centralizado |
| FR-002 | AC-011 | Componente/browser | `apps/consumer-web/tests/reader-pickers.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: seleção de livro/capítulo, versão, tokens semânticos e leitura pela engine |
| FR-004 | AC-011 | Componente/browser | `apps/consumer-web/tests/reader-root.spec.tsx`, `tests/app-shell.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: `/` abre Leitor, `/library` mantém catálogo e seleção muda a rota |
| FR-004 | AC-012 | Browser | `apps/consumer-web/tests/browser/consumer.spec.ts` | Passed no Chromium: `/ler/` responde 404 |
| FR-002 | AC-013 | Componente/browser | `apps/consumer-web/tests/reader.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: `/ara/gn/2` exibe Gênesis 2 sem `/ler`; navegação preserva o slug público |
| FR-004 | AC-014 | Componente/browser | `apps/consumer-web/tests/app-shell.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: `/library` e `/search` são as rotas estáticas canônicas |
| FR-005 | AC-015 | Componente/a11y | `apps/consumer-web/tests/verse-selection.spec.tsx` | Passed: seleção focável, estado `aria-pressed`, popover nomeado e ações |
| FR-005 | AC-016 | Unidade/componente | `apps/consumer-web/tests/verse-reference.test.ts`, `tests/verse-selection.spec.tsx` | Passed: intervalos, referência com versão e texto numerado no clipboard |
| FR-005 | AC-017 | Componente/a11y | `apps/consumer-web/tests/verse-selection.spec.tsx` | Passed: limpeza, Escape, clique fora e erro acessível sem persistência |
| FR-002 | AC-008 | Componente/a11y | `apps/consumer-web/tests/offline-empty.spec.tsx`, `states.a11y.spec.tsx` | Passed: loading, erro, retry e labels |
| FR-003 | AC-003 | Integração/adapter | `apps/consumer-web/tests/install-failure.spec.tsx`, adapter rollback | Passed: nenhuma instalação parcial |
| FR-003 | AC-006 | Browser | `apps/consumer-web/tests/browser/consumer.spec.ts` | Passed no Chromium com rede bloqueada |
| FR-003 | AC-007 | Componente | `apps/consumer-web/tests/offline-empty.spec.tsx` | Passed: storage indisponível sem engine falsa |
| FR-003 | AC-008 | Componente/a11y | `apps/consumer-web/tests/states.a11y.spec.tsx` | Passed: feedback recuperável e progresso indeterminado |
| NFR-001 | AC-001 | Conformance | `pnpm --filter @openbible/consumer-web run test:browser` | Passed: instalação real e leitura Chromium |
| NFR-001 | AC-003 | Falha/rollback | `packages/adapter-sqlite-web/tests/unit/installer.test.ts` | Passed: cleanup e preservação |
| NFR-001 | AC-007 | Integração | `apps/consumer-web/tests/*state*`, provider | Passed: erro tipado e retry |
| NFR-001 | AC-009 | Arquitetural | `pnpm test:tdd`, `tests/arch/*`, boundary test | Passed: 21 guards e boundary |
| NFR-002 | AC-004 | Componente | `apps/consumer-web/tests/reader.spec.tsx` | Passed: ordem retornada pela engine |
| NFR-002 | AC-005 | Componente | `apps/consumer-web/tests/reader.spec.tsx` | Passed: destinos válidos |
| NFR-002 | AC-006 | E2E browser | `pnpm --filter @openbible/consumer-web run test:browser` | Passed no Chromium |
| NFR-002 | AC-009 | Arquitetural | boundary/exports tests | Passed: somente exports públicos |
| NFR-003 | AC-001 | Browser/a11y | `apps/consumer-web/tests/browser/consumer.spec.ts` | Passed: jornada Chromium |
| NFR-003 | AC-003 | Componente | `apps/consumer-web/tests/install-failure.spec.tsx` | Passed: cancelar disponível |
| NFR-003 | AC-004 | Componente/a11y | `apps/consumer-web/tests/reader.spec.tsx` | Passed: conteúdo e navegação |
| NFR-003 | AC-005 | Browser/a11y | Playwright desktop/mobile | Chromium desktop passed; WebKit bloqueado por dependências do host |
| NFR-003 | AC-006 | Browser | `apps/consumer-web/tests/browser/consumer.spec.ts` | Passed no Chromium |
| NFR-003 | AC-007 | Componente/a11y | `apps/consumer-web/tests/states.a11y.spec.tsx` | Passed: alerta e retry acessíveis |
| NFR-003 | AC-008 | Componente/a11y | `apps/consumer-web/tests/states.a11y.spec.tsx` | Passed: `aria-live` e foco |
| NFR-003 | AC-009 | Arquitetural | `tests/arch/*` | Passed: boundary e superfície pública |
| NFR-003 | AC-010 | Componente/browser/a11y | `apps/consumer-web/tests/app-shell.spec.tsx`, `tests/reader-toolbar.spec.tsx` | Passed: regressão do gatilho numérico, foco e toolbar responsiva |
| NFR-003 | AC-011 | Componente/browser/a11y | `apps/consumer-web/tests/reader-pickers.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: tokens semânticos, dialog nomeado, Escape, modal desktop, drawer mobile e foco visível |
| FR-001 | AC-001/AC-008 | Componente/integracao | `apps/consumer-web/tests/download-toast.spec.tsx`, `tests/browser/consumer.spec.ts` | Passed: ciclo Sonner com progresso determinado/indeterminado, sucesso e erro |
| NFR-003 | AC-008/AC-010 | Componente/a11y | `apps/consumer-web/tests/feedback.spec.tsx`, `tests/reader.spec.tsx`, `tests/version-picker.spec.tsx` | Passed: badge offline expansível, skeleton representativo, hover de versão e cor compartilhada da toolbar |
| NFR-003 | AC-015/AC-016/AC-017 | Componente/browser/a11y | `apps/consumer-web/tests/verse-selection.spec.tsx`, `tests/verse-reference.test.ts`, `tests/browser/consumer.spec.ts` | Passed: foco, seleção, feedback de clipboard, fechamento e regressão Chromium desktop/mobile |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed em 2026-08-30 após incorporar a seleção alternável de
  versículos, o popover contextual e as ações de clipboard.
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/in-progress/0009-leitor-web-download-r2/spec.md`.
- **Achados**: nenhum blocker; AC-015 a AC-017 possuem comportamento observável,
  FR-005 tem três aceites distintos, NFR-003 mantém cobertura mínima e a seção 10
  descreve stack, tela, fluxo, ações, composição, componentes, estados e
  acessibilidade. A evidência anterior de AC-001 a AC-014 permanece histórica.
- Findings especializados, quando aplicáveis, seguem `FIND-PROD|ARCH|SEC-NNN`,
  severidade `P1|P2|P3`, estado `Open|Resolved|Accepted`, refs e evidência.

#### Gate do Ato II — Plano

- **Resultado**: Passed em 2026-08-30 após materializar T042-T044, observar os
  REDs e validar T042-T046 com os arquivos de interface declarados.
- **Comandos**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs
  specs/in-progress/0009-leitor-web-download-r2/spec.md`,
  `node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs
  specs/in-progress/0009-leitor-web-download-r2/spec.md` e
  `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs
  specs/in-progress/0009-leitor-web-download-r2/spec.md . --full-chain`.
- **Achados**: 43 tarefas, 215 itens de checklist, 28/28 IDs cobertos e
  interface válida; T042-T044 possuem testes RED com marcadores `SPECSFY` e
  T045 depende deles. As evidências históricas T001-T041 permanecem preservadas.

#### Gate do Ato III — Entrega

- **Resultado**: Passed em 2026-08-30 após concluir T045-T046 e verificar a
  seleção de versículos sem alteração de engine, persistência ou APIs.
- **Comandos**: `pnpm --filter @openbible/consumer-web run test:tdd`,
  `pnpm --filter @openbible/consumer-web run typecheck`,
  `pnpm --filter @openbible/consumer-web run lint`, build autenticado do
  consumer, Playwright Chromium `3/3`,
  `node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs
  --project /home/claudio/Projects/openbible-engine --check`,
  `node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project
  /home/claudio/Projects/openbible-engine --check` e validação estrita de
  evidência de T045.
- **Achados**: os 48 testes TDD, tipos, lint, build, os três cenários Chromium
  com viewport desktop/mobile e a documentação passaram. A rastreabilidade da
  SPEC está completa em `28/28`; o verificador global continua reportando apenas
  marcadores órfãos históricos de outras specs, mantidos fora desta atualização.
  WebKit permanece limitado pelas dependências ausentes do host conforme a
  evidência histórica; nenhuma funcionalidade desta fatia depende dele.

### 14. Tarefas

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar teste de instalação bem-sucedida com observer em `apps/consumer-web/tests/library-source.spec.tsx` — Refs: US-001, FR-001, NFR-001, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Confirmar contrato público de `installVersion`, observer de progresso e baseline do teste existente.
  - [x] **EXECUTE**: Escrever o teste comportamental com marcador `SPECSFY`, sem fixture de execução nem import do legado.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/library-source.spec.tsx -t "encaminha o observer"` e observar RED válido por chamada sem observer.
  - [x] **EVIDENCE**: Registrar o teste em `apps/consumer-web/tests/library-source.spec.tsx` e o exit 1 na seção 11 para AC-001.
  - [x] **IMPROVE**: O caso prova a delegação à engine e a lacuna real de progresso, sem duplicar teste de renderização.

- [x] T002 [TEST] [TDD] [US-001] Derivar testes de cancelamento, pacote inválido, retry e preservação de instalação anterior em `apps/consumer-web/tests/install-failure.spec.tsx` — Refs: US-001, US-003, FR-001, FR-003, NFR-001, NFR-003, AC-003, AC-007 — Depends: none
  - [x] **PREP**: Mapear códigos `cancelled`, `invalid_package`, `network_unavailable`, `storage_busy` e `storage_unavailable`.
  - [x] **EXECUTE**: Escrever testes de falha no consumer e nos adapters com fronteira real/fake explícita.
  - [x] **VERIFY**: Executar testes focais e observar RED válido.
  - [x] **EVIDENCE**: Registrar ausência esperada de parcial e preservação do estado anterior.
  - [x] **IMPROVE**: Confirmar que mocks não escondem o lifecycle do installer.

- [x] T003 [TEST] [TDD] [US-002] Derivar testes de leitura, ordenação, seleção e navegação nos limites em `apps/consumer-web/tests/reader.spec.tsx` — Refs: US-002, FR-002, NFR-002, NFR-003, AC-004, AC-005 — Depends: none
  - [x] **PREP**: Confirmar rotas, contratos `getBooks`/`getChapter`, cânone e limites válidos.
  - [x] **EXECUTE**: Escrever casos de componente e contrato com dados determinísticos.
  - [x] **VERIFY**: Executar testes e observar RED válido se Reader/links forem removidos.
  - [x] **EVIDENCE**: Registrar arquivos, comandos e IDs cobertos.
  - [x] **IMPROVE**: Evitar testar ordenação duplicada na UI quando a engine é a dona da regra.

- [x] T004 [TEST] [TDD] [US-003] Derivar testes de reopen/offline, estados e acessibilidade — Refs: US-002, US-003, FR-002, FR-003, NFR-002, NFR-003, AC-006, AC-007, AC-008 — Depends: none
  - [x] **PREP**: Confirmar provider, OPFS lifecycle, Playwright persistent context e estados existentes.
  - [x] **EXECUTE**: Materializar testes de reabertura, rede bloqueada, loading/empty/error, foco e labels.
  - [x] **VERIFY**: Executar Vitest e Playwright focal; registrar limitações WebKit conforme matriz.
  - [x] **EVIDENCE**: Associar resultados aos cenários BDD e à tabela de rastreabilidade.
  - [x] **IMPROVE**: Separar indisponibilidade de aquisição da disponibilidade de leitura local.

- [x] T012 [TEST] [TDD] [US-001] Derivar do AC-002 um caso independente de fallback do catálogo para R2 em `packages/adapter-http/src/__tests__/http-source.test.ts` — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none
  - [x] **PREP**: Confirmar resposta não-2xx e mapeamento público de arquivo no `HttpBiblePackageSource`.
  - [x] **EXECUTE**: Escrever o teste de contrato com `fetchImpl` injetável e marcador `SPECSFY` em `packages/adapter-http/src/__tests__/http-source.test.ts`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se o fallback não for retornado.
  - [x] **EVIDENCE**: Registrar resposta, URL e resultado na matriz AC-002.
  - [x] **IMPROVE**: Não duplicar a implementação do fallback no teste.

- [x] T013 [TEST] [TDD] [US-001] Derivar do AC-003 um caso independente de cancelamento ou pacote inválido sem parcialidade em `apps/consumer-web/tests/install-failure.spec.tsx` — Refs: US-001, US-003, FR-001, FR-003, NFR-001, NFR-003, AC-003 — Depends: none
  - [x] **PREP**: Confirmar instalação anterior, códigos `cancelled`/`invalid_package` e cleanup esperado.
  - [x] **EXECUTE**: Escrever o teste de falha com source/installer explícitos e marcador `SPECSFY`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se o estado anterior for perdido.
  - [x] **EVIDENCE**: Registrar código, ausência de parcial e retry na matriz AC-003.
  - [x] **IMPROVE**: Exercitar a fronteira do installer sem mockar sua garantia transacional.

- [x] T014 [TEST] [TDD] [US-002] Derivar do AC-004 um caso independente de abertura e ordenação de capítulo em `apps/consumer-web/tests/reader.spec.tsx` — Refs: US-002, FR-002, NFR-002, NFR-003, AC-004 — Depends: none
  - [x] **PREP**: Confirmar `getBooks`, `getChapter`, rota e números de versículo esperados.
  - [x] **EXECUTE**: Escrever o teste de componente com marcador `SPECSFY` em `apps/consumer-web/tests/reader.spec.tsx`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se o capítulo não for exibido.
  - [x] **EVIDENCE**: Registrar título e ordem observados na matriz AC-004.
  - [x] **IMPROVE**: Não reproduzir na UI a regra canônica da engine.

- [x] T015 [TEST] [TDD] [US-002] Derivar do AC-005 um caso independente de seleção e navegação nos limites em `apps/consumer-web/tests/reader.spec.tsx` — Refs: US-002, FR-002, NFR-002, NFR-003, AC-005 — Depends: none
  - [x] **PREP**: Confirmar destinos válidos e ausência de link no limite final.
  - [x] **EXECUTE**: Escrever o teste de interação com marcador `SPECSFY` em `apps/consumer-web/tests/reader.spec.tsx`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se houver href inválido ou seletor sem rota.
  - [x] **EVIDENCE**: Registrar hrefs, seleções e limites na matriz AC-005.
  - [x] **IMPROVE**: Preservar `PrevNextNav` como owner da navegação sequencial.

- [x] T016 [TEST] [TDD] [US-002] Derivar do AC-006 um caso independente de reopen e leitura sem rede em `apps/consumer-web/tests/browser/consumer.spec.ts` — Refs: US-002, US-003, FR-002, FR-003, NFR-002, NFR-003, AC-006 — Depends: none
  - [x] **PREP**: Confirmar contexto persistente, reload e bloqueio de rede após instalação.
  - [x] **EXECUTE**: Escrever o teste Playwright com marcador `SPECSFY` em `apps/consumer-web/tests/browser/consumer.spec.ts`.
  - [x] **VERIFY**: Executar Chromium e registrar o resultado WebKit conforme a matriz; observar RED antes do código.
  - [x] **EVIDENCE**: Registrar requests bloqueadas e conteúdo local na matriz AC-006.
  - [x] **IMPROVE**: Garantir que o caso não dependa de fallback em memória.

- [x] T017 [TEST] [TDD] [US-003] Derivar do AC-007 um caso independente de storage Web indisponível em `apps/consumer-web/tests/offline-empty.spec.tsx` — Refs: US-003, FR-003, NFR-001, NFR-003, AC-007 — Depends: none
  - [x] **PREP**: Confirmar inicialização falha com `storage_unavailable` e não cria engine falsa.
  - [x] **EXECUTE**: Escrever o teste de ErrorState/retry com marcador `SPECSFY` em `apps/consumer-web/tests/offline-empty.spec.tsx`.
  - [x] **VERIFY**: Executar o caso e observar RED válido sem alerta ou com leitura simulada.
  - [x] **EVIDENCE**: Registrar role, retry e ausência de conteúdo na matriz AC-007.
  - [x] **IMPROVE**: Distinguir storage indisponível de catálogo vazio.

- [x] T018 [TEST] [TDD] [US-003] Derivar do AC-008 um caso independente de estados e acessibilidade em `apps/consumer-web/tests/states.a11y.spec.tsx` — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Confirmar skeleton, EmptyState, ErrorState, `aria-live`, foco e labels.
  - [x] **EXECUTE**: Escrever o teste Testing Library com marcador `SPECSFY` em `apps/consumer-web/tests/states.a11y.spec.tsx`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se um estado ou ação acessível desaparecer.
  - [x] **EVIDENCE**: Registrar estados e nomes acessíveis na matriz AC-008.
  - [x] **IMPROVE**: Verificar próximo passo recuperável, não apenas presença de texto.

- [x] T019 [TEST] [TDD] [US-001] Derivar do AC-009 um caso independente de fronteira pública e legado somente leitura em `apps/consumer-web/tests/boundary.test.ts` — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003, AC-009 — Depends: none
  - [x] **PREP**: Confirmar guardas de exports/imports, SQL na UI e paths do legado proibidos.
  - [x] **EXECUTE**: Escrever o teste arquitetural com marcador `SPECSFY` em `apps/consumer-web/tests/boundary.test.ts`.
  - [x] **VERIFY**: Executar o caso e observar RED válido se a fronteira pública for atravessada.
  - [x] **EVIDENCE**: Registrar arquivos e resultado na matriz AC-009.
  - [x] **IMPROVE**: Reutilizar as guardas arquiteturais existentes em vez de criar duplicação.
  <!-- specsfy:evidence {"task":"T019","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","NFR-001","NFR-002","NFR-003","AC-009"],"files":["apps/consumer-web/tests/boundary.test.ts","apps/consumer-web/src/engine/bible-engine-provider.tsx","apps/consumer-web/src/features/search/search-installed.ts"],"commands":[{"run":"pnpm exec vitest run tests/arch","exit":0},{"run":"node scripts/check-api-surface.mjs --check-no-publish","exit":0},{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/boundary.test.ts","exit":0}]} -->

#### Fase 2 — US-001 Instalar uma versão oficial para leitura local (P1)

**Objetivo**: permitir aquisição R2 e instalação exception-safe com feedback
recuperável.
**Teste independente**: T001/T002 e a instalação ARA no Playwright.

- [x] T005 [CODE] [US-001] Ajustar a composição de `HttpBiblePackageSource`, provider e Biblioteca para catálogo R2, observer de progresso, token de cancelamento, retry e estado instalado em `apps/consumer-web/src/engine/bible-engine-provider.tsx` e `packages/adapter-http/src/http-source.ts` — Refs: US-001, FR-001, NFR-001, NFR-003, AC-001, AC-002, AC-003, AC-008 — Depends: T001, T002, T003, T012, T013, T018
  - [x] **PREP**: Confirmar RED e localizar os contratos públicos sem mover regra para React.
  - [x] **EXECUTE**: Implementar a menor alteração em `apps/consumer-web` e `packages/adapter-http` necessária para o fluxo.
  - [x] **VERIFY**: Executar testes focais, typecheck e lint do consumer/package.
  - [x] **EVIDENCE**: Registrar GREEN, URLs/configuração usada e arquivos alterados.
  - [x] **IMPROVE**: Remover duplicação de mensagens/estado sem criar camada de compatibilidade desnecessária.
  <!-- specsfy:evidence {"task":"T005","refs":["US-001","FR-001","NFR-001","NFR-003","AC-001","AC-002","AC-003","AC-008"],"files":["apps/consumer-web/src/engine/bible-engine-provider.tsx","apps/consumer-web/src/features/library/AppLibrary.tsx","packages/adapter-http/src/http-source.ts","packages/adapter-sqlite-web/src/adapter.ts","apps/consumer-web/src/lib/engine-error.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck && pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"pnpm --filter @openbible/adapter-http run check","exit":0},{"run":"pnpm --filter @openbible/adapter-sqlite-web run check","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase de interface existente

- [x] T006 [CODE] [US-001] Estender `VersionCard` e `AppLibrary` com progresso sem percentual falso e cancelamento acessível em `apps/consumer-web/src/features/library/VersionCard.tsx` e `AppLibrary.tsx` — Refs: US-001, US-003, FR-001, FR-003, NFR-003, AC-001, AC-003, AC-008 — Depends: T005, T001, T013, T018
  - [x] **PREP**: Confirmar composição em `INTERFACE.md`, ações inline e estados de teclado.
  - [x] **EXECUTE**: Implementar componentes sem modal e registrar alterações/reuso em `INTERFACE.md`.
  - [x] **VERIFY**: Exercitar instalação, cancelamento, retry, `aria-live`, foco e mobile.
  - [x] **EVIDENCE**: Registrar telas, componentes, comando e resultado.
  - [x] **IMPROVE**: Manter a página como compositora e concentrar feedback no bloco de domínio.
  <!-- specsfy:evidence {"task":"T006","refs":["US-001","US-003","FR-001","FR-003","NFR-003","AC-001","AC-003","AC-008"],"files":["INTERFACE.md","apps/consumer-web/src/features/library/VersionCard.tsx","apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/src/components/ui/button.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

**Fase 3 — US-002 Ler e navegar por uma versão instalada (P1)**

**Objetivo**: tornar a leitura local do capítulo a saída principal da fatia.
**Teste independente**: T003 e E2E de `/ara/gn/1`.

- [x] T007 [CODE] [US-002] Ajustar `Reader` e `PrevNextNav` para seleção de livro/capítulo, conteúdo ordenado, rotas válidas e estados de versão não instalada — Refs: US-002, FR-002, NFR-002, NFR-003, AC-004, AC-005, AC-006, AC-008 — Depends: T003, T005, T014, T015, T016, T018
  - [x] **PREP**: Confirmar contratos da engine, Breadcrumbs, links válidos e dados que não devem ser reordenados na UI.
  - [x] **EXECUTE**: Implementar somente composição/estado de tela e registrar blocos alterados.
  - [x] **VERIFY**: Executar testes Reader, navegação, typecheck e lint.
  - [x] **EVIDENCE**: Registrar GREEN e a rota/viewport exercitada.
  - [x] **IMPROVE**: Simplificar efeitos/estado local e preservar a leitura centralizada.
  <!-- specsfy:evidence {"task":"T007","refs":["US-002","FR-002","NFR-002","NFR-003","AC-004","AC-005","AC-006","AC-008"],"files":["INTERFACE.md","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/PrevNextNav.tsx","apps/consumer-web/src/lib/engine-error.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader.spec.tsx tests/search.spec.tsx tests/boundary.test.ts","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

**Fase 4 — US-003 Retomar a leitura após falha ou reabertura (P1)**

**Objetivo**: provar persistência local, offline e recuperação sem parcialidade.
**Teste independente**: T004 e jornada browser com reabertura/rede bloqueada.

- [x] T008 [CODE] [US-003] Ajustar provider e estados de feedback para storage indisponível, reabertura, offline e retry sem fallback em memória em `apps/consumer-web/src/engine/bible-engine-provider.tsx` e `apps/consumer-web/src/components/ui/feedback.tsx` — Refs: US-003, FR-003, NFR-001, NFR-002, NFR-003, AC-006, AC-007, AC-008 — Depends: T004, T005, T007, T016, T017, T018
  - [x] **PREP**: Confirmar códigos de erro, ciclo de fechamento e comportamento do adapter Web.
  - [x] **EXECUTE**: Implementar recuperação no provider/UI ou corrigir adapter somente se o contrato público exigir.
  - [x] **VERIFY**: Executar testes de lifecycle, E2E offline e checagem de ausência de fallback em memória.
  - [x] **EVIDENCE**: Registrar resultado de reopen, rede bloqueada, retry e estado anterior preservado.
  - [x] **IMPROVE**: Documentar limitações WebKit/OPFS sem enfraquecer o critério Chromium bloqueante.
  <!-- specsfy:evidence {"task":"T008","refs":["US-003","FR-003","NFR-001","NFR-002","NFR-003","AC-006","AC-007","AC-008"],"files":["apps/consumer-web/src/engine/bible-engine-provider.tsx","apps/consumer-web/src/components/ui/feedback.tsx","apps/consumer-web/tests/offline-empty.spec.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase final — Qualidade

- [x] T020 [TEST] [US-001] Executar conformance, boundary, exports, testes focais e E2E desktop/mobile — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009 — Depends: T006, T007, T008
  - [x] **PREP**: Identificar comandos Turbo, consumer, adapter HTTP/Web, Playwright e rastreabilidade.
  - [x] **EXECUTE**: Executar `pnpm turbo run build test typecheck lint check`, testes browser focalizados e checks Specsfy aplicáveis.
  - [x] **VERIFY**: Confirmar todos os ACs, nenhum blocker e resultados de browsers registrados.
  - [x] **EVIDENCE**: Atualizar seções 11–13, evidências de tarefa e gates com comandos/exit codes.
  - [x] **IMPROVE**: Registrar regressões, limitações residuais e redução de duplicação aplicada.
  <!-- specsfy:evidence {"task":"T020","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009"],"files":["apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/src/features/library/VersionCard.tsx","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/tests/browser/consumer.spec.ts","apps/conformance-cli/src/index.ts","scripts/check-api-surface.mjs"],"commands":[{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm turbo run build test typecheck lint check --filter=@openbible/consumer-web...","exit":0},{"run":"node apps/conformance-cli/dist/index.js check","exit":0},{"run":"pnpm exec vitest run tests/arch","exit":0},{"run":"node scripts/check-api-surface.mjs --check-no-publish","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0}]} -->

- [x] T021 [DOC] [US-003] Atualizar `INTERFACE.md`, `PROJECT.md`, documentação técnica e `.specsfy/PACKAGES.md` após a implementação — Refs: US-001, US-002, US-003, NFR-001, NFR-002, NFR-003, AC-009 — Depends: T020
  - [x] **PREP**: Revisar mudanças reais de aplicação, interface, dependência e finalidade.
  - [x] **EXECUTE**: Executar `specsfy-documentator` e registrar componentes, rotas, integração R2, persistência e limites.
  - [x] **VERIFY**: Executar `build_documentation.mjs --check`, monitor e revisão de links.
  - [x] **EVIDENCE**: Registrar documentação reconstruída e rastreabilidade final.
  - [x] **IMPROVE**: Corrigir documentação derivada desatualizada sem apagar notas humanas.
<!-- specsfy:evidence {"task":"T021","refs":["US-001","US-002","US-003","NFR-001","NFR-002","NFR-003","AC-009"],"files":["PROJECT.md","INTERFACE.md","docs/README.md","docs/application.md","docs/architecture.md","docs/frontend.md","docs/testing.md",".specsfy/PACKAGES.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase de paridade visual

- [x] T022 [TEST] [TDD] [US-002] Derivar teste independente do shell em viewport para AC-010 em `apps/consumer-web/tests/app-shell.spec.tsx` — Refs: US-002, FR-002, NFR-003, AC-010 — Depends: none
  - [x] **PREP**: Mapear a altura `100dvh` como região observável do shell legado.
  - [x] **EXECUTE**: Escrever o teste Testing Library com marcador `SPECSFY`, sem comparar pixels frágeis e sem importar o legado.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose` e observar RED pela ausência de `data-testid="app-shell"`.
  - [x] **EVIDENCE**: Registrar o teste e o exit 1 na seção 11 para AC-010.
  - [x] **IMPROVE**: O caso prova viewport sem depender de cor, ícone ou detalhe acidental de Tailwind.
  <!-- specsfy:evidence {"task":"T022","refs":["US-002","FR-002","NFR-003","AC-010"],"files":["apps/consumer-web/tests/app-shell.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T025 [TEST] [TDD] [US-002] Derivar teste independente do dock de navegação e seus estados acessíveis em `apps/consumer-web/tests/app-shell.spec.tsx` — Refs: US-002, FR-002, NFR-003, AC-010 — Depends: none
  - [x] **PREP**: Confirmar a navegação visual Leitura/Busca, ação de tema e itens futuros sem conteúdo falso.
  - [x] **EXECUTE**: Materializar o caso com `aria-current`, labels e foco visível usando o runner Vitest/Testing Library.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose` e observar RED sem o dock flutuante.
  - [x] **EVIDENCE**: Registrar as regiões e roles do dock observados na saída Testing Library.
  - [x] **IMPROVE**: O caso evita dependência de ícones ou detalhes de cor para provar a navegação.
  <!-- specsfy:evidence {"task":"T025","refs":["US-002","FR-002","NFR-003","AC-010"],"files":["apps/consumer-web/tests/app-shell.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T026 [TEST] [TDD] [US-002] Derivar teste independente da toolbar pill do Leitor em `apps/consumer-web/tests/reader-toolbar.spec.tsx` — Refs: US-002, FR-002, NFR-003, AC-010 — Depends: none
  - [x] **PREP**: Confirmar seletores de livro/capítulo, versão e ação de exibição no fluxo instalado.
  - [x] **EXECUTE**: Escrever o caso Testing Library com marcador `SPECSFY` e dados de livros retornados pela engine.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose` e observar RED sem botão `Exibição`.
  - [x] **EVIDENCE**: Registrar comboboxes, labels e ação de ajustes ausentes na saída Testing Library.
  - [x] **IMPROVE**: O teste mantém a toolbar como composição visual sem duplicar leitura ou parser.
  <!-- specsfy:evidence {"task":"T026","refs":["US-002","FR-002","NFR-003","AC-010"],"files":["apps/consumer-web/tests/reader-toolbar.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/reader-toolbar.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T023 [CODE] [US-002] Reproduzir o shell visual do legado e enriquecer o Leitor em `apps/consumer-web/src/components/AppShell.tsx`, `NavigationDock.tsx`, `apps/consumer-web/src/features/reader/ReaderToolbar.tsx` e `apps/consumer-web/src/styles/globals.css` — Refs: US-002, FR-002, NFR-003, AC-010 — Depends: T022, T025, T026
  - [x] **PREP**: Reutilizar primitives locais e manter a engine como única origem de dados bíblicos; a reconstrução documental foi verificada antes da alteração.
  - [x] **EXECUTE**: Implementar shell em tela cheia, dock desktop/mobile, toolbar pill e coluna de leitura responsiva, sem levar contexts, storage ou dependências do legado.
  - [x] **VERIFY**: Exercitar navegação, foco, leitura, mobile e desktop junto dos testes existentes; 34 testes, typecheck, lint, build autenticado e Chromium E2E passaram.
  - [x] **EVIDENCE**: Registrar arquivos, rotas e estados de composição observados nos testes de shell/toolbar, na documentação e no resultado Playwright.
  - [x] **IMPROVE**: Remover duplicação visual, trocar primitives para tokens do tema e manter Notas/Destaques explicitamente indisponíveis nesta fatia.
  <!-- specsfy:evidence {"task":"T023","refs":["US-002","FR-002","NFR-003","AC-010"],"files":["apps/consumer-web/src/components/AppShell.tsx","apps/consumer-web/src/components/NavigationDock.tsx","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/ReaderToolbar.tsx","apps/consumer-web/src/styles/globals.css","apps/consumer-web/tests/app-shell.spec.tsx","apps/consumer-web/tests/reader-toolbar.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm --filter @openbible/consumer-web run build","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0}]} -->

- [x] T024 [DOC] [US-002] Atualizar `INTERFACE.md`, `PROJECT.md` e documentação derivada após a paridade visual — Refs: US-002, FR-002, NFR-003, AC-010 — Depends: T023
  - [x] **PREP**: Revisar componentes novos, consumidores, origem visual e limites preservados.
  - [x] **EXECUTE**: Executar `specsfy-documentator` e registrar a composição do shell/Leitor.
  - [x] **VERIFY**: Rodar monitor, documentação em modo check e checks do consumer.
  - [x] **EVIDENCE**: Registrar a nova matriz visual e o resultado dos comandos.
  - [x] **IMPROVE**: Manter a documentação sem mencionar como entregue o Personal Study.
<!-- specsfy:evidence {"task":"T024","refs":["US-002","FR-002","NFR-003","AC-010"],"files":["INTERFACE.md","PROJECT.md","DESIGNSYSTEM.MD","docs/frontend.md","docs/application.md",".specsfy/PACKAGES.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase de interface

- [x] T027 [TEST] [TDD] [US-002] Materializar AC-011 para a entrada `/`, a rota `/library` e o picker de livro/capítulo em `apps/consumer-web/tests/reader-pickers.spec.tsx` — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-011 — Depends: none
  - [x] **PREP**: Confirmar a resolução da primeira versão instalada, a lista de livros da engine e os modos desktop/mobile.
  - [x] **EXECUTE**: Escrever testes de interação, seleção válida, fechamento e acessibilidade com marcador `SPECSFY`.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/reader-pickers.spec.tsx --reporter=verbose` e observar RED pela ausência do picker.
  - [x] **EVIDENCE**: Registrar roles, callbacks e rotas observadas na matriz AC-011.
  - [x] **IMPROVE**: Não acoplar os testes a detalhes de cor ou ao código do legado.
  <!-- specsfy:evidence {"task":"T027","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-011"],"files":["apps/consumer-web/tests/reader-pickers.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader-pickers.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T028 [TEST] [TDD] [US-002] Derivar o comportamento do picker de versão em `apps/consumer-web/tests/version-picker.spec.tsx` com instaladas, disponíveis, busca, seleção e instalação — Refs: US-002, FR-002, FR-004, NFR-001, NFR-003, AC-011 — Depends: T027
  - [x] **PREP**: Reutilizar os contratos `BibleVersion`, `InstalledBible`, `InstallationProgress` e `CancellationToken` já cobertos pela Biblioteca.
  - [x] **EXECUTE**: Adicionar casos de modal desktop, drawer mobile, seleção e ação de instalação sem acessar SQLite.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/version-picker.spec.tsx --reporter=verbose` e observar RED antes do código de produção.
  - [x] **EVIDENCE**: Associar os casos ao AC-011 e aos estados recuperáveis existentes.
  - [x] **IMPROVE**: Evitar duplicar a regra de aquisição ou validação do engine.
  <!-- specsfy:evidence {"task":"T028","refs":["US-002","FR-002","FR-004","NFR-001","NFR-003","AC-011"],"files":["apps/consumer-web/tests/version-picker.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/version-picker.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T032 [TEST] [TDD] [US-002] Cobrir a resolução da primeira versão e do primeiro capítulo em `apps/consumer-web/tests/reader-root.spec.tsx` — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-005, AC-011 — Depends: T027
  - [x] **PREP**: Confirmar o comportamento sem parâmetros e a preservação da navegação profunda `/[version]/[book]/[chapter]`.
  - [x] **EXECUTE**: Escrever o caso de raiz com engine fake, versão instalada e rota enviada ao router.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/reader-root.spec.tsx --reporter=verbose` e observar RED quando `/` não resolver uma referência legível.
  - [x] **EVIDENCE**: Registrar a versão, livro, capítulo e chamadas de engine observadas.
  - [x] **IMPROVE**: Manter a resolução na composição Reader sem criar preferência persistida nova.
  <!-- specsfy:evidence {"task":"T032","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-005","AC-011"],"files":["apps/consumer-web/tests/reader-root.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader-root.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T029 [CODE] [US-002] Implementar os pickers responsivos, integrar a toolbar e tornar `/` a entrada do Leitor em `apps/consumer-web/src/features/reader/BookChapterPicker.tsx`, `VersionPicker.tsx`, `ResponsivePicker.tsx`, `Reader.tsx`, `ReaderToolbar.tsx` e `apps/consumer-web/src/app/page.tsx` — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-005, AC-010, AC-011 — Depends: T027, T028, T032
  - [x] **PREP**: Executar a reconstrução documental atual e registrar em `INTERFACE.md` os blocos `BookChapterPicker`, `VersionPicker` e a nova composição de rota.
  - [x] **EXECUTE**: Criar modal desktop/drawer mobile baseado nos dados da engine, conectar seleção e manter a instalação na fachada pública.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/reader-pickers.spec.tsx tests/version-picker.spec.tsx tests/reader-root.spec.tsx`, typecheck e lint.
  - [x] **EVIDENCE**: Registrar as rotas, modos de abertura, estados, callbacks e arquivos alterados.
  - [x] **IMPROVE**: Concentrar a adaptação responsiva em uma composição reutilizável sem adicionar dependência de UI.
  <!-- specsfy:evidence {"task":"T029","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-005","AC-010","AC-011"],"files":["apps/consumer-web/src/features/reader/BookChapterPicker.tsx","apps/consumer-web/src/features/reader/VersionPicker.tsx","apps/consumer-web/src/features/reader/ResponsivePicker.tsx","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/ReaderToolbar.tsx","apps/consumer-web/src/app/page.tsx","apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx","apps/consumer-web/tests/reader-pickers.spec.tsx","apps/consumer-web/tests/version-picker.spec.tsx","apps/consumer-web/tests/reader-root.spec.tsx"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader-pickers.spec.tsx tests/version-picker.spec.tsx tests/reader-root.spec.tsx","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test tests/browser/consumer.spec.ts -g 'baixa ARA' --project=chromium --workers=1","exit":0}]} -->

- [x] T033 [CODE] [US-002] Expor a Biblioteca em `/library` e atualizar a navegação principal em `apps/consumer-web/src/app/library/page.tsx`, `apps/consumer-web/src/components/NavigationDock.tsx` e `apps/consumer-web/src/features/library/AppLibrary.tsx` — Refs: US-002, FR-004, NFR-003, AC-011, AC-014 — Depends: T027, T028, T032
  - [x] **PREP**: Confirmar que a Biblioteca mantém a aquisição R2 existente e que `/` não continua apontando para seu catálogo.
  - [x] **EXECUTE**: Compor a rota de catálogo e o destino de Biblioteca no dock sem mover regras de engine para a página.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/library.spec.tsx tests/library-states.spec.tsx` e a jornada Chromium.
  - [x] **EVIDENCE**: Registrar `/`, `/library`, `aria-current` e links válidos observados.
  - [x] **IMPROVE**: Reutilizar `AppLibrary` sem duplicar a composição de catálogo.
  <!-- specsfy:evidence {"task":"T033","refs":["US-002","FR-004","NFR-003","AC-011","AC-014"],"files":["apps/consumer-web/src/app/page.tsx","apps/consumer-web/src/app/library/page.tsx","apps/consumer-web/src/components/NavigationDock.tsx","apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/tests/app-shell.spec.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/app-shell.spec.tsx tests/library.spec.tsx tests/library-states.spec.tsx","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test tests/browser/consumer.spec.ts -g 'baixa ARA' --project=chromium --workers=1","exit":0}]} -->

- [x] T030 [TEST] [TDD] [US-002] Reexecutar a jornada browser da rota `/` com abertura de picker e leitura offline em `apps/consumer-web/tests/browser/consumer.spec.ts` — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-006, AC-011 — Depends: T029, T033
  - [x] **PREP**: Adaptar a jornada existente para o Leitor como entrada sem perder a prova de instalação R2.
  - [x] **EXECUTE**: Cobrir desktop e mobile no Playwright, incluindo fechamento e seleção de contexto.
  - [x] **VERIFY**: Executar Chromium e registrar WebKit conforme as limitações do host.
  - [x] **EVIDENCE**: Registrar requests, rotas, conteúdo local e resultado por navegador.
  - [x] **IMPROVE**: Manter a verificação offline independente de estado em memória.
  <!-- specsfy:evidence {"task":"T030","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-006","AC-011"],"files":["apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0}]} -->

- [x] T031 [DOC] [US-002] Atualizar `INTERFACE.md`, `PROJECT.md`, `DESIGNSYSTEM.MD`, `docs/`, gates e evidências após a nova composição — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-011 — Depends: T029, T030, T033
  - [x] **PREP**: Revisar rotas, consumidores e limitações sem atribuir ao legado qualquer implementação.
  - [x] **EXECUTE**: Executar `specsfy-documentator` e registrar os resultados da entrega.
  - [x] **VERIFY**: Rodar documentação em modo check e o monitor de contexto.
  - [x] **EVIDENCE**: Atualizar seções 11–13 e somente as evidências afetadas.
  - [x] **IMPROVE**: Remover referências antigas à Biblioteca como rota `/` sem apagar histórico válido.
<!-- specsfy:evidence {"task":"T031","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-011"],"files":["INTERFACE.md","PROJECT.md","DESIGNSYSTEM.MD","docs/README.md","docs/architecture.md","docs/application.md","docs/frontend.md","docs/testing.md",".specsfy/PACKAGES.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase de ajuste visual solicitado

- [x] T034 [TEST] [TDD] [US-002] Cobrir o gatilho de capítulo somente numérico e a composição semântica dos pickers em `apps/consumer-web/tests/reader-toolbar.spec.tsx` e `apps/consumer-web/tests/reader-pickers.spec.tsx` — Refs: US-002, FR-002, NFR-003, AC-010, AC-011 — Depends: none
  - [x] **PREP**: Confirmar que o nome acessível continua sendo `Capítulo` e que o texto visual deixa de conter `Cap.`; mapear os tokens do tema legado usados pelos pickers.
  - [x] **EXECUTE**: Adicionar a regressão comportamental sem comparar pixels frágeis.
  - [x] **VERIFY**: Executar os testes focais e observar RED antes do ajuste de produção.
  - [x] **EVIDENCE**: Registrar a expectativa do número isolado e a cobertura responsiva preservada; RED registrado na seção 11 com exit 1 em 2026-08-30.
  - [x] **IMPROVE**: Manter a acessibilidade independente da apresentação visual.

- [x] T035 [CODE] [US-002] Ajustar a apresentação do capítulo e os tokens Tailwind/shadcn neutros do legado em `apps/consumer-web/src/features/reader/ReaderToolbar.tsx`, `BookChapterPicker.tsx`, `VersionPicker.tsx`, `ResponsivePicker.tsx` e `apps/consumer-web/src/styles/globals.css` — Refs: US-002, FR-002, NFR-003, AC-010, AC-011 — Depends: T034, T027, T028, T032
  - [x] **PREP**: Reutilizar os tokens semânticos e os valores do tema padrão do legado, sem importar CSS, componentes ou regras do projeto externo.
  - [x] **EXECUTE**: Renderizar somente o número no gatilho e alinhar superfícies, bordas, estados ativos, erro e overlay dos pickers.
  - [x] **VERIFY**: Executar testes, typecheck, lint e a jornada Chromium desktop/mobile; 3 testes focais, build autenticado e Chromium 2/2 passaram.
  - [x] **EVIDENCE**: Registrar os arquivos alterados, os tokens usados e os resultados por viewport; documentação reconstruída e verificada.
  - [x] **IMPROVE**: Evitar cores literais novas no picker e preservar modal, drawer, foco e seleção.
 <!-- specsfy:evidence {"task":"T035","refs":["US-002","FR-002","NFR-003","AC-010","AC-011"],"files":["apps/consumer-web/src/features/reader/ReaderToolbar.tsx","apps/consumer-web/src/features/reader/BookChapterPicker.tsx","apps/consumer-web/src/features/reader/VersionPicker.tsx","apps/consumer-web/src/features/reader/ResponsivePicker.tsx","apps/consumer-web/src/styles/globals.css","apps/consumer-web/tests/reader-toolbar.spec.tsx","apps/consumer-web/tests/reader-pickers.spec.tsx","docs/README.md","docs/application.md","docs/architecture.md","docs/frontend.md","docs/testing.md",".specsfy/PACKAGES.md"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader-toolbar.spec.tsx tests/reader-pickers.spec.tsx --reporter=verbose","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm --filter @openbible/consumer-web run build","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T036 [DOC] [US-002] Atualizar `INTERFACE.md`, `DESIGNSYSTEM.MD`, documentação derivada e evidências da SPEC após o ajuste visual — Refs: US-002, FR-002, NFR-003, AC-010, AC-011 — Depends: T035
  - [x] **PREP**: Revisar a fonte Tailwind/shadcn consultada e as mudanças reais do consumer; `PROJECT.md` foi revisado e não exige alteração de finalidade ou capacidade.
  - [x] **EXECUTE**: Executar `specsfy-documentator` e atualizar a decisão e os gates com os resultados.
  - [x] **VERIFY**: Rodar documentação em modo check e o monitor de contexto; ambos passaram.
  - [x] **EVIDENCE**: Registrar testes e checks finais sem reescrever a evidência histórica.
   - [x] **IMPROVE**: Manter a documentação explícita sobre o número isolado e os tokens neutros.

#### Fase de feedback e estados do leitor

- [x] T037 [TEST] [TDD] [US-001] Derivar o ciclo de notificação do download em `apps/consumer-web/tests/download-toast.spec.tsx` — Refs: US-001, FR-001, NFR-003, AC-001, AC-008 — Depends: none
  - [x] **PREP**: Confirmar o contrato Sonner, o evento público `InstallationProgress` e a regra de não exibir percentual sem `totalBytes`.
  - [x] **EXECUTE**: Escrever testes do toast customizado para recebimento determinado/indeterminado, sucesso, erro e atualização pelo mesmo id, com marcador `SPECSFY`.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/download-toast.spec.tsx --reporter=verbose`; RED válido porque o módulo de produção ainda não existe.
  - [x] **EVIDENCE**: Registrar quatro falhas esperadas de coleta/execução no ciclo focal de 2026-08-30; o teste exige criação, atualização por id e estados finais.
  - [x] **IMPROVE**: Manter o componente de apresentação independente da engine e sem duplicar o cálculo de progresso.

- [x] T038 [TEST] [TDD] [US-002] Derivar os estados visuais corrigidos em `apps/consumer-web/tests/feedback.spec.tsx`, `tests/reader.spec.tsx` e `tests/version-picker.spec.tsx` — Refs: US-002, FR-001, FR-002, NFR-003, AC-008, AC-010, AC-011 — Depends: none
  - [x] **PREP**: Mapear o badge offline fechado/aberto, a composição do skeleton de capítulo, hover da lista de versões e cor semântica de `Exibição`.
  - [x] **EXECUTE**: Escrever testes comportamentais com marcadores `SPECSFY`, sem comparar pixels frágeis.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/feedback.spec.tsx tests/reader.spec.tsx tests/version-picker.spec.tsx --reporter=verbose`; RED válido para badge, skeleton e hover ausentes.
  - [x] **EVIDENCE**: Registrar roles, estados, classes estruturais e ausência/presença da mensagem completa no ciclo focal de 2026-08-30.
  - [x] **IMPROVE**: Provar acessibilidade por nome, `aria-expanded`, `aria-live` e estrutura, preservando a responsividade.

- [x] T039 [CODE] [US-001] [US-002] Implementar Sonner global, feedback de download, skeleton representativo, badge offline expansível e ajustes visuais nos fluxos da Biblioteca e do Leitor em `apps/consumer-web/package.json`, `apps/consumer-web/src/app/layout.tsx`, `apps/consumer-web/src/components/ui/sonner.tsx`, `apps/consumer-web/src/components/ui/download-toast.tsx`, `apps/consumer-web/src/components/ui/feedback.tsx`, `apps/consumer-web/src/features/library/AppLibrary.tsx`, `apps/consumer-web/src/features/reader/Reader.tsx`, `apps/consumer-web/src/features/reader/VersionPicker.tsx`, `apps/consumer-web/src/features/reader/ReaderToolbar.tsx`, `apps/consumer-web/src/styles/globals.css` e `pnpm-lock.yaml` — Refs: US-001, US-002, FR-001, FR-002, NFR-003, AC-001, AC-008, AC-010, AC-011 — Depends: T037, T038, T034
  - [x] **PREP**: Reutilizar os tokens locais, a dependência Sonner do consumer e os observers existentes; não alterar contratos da engine ou criar persistência.
  - [x] **EXECUTE**: Integrar `Toaster` no layout, atualizar o toast pelo progresso em Biblioteca/Reader, corrigir hover/cor, substituir o loading genérico e tornar `OfflineBanner` um badge fixo recolhido.
  - [x] **VERIFY**: Executar testes focais, toda a suíte TDD, typecheck, lint, build e E2E desktop/mobile.
  - [x] **EVIDENCE**: Registrar os componentes, rotas, estados e resultados por viewport; atualizar a matriz de rastreabilidade.
  - [x] **IMPROVE**: Centralizar o ciclo de toast, evitar regressões de cancelamento/retry e manter o aviso offline abaixo de modais/drawers.
  <!-- specsfy:evidence {"task":"T039","refs":["US-001","US-002","FR-001","FR-002","NFR-003","AC-001","AC-008","AC-010","AC-011"],"files":["apps/consumer-web/package.json","pnpm-lock.yaml","apps/consumer-web/src/app/layout.tsx","apps/consumer-web/src/components/ui/sonner.tsx","apps/consumer-web/src/components/ui/download-toast.tsx","apps/consumer-web/src/components/ui/feedback.tsx","apps/consumer-web/src/features/library/AppLibrary.tsx","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/VersionPicker.tsx","apps/consumer-web/src/features/reader/ReaderToolbar.tsx","apps/consumer-web/src/styles/globals.css","apps/consumer-web/tests/download-toast.spec.tsx","apps/consumer-web/tests/feedback.spec.tsx","apps/consumer-web/tests/reader.spec.tsx","apps/consumer-web/tests/version-picker.spec.tsx","docs/README.md","docs/application.md","docs/architecture.md","docs/frontend.md","docs/packages.md","docs/testing.md",".specsfy/STACK.md",".specsfy/PACKAGES.md"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/download-toast.spec.tsx tests/feedback.spec.tsx tests/reader.spec.tsx tests/version-picker.spec.tsx --reporter=verbose","exit":0},{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm --filter @openbible/consumer-web run build","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test --project=chromium","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/in-progress/0009-leitor-web-download-r2/spec.md .","exit":0}]} -->

- [x] T040 [TEST] [TDD] [US-002] Derivar os aceites das rotas canônicas do Leitor, do namespace removido e dos caminhos estáticos em inglês em `apps/consumer-web/tests/reader.spec.tsx`, `apps/consumer-web/tests/app-shell.spec.tsx` e `apps/consumer-web/tests/browser/consumer.spec.ts` — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-012, AC-013, AC-014 — Depends: none
  - [x] **PREP**: Confirmar `/` como entrada, `/ara/gn/2` como leitura profunda e `/ler/` como recurso inexistente.
  - [x] **EXECUTE**: Atualizar os testes para parâmetros em inglês, abreviação pública `gn`, links sem `/ler` e resposta 404 para o namespace antigo, preservando marcador `SPECSFY`.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/reader.spec.tsx tests/reader-toolbar.spec.tsx tests/app-shell.spec.tsx tests/search.spec.tsx --reporter=verbose`; RED observado nas URLs antigas, no parse de `gn` e no campo `bookSegment`.
  - [x] **EVIDENCE**: Registrar as expectativas de URL e o RED válido no ciclo focal de 2026-08-30; a verificação browser será repetida após o build da nova rota.
  - [x] **IMPROVE**: Manter a engine desacoplada da representação pública da URL.
  <!-- specsfy:evidence {"task":"T040","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-012","AC-013","AC-014"],"files":["apps/consumer-web/tests/reader.spec.tsx","apps/consumer-web/tests/reader-toolbar.spec.tsx","apps/consumer-web/tests/app-shell.spec.tsx","apps/consumer-web/tests/search.spec.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/reader.spec.tsx tests/reader-toolbar.spec.tsx tests/app-shell.spec.tsx tests/search.spec.tsx --reporter=verbose","exit":1}]} -->

- [x] T041 [CODE] [US-002] Migrar as rotas Web para `/[version]/[book]/[chapter]`, `/library` e `/search`, com abreviação pública de livro, em `apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx`, `apps/consumer-web/src/app/library/page.tsx`, `apps/consumer-web/src/app/search/page.tsx`, `apps/consumer-web/src/features/reader/reader-route.ts`, `Reader.tsx`, `SearchResults.tsx`, `search-installed.ts`, `NavigationDock.tsx`, `VersionCard.tsx` e links de recuperação — Refs: US-002, FR-002, FR-004, NFR-002, NFR-003, AC-012, AC-013, AC-014 — Depends: T040, T038, T034
  - [x] **PREP**: Usar a página dinâmica client-side existente, resolver `book` pela abreviação retornada em `BibleBook` e não importar regra do legado.
  - [x] **EXECUTE**: Remover `/ler`, renomear parâmetros para `version`, `book` e `chapter`, mover Biblioteca/Busca para caminhos em inglês e atualizar toda navegação e busca contextual.
  - [x] **VERIFY**: Executar suíte TDD, typecheck, lint, build limpo e E2E Chromium; validar `/ara/gn/2`, `/library`, `/search` e 404 para `/ler/`, `/biblioteca`, `/busca`. Consumer TDD `42/42`, typecheck, lint, build autenticado e Chromium `3/3` passaram.
  - [x] **EVIDENCE**: Registrar os caminhos canônicos, a conversão `gn → gen` antes da engine, links estáticos e a ausência do namespace antigo. WebKit foi tentado e ficou bloqueado pelas dependências ausentes do host.
  - [x] **IMPROVE**: Centralizar a montagem/parsing da rota em `reader-route.ts`, reutilizado por Reader e busca, sem duplicar slug.
  <!-- specsfy:evidence {"task":"T041","refs":["US-002","FR-002","FR-004","NFR-002","NFR-003","AC-012","AC-013","AC-014"],"files":["apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx","apps/consumer-web/src/app/library/page.tsx","apps/consumer-web/src/app/search/page.tsx","apps/consumer-web/src/features/reader/reader-route.ts","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/search/SearchResults.tsx","apps/consumer-web/src/features/search/search-installed.ts","apps/consumer-web/src/components/NavigationDock.tsx","apps/consumer-web/src/features/library/VersionCard.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm --filter @openbible/consumer-web run build","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test tests/browser/consumer.spec.ts --project=chromium --workers=1","exit":0}]} -->

- [x] T042 [TEST] [TDD] [US-002] Derivar do AC-015 o teste de seleção de um versículo e abertura do popover em `apps/consumer-web/tests/verse-selection.spec.tsx` — Refs: US-002, FR-002, FR-005, NFR-003, AC-015 — Depends: none
  - [x] **PREP**: Confirmar a interação alternável da referência, o estado `aria-pressed` e o popover contextual nomeado.
  - [x] **EXECUTE**: Escrever o teste Vitest com marcador `SPECSFY`, cobrindo foco do versículo, seleção visual e ações nomeadas.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/verse-selection.spec.tsx --reporter=verbose`; RED válido porque o Reader ainda não renderiza controle de versículo.
  - [x] **EVIDENCE**: Registrar a falha RED, o ID AC-015 e os contratos esperados na seção 11.
  - [x] **IMPROVE**: Isolar o teste da seleção da lógica de clipboard para manter uma causa de falha por caso.

- [x] T043 [TEST] [TDD] [US-002] Derivar do AC-016 os testes de seleção múltipla e formatos de cópia em `apps/consumer-web/tests/verse-reference.test.ts` e `apps/consumer-web/tests/verse-selection.spec.tsx` — Refs: US-002, FR-002, FR-005, NFR-003, AC-016 — Depends: none
  - [x] **PREP**: Confirmar intervalos contíguos, segmentos não contíguos, referência com versão e texto numerado.
  - [x] **EXECUTE**: Escrever testes Vitest com marcadores `SPECSFY` para formatos puros e escrita no clipboard.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/verse-reference.test.ts tests/verse-selection.spec.tsx --reporter=verbose`; RED válido porque o formatador não existe e o Reader não oferece seleção.
  - [x] **EVIDENCE**: Registrar a falha RED, exemplos determinísticos e o ID AC-016 na seção 11.
  - [x] **IMPROVE**: Manter a ordenação e o agrupamento testados no helper puro, sem duplicar regra no componente.

- [x] T044 [TEST] [TDD] [US-002] Derivar do AC-017 os testes de limpeza, Escape, clique fora e falha do clipboard em `apps/consumer-web/tests/verse-selection.spec.tsx` — Refs: US-002, FR-005, NFR-003, AC-017 — Depends: T042
  - [x] **PREP**: Confirmar as saídas de seleção, o fechamento explícito e o feedback seguro de erro.
  - [x] **EXECUTE**: Escrever testes Vitest com marcador `SPECSFY`, verificando seleção intacta após falha e ausência após limpeza.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-web exec vitest run tests/verse-selection.spec.tsx --reporter=verbose`; RED válido porque os handlers de fechamento e recuperação não existem.
  - [x] **EVIDENCE**: Registrar a falha RED, os eventos de teclado/pointer e o ID AC-017 na seção 11.
  - [x] **IMPROVE**: Cobrir a recuperação sem depender de permissões reais do browser ou de dados persistidos.

- [x] T045 [CODE] [US-002] Implementar seleção de versículos e popover contextual em `apps/consumer-web/src/features/reader/Reader.tsx`, `VerseRow.tsx`, `VerseSelectionPopover.tsx`, `verse-reference.ts`, `apps/consumer-web/src/styles/globals.css` e `apps/consumer-web/tests/browser/consumer.spec.ts` — Refs: US-002, FR-002, FR-005, NFR-003, AC-015, AC-016, AC-017 — Depends: T042, T043, T044
  - [x] **PREP**: Reutilizar `Button`, tokens do Reader e contratos `BibleBook`/`Verse`; não importar componentes, contexto, storage ou regras do legado.
  - [x] **EXECUTE**: Antes de produzir código, reconstruir `docs/` com `$specsfy-documentator`; depois adicionar seleção efêmera por versículo, âncora responsiva, popover com copiar referência/texto/limpar, feedback Sonner e estados acessíveis.
  - [x] **VERIFY**: Executar testes focais, suíte TDD, typecheck, lint e build do consumer; validar desktop/mobile quando o ambiente permitir.
  - [x] **EVIDENCE**: Registrar arquivos, formatos de clipboard, ações de recuperação e resultados para AC-015 a AC-017.
  - [x] **IMPROVE**: Manter o Reader como orquestrador, extrair formatação pura e preservar leitura, navegação e layout existentes; a animação foi mantida separada do transform de ancoragem para não deslocar o popover.
  <!-- specsfy:evidence {"task":"T045","refs":["US-002","FR-002","FR-005","NFR-003","AC-015","AC-016","AC-017"],"files":["INTERFACE.md","apps/consumer-web/src/features/reader/Reader.tsx","apps/consumer-web/src/features/reader/VerseRow.tsx","apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx","apps/consumer-web/src/features/reader/verse-reference.ts","apps/consumer-web/src/styles/globals.css","apps/consumer-web/tests/verse-reference.test.ts","apps/consumer-web/tests/verse-selection.spec.tsx","apps/consumer-web/tests/browser/consumer.spec.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-web exec vitest run tests/verse-selection.spec.tsx tests/verse-reference.test.ts --reporter=verbose","exit":0},{"run":"pnpm --filter @openbible/consumer-web run test:tdd","exit":0},{"run":"pnpm --filter @openbible/consumer-web run typecheck","exit":0},{"run":"pnpm --filter @openbible/consumer-web run lint","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token pnpm --filter @openbible/consumer-web run build","exit":0},{"run":"BETTER_AUTH_URL=http://127.0.0.1:3104 BETTER_AUTH_SECRET=local-build-secret-32-characters-long-xxxxxxxx DATABASE_URL=libsql://localhost DATABASE_TURSO_TOKEN=local-build-token CI=1 pnpm --filter @openbible/consumer-web exec playwright test tests/browser/consumer.spec.ts --project=chromium --workers=1","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T046 [DOC] [US-002] Atualizar `INTERFACE.md`, a matriz da SPEC-0009 e a documentação técnica após a implementação da seleção em `apps/consumer-web` — Refs: US-002, FR-002, FR-005, NFR-003, AC-015, AC-016, AC-017 — Depends: T045
  - [x] **PREP**: Conferir os blocos React criados, consumidores reais, estados e comandos de verificação.
  - [x] **EXECUTE**: Registrar `VerseRow`, `VerseSelectionPopover` e o formatador em `INTERFACE.md` e executar o `specsfy-documentator`.
  - [x] **VERIFY**: Executar rastreabilidade, monitor de contexto e os checks finais sem alterar a documentação histórica dos aceites anteriores.
  - [x] **EVIDENCE**: Registrar os comandos finais, a limitação de WebKit se ocorrer e os resultados por viewport.
  - [x] **IMPROVE**: Confirmar que não há dependência nova, persistência ou acoplamento ao projeto de referência; a documentação gerada reconhece os três módulos e os dois novos arquivos de teste.
  <!-- specsfy:evidence {"task":"T046","refs":["US-002","FR-002","FR-005","NFR-003","AC-015","AC-016","AC-017"],"files":["INTERFACE.md","docs/README.md","docs/application.md","docs/architecture.md","docs/frontend.md","docs/testing.md",".specsfy/PACKAGES.md","specs/in-progress/0009-leitor-web-download-r2/spec.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/in-progress/0009-leitor-web-download-r2/spec.md","exit":0},{"run":"node .agents/skills/specsfy-05-tasks/scripts/validate_interface_tasks.mjs specs/in-progress/0009-leitor-web-download-r2/spec.md","exit":0}]} -->


### 15. Ordem de execução

- Caminho crítico: T001/T002/T003/T004/T011/T012/T013/T014/T015/T016/T017/T018/T019
  → T005 → T006/T007 → T008 → T020/T021 → T022/T025/T026 → T023 → T024
  → T027 → T028/T032 → T029/T033 → T030 → T031 → T034 → T035 → T036
  → T037/T038 → T039 → T040 → T041 → T042 → T043 → T044.
- Tarefas paralelas: T001–T004 e T011–T019 podem ser materializadas em paralelo
  porque são casos TDD independentes; T005–T008 seguem suas fronteiras e
  predecessores RED. T022 é independente da entrega R2 e precede T023.
- Estratégia de MVP: T001–T003/T011–T013 e T005–T006 provam instalação; T004,
  T014–T016 e T007 provam leitura; T017–T018 e T008 provam recuperação; T019,
  T020 e T021 são obrigatórios para o aceite da fatia e da fronteira; T022–T024
  comprovam e documentam a paridade visual solicitada posteriormente.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- M01 aceita e specs 0002, 0003 e 0004 concluídas.
- Node.js 22, pnpm, dependências workspace, navegador Playwright e assets do
  Worker/WASM disponíveis.
- Bucket R2 e/ou API pública configurados pelos defaults/variáveis já existentes;
  a execução não depende de credencial privada.
- OPFS/Worker/SW disponíveis no browser usado para o cenário bloqueante.

#### Riscos

- R2/API pode mudar disponibilidade, CORS ou catálogo → manter endpoints e
  fallback configuráveis, testar fonte injetável e registrar o resultado real sem
  esconder erro de pacote.
- Arquivos publicados podem ser grandes → streaming/progresso permanece na
  origem; Worker/OPFS evita cópia de SQLite na UI; não definir timeout artificial.
- OPFS/SW variam entre navegadores → Chromium é bloqueante, WebKit segue matriz
  existente e limitações são documentadas; não simular persistência.
- Cancelamento entre recebimento e commit pode expor corrida → token é verificado
  nos checkpoints existentes e installer mantém rollback/cleanup.
- Alteração visual pode quebrar foco/mobile → testes Testing Library/Playwright e
  inspeção de `INTERFACE.md` antes/depois reduzem o risco.
- Clipboard pode variar entre contexto seguro, permissões e browsers → manter
  fallback com textarea, feedback acessível e a seleção intacta quando a cópia
  falhar.

#### Suposições

- O catálogo fallback e o mapeamento R2 atuais são a fonte de versões desta
  primeira fatia; não será criada uma tela de administração de catálogo.
- O progresso é textual/indeterminado sem `Content-Length` e percentual somente
  quando total confiável estiver disponível.
- ARA é o caso E2E representativo; testes de contrato não dependem de conteúdo
  protegido fora dos artefatos oficiais já disponíveis.
- Uma instalação já existente deve continuar utilizável durante falha de
  reinstalação, conforme o contrato do installer Web.
- Não há necessidade de autenticação, sincronização ou retenção remota para ler
  uma versão pública instalada localmente.
- O identificador da versão em cópias é a abreviação pública em maiúsculas, como
  `ARA`, preservando o formato já usado pelo Reader de referência.
- A seleção pode alternar itens não contíguos; o formatador agrupa somente
  números contíguos e mantém segmentos separados por vírgula.

### 17. Decisões

- **DEC-001**: Começar M02 pelo Leitor Web e downloads R2 — decisão confirmada
  na conversa de 2026-08-30; reduz a fatia ao valor essencial antes de migrar
  workspace, Personal Study ou Sync.
- **DEC-002**: Usar `apps/consumer-web` como destino e o legado apenas como
  referência — preserva rollback e evita acoplamento operacional ao projeto
  externo.
- **DEC-003**: Manter R2 atrás de `HttpBiblePackageSource` e da fachada pública da
  engine — concentra aquisição/validação fora da UI e permite trocar origem sem
  alterar o Leitor.
- **DEC-004**: Exibir progresso e cancelamento inline, sem modal — mantém a ação
  contextual, acessível e compatível com o padrão existente de `VersionCard`.
- **DEC-005**: Não criar migration nem storage de consumer — o adapter Web já
  possui o schema/lifecycle necessário e uma persistência nova ampliaria o
  escopo sem valor para a leitura.
- **DEC-006**: Declarar exception-safe/reconciliação best-effort, não crash-safe
  completa — preserva a garantia real documentada do adapter Web e não promete
  comportamento não testado.
- **DEC-007**: Reabrir a spec para reproduzir a interface visual do aplicativo Web
  legado, mantendo a implementação no consumer e os dados nos exports públicos
  da engine — atende ao pedido posterior sem importar código, storage, contexts
  ou Personal Study do projeto legado.
- **DEC-008**: Tornar `/` a entrada do Leitor e mover a Biblioteca para
  `/library`; usar pickers próprios com modal desktop e drawer mobile, mantendo
  livros, capítulos, versões e instalação sob os contratos públicos da engine —
  atende ao pedido de paridade de fluxo sem copiar contexts ou persistência do
  legado.
- **DEC-009**: Exibir somente o número no gatilho de capítulo e alinhar os pickers
  aos tokens neutros Tailwind/shadcn do tema padrão do legado — atende ao ajuste
  visual confirmado em 2026-08-30 sem alterar nomes acessíveis, contratos da
  engine, responsividade ou origem dos dados.
- **DEC-010**: Usar Sonner como superfície única de feedback do download e manter
  o `OfflineBanner` como badge fixo recolhido — atende às correções solicitadas
  sem mover progresso para persistência ou criar uma segunda camada de estado.
- **DEC-011**: Remover o namespace `/ler` e usar `/<version>/<book>/<chapter>`
  como rota profunda, com abreviação pública de livro e páginas estáticas em
  `/library` e `/search` — mantém URLs curtas, legíveis e sem termos em português.
- **DEC-012**: Adicionar seleção alternável por versículo e um popover contextual
  ancorado à seleção — reproduz a interação do Reader legado sem importar seus
  componentes, contexts, highlights ou notas.
- **DEC-013**: Oferecer somente cópia de referência e de texto nesta atualização,
  com formato determinístico, fallback de clipboard e feedback local — entrega o
  pedido atual sem criar persistência ou ampliar o bounded context Personal Study.

### 18. Definition of Done

- [ ] `Definition Gate` está `Passed`.
- [ ] `Plan Gate` está `Passed`.
- [ ] `Delivery Gate` está `Passed`.
- [ ] Todos os cenários `AC` aplicáveis passam.
- [ ] Todos os requisitos possuem evidência de verificação.
- [ ] Todas as tarefas na seção 14 estão concluídas.
- [ ] Testes e checks estáticos disponíveis passam.
