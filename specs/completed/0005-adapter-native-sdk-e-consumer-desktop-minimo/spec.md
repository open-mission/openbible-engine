# Especificação integrada: Adapter Native SDK e consumer desktop mínimo

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0005 |
| Slug | 0005-adapter-native-sdk-e-consumer-desktop-minimo |
| Status | Complete |
| Effort | 8 |
| Effort updated at | 2026-08-27 |
| Effort rationale | A fatia combina investigação de um SDK pré-1.0, novo adapter de persistência, seam entre core síncrono e ports assíncronas existentes, consumer nativo e UI desktop multiplataforma. |
| ClickUp Task | |
| Milestones | M02 |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Sim — UI desktop mínima |
| Atualizada em | 2026-08-28 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

O projeto declara o Native SDK como consumidor futuro, mas ainda não provou que o
engine TypeScript, suas ports assíncronas, o schema SQLite legado e o ciclo de
filesystem podem ser usados em um aplicativo desktop nativo. Também não existe
um adapter `@openbible/adapter-sqlite-native` nem um consumer que demonstre a
jornada de Scripture Library fora do Web/PWA. Sem essa prova, declarar
compatibilidade com o Native SDK seria uma hipótese não verificável.

#### Resultado desejado

Entregar um app privado em `apps/consumer-native` que compile e execute no
Native SDK, com UI nativa mínima e armazenamento local isolado, usando o mesmo
domínio Scripture Library. A instalação da UI deve baixar a versão escolhida
diretamente do bucket público R2, em blocos HTTP limitados pelo Native SDK, e
então usar o mesmo installer local exception-safe. A fatia deve provar a
instalação remota, listagem de livros, leitura de capítulo, busca offline,
remoção e rollback de falha, além de registrar honestamente quais hosts e
capacidades são suportados. Fixtures sintéticas continuam restritas ao harness
e aos testes.

#### Métricas de sucesso

- A revisão oficial do Native SDK, a matriz de hosts e a decisão sobre o seam de
  SQLite/filesystem ficam registradas antes de qualquer declaração de suporte.
- O fluxo vertical completo passa no host escolhido: baixar do R2, instalar,
  listar, ler, buscar, remover e recuperar uma falha de instalação sem estado
  parcial.
- A verificação de dependências confirma que o core nativo não importa serviços,
  Node, DOM, SQLite ou módulos internos do monorepo; somente o service/adapter
  possui autoridade de plataforma.
- Cada host que não for executado aparece como não verificado ou não suportado,
  sem ser mascarado por um resultado de outro sistema operacional.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001** [critical] O Native SDK fornece um modelo de app com core TypeScript determinístico, UI `.native`, services para I/O, capacidade relacional SQLite e hosts desktop macOS/Linux/Windows — Verdict: verified — Confidence: high — Evidence: research/native-sdk-oficial.md#plataformas-desktop — Budget: 4/8.
- **R-002** [critical] O Native SDK fornece `Cmd.fetch` para HTTP(S), mas limita uma resposta buffered a 256 KiB; o bucket R2 expõe os arquivos SQLite com `Accept-Ranges: bytes` — Verdict: verified — Confidence: high — Evidence: research/native-sdk-oficial.md#download-r2 — Budget: 2/8.
- Limite da pesquisa: a documentação oficial consultada não prova compatibilidade direta entre as ports assíncronas atuais do engine e o core síncrono do Native SDK; essa questão permanece aberta para a spike.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193948-adapter-native-sdk-e-consumer-desktop-minimo.md`, captura integral da ideia original.
- `specs/backlog/0005-adapter-native-sdk-e-consumer-desktop-minimo.md`, brief refinado e decisões confirmadas.
- `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md`, `.specsfy/DATABASE.md`,
  `.specsfy/PACKAGES.md`, `INTERFACE.md` e `DESIGNSYSTEM.MD`.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md`, contratos
  portáveis e limites do core.
- `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md`, semântica
  de SQLite, instalação exception-safe e operação offline.
- `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md`,
  exports e consumo reproduzível dos packages.
- `docs/adr/001-typescript-portatil-em-vez-de-rust.md`,
  `docs/adr/003-adapters-oficiais.md`, `docs/adr/007-native-sdk-consumidor-substituivel.md`
  e `docs/adr/009-migracao-strangler-futura.md`.
- Código público atual em `packages/engine-core`, `packages/engine` e
  `packages/adapter-sqlite-node`.

#### Documentação consultada

- Native SDK README, revisão `48629b3f15c5f6b9858e2f7d45c4c3074a1816f1`, consultado
  em 2026-08-27: modelo de app, TypeScript, UI nativa, serviços, plataformas,
  automação e maturidade pré-1.0.
- Native SDK TypeScript Cores, consultado em 2026-08-27:
  `https://native-sdk.dev/docs/typescript`, subset do core, `Model`/`Msg`/`update`,
  comandos e fronteira com `src/services`.
- Native SDK TypeScript Services, consultado em 2026-08-27:
  `https://native-sdk.dev/docs/typescript/services`, contratos síncronos de
  serviço, carrier desktop, cancelamento e limites de dados.
- Native SDK Relational SQLite, consultado em 2026-08-27:
  `https://native-sdk.dev/docs/sqlite`, capability, migrations, queries tipadas,
  transações, paginação e erros fechados.
- Native SDK Native UI, consultado em 2026-08-27:
  `https://native-sdk.dev/docs/native-ui`, markup, controles, mensagens,
  navegação, estados e acessibilidade.
- Native SDK Files & Streaming, consultado em 2026-08-27:
  `https://native-sdk.dev/docs/files`, efeitos de filesystem, limites, escrita
  atômica, paths e permissão.
- Native SDK Platform Support, consultado em 2026-08-27:
  `https://native-sdk.dev/platform-support`, matriz de hosts, automação,
  empacotamento e diferenças por plataforma.

#### Artefatos de pesquisa armazenados

- `specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/research/native-sdk-oficial.md`:
  notas próprias baseadas no repositório oficial e na documentação pública,
  revisão `48629b3f15c5f6b9858e2f7d45c4c3074a1816f1`, consultada em 2026-08-27;
  licença declarada pelo repositório Apache-2.0; propósito de registrar
  capacidades confirmadas, limites e proveniência sem copiar conteúdo protegido.

#### Dúvidas respondidas

- Alvo inicial: executar primeiro uma spike baseada na versão/API oficial e na
  matriz de plataformas, sem presumir macOS ou Windows.
- Fluxo mínimo: fatia vertical completa com compilação, execução, download R2,
  instalação, listagem, leitura, busca e remoção offline após o commit.
- Interface: UI desktop mínima, além da prova técnica.
- Composição: uma janela única com navegação entre Biblioteca, Leitor e Busca.
- Estados: disponível, instalada, instalando, removendo, carregando, vazio,
  erro com retry e offline; ações incompatíveis ficam bloqueadas durante a operação.
- Dados: namespace nativo isolado; pacotes públicos são baixados do R2 e fixtures
  SQLite sintéticas ficam restritas aos testes, sem ler, copiar ou alterar o
  armazenamento do legado.
- Local: consumer privado em `apps/consumer-native` neste monorepo.
- Acessibilidade: teclado, foco visível e previsível, labels claros e estados
  de operação/erro comunicados.
- Runner: Vitest existente para adapter, contratos, core e harness; o comando
  `native test` poderá ser executado como verificação complementar do app se a
  spike confirmar sua disponibilidade, sem substituir silenciosamente o runner
  principal do monorepo.

#### Dúvidas abertas

- A revisão fixada é o `gitHead`
  `064ca9890cc0cf8adc198215bd0ddaeb586c220a` de `@native-sdk/cli@0.10.1`,
  instalado com Node 24.20.0 fora do workspace.
- Como preservar a port `BibleLibrary`/`BibleInstaller`, atualmente baseada em
  `Promise`, diante do contrato síncrono de services e do core síncrono nativo:
  service síncrono com driver compatível, uso direto dos efeitos SQLite em uma
  implementação nativa, ou outra ponte que mantenha a mesma semântica.
- Quais hosts desktop serão executáveis no ambiente de CI e quais exigirão
  verificação em máquina própria; a spike não escolhe suporte por inferência.
- A capability SQLite engine-owned não abre um arquivo legado externo; `node:sqlite`
  foi rejeitado por `NS1066` em service. O adapter usará filesystem Native e um
  leitor TypeScript somente leitura, limitado ao schema legado documentado; o
  registry persistirá como JSON atômico no namespace do app.
- O pacote de produção não será embutido no consumer. A aquisição remota usará
  `Cmd.fetch` com `Range` em blocos abaixo de 256 KiB; cada bloco será staged no
  service e o installer só receberá os bytes completos depois do último bloco.
- Como o build do Native SDK consumirá packages workspace durante a prova sem
  transformar `src/` interno ou `workspace:*` em contrato público.
- O ambiente do monorepo continua usando Node 22; a spike Native usa toolchain
  própria Node 24+ e a CLI não entra nas dependências do workspace.

### 3. Escopo e atores

#### Incluído

- Spike oficial da versão/API do Native SDK, capacidades e matriz de hosts.
- Contrato e implementação do futuro `@openbible/adapter-sqlite-native`, atrás
  das ports existentes ou do seam de compatibilidade aprovado pela spike.
- Consumer privado em `apps/consumer-native` com manifest, core determinístico,
  services, download R2, fixture de teste e configuração do namespace local.
- UI nativa em uma janela com as áreas Biblioteca, Leitor e Busca.
- Instalação, listagem, leitura, busca, remoção, falha de instalação e
  reconciliação/rollback best-effort conforme a semântica existente.
- Vitest unitário/contratual e automação do Native SDK quando o host permitir.
- Evidência de comandos, revisão do SDK, hosts executados e documentação técnica.

#### Fora de escopo

- Aplicação desktop completa, personalização avançada ou distribuição para
  usuários finais.
- Alterar, migrar, ler diretamente ou reutilizar o armazenamento do projeto
  legado `/home/claudio/Projects/open-bible`.
- Alteração do banco legado; o runtime pode baixar os arquivos públicos do R2,
  enquanto os testes herméticos usam somente fixtures sintéticas.
- Personal Study, Sync, TursoDB, autenticação, contas, API de catálogo remota, TUI,
  React Native e consumer Web/PWA.
- Publicação npm, release, repositório remoto, assinatura de binário e
  instaladores de produção.
- Suporte a host que não tenha execução comprovada na matriz.
- Crash-safety completa por journal durável; a garantia desta fatia permanece
  exception-safe com reconciliação best-effort, salvo se o Native SDK exigir
  outra limitação explicitamente documentada.

#### Atores

- **Desenvolvedor do consumer nativo**: compõe o app pelos exports públicos,
  executa a jornada e interpreta a matriz de capacidades.
- **Usuário desktop de prova**: baixa, instala, lê, busca e remove uma versão por
  meio da UI; depois da instalação, leitura e busca não dependem de rede.
- **CI ou verificador de plataforma**: executa `native check`, Vitest, build,
  automação e conformance no host disponível; não transforma host ausente em
  suporte declarado.
- **Native SDK**: toolchain e runtime externo que validam core, markup, services,
  SQLite, filesystem, renderização e ciclo de vida do app.

### 4. Princípios e restrições do projeto

- **PR-001**: A direção de dependência permanece adapters → engine →
  engine-core; o Native SDK é consumidor substituível e nunca dependência do core.
- **PR-002**: `BibleLibrary` é somente leitura e `BibleInstaller` é o único dono
  de escrita, instalação, remoção, compensação e registry.
- **PR-003**: O core do engine não interpreta SQLite, não usa Node/DOM/Web APIs,
  não executa I/O e mantém contratos serializáveis.
- **PR-004**: O core do Native SDK é determinístico, síncrono e livre de
  services; I/O atravessa comandos e mensagens ou o seam técnico que a spike
  demonstrar ser equivalente.
- **PR-005**: Código TypeScript é strict e ESM; erros externos usam `unknown`,
  narrowing e uniões discriminadas, sem `any` ou casts cosméticos.
- **PR-006**: IDs e paths são validados; traversal, paths físicos em mensagens,
  SQL e stack traces não são expostos na UI.
- **PR-007**: Operações locais não dependem de rede e não simulam persistência
  com memória quando SQLite/filesystem estiver indisponível; somente a ação
  explícita de instalação pode iniciar a aquisição R2.
- **PR-008**: A fixture de teste deve usar o schema SQLite legado real e somente
  dados sintéticos; os pacotes R2 seguem as mesmas validações e conversões do
  engine.
- **PR-009**: O consumer importa somente exports públicos de packages; imports de
  `src/` interno, paths de workspace ou APIs não declaradas são falhas de prova.
- **PR-010**: O código da UI compõe o domínio, mas não duplica parser, busca,
  ordenação, instalação, validação de package ou transações.
- **PR-011**: A versão/API do Native SDK e cada host precisam estar fixados ou
  marcados como não verificados; APIs pré-1.0 não são tratadas como estáveis.

### 5. Histórias de usuário

#### US-001 — Provar a Scripture Library em um desktop nativo (P1)

Como desenvolvedor do consumer nativo, quero executar uma UI desktop que use a
engine por um adapter nativo isolado, para comprovar que o mesmo domínio funciona
fora do Web/PWA sem duplicar regras nem tocar o legado.

**Por que P1**: a compatibilidade com Native SDK é uma hipótese arquitetural e
desbloqueia o próximo consumidor real previsto antes de uma versão 1.0.
**Teste independente**: abrir `apps/consumer-native`, baixar uma versão pública
do R2 e concluir instalação, leitura, busca, remoção e falha de instalação por
comandos do app e da suíte Vitest, com evidência da matriz Native SDK; o harness
usa fixture sintética para não depender da rede.
**Requisitos**: FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003.

### 6. Cenários BDD de aceite

#### AC-001 — Registrar a spike oficial antes da implementação

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-001
Feature: Prova Native SDK da Scripture Library

  Scenario: A revisão oficial e a matriz são fixadas antes do alvo
    Given que o Native SDK está em uma revisão pré-1.0
    When a equipe executa a spike oficial
    Then a evidência registra revisão, comandos, capabilities, hosts avaliados e capacidades confirmadas
    And nenhum host não executado é declarado suportado
```

#### AC-002 — Compilar o core determinístico

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-002
Feature: Prova Native SDK da Scripture Library

  Scenario: O core passa a verificação do Native SDK
    Given um `Model`, uma união `Msg` e uma função `update` sem I/O
    When a equipe executa `native check`
    Then o core e o markup compilam sem import de Node, DOM, service ou módulo interno
    And os bindings e rotas de mensagens são validados contra seus tipos
```

#### AC-003 — Rejeitar uma capacidade não suportada

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-003
Feature: Prova Native SDK da Scripture Library

  Scenario: O app não mascara um host ou driver ausente
    Given que um host ou capability não está disponível no ambiente de verificação
    When o consumer tenta construir ou executar essa combinação
    Then o comando falha com resultado explícito de não suportado
    And a matriz mantém a capacidade como não verificada
```

#### AC-004 — Instalar e listar a fixture

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-004
Feature: Prova Native SDK da Scripture Library

  Scenario: A Biblioteca baixa e instala uma versão pública
    Given que o app abriu seu namespace nativo vazio e a versão possui arquivo no bucket R2
    When a pessoa aciona instalar na área Biblioteca com rede disponível
    Then o consumer baixa o arquivo diretamente do R2 em blocos HTTP e o service os staged no namespace
    And o adapter valida header, schema, identidade e sanity query antes do commit
    And a versão aparece como instalada e seus livros aparecem em ordem canônica
```

#### AC-005 — Ler e buscar conteúdo instalado

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-005
Feature: Prova Native SDK da Scripture Library

  Scenario: O Leitor e a Busca usam os contratos da engine
    Given que uma versão sintética está instalada
    When a pessoa abre um livro e capítulo e pesquisa um termo sem rede
    Then os versículos são exibidos em ordem canônica
    And os resultados respeitam limite, total e agrupamento por versão definidos pelos contratos
```

#### AC-006 — Remover e reabrir o namespace

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-006
Feature: Prova Native SDK da Scripture Library

  Scenario: A remoção e a persistência local são observáveis
    Given que uma versão instalada foi lida e buscada
    When a pessoa aciona remover e reabre o app
    Then a versão não aparece mais no registry nem pode ser lida
    And outra versão previamente instalada continua utilizável
```

#### AC-007 — Preservar a versão anterior em falha

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-007
Feature: Prova Native SDK da Scripture Library

  Scenario: Uma reinstalação inválida faz rollback
    Given que a versão anterior está instalada e a nova fixture tem schema inválido
    When a pessoa tenta instalar a nova fixture
    Then a UI mostra erro tipado com retry
    And nenhum temporário ou registry parcial permanece
    And a versão anterior continua legível e pesquisável
```

#### AC-008 — Navegar pelas três áreas da janela

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-008
Feature: Prova Native SDK da Scripture Library

  Scenario: A janela única mantém o fluxo Biblioteca-Leitor-Busca
    Given que o consumer foi aberto em sua área Biblioteca
    When a pessoa escolhe Leitor ou Busca na navegação principal
    Then a área selecionada substitui o conteúdo sem abrir uma janela secundária
    And o contexto de versão instalada e o estado offline permanecem visíveis
```

#### AC-009 — Exibir estados e bloquear ações concorrentes

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-009
Feature: Prova Native SDK da Scripture Library

  Scenario: A Biblioteca comunica uma instalação em andamento
    Given que a pessoa iniciou a instalação de uma versão
    When o adapter ainda está em operação
    Then a UI mostra instalando ou carregando e desabilita remover e iniciar outra instalação incompatível
    And ao falhar mostra erro com retry sem perder o estado anterior
```

#### AC-010 — Operar sem rede

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-010
Feature: Prova Native SDK da Scripture Library

  Scenario: Leitura e busca não criam dependência de rede
    Given que uma versão baixada foi instalada e todas as interfaces de rede estão bloqueadas
    When a pessoa lê um capítulo e busca um termo
    Then ambas as operações terminam usando somente o namespace nativo local
    And a UI mantém o indicador offline sem iniciar novo download ou oferecer um falso fallback remoto
```

#### AC-013 — Baixar o pacote direto do R2 em blocos

**Cobre**: US-001, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-013
Feature: Aquisição remota da Scripture Library

  Scenario: O consumer contorna o limite de resposta do Native SDK
    Given que o arquivo SQLite público é maior que 256 KiB
    When a pessoa inicia a instalação da versão
    Then o core emite requisições GET com ranges consecutivos abaixo do limite buffered do Native SDK
    And cada resposta é encaminhada ao service sem armazenar o pacote inteiro no Model
    And somente o último bloco dispara o installer local e o arquivo final fica validado e persistido
```

#### AC-011 — Isolar paths e dados do legado

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-011
Feature: Prova Native SDK da Scripture Library

  Scenario: O namespace não atravessa o limite do app
    Given que o app recebeu um identificador de versão e um namespace local
    When o adapter resolve o armazenamento e registra um erro
    Then traversal e identificadores inválidos são rejeitados
    And nenhuma mensagem exibe path físico, SQL, credencial ou stack trace
```

#### AC-012 — Operar por teclado e comunicar foco

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-012
Feature: Prova Native SDK da Scripture Library

  Scenario: A jornada mínima pode ser concluída pelo teclado
    Given que a janela está aberta e o foco está na navegação
    When a pessoa usa Tab, setas, Enter e atalhos dos controles
    Then alcança Biblioteca, Leitor, Busca, instalar, ler, pesquisar, remover e retry
    And o foco permanece visível, previsível e os estados de operação/erro têm nome acessível
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve executar uma spike contra uma revisão fixada do
  Native SDK, registrar a matriz de hosts/capabilities e só selecionar um alvo
  quando o core, UI, I/O e verificação correspondente forem demonstráveis.
- **FR-002**: O sistema deve fornecer um adapter Native SQLite que preserve as
  ports e semântica públicas aplicáveis de `BibleLibrary`,
  `InstalledBibleRegistry` e `BibleInstaller`, incluindo validação de schema,
  instalação exception-safe, remoção, reconciliação e compensação verificável.
- **FR-003**: O sistema deve fornecer `apps/consumer-native` com namespace
  isolado, catálogo de versões mapeado aos arquivos públicos do R2, download
  direto em blocos, fixture SQLite sintética somente para testes e jornada local
  de instalar, listar livros, ler capítulo, buscar versículos, remover e reabrir
  o app.
- **FR-004**: O sistema deve fornecer uma UI nativa em janela única com áreas
  Biblioteca, Leitor e Busca, ações de instalar/remover/ler/buscar, estados
  operacionais essenciais, retry e baseline de acessibilidade.

#### Não funcionais

- **NFR-001**: A separação de dependências deve ser verificável: o core nativo
  permanece puro, síncrono, determinístico e sem autoridade de plataforma; o
  adapter/service concentra SQLite/filesystem; o consumer usa exports públicos.
  **Verificação**: `native check`, typecheck, teste de arquitetura e inspeção de
  imports/exports no build do monorepo.
- **NFR-002**: A jornada local deve ser offline após a instalação, namespace-isolada
  e exception-safe. A aquisição remota deve ser limitada ao download explícito,
  sem perda da versão anterior após falha controlada, sem persistência falsa em
  memória e sem exposição de path/SQL/segredo. **Verificação**: Vitest com
  filesystem/SQLite real ou capacidade nativa equivalente, testes de chunks,
  falha/rollback/reopen e bloqueio de rede para leitura/busca.
- **NFR-003**: A prova deve ser reproduzível e honesta por host, com revisão do
  SDK, comandos, fixture, resultados e limites registrados; a UI deve ser
  operável por teclado com foco e estados acessíveis.
  **Verificação**: Vitest, `native check`, `native test` quando disponível,
  automação/snapshot do host executável e inspeção manual somente para lacunas
  do ambiente.

#### Erros e casos-limite

- SDK, CLI, compilador, host ou capability indisponível → erro de verificação;
  matriz marca não suportado/não verificado e não há fallback silencioso.
- API de service não aceita a port assíncrona atual → spike interrompe a
  implementação daquela variante e registra o seam necessário antes do adapter.
- Driver SQLite TypeScript não é aceito → avaliar capability SQLite nativa ou
  bridge Zig/C fina atrás da mesma port; não introduzir dependência no core.
- Filesystem/SQLite indisponível, banco corrompido ou package inválido → erro
  tipado, nenhum commit parcial e limpeza dos temporários.
- Reinstalação falha → arquivo/registry anterior permanece utilizável.
- Versão não instalada ou query inválida → erro estável traduzido pela UI e retry
  somente quando a operação for recuperável.
- Ação concorrente durante instalação/remoção → ação incompatível bloqueada,
  sem segunda escrita concorrente.
- Namespace ou path inválido → rejeição antes de abrir ou remover qualquer dado.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

- Monorepo pnpm/Turborepo, TypeScript strict, ESM, Vitest e declarations reais.
- `@openbible/engine-core` contém tipos, erros, normalização e parser sem
  dependências de plataforma.
- `@openbible/engine` expõe ports, use-cases e `createBibleEngine`; suas ports
  atuais retornam `Promise` e não conhecem SQLite.
- `@openbible/adapter-sqlite-node` já compõe library, registry e installer sobre
  `node:sqlite`, filesystem e schema legado, servindo de referência sem ser
  reutilizado como runtime Native SDK.
- `apps/consumer-web` é a referência semântica de Biblioteca, Leitor e Busca,
  mas sua stack React/Tailwind/shadcn/ReUI e DOM não entra no consumer nativo.

#### Arquitetura e módulos

- `packages/adapter-sqlite-native/package.json`: package privado inicialmente,
  com `exports` somente para o contrato público e dependências declaradas.
- `packages/adapter-sqlite-native/src/index.ts`: composição pública do adapter;
  exporta somente tipos, factory e resultados necessários ao consumer.
- `packages/adapter-sqlite-native/src/native-library.ts`: leitura de livros,
  capítulos, versão e busca no schema legado, com ordenação e limites da engine.
- `packages/adapter-sqlite-native/src/native-installer.ts`: stage, validação,
  commit, rollback/cleanup, reconciliação e registry; não interpreta regras de
  UI nem faz chamadas remotas.
- `packages/adapter-sqlite-native/src/native-registry.ts`: registro persistente
  no namespace nativo escolhido pela spike.
- `packages/adapter-sqlite-native/src/storage.ts`: seam isolado para a capability
  SQLite/filesystem confirmada; não expõe path físico ao core.
- `apps/consumer-native/src/core.ts`: `Model`, `Msg`, `initialModel`, `update`,
  derivação de bindings e comandos; não importa service nem faz I/O.
- `apps/consumer-native/src/shared.ts`: tipos encodáveis de request/result entre
  core e service, sem funções, Promises ou classes comportamentais.
- `apps/consumer-native/src/services/scripture-library.ts`: operações síncronas
  do Native SDK service; concentra a autoridade de filesystem, staging dos
  blocos baixados e leitor SQLite legado puro, instancia o adapter e traduz
  resultado/erro para tipos de `shared.ts`. A rede não fica no service.
- `apps/consumer-native/src/app.native`: janela, tabs/áreas, bindings, ações,
  estados, labels e componentes Native markup.
- `apps/consumer-native/src/components/*.native`: blocos reutilizáveis de
  Biblioteca, Leitor, Busca, status offline e feedback; a view raiz apenas compõe.
- `apps/consumer-native/app.json` ou o manifest oficial equivalente da revisão
  fixada: capability, carrier, nome e configurações mínimas, sem segredo.
- `apps/consumer-native/tests/`: scripts Vitest do consumer, fixture, contrato
  e harness; a localização final segue o layout aceito pelo Native SDK sem criar
  arquivos `.feature`.

O seam assíncrono/síncrono é uma decisão bloqueante da spike. A implementação
escolhe adaptar a port em um service compatível: filesystem Native síncrono,
leitor SQLite legado puro em TypeScript e registry JSON atômico no namespace do
app. O parser é limitado ao schema legado documentado e preserva os mesmos
resultados, erros e invariantes; nenhuma regra pode mover-se para a UI.

#### Migrations

Não há migration do banco legado nem alteração do projeto legado. Se a capability
SQLite engine-owned for escolhida, as migrations append-only do Native SDK ficam
restritas ao namespace próprio e representam somente o registry/metadados que o
adapter precisar; o conteúdo bíblico da fixture mantém o schema legado validado
pela engine. Rollback de instalação é de dados/arquivos, não de migration
publicada. A spike deve declarar `Não aplicável` para qualquer migration que não
seja necessária.

#### Models

- `NativeAdapterOptions`: namespace lógico validado e opções de runtime aceitas;
  não carrega path arbitrário nem credencial.
- `NativeAdapter`: library, registry, installer e fechamento/reconciliação,
  equivalente ao contrato público do adapter Node.
- `NativeLibrary`: leitura read-only, livros/capítulos ordenados, busca
  case-insensitive e nome de versão.
- `NativeRegistry`: versões instaladas com identidade, nome, timestamp e
  version code conforme `InstalledBible`.
- `NativeInstallState`: união discriminada para staged/validated/committed/
  rolled_back/cleaned quando a implementação precisar expor observabilidade;
  não é regra duplicada no core.
- `ConsumerModel`: área atual, versão/livro/capítulo selecionados, catálogo,
  instalados, livros, versículos, resultados, estado da operação e erro
  serializável; texto dinâmico segue bytes do Native SDK.

#### Controllers e casos de uso

- `runScriptureOperation` no service: recebe request discriminado, instancia ou
  reutiliza o adapter no namespace isolado, executa operação e retorna record
  encodável; timeout, cancelamento e erro tipado seguem o Native SDK.
- `update` no core: converte ações da UI em commands e respostas em mudanças
  imutáveis do `ConsumerModel`; não chama `runScriptureOperation` diretamente.
- `createNativeAdapter`: executa reconciliação ao abrir antes de devolver a
  composição, como o adapter Node, mas usa apenas a storage escolhida pela spike.
- `installVersion`/`uninstallVersion`/`getChapter`/`searchVerses`: permanecem
  semânticas da façade da engine; a UI não chama SQLite diretamente.

#### Views e experiência

- `src/app.native`: shell de janela única com navegação Biblioteca, Leitor e
  Busca, indicador offline e região de conteúdo.
- Biblioteca: lista de versões disponíveis/instaladas, badge de estado e ações
  inline de instalar/remover; sem modal para a operação principal.
- Leitor: seleção de versão, livro e capítulo, versículos ordenados e navegação
  anterior/próxima quando suportada pelos dados da fixture.
- Busca: `search-field`, submit, resultados agrupados por versão e vínculo para
  abrir o contexto no Leitor.
- Feedback: `skeleton`/`spinner`, `empty`, `alert`/`bubble` de erro com retry,
  sucesso/instalada e aviso offline persistente.

#### Queries e repositórios

- Queries de leitura reproduzem a referência Node: `book`/`verse`/`metadata`,
  mapeamento de IDs legado, ordenação ASC, `LIKE ... COLLATE NOCASE`, limite
  explícito e `COUNT(*)` antes do limite.
- Registry usa identidade normalizada e relação um-para-um entre versão instalada
  e arquivo/namespace final; temporários, backups e trash não são estados de
  consumo.
- Se a capability relacional do Native SDK for escolhida, `src/schema/` e
  `src/queries.sql` ficam versionados e `native check` prepara as queries em
  SQLite real; se não, o storage seam da spike deve oferecer as mesmas operações
  e testes de contrato.
- Não há cache de resultados ou paginação nova nesta fatia além dos limites dos
  contratos existentes.

#### Jobs e processamento assíncrono

Não há jobs, filas ou sincronização remota contínua. A aquisição explícita usa o
efeito `Cmd.fetch` com ranges consecutivos; cada resposta é seguida por um
service request síncrono que grava o bloco, e o último bloco chama o installer.
Leitura e busca continuam locais. Instalação é idempotente e uma chave de
operação não pode iniciar uma escrita incompatível concorrente. O carrier `child`
ou `in_process` fica conforme a matriz e não altera a semântica do adapter.

#### Estrutura de arquivos

```text
specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/
  spec.md
  research/
    native-sdk-oficial.md
packages/adapter-sqlite-native/
  package.json
  tsconfig.json
  src/
    index.ts
    native-library.ts
    native-installer.ts
    native-registry.ts
    storage.ts
  tests/
apps/consumer-native/
  native-sdk-matrix.json
  app.json
  package.json
  src/
    core.ts
    shared.ts
    app.native
    components/
    services/
  tests/
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| Namespace nativo | identificador validado do app | isolado do legado; localização resolvida pelo runtime; não aparece em mensagens | contém registry e arquivos SQLite |
| Bible Package | `versionId` normalizado | arquivo público R2 mapeado por nome; baixado em ranges e staged antes da validação | uma versão se relaciona a muitos livros e versos |
| Livro | `book.id` legado convertido para ID canônico | nome, ordem canônica; leitura somente | pertence a uma Fixture Bible |
| Capítulo | `(versionId, bookId, chapter)` | sequência de versículos ordenada ASC | pertence a um Livro |
| Versículo | `(versionId, bookId, chapter, verse)` | texto sintético e busca case-insensitive | pertence a um Capítulo; pode aparecer em resultados |
| InstalledBible | `versionId` | nome, `installedAt`, `versionCode`; registry só confirma estado committed | aponta para uma Fixture Bible final |
| Operação da UI | chave da mensagem/operação | loading/installing/removing/success/empty/error/offline; ações incompatíveis bloqueadas | altera `ConsumerModel`, não persiste por si |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| Bible Package | ausente | ranges válidos + stage + commit | instalada | arquivo final e registry concordam |
| Bible Package | instalada | uninstall concluído | ausente | nenhum arquivo final ou registro permanece |
| Bible Package | instalada | reinstall inválido | instalada | versão anterior preservada; temporários limpos |
| Bible Package | staging | falha/cancelamento | ausente ou anterior | staging nunca é consumível e é descartável |
| Operação da UI | idle | ação de instalar/remover | loading/installing/removing | ação conflitante desabilitada |
| Operação da UI | loading | resultado vazio | empty | vazio não é erro |
| Operação da UI | loading | resultado válido | success/idle | dados obedecem contrato |
| Operação da UI | loading | erro recuperável | error | retry explícito e estado anterior preservado |
| Consumer | qualquer | rede bloqueada com dados locais | offline | leitura/busca local continuam possíveis |

#### Migração e retenção

Não há migração de dados do legado. Fixtures sintéticas são criadas somente para
teste; em execução, os pacotes são baixados do R2 para o namespace local do
consumer e sua retenção é limitada ao ciclo de vida do app de prova;
limpeza de dados de desenvolvimento usa somente o comando seguro do runtime e
não aceita path arbitrário. Registry e arquivos finais persistem entre reaberturas
durante a prova; operações de remoção excluem ambos. Não há dados pessoais,
credenciais, histórico de busca ou sincronização.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Sim. A UI desktop mínima permite operar a
  jornada vertical e observar os estados do adapter; ela não pretende ser o
  produto final nem substitui a conformance técnica.

#### Stack e convenções de interface

O consumer usa Native markup `.native`, `Model`/`Msg`/`update` e componentes do
catálogo oficial do Native SDK. Não usa React, Next, DOM, Tailwind, shadcn/ui ou
ReUI: essas são convenções observadas no `apps/consumer-web`, enquanto o Native
SDK renderiza uma janela nativa sem browser/WebView para esta jornada. A
semântica visual do Web é preservada onde não conflita: shell escuro de alto
contraste, Biblioteca com lista/card e ação inline, Leitor com corpo legível,
Busca agrupada por versão, estados offline, loading, empty e erro com retry. Os
testes de UI usam automação/snapshot nativos quando o host oferecer e Vitest
para lógica/contrato. A página/raiz apenas compõe blocos; regras ficam no engine.

#### Telas e responsabilidades

- **Biblioteca**: usuário desktop consulta versões disponíveis e instaladas,
  baixa/instala uma versão do R2, remove-a, vê badges de estado e inicia o Leitor.
- **Leitor**: usuário escolhe versão/livro/capítulo, consulta versículos e
  retorna à Biblioteca ou segue para Busca; saída é texto em ordem canônica.
- **Busca**: usuário informa termo, consulta todas as versões instaladas,
  vê resultados agrupados e abre o contexto no Leitor.
- As três responsabilidades vivem em áreas/tabs de uma única janela; não há
  janela secundária, modal de instalação ou rota Web.

#### Fluxo de informação e navegação

Ao abrir, o core mostra carregamento e depois Biblioteca; o app inicializa/reconcilia
o namespace antes de expor ações. O fluxo de instalação atualiza o estado da
Biblioteca e o registry; uma versão instalada alimenta Leitor e Busca. Selecionar
um resultado leva ao Leitor com versão/livro/capítulo preservados. Erro mantém o
último estado válido e oferece retry. O breadcrumb nativo de cada área é:
`Open Bible / Scripture Library / Biblioteca`,
`Open Bible / Scripture Library / Leitor` ou
`Open Bible / Scripture Library / Busca`; itens anteriores são destinos válidos e
 a área atual é marcada como página corrente.

#### Menus e navegação principal

O menu principal é uma faixa `tabs` na janela com os itens Biblioteca, Leitor e
Busca. Cada item é um destino de área e não exige permissão adicional. Leitor e
Busca podem ficar desabilitados até existir uma versão instalada; essa condição
é comunicada no estado vazio, não ocultada. Não há menu secundário ou menu de
conta. A janela é desktop; a composição reflowa as regiões para largura menor,
mantendo as ações visíveis e permitindo rolagem no conteúdo.

#### Formulários e ações

- Biblioteca: ações `Instalar` e `Remover` são botões inline por versão; instalar
  baixa o arquivo público R2 em ranges, fica ocupada/desabilitada durante a
  operação e não abre modal. Erro mostra `Tentar novamente`; não há campo livre.
- Leitor: selects nativos para versão, livro e capítulo; mudanças validam
  identidade, livro instalado e capítulo inteiro antes de consultar. Controles
  anterior/próxima são desabilitados no limite.
- Busca: `search-field` com label `Pesquisar versículos`, termo obrigatório
  para executar, submit por Enter/botão, estado vazio para nenhum resultado,
  erro com retry e resultados clicáveis para abrir contexto.
- O indicador offline é persistente e informativo; somente `Instalar` abre rede,
  enquanto leitura, busca e remoção usam o namespace local.

#### Composição e disposição

A janela usa shell escuro de alto contraste com app bar curta, breadcrumb e área
de conteúdo. A navegação fica acima do conteúdo; a Biblioteca usa lista/linhas
densas com badge e ação no fim; Leitor usa coluna de leitura com controles no
topo; Busca usa formulário no topo e lista rolável abaixo. Superfícies e ações
seguem tokens nativos, sem bordas decorativas desnecessárias. Em largura menor,
controles passam para uma coluna e o conteúdo usa scroll; nenhuma ação essencial
fica apenas em hover.

#### Blocos React e componentes selecionados

O bloco React não é aplicável porque o consumer não é React. A tabela registra,
no mesmo contrato exigido pela interface, os blocos Native markup equivalentes e
suas fontes oficiais; nenhum `@reui/c-*` ou primitive shadcn é introduzido em uma
camada incompatível.

| Tela | Bloco React | Responsabilidade | Arquivo previsto | Componente ou composição | Origem | Reuso ou extensão |
| --- | --- | --- | --- | --- | --- | --- |
| Biblioteca | Não aplicável; `LibraryArea` Native | lista, badge e ações de instalação/remoção | `apps/consumer-native/src/components/library.native` | `list`/`list-item` + `badge` + `button` | Native SDK Native UI | novo; preserva a semântica de `VersionCard` do Web |
| Leitor | Não aplicável; `ReaderArea` Native | seletores, capítulo e navegação | `apps/consumer-native/src/components/reader.native` | `select` + `scroll` + `text` + `button` | Native SDK Native UI | novo; não copia consulta da engine |
| Busca | Não aplicável; `SearchArea` Native | entrada, submit e resultados | `apps/consumer-native/src/components/search.native` | `search-field` + `list` + `list-item` | Native SDK Native UI | novo; preserva a semântica de `SearchForm`/`SearchResults` |
| Todas | Não aplicável; `StatusFeedback` Native | offline, loading, vazio e erro/retry | `apps/consumer-native/src/components/feedback.native` | `alert`/`skeleton`/`spinner`/`text` | Native SDK Native UI | novo; regra de estado vem do `ConsumerModel` |
| Shell | Não aplicável; `AppShell` Native | tabs, breadcrumb e conteúdo | `apps/consumer-native/src/app.native` | `tabs` + `breadcrumb` + `column`/`scroll` | Native SDK Native UI | novo; equivalente conceitual ao shell Web |

#### Estados e acessibilidade

Estados visíveis: inicial/carregando, disponível, instalada, instalando,
removendo, sucesso, vazio, erro tipado com retry e offline. Ações de escrita
ficam desabilitadas durante instalação/remoção; Leitor e Busca exibem vazio
explicativo quando não há versão. Foco é visível e previsível; Tab percorre
tabs, campos e ações; setas percorrem grupos; Enter/Space ativam controles; labels
nomeiam versão, livro, capítulo, termo e erro. Mudanças de operação e erro são
anunciadas pela semântica nativa de status/alert e permanecem no conteúdo até
serem resolvidas. A UI não depende de hover para acesso. O `breadcrumb` mantém
equipe, módulo e área atual visíveis.

#### APIs expostas

- `@openbible/adapter-sqlite-native` expõe somente factory, tipos do adapter e
  contratos necessários à composição; não expõe driver, path, SQL ou internals.
- `apps/consumer-native` não expõe API HTTP, rota remota ou endpoint público.
- O contrato interno do app é o service gerado pelo Native SDK: operação
  discriminada, request/result encodável, erro kind-tagged e rota para `Msg`.
- Versionamento segue a revisão do package do monorepo e a revisão fixada do SDK;
  nenhuma publicação acontece nesta fatia.

#### APIs externas utilizadas

- Native SDK CLI/compiler/runtime, revisão fixada pela spike; instalação e
  comandos são executados conforme documentação oficial, com erro explícito se o
  host não suportar a combinação.
- SQLite engine-owned ou driver/filesystem Native SDK escolhido pela spike,
  somente no adapter/service; a aquisição usa exclusivamente `Cmd.fetch` para
  os arquivos públicos R2, sem API de catálogo, autenticação ou fallback remoto.
- Vitest existente do monorepo para testes automatizados; `native test` e
  automação Native SDK são complementares quando disponíveis no host.

#### Documentação das APIs consultadas

- README oficial e revisão `064ca9890cc0cf8adc198215bd0ddaeb586c220a`: modelo,
  plataformas e comandos.
- `/docs/typescript` e `/docs/typescript/services`: subset, `Model`/`Msg`/`update`,
  services síncronos, carriers e contratos.
- `/docs/sqlite` e `/docs/files`: SQLite relacional, queries, migrations, efeitos
  de arquivo e limites.
- `/docs/native-ui` e `/platform-support`: markup, controles, acessibilidade,
  automação e suporte de hosts.
- Evidência resumida e ancorada em
  `research/native-sdk-oficial.md`, sem tratar a documentação como prova da
  compatibilidade do código atual.

#### Eventos e outros contratos

- `Msg` é união discriminada com ações de navegação, instalação, remoção, leitura,
  busca, retry e respostas de service; todos os payloads são encodáveis.
- Service request/result contém operação, `versionId`, offset, bytes de bloco,
  livro, capítulo, query, limite, dados de livros/versículos, progresso e erro
  kind-tagged; o resultado buffered do fetch contém status e bytes. Promises,
  funções, classes e paths físicos não cruzam a fronteira.
- Eventos de automação são externos à regra de domínio e servem somente para
  dirigir teclado, ações, snapshots e replay; não há `.feature`.
- O contrato precisa declarar cancelamento, timeout, duplicidade de chave e
  fechamento do adapter; replay deve alimentar resultados sem abrir SQLite.

### 11. Estratégia TDD

- **Unidade**: normalização, validação de package/schema, mapeamento de livros,
  queries, registry, estados do `ConsumerModel` e reducers puros.
- **Integração/contrato**: adapter Native contra fixture sintética, equivalência
  com a suite de ports, service request/result, exports públicos e reconciliação.
- **BDD/aceite**: os 13 cenários AC-001–AC-013 são a referência para testes
  Vitest e automação Native SDK; não serão criados arquivos `.feature`.
- **Runner TDD**: Vitest existente, decisão confirmada no refinamento; `native
  test` é verificação complementar do app quando a revisão do SDK o suportar.
- **E2E**: jornada AC-004–AC-013 por automação Native SDK no host disponível,
  incluindo download em ranges, teclado, estados, leitura, busca, remoção e
  retry; o harness técnico roda a mesma fixture sintética sem UI.
- **Verificação manual**: somente conferir janela e foco em host não disponível
  em CI; o resultado deve registrar host, versão, limitações e não substitui os
  testes automatizados.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-001 | AC-001 na seção 6 | `tests/native-sdk-spike.test.ts` com `SPECSFY: AC-001` | Observado: exit 1 antes da matriz; arquivo ausente | Passed: matriz fixada e `native check/test/build` do consumer passaram; hosts não executados permanecem `unverified` | Passed: matriz separa SDK, host, capability e seam sem inferir suporte multiplataforma |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-002 | AC-002 na seção 6 | `tests/architecture/native-boundary.test.ts` com `SPECSFY: AC-002` | Observado: exit 1; `apps/consumer-native/src/core.ts` ausente | Passed: teste arquitetural, `native check` e Turbo confirmaram core Native determinístico | Passed: core limita efeitos a `Cmd`/`Msg` e não importa Node, DOM, services ou SQLite |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-003 | AC-003 na seção 6 | `tests/native-sdk-capability.test.ts` com `SPECSFY: AC-003` | Observado: exit 1 antes da matriz; arquivo ausente | Passed: capability test passou; Linux permanece `unverified`, WebKitGTK e `node:sqlite` ficam explicitamente indisponíveis | Passed: claims de host e capability estão classificados na matriz sem fallback silencioso |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-004 | AC-004 na seção 6 | `packages/adapter-sqlite-native/tests/adapter-install.test.ts` com `SPECSFY: AC-004` | Observado: exit 1; `packages/adapter-sqlite-native/src/index.ts` ausente | Passed: package check, harness e automação instalaram fixture real e listaram livros em ordem | Passed: somente ARA possui fixture física instalada; NVI permanece disponível para futura instalação |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-005 | AC-005 na seção 6 | `packages/adapter-sqlite-native/tests/adapter-read.test.ts` com `SPECSFY: AC-005` | Observado: exit 1; `packages/adapter-sqlite-native/src/native-library.ts` ausente | Passed: package check, harness e automação confirmaram capítulo ordenado e busca limitada | Passed: parser/queries permanecem no adapter/service; UI só dispara mensagens |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-006 | AC-006 na seção 6 | `apps/consumer-native/tests/reopen.test.ts` com `SPECSFY: AC-006` | Observado: exit 1; `apps/consumer-native/tests/harness.test.ts` ausente | Passed: harness e reopen visual preservaram ARA após nova instância/processo e remoção limpou storage | Passed: registry JSON e fixture ficam no namespace isolado, sem estado global no core |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-007 | AC-007 na seção 6 | `packages/adapter-sqlite-native/tests/adapter-rollback.test.ts` com `SPECSFY: AC-007` | Observado: exit 1; `packages/adapter-sqlite-native/src/native-installer.ts` ausente | Passed: package check e harness confirmaram replacement inválido preservando arquivo, registry e ausência de temporários | Passed: UI expõe erro/retry e o installer mantém rollback no adapter, sem regra duplicada no markup |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-008 | AC-008 na seção 6 | `apps/consumer-native/tests/ui-navigation.test.ts` com `SPECSFY: AC-008` | Observado: exit 1; `apps/consumer-native/src/app.native` ausente | Passed: tabs e breadcrumb foram confirmados no snapshot e em `941x1030`/`720x520` | Passed: uma única janela GPU mantém Biblioteca, Leitor e Busca com contexto offline visível |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-009 | AC-009 na seção 6 | `apps/consumer-native/tests/ui-feedback.test.ts` com `SPECSFY: AC-009` | Observado: exit 1; `apps/consumer-native/src/components/feedback.native` ausente | Passed: markup/teste de feedback, estados instalado/vazio e ações bloqueadas durante loading foram confirmados | Passed: loading/failed/retry ficam no bloco de feedback e não expõem mensagens internas do adapter |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-010 | AC-010 na seção 6 | `apps/consumer-native/tests/offline-contract.test.ts` com `SPECSFY: AC-010` | Observado: exit 1; service local ausente | Passed: service local, harness e busca Native executaram sem rede; resultados e termo vazio foram confirmados | Passed: filesystem e parser são locais; nenhuma operação de UI declara origem remota |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-011 | AC-011 na seção 6 | `packages/adapter-sqlite-native/tests/security-contract.test.ts` com `SPECSFY: AC-011` | Observado: exit 1; `packages/adapter-sqlite-native/src/storage.ts` ausente | Passed: package check e harness rejeitaram traversal antes do storage e não expuseram paths físicos | Passed: validação de namespace permanece no adapter/storage; o Model recebe somente dados encodáveis |
| US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-012 | AC-012 na seção 6 | `apps/consumer-native/tests/accessibility-contract.test.ts` com `SPECSFY: AC-012` | Observado: exit 1; `apps/consumer-native/src/app.native` ausente | Passed: labels, tabs, textbox focável, navegação e status foram confirmados em testes e snapshot Native | Passed: foco, labels e estados usam semântica Native; hosts não executados continuam explicitamente não verificados |
| US-001, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-013 | AC-013 na seção 6 | `apps/consumer-native/tests/download-contract.test.ts` com `SPECSFY: AC-013` | Observado: exit 1; manifest sem rede, core sem `Cmd.fetch` e service sem staging R2 | Passed: consumer emite GETs `Range` de `204800` bytes, o adapter faz staging sequencial e somente o último bloco dispara a instalação; o teste real do R2 confirmou 22 respostas `206` e `4476928` bytes | Passed: falhas de status, bloco inválido, staging fora de ordem, parte incompleta e falha de registry limpam ou restauram o estado anterior |

<!-- specsfy:evidence {"task":"T001","refs":["US-001","FR-001","NFR-003","AC-001","AC-003"]} -->
<!-- specsfy:evidence {"task":"T002","refs":["US-001","FR-001","NFR-003","AC-001"]} -->
<!-- specsfy:evidence {"task":"T003","refs":["US-001","FR-001","NFR-001","AC-002"]} -->
<!-- specsfy:evidence {"task":"T004","refs":["US-001","FR-001","NFR-003","AC-003"]} -->
<!-- specsfy:evidence {"task":"T005","refs":["US-001","FR-002","FR-003","NFR-001","NFR-002","AC-004"]} -->
<!-- specsfy:evidence {"task":"T006","refs":["US-001","FR-002","FR-003","FR-004","NFR-001","NFR-002","AC-005"]} -->
<!-- specsfy:evidence {"task":"T007","refs":["US-001","FR-002","FR-003","NFR-002","AC-006"]} -->
<!-- specsfy:evidence {"task":"T008","refs":["US-001","FR-002","FR-003","NFR-002","AC-007"]} -->
<!-- specsfy:evidence {"task":"T009","refs":["US-001","FR-004","NFR-003","AC-008"]} -->
<!-- specsfy:evidence {"task":"T010","refs":["US-001","FR-004","NFR-003","AC-009"]} -->
<!-- specsfy:evidence {"task":"T011","refs":["US-001","FR-003","NFR-002","AC-010"]} -->
<!-- specsfy:evidence {"task":"T012","refs":["US-001","FR-002","FR-003","NFR-002","AC-011"]} -->
<!-- specsfy:evidence {"task":"T013","refs":["US-001","FR-004","NFR-003","AC-012"]} -->
<!-- specsfy:evidence {"task":"T014","refs":["US-001","FR-002","NFR-001","NFR-002","AC-004","AC-005","AC-006","AC-007","AC-011"],"files":["packages/adapter-sqlite-native/package.json","packages/adapter-sqlite-native/src/index.ts","packages/adapter-sqlite-native/src/storage.ts","packages/adapter-sqlite-native/src/legacy-sqlite.ts","packages/adapter-sqlite-native/src/native-library.ts","packages/adapter-sqlite-native/src/native-registry.ts","packages/adapter-sqlite-native/src/native-installer.ts","packages/adapter-sqlite-native/tests/adapter-install.test.ts","packages/adapter-sqlite-native/tests/adapter-read.test.ts","packages/adapter-sqlite-native/tests/adapter-rollback.test.ts","packages/adapter-sqlite-native/tests/security-contract.test.ts"],"commands":[{"run":"pnpm --filter @openbible/adapter-sqlite-native run check","exit":0},{"run":"pnpm --filter @openbible/adapter-sqlite-native run build","exit":0}]} -->
<!-- specsfy:evidence {"task":"T015","refs":["US-001","FR-002","NFR-001","NFR-002","AC-004","AC-005","AC-006","AC-007","AC-010","AC-011"],"files":["packages/adapter-sqlite-native/tests/conformance.test.ts","packages/adapter-sqlite-native/tests/native-storage.ts"],"commands":[{"run":"pnpm --filter @openbible/adapter-sqlite-native run check","exit":0},{"run":"pnpm exec vitest run packages/adapter-sqlite-native/tests","exit":0}]} -->
<!-- specsfy:evidence {"task":"T016","refs":["US-001","FR-001","FR-003","NFR-001","NFR-003","AC-002","AC-003","AC-004","AC-005","AC-006","AC-010"],"files":["apps/consumer-native/app.json","apps/consumer-native/native-sdk-matrix.json","apps/consumer-native/src/core.ts","apps/consumer-native/src/shared.ts","apps/consumer-native/src/app.native","apps/consumer-native/src/services/scripture-library.ts","apps/consumer-native/tests/harness.test.ts"],"commands":[{"run":"native check apps/consumer-native","exit":0},{"run":"native test apps/consumer-native","exit":0},{"run":"native build apps/consumer-native -Dautomation=true","exit":0},{"run":"pnpm --filter @openbible/consumer-native run test","exit":0}]} -->
<!-- specsfy:evidence {"task":"T017","refs":["US-001","FR-003","NFR-002","AC-004","AC-005","AC-006","AC-007","AC-010","AC-011"],"files":["apps/consumer-native/tests/harness.test.ts","apps/consumer-native/tests/fixture.ts","packages/adapter-sqlite-native/src/index.ts","packages/adapter-sqlite-native/src/native-installer.ts"],"commands":[{"run":"pnpm --filter @openbible/consumer-native exec vitest run tests/harness.test.ts","exit":0}]} -->
<!-- specsfy:evidence {"task":"T018","refs":["US-001","FR-004","NFR-003","AC-004","AC-006","AC-007","AC-009"],"files":["apps/consumer-native/src/components/library.native","apps/consumer-native/src/app.native","apps/consumer-native/src/core.ts","apps/consumer-native/tests/ui-feedback.test.ts"],"commands":[{"run":"native check apps/consumer-native","exit":0},{"run":"native build apps/consumer-native -Dautomation=true","exit":0},{"run":"native automate assert 'role=text name=\\\"Biblioteca\\\"' 'role=button name=\\\"Instalar\\\"'","exit":0},{"run":"native automate assert 'role=text name=\\\"Biblioteca local disponível\\\"' 'role=button name=\\\"Remover\\\"'","exit":0}]} -->
<!-- specsfy:evidence {"task":"T019","refs":["US-001","FR-004","NFR-003","AC-005","AC-006","AC-008","AC-012"],"files":["apps/consumer-native/src/components/reader.native","apps/consumer-native/src/app.native","apps/consumer-native/src/core.ts","apps/consumer-native/tests/ui-navigation.test.ts","apps/consumer-native/tests/accessibility-contract.test.ts"],"commands":[{"run":"native check apps/consumer-native","exit":0},{"run":"native automate assert 'role=text name=\\\"gen 1:1\\\"' 'role=text name=\\\"No princípio criou Deus os céus e a terra.\\\"'","exit":0},{"run":"native automate assert 'role=text name=\\\"gen 2:1\\\"' 'role=button name=\\\"Anterior\\\"'","exit":0}]} -->
<!-- specsfy:evidence {"task":"T020","refs":["US-001","FR-004","NFR-003","AC-005","AC-008","AC-010","AC-012"],"files":["apps/consumer-native/src/components/search.native","apps/consumer-native/src/app.native","apps/consumer-native/src/core.ts","apps/consumer-native/tests/offline-contract.test.ts","apps/consumer-native/tests/accessibility-contract.test.ts"],"commands":[{"run":"native check apps/consumer-native","exit":0},{"run":"native automate assert 'role=text name=\\\"gen 1:3\\\"' 'role=text name=\\\"E disse Deus: Haja luz; e houve luz. (gen 1:3)\\\"'","exit":0},{"run":"native automate assert 'role=text name=\\\"Digite um termo para pesquisar.\\\"'","exit":0}]} -->
<!-- specsfy:evidence {"task":"T021","refs":["US-001","FR-004","NFR-003","AC-008","AC-009","AC-012"],"files":["apps/consumer-native/src/app.native","apps/consumer-native/src/components/library.native","apps/consumer-native/src/components/reader.native","apps/consumer-native/src/components/search.native","apps/consumer-native/src/components/feedback.native","apps/consumer-native/.zig-cache/native-sdk-automation/snapshot.txt","apps/consumer-native/.zig-cache/native-sdk-automation/screenshot-library.png","apps/consumer-native/.zig-cache/native-sdk-automation/screenshot-reader.png","apps/consumer-native/.zig-cache/native-sdk-automation/screenshot-search.png","apps/consumer-native/.zig-cache/native-sdk-automation/screenshot-reopen.png","apps/consumer-native/.zig-cache/native-sdk-automation/screenshot-search-narrow.png"],"commands":[{"run":"pnpm --filter @openbible/consumer-native run test","exit":0},{"run":"native check apps/consumer-native","exit":0},{"run":"native automate resize 1080 720","exit":0},{"run":"native automate resize 720 520","exit":0},{"run":"native automate assert 'window .*720x520' 'role=textbox name=\\\"Pesquisar versículos\\\".*focused=true' 'dispatch_errors=0'","exit":0},{"run":"native automate screenshot main-canvas 1","exit":0}]} -->
<!-- specsfy:evidence {"task":"T022","refs":["US-001","FR-001","FR-002","FR-003","FR-004","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012"],"files":["tests/architecture/native-boundary.test.ts","tests/native-sdk-spike.test.ts","tests/native-sdk-capability.test.ts","apps/consumer-native/native-sdk-matrix.json","apps/consumer-native/zig-out/model-contract.zon","specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md"],"commands":[{"run":"pnpm exec turbo run build test typecheck lint check","exit":0},{"run":"pnpm exec vitest run tests/native-sdk-spike.test.ts tests/native-sdk-capability.test.ts tests/architecture/native-boundary.test.ts","exit":0},{"run":"native test apps/consumer-native","exit":0},{"run":"native check apps/consumer-native","exit":0},{"run":"native build apps/consumer-native -Dautomation=true","exit":0},{"run":"node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md","exit":0}]} -->
<!-- specsfy:evidence {"task":"T023","refs":["US-001","FR-001","FR-002","FR-003","FR-004","NFR-003","AC-001","AC-003","AC-008","AC-012"],"files":["PROJECT.md","INTERFACE.md",".specsfy/STACK.md",".specsfy/DATABASE.md",".specsfy/PACKAGES.md","docs/README.md","docs/architecture.md","docs/application.md","docs/database.md","docs/flows.md","docs/frontend.md","docs/integrations.md","docs/decisions.md","docs/testing.md","apps/consumer-native/native-sdk-matrix.json"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->
<!-- specsfy:evidence {"task":"T025","refs":["US-001","FR-003","FR-004","NFR-001","NFR-002","NFR-003","AC-004","AC-009","AC-010","AC-013"],"files":["apps/consumer-native/src/core.ts","apps/consumer-native/src/shared.ts","apps/consumer-native/src/services/scripture-library.ts","apps/consumer-native/app.json","apps/consumer-native/native-sdk-matrix.json","packages/adapter-sqlite-native/src/native-service.ts","packages/adapter-sqlite-native/src/legacy-sqlite.ts","packages/adapter-sqlite-native/tests/package-download.test.ts","packages/adapter-sqlite-native/tests/r2-schema.test.ts","packages/adapter-sqlite-native/tests/adapter-rollback.test.ts"],"commands":[{"run":"pnpm --filter @openbible/adapter-sqlite-native run check","exit":0},{"run":"pnpm --filter @openbible/adapter-sqlite-native run build","exit":0},{"run":"pnpm --filter @openbible/consumer-native run test","exit":0},{"run":"native check apps/consumer-native","exit":0},{"run":"native test apps/consumer-native","exit":0},{"run":"native build apps/consumer-native -Dautomation=true","exit":0},{"run":"pnpm exec turbo run build test typecheck lint check","exit":0},{"run":"curl -fsS -D /tmp/opencode/ara-range-final.txt -H 'Range: bytes=0-204799' -o /tmp/opencode/ara-range-final.bin https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles/ARA.sqlite && grep -E '^(HTTP/|Content-Length:|Content-Range:|Accept-Ranges:)' /tmp/opencode/ara-range-final.txt && test \"$(wc -c < /tmp/opencode/ara-range-final.bin)\" -eq 204800","exit":0}]} -->
<!-- specsfy:evidence {"task":"T026","refs":["US-001","FR-003","FR-004","NFR-003","AC-004","AC-008","AC-009","AC-010","AC-013"],"files":["PROJECT.md","INTERFACE.md",".specsfy/STACK.md",".specsfy/DATABASE.md",".specsfy/PACKAGES.md","docs/README.md","docs/architecture.md","docs/application.md","docs/database.md","docs/flows.md","docs/frontend.md","docs/integrations.md","docs/decisions.md","docs/testing.md","apps/consumer-native/native-sdk-matrix.json"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Marcadores TDD esperados

Os testes materializados devem conter no mínimo três casos executáveis para a
feature inteira e para cada `US`, `FR` e `NFR`, cada caso com seu próprio marcador
`SPECSFY:`. Os marcadores devem usar os mesmos IDs dos cenários e não devem ser
substituídos por um marcador compartilhado.

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001 | Spike/contrato | `tests/native-sdk-spike.test.ts`; `native check` | Passed: matriz e scaffold Native verificados; consumer ainda não executado |
| FR-001 | AC-002 | Arquitetura | `tests/architecture/native-boundary.test.ts`; `native check` | Passed: teste arquitetural, Native check e Turbo passaram |
| FR-001 | AC-003 | Plataforma | `tests/native-sdk-capability.test.ts`; comando do host | Passed: Linux permanece unverified e indisponibilidades estão explícitas |
| FR-002 | AC-004 | Integração | `packages/adapter-sqlite-native/tests/adapter-install.test.ts` | Passed: adapter check instalou fixture SQLite real e listou livros |
| FR-002 | AC-005 | Integração | `packages/adapter-sqlite-native/tests/adapter-read.test.ts` | Passed: adapter check leu capítulo e busca limitada |
| FR-002 | AC-007 | Falha/rollback | `packages/adapter-sqlite-native/tests/adapter-rollback.test.ts` | Passed: arquivo anterior e registry foram preservados |
| FR-003 | AC-004 | Integração | `packages/adapter-sqlite-native/tests/adapter-install.test.ts` | Passed: fixture instalada no storage lógico |
| FR-003 | AC-005 | Integração | `packages/adapter-sqlite-native/tests/adapter-read.test.ts` | Passed: leitura e busca sem rede |
| FR-003 | AC-006 | Reopen | `apps/consumer-native/tests/reopen.test.ts` | Passed: harness e reopen Native preservaram a instalação após reinício |
| FR-004 | AC-008 | UI automatizada | `apps/consumer-native/tests/ui-navigation.test.ts`; Native automation | Passed: tabs, breadcrumb, janela única e screenshots passaram |
| FR-004 | AC-009 | UI automatizada | `apps/consumer-native/tests/ui-feedback.test.ts`; Native automation | Passed: feedback, estados vazio/instalado e bloqueio durante loading passaram |
| FR-004 | AC-012 | Acessibilidade | `apps/consumer-native/tests/accessibility-contract.test.ts`; Native automation | Passed: labels, foco do textbox e navegação Native passaram |
| NFR-001 | AC-002 | Arquitetura | `tests/architecture/native-boundary.test.ts`; typecheck | Passed: Turbo typecheck e Native check passaram; `tsc` raiz permanece bloqueado por TS6059 preexistente |
| NFR-001 | AC-004 | Contrato | `packages/adapter-sqlite-native/tests/adapter-install.test.ts` | Passed: package compila sem imports de Node |
| NFR-001 | AC-011 | Segurança | `packages/adapter-sqlite-native/tests/security-contract.test.ts` | Passed: namespace lógico valida traversal |
| NFR-002 | AC-006 | Persistência | `apps/consumer-native/tests/reopen.test.ts` | Passed: teste focal do adapter verificou reopen e remoção |
| NFR-002 | AC-007 | Falha/rollback | `packages/adapter-sqlite-native/tests/adapter-rollback.test.ts` | Passed: falha não deixou temporários ou divergência |
| NFR-002 | AC-010 | Offline | `apps/consumer-native/tests/offline-contract.test.ts` | Passed: service local e jornada Native não usam rede |
| NFR-003 | AC-001 | Evidência | `tests/native-sdk-spike.test.ts`; research loader | Passed: revisão, commands, capabilities e hosts estão fixados |
| NFR-003 | AC-003 | Matriz | `tests/native-sdk-capability.test.ts`; host command | Passed: capability test passou e doctor registra limite WebKitGTK |
| NFR-003 | AC-012 | Acessibilidade | `apps/consumer-native/tests/accessibility-contract.test.ts` | Passed: labels, foco, resize e snapshot confirmados |
| NFR-003 | AC-013 | Download limitado | `apps/consumer-native/tests/download-contract.test.ts`; `packages/adapter-sqlite-native/tests/package-download.test.ts` | Passed: ranges `204800`, staging sem o pacote no Model, último bloco instala e falhas limpam/restauram o estado |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: READY — 2026-08-28
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md`
- **Achados**: definição revisada e aprovada; 1 US, 4 FR, 3 NFR e 13 AC com
  cobertura mínima de três cenários por item. O comportamento novo fixa a
  aquisição no R2, ranges abaixo de 256 KiB, staging no service e instalação
  somente após o último bloco; leitura e busca continuam offline.
- **FIND-PROD-001** [P2] [Accepted] O alvo e a profundidade multiplataforma dependem da revisão pré-1.0 do SDK — Refs: FR-001, NFR-003 — Evidence: specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/research/native-sdk-oficial.md:7 — Effect: uma execução em um host não pode ser generalizada para os demais — Suggestion: manter T001 com cada host como suportado, não verificado ou não suportado e não declarar o consumer suportado sem execução própria.
- **FIND-ARCH-001** [P2] [Accepted] As ports atuais retornam `Promise`, enquanto services do Native SDK exigem operações síncronas — Refs: FR-002, NFR-001 — Evidence: packages/engine/src/ports.ts:18 — Effect: uma implementação direta pode violar a fronteira determinística ou duplicar o domínio — Suggestion: resolver o seam em T001 e bloquear T014 até preservar contratos, erros e invariantes.
- **FIND-SEC-001** [P2] [Accepted] O armazenamento nativo precisa impedir traversal, exposição de paths e acesso ao legado — Refs: FR-003, NFR-002, AC-011 — Evidence: specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md:465 — Effect: um namespace incorreto pode ler ou remover dados fora do app — Suggestion: validar identificadores no adapter e provar isolamento em T014/T015 antes da UI.

#### Gate do Ato II — Plano

- **Resultado**: Passed — 2026-08-28
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/spec.md`
- **Achados**: 26 tarefas, 26 completas, 16 TDD materializadas, 130 itens de
  checklist, 21/21 IDs cobertos e interface validada. T024 produziu RED próprio
  para AC-013; T025 implementou a entrega dependente desse RED.

#### Gate do Ato III — Entrega

- **Resultado**: Passed — 2026-08-28; T025 implementou download R2 em ranges,
  staging sequencial no adapter, commit somente após o último bloco e limpeza
  exception-safe. T026 reconstruiu e validou a documentação.
- **Evidência**: `native check`, `native test` e `native build` passaram no Linux
  com Native SDK `0.10.1`; a regressão Turbo passou 47/47 tarefas; a suíte do
  adapter passou 7 arquivos/11 testes e a do consumer 7 arquivos/10 testes. A
  execução real do ARA baixou 22 ranges `206` de até `204800` bytes, instalou
  `4476928` bytes, leu 66 livros e não deixou `.part` após o commit.
- **Limites aceitos**: `native doctor --strict` continua bloqueado pela ausência
  de WebKitGTK 6.0; macOS e Windows permanecem `unverified`. A validação real
  do R2 foi feita fora da automação Native, usando o adapter construído e um
  `NativeStorage` temporário; a suíte hermética continua sem depender da rede.

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

#### Fase 1 — Spike e RED TDD

- [x] T001 [P1] [DOC] [US-001] Registrar revisão/API oficial, hosts, capabilities, commands e limites do seam de SQLite/filesystem em `specs/completed/0005-adapter-native-sdk-e-consumer-desktop-minimo/research/native-sdk-oficial.md` e `apps/consumer-native/native-sdk-matrix.json` — Refs: US-001, FR-001, NFR-003, AC-001, AC-003 — Depends: none
  - [x] **PREP**: Conferir R-001, o limite de pesquisa, backlog, matriz oficial e host disponível.
  - [x] **EXECUTE**: Registrar revisão, comandos, capacidades, limitações e alternativas do seam sem copiar conteúdo externo.
  - [x] **VERIFY**: Executar `native check`, `native test` e `native build` no scaffold temporário com Node 24.20.0; os três passaram. `native check` do consumer real permanece não executável sem manifest, e `native doctor --strict` registra WebKitGTK 6.0 ausente.
  - [x] **EVIDENCE**: Atualizar research, seção 2, matriz local, seção 13 e os IDs AC-001/AC-003.
  - [x] **IMPROVE**: Escolher o filesystem Native combinado com leitor SQLite legado puro em TypeScript e registry JSON atômico. A escolha preserva a port pública, evita `node:sqlite` rejeitado por `NS1066`, mantém paths fora do Model e limita o parser ao schema legado suportado.

- [x] T002 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-001 em `tests/native-sdk-spike.test.ts` — Refs: US-001, FR-001, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Ler AC-001 e confirmar revisão, matriz e classificação de host.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-001`, sem criar `.feature`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED pela ausência da evidência da spike.
  - [x] **EVIDENCE**: Registrar comando, causa do RED e vínculo US/FR/NFR/AC na seção 11.
  - [x] **IMPROVE**: Manter o caso focado na decisão de suporte, sem testar implementação do adapter.

- [x] T003 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-002 em `tests/architecture/native-boundary.test.ts` — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none
  - [x] **PREP**: Ler AC-002 e enumerar imports proibidos e bindings verificáveis.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-002`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED pela ausência do consumer nativo.
  - [x] **EVIDENCE**: Registrar comando, import esperado e causa do RED na seção 11.
  - [x] **IMPROVE**: Separar a regra arquitetural do teste de execução da UI.

- [x] T004 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-003 em `tests/native-sdk-capability.test.ts` — Refs: US-001, FR-001, NFR-003, AC-003 — Depends: none
  - [x] **PREP**: Ler AC-003 e definir resultado explícito para host/capability indisponível.
  - [x] **EXECUTE**: Adicionar o caso Vitest com marcador próprio `SPECSFY: AC-003`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED antes da matriz; após T001, o caso passa sem fallback silencioso.
  - [x] **EVIDENCE**: Registrar comando, saída e classificação esperada do host.
  - [x] **IMPROVE**: Evitar que o caso trate um host não executado como falha do produto.

- [x] T005 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-004 em `packages/adapter-sqlite-native/tests/adapter-install.test.ts` — Refs: US-001, FR-002, FR-003, NFR-001, NFR-002, AC-004 — Depends: none
  - [x] **PREP**: Ler AC-004 e preparar fixture sintética, namespace vazio e contrato de instalação.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-004`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED pela ausência do adapter Native.
  - [x] **EVIDENCE**: Registrar comando, schema esperado e causa do RED.
  - [x] **IMPROVE**: Reutilizar a fixture do contrato existente sem incluir conteúdo bíblico protegido.

- [x] T006 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-005 em `packages/adapter-sqlite-native/tests/adapter-read.test.ts` — Refs: US-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, AC-005 — Depends: none
  - [x] **PREP**: Ler AC-005 e definir livro, capítulo, query, limite e ordem esperados.
  - [x] **EXECUTE**: Adicionar o caso Vitest com marcador próprio `SPECSFY: AC-005`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED na leitura/busca Native.
  - [x] **EVIDENCE**: Registrar comando, resultados esperados e causa do RED.
  - [x] **IMPROVE**: Cobrir leitura e busca sem acoplar o teste a detalhes de UI.

- [x] T007 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-006 em `apps/consumer-native/tests/reopen.test.ts` — Refs: US-001, FR-002, FR-003, NFR-002, AC-006 — Depends: none
  - [x] **PREP**: Ler AC-006 e preparar instalação, remoção, fechamento e reabertura do namespace.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-006`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED na persistência/reopen.
  - [x] **EVIDENCE**: Registrar comando, estado do registry e causa do RED.
  - [x] **IMPROVE**: Garantir isolamento entre execuções e ausência de estado global.

- [x] T008 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-007 em `packages/adapter-sqlite-native/tests/adapter-rollback.test.ts` — Refs: US-001, FR-002, FR-003, NFR-002, AC-007 — Depends: none
  - [x] **PREP**: Ler AC-007 e preparar versão anterior, fixture inválida e falha controlada.
  - [x] **EXECUTE**: Adicionar o caso Vitest com marcador próprio `SPECSFY: AC-007`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED sem rollback Native.
  - [x] **EVIDENCE**: Registrar comando, arquivos intermediários esperados e causa do RED.
  - [x] **IMPROVE**: Assegurar que a asserção cobre preservação da versão anterior.

- [x] T009 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-008 em `apps/consumer-native/tests/ui-navigation.test.ts` — Refs: US-001, FR-004, NFR-003, AC-008 — Depends: none
  - [x] **PREP**: Ler AC-008 e definir tabs, breadcrumb, contexto e janela única.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-008`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED sem a composição Native.
  - [x] **EVIDENCE**: Registrar comando, bindings e causa do RED.
  - [x] **IMPROVE**: Testar navegação e preservação de contexto, não estética isolada.

- [x] T010 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-009 em `apps/consumer-native/tests/ui-feedback.test.ts` — Refs: US-001, FR-004, NFR-003, AC-009 — Depends: none
  - [x] **PREP**: Ler AC-009 e listar estados, bloqueios e retry recuperável.
  - [x] **EXECUTE**: Adicionar o caso Vitest com marcador próprio `SPECSFY: AC-009`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED nos estados de operação.
  - [x] **EVIDENCE**: Registrar comando, ação bloqueada e causa do RED.
  - [x] **IMPROVE**: Manter o teste determinístico e independente de tempo visual.

- [x] T011 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-010 em `apps/consumer-native/tests/offline-contract.test.ts` — Refs: US-001, FR-003, NFR-002, AC-010 — Depends: none
  - [x] **PREP**: Ler AC-010 e configurar bloqueio de rede e fixture já instalada.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-010`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED caso haja dependência remota.
  - [x] **EVIDENCE**: Registrar comando, bloqueio aplicado e causa do RED.
  - [x] **IMPROVE**: Diferenciar indisponibilidade de rede de erro do armazenamento local.

- [x] T012 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-011 em `packages/adapter-sqlite-native/tests/security-contract.test.ts` — Refs: US-001, FR-002, FR-003, NFR-002, AC-011 — Depends: none
  - [x] **PREP**: Ler AC-011 e preparar identificadores inválidos, namespace e mensagem de erro.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-011`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED sem validação Native.
  - [x] **EVIDENCE**: Registrar comando, entrada rejeitada e causa do RED.
  - [x] **IMPROVE**: Cobrir path traversal sem acessar o filesystem do legado.

- [x] T013 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do AC-012 em `apps/consumer-native/tests/accessibility-contract.test.ts` — Refs: US-001, FR-004, NFR-003, AC-012 — Depends: none
  - [x] **PREP**: Ler AC-012 e definir sequência de foco, labels e mensagens de estado.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY: AC-012`.
  - [x] **VERIFY**: Executar `pnpm test:tdd` e observar RED sem UI Native acessível.
  - [x] **EVIDENCE**: Registrar comando, ordem de foco e causa do RED.
  - [x] **IMPROVE**: Priorizar tarefa concluível e anúncio de estado, não inspeção estética.

#### Fase 2 — Adapter e contratos

- [x] T014 [P1] [CODE] [US-001] Criar o package público `packages/adapter-sqlite-native/` e implementar o seam escolhido para library, registry e installer — Refs: US-001, FR-002, NFR-001, NFR-002, AC-004, AC-005, AC-006, AC-007, AC-011 — Depends: T001, T005, T006, T008, T012
  - [x] **PREP**: Executar `$specsfy-documentator` e confirmar a alternativa síncrono/assíncrono e os contratos das SPEC-0001/0002: filesystem Native síncrono, leitor SQLite legado puro e registry JSON atômico, mantendo as ports públicas baseadas em `Promise`.
  - [x] **EXECUTE**: Implementar factory, storage, leitura, registry, instalação, remoção e reconciliação nos arquivos definidos.
  - [x] **VERIFY**: `pnpm --filter @openbible/adapter-sqlite-native run check` e `pnpm --filter @openbible/adapter-sqlite-native run build` passaram; os testes focais instalaram e leram a fixture SQLite real, verificaram busca limitada, rollback, reopen e remoção.
  - [x] **EVIDENCE**: Exports públicos, storage lógico, parser, registry, installer e reconciliação estão em `packages/adapter-sqlite-native/src/`; os quatro testes do package passaram cobrindo AC-004–AC-007/AC-011.
  - [x] **IMPROVE**: A implementação compara a semântica com o adapter Node por meio da fixture compartilhada, sem importar `node:sqlite`, `node:fs` ou driver Node no package Native.

- [x] T015 [P1] [TEST] [TDD] [US-001] Executar conformance de ports e segurança do adapter em `packages/adapter-sqlite-native/tests/` — Refs: US-001, FR-002, NFR-001, NFR-002, AC-004, AC-005, AC-006, AC-007, AC-010, AC-011 — Depends: T014
  - [x] **PREP**: Selecionar a fixture sintética compartilhada, a suite Vitest do package, falhas de storage e jornada local sem qualquer package source ou chamada de rede.
  - [x] **EXECUTE**: Rodar instalação/leitura/busca/remoção/reopen, rollback, traversal e divergência registry/storage.
  - [x] **VERIFY**: `pnpm --filter @openbible/adapter-sqlite-native run check` passou com 5 arquivos e 7 testes; não houve temporários residuais e a versão anterior foi preservada.
  - [x] **EVIDENCE**: `conformance.test.ts` cobriu jornada offline, reconciliação de `.tmp/.bak`, órfãos, rollback, reopen e traversal; a suite retornou exit 0.
  - [x] **IMPROVE**: A conformance separa a ausência de rede do adapter local e registra o limite residual: a execução Native real do consumer e hosts macOS/Windows ainda não foram provados.

#### Fase 3 — Consumer nativo

- [x] T016 [P1] [CODE] [US-001] Criar `apps/consumer-native/` com manifest, package, core, shared types e service contract — Refs: US-001, FR-001, FR-003, NFR-001, NFR-003, AC-002, AC-003, AC-004, AC-005, AC-006, AC-010 — Depends: T003, T004, T011, T014
  - [x] **PREP**: Executar `$specsfy-documentator` e depois confirmar revisão `@native-sdk/cli@0.10.1` (`064ca9890cc0cf8adc198215bd0ddaeb586c220a`), carrier desktop `child`, capabilities `filesystem`/`native_views`/`gpu_surfaces` e records encodáveis; `native check`, `native test`, `native build` e `native dev --core` foram executados no Linux com Node 24.20.0.
  - [x] **EXECUTE**: Implementar `Model`/`Msg`/`update`, service, fixture, manifest e harness usando somente exports públicos e `Cmd`/`Msg`.
  - [x] **VERIFY**: `native check apps/consumer-native`, `native test apps/consumer-native`, `native build apps/consumer-native -Dautomation=true` e `pnpm --filter @openbible/consumer-native run test` passaram; a suíte Native teve 25/25 etapas e a suíte Vitest teve 6 arquivos/7 testes.
  - [x] **EVIDENCE**: O core não importa Node/DOM/service; `native-sdk-matrix.json` fixa SDK, carrier, capabilities, seam e hosts; o snapshot Native registra janela GPU/software e `dispatch_errors=0` após a jornada automatizada.
  - [x] **IMPROVE**: Numeric wire fields foram normalizados como `Uint8Array`, `chapterCount` recebeu limite explícito para o compilador Native e resultados vazios passaram a usar visibilidade booleana sem cruzar um array sem tipo.

- [x] T017 [P1] [CODE] [US-001] Implementar a jornada técnica de fixture em `apps/consumer-native/tests/harness.test.ts` — Refs: US-001, FR-003, NFR-002, AC-004, AC-005, AC-006, AC-007, AC-010, AC-011 — Depends: T006, T008, T012, T016
  - [x] **PREP**: Confirmar namespace lógico isolado em memória, fixture SQLite real compartilhada, ausência de rede e reabertura por nova instância do adapter.
  - [x] **EXECUTE**: Exercitar install/list/read/search/uninstall/reopen e replacement inválido pelo contrato público assíncrono do adapter Native.
  - [x] **VERIFY**: `pnpm --filter @openbible/consumer-native exec vitest run tests/harness.test.ts` passou com 2 testes, incluindo leitura de João 2, busca por `luz`, reopen, remoção e rollback.
  - [x] **EVIDENCE**: `apps/consumer-native/tests/harness.test.ts` usa `HarnessStorage` sem filesystem ou rede e confirma registry/storage sem temporário residual; execução Linux/Node 22 do monorepo retornou exit 0.
  - [x] **IMPROVE**: Cada teste cria seu próprio storage e adapter; nenhuma ordem, estado persistido ou recurso externo é compartilhado entre casos.

#### Fase de interface

- [x] T018 [P1] [CODE] [US-001] Implementar a área Biblioteca em `apps/consumer-native/src/components/library.native`, compô-la em `apps/consumer-native/src/app.native` e registrar o bloco em `INTERFACE.md` — Refs: US-001, FR-004, NFR-003, AC-004, AC-006, AC-007, AC-009 — Depends: T005, T008, T010, T017
  - [x] **PREP**: Confirmar lista, badges, ações inline, estados de loading/empty/failed/installed, labels acessíveis e breadcrumb da Biblioteca.
  - [x] **EXECUTE**: Criar a área Native markup conectada a `install_version` e `remove_version`, sem duplicar instalação, remoção ou validação da engine.
  - [x] **VERIFY**: `native check apps/consumer-native` e `native build apps/consumer-native -Dautomation=true` passaram; a automação confirmou Biblioteca vazia com `Instalar` e instalada com `Remover`.
  - [x] **EVIDENCE**: `library.native` e o shell expõem a lista, status LOCAL e ações focáveis; snapshots Native confirmaram os estados e `dispatch_errors=0`.
  - [x] **IMPROVE**: A ação destrutiva permanece explícita como `Remover`, fica bloqueada durante loading e usa feedback compartilhado, sem React/shadcn/ReUI no consumer Native.

- [x] T019 [P1] [CODE] [US-001] Implementar a área Leitor em `apps/consumer-native/src/components/reader.native` e conectá-la ao shell — Refs: US-001, FR-004, NFR-003, AC-005, AC-006, AC-008, AC-012 — Depends: T006, T007, T013, T017
  - [x] **PREP**: Confirmar selects, ordem dos versículos, limites, navegação, vazio e labels do Leitor.
  - [x] **EXECUTE**: Criar controles e coluna de leitura Native markup ligados somente ao `Model` e a mensagens `select_*`/`previous_chapter`/`next_chapter`.
  - [x] **VERIFY**: `native check apps/consumer-native` passou; a automação confirmou `gen 1:1`, o texto do versículo, avanço para `gen 2:1` e botão `Anterior`.
  - [x] **EVIDENCE**: `reader.native` e o shell preservam contexto de versão/livro/capítulo; snapshots registraram selects e labels de navegação acessíveis.
  - [x] **IMPROVE**: A coluna usa rolagem Native, valida limites de capítulo e foi verificada em janela estreita `720x520`, sem consultas locais no markup.

- [x] T020 [P1] [CODE] [US-001] Implementar a área Busca em `apps/consumer-native/src/components/search.native` e conectá-la ao shell — Refs: US-001, FR-004, NFR-003, AC-005, AC-008, AC-010, AC-012 — Depends: T006, T011, T013, T017
  - [x] **PREP**: Confirmar campo obrigatório, submit, resultados locais, zero resultados, termo vazio, retry e labels acessíveis.
  - [x] **EXECUTE**: Criar `search-field`, lista de resultados e abertura contextual do Leitor, deixando a busca no service/adapter.
  - [x] **VERIFY**: `native check apps/consumer-native` passou; a automação por teclado confirmou resultado para `luz` e mensagem de termo vazio sem abortar o processo.
  - [x] **EVIDENCE**: `search.native` preserva a query no `Model`, expõe label `Pesquisar versículos` e estados de zero resultado/termo vazio; o snapshot final registrou `dispatch_errors=0`.
  - [x] **IMPROVE**: O estado `Nenhum resultado encontrado` e a mensagem `Digite um termo para pesquisar.` evitam materializar listas vazias sem tipo no contrato Native.

- [x] T021 [P1] [TEST] [US-001] Executar conformance visual, estados e acessibilidade das três áreas em `apps/consumer-native/tests/` — Refs: US-001, FR-004, NFR-003, AC-008, AC-009, AC-012 — Depends: T018, T019, T020
  - [x] **PREP**: Definir a sessão Native com janela inicial `941x1030`, resize para `1080x720` e limite `720x520`, foco, estados e ações esperadas.
  - [x] **EXECUTE**: Dirigir tabs, remoção/reinstalação, leitura, avanço/retorno, seletor de capítulo, busca por teclado, zero resultados, termo vazio e reopen.
  - [x] **VERIFY**: Confirmar labels, tabs, foco do textbox, GPU/software, `gpu_status=ready`, snapshot sem `dispatch_errors`, e renderização em janela ampla e estreita.
  - [x] **EVIDENCE**: Em Linux com Native SDK `0.10.1` na revisão `064ca9890cc0cf8adc198215bd0ddaeb586c220a`, snapshots confirmaram Biblioteca/Leitor/Busca e screenshots foram gerados para library, reader, search, narrow search e reopen.
  - [x] **IMPROVE**: A matriz mantém macOS/Windows como `unverified`; a ausência de WebKitGTK 6.0 bloqueia `native doctor --strict`, mas não invalida a prova GPU/software executada.

#### Fase final — Qualidade e documentação

- [x] T022 [P1] [TEST] [US-001] Executar regressão, arquitetura e rastreabilidade em `tests/architecture/native-boundary.test.ts` e no monorepo — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-001..AC-012 — Depends: T015, T017, T021
  - [x] **PREP**: Identificar checks pnpm/Turbo, Vitest, `native check/test/build`, hosts, capabilities e gates.
  - [x] **EXECUTE**: Rodar regressão completa com `pnpm exec turbo run build test typecheck lint check`, testes focais de arquitetura/matriz, Native test/check/build e validação de tarefas.
  - [x] **VERIFY**: Turbo passou 47/47 tarefas; Native test/check/build passaram; testes focais passaram 3/3; esta spec mantém 20/20 IDs e `validate_tasks` retornou `READY`. A rastreabilidade global só reporta órfãos de outras specs; o `tsc` raiz falha no `rootDir` legado com TS6059 e não invalida os typechecks por pacote.
  - [x] **EVIDENCE**: Seções 11–13 registram GREEN, rastreabilidade, contagens, comandos e limites; `native-sdk-matrix.json` e `zig-out/model-contract.zon` confirmam a revisão e o contrato gerado.
  - [x] **IMPROVE**: O bloqueio de `native doctor --strict` por WebKitGTK 6.0 e a ausência de hosts macOS/Windows ficam classificados como `unverified`; a revisão final aceitou esses limites sem declarar suporte indevido.

- [x] T023 [P1] [DOC] [US-001] Atualizar `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md` e documentação em `docs/` — Refs: US-001, FR-001, FR-002, FR-003, FR-004, NFR-003, AC-001, AC-003, AC-008, AC-012 — Depends: T022
  - [x] **PREP**: Executar monitor de contexto e identificar mudanças estruturais, dados, interface, dependências e limites de host.
  - [x] **EXECUTE**: Documentar package, Native SDK `0.10.1`, namespace lógico, registry/arquivos, blocos Native, fluxos, testes e matriz de hosts conforme fontes canônicas.
  - [x] **VERIFY**: Executar `$specsfy-documentator`, `build_documentation.mjs --check` e monitor; documentação e `.specsfy/PACKAGES.md` ficaram compatíveis.
  - [x] **EVIDENCE**: `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md` e `docs/` registram revisão, seam, persistência, UI e comandos executados; T023 possui evidência estrita material.
  - [x] **IMPROVE**: Remover a afirmação de que o Native adapter era futuro, manter Linux como `unverified` por WebKitGTK 6.0 e preservar as notas humanas fora dos blocos gerenciados.

#### Fase de aquisição remota

- [x] T024 [P1] [TEST] [TDD] [US-001] Derivar o teste RED do download direto do R2 em `apps/consumer-native/tests/download-contract.test.ts` — Refs: US-001, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-013 — Depends: T016
  - [x] **PREP**: Ler AC-013 e confirmar o limite buffered de 256 KiB, o endpoint público R2, o header `Range` e a ausência de pacote completo no `Model`.
  - [x] **EXECUTE**: Escrever casos Vitest com marcador próprio `SPECSFY: AC-013` para manifest de rede, ranges consecutivos, staging no service e commit somente no último bloco.
  - [x] **VERIFY**: Executar `pnpm --filter @openbible/consumer-native run test -- tests/download-contract.test.ts`; o teste terminou com exit 1 nos três casos porque a capacidade, o efeito e o staging ainda não existiam.
  - [x] **EVIDENCE**: Registrar o comando, a falha inicial e os contratos cobertos na seção 11.
  - [x] **IMPROVE**: Manter a prova determinística por contrato e separar o teste de rede real da suíte hermética de fixtures.

- [x] T025 [P1] [CODE] [US-001] Implementar o download R2 em ranges e o staging/commit no consumer Native em `apps/consumer-native/src/core.ts`, `apps/consumer-native/src/shared.ts`, `apps/consumer-native/src/services/scripture-library.ts` e `apps/consumer-native/app.json` — Refs: US-001, FR-003, FR-004, NFR-001, NFR-002, NFR-003, AC-004, AC-009, AC-010, AC-013 — Depends: T024
  - [x] **PREP**: Executar `$specsfy-documentator`, confirmar o contrato buffered de `Cmd.fetch`, a permissão/capability de rede, os mapeamentos `ARA.sqlite`/`NVI.sqlite` e o installer existente; mover a fixture para os testes.
  - [x] **EXECUTE**: Adicionar GET buffered em ranges de `204800` bytes, mensagens encodáveis, staging sequencial em `downloads/<id>.sqlite.part`, finalização pelo installer, limpeza de partes e feedback de progresso/erro. O core não importa fixture nem materializa o pacote completo no `Model`.
  - [x] **VERIFY**: `native check apps/consumer-native`, `native test apps/consumer-native` e `native build apps/consumer-native -Dautomation=true` passaram com 25/25 etapas no build; `pnpm --filter @openbible/adapter-sqlite-native run check` passou com 7 arquivos/11 testes; `pnpm --filter @openbible/consumer-native run test` passou com 7 arquivos/10 testes; Turbo passou 47/47 tarefas; a instalação real do ARA via R2 passou com 22 respostas `206`, `4476928` bytes, 66 livros e parte removida.
  - [x] **EVIDENCE**: `core.ts` emite `Range` consecutivo e encadeia fetch → staging → install; `shared.ts` transporta somente blocos; `scripture-library.ts` delega o filesystem; o adapter cobre parte incompleta, fora de ordem, schema publicado, limpeza e rollback após promoção; `app.json` declara `network` e o hash vendorizado foi atualizado.
  - [x] **IMPROVE**: O parser Native passou a aceitar o formato publicado em que `INTEGER PRIMARY KEY` é omitido do payload SQLite e mantém a fixture sintética. Falha de status, bloco inválido, erro de staging ou instalação inválida limpa a parte; falha de registry restaura o banco e o registry anteriores.

- [x] T026 [P1] [DOC] [US-001] Reconstruir a documentação após o download R2 em `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md` e `docs/` — Refs: US-001, FR-003, FR-004, NFR-003, AC-004, AC-008, AC-009, AC-010, AC-013 — Depends: T025
  - [x] **PREP**: Revisar manifest, capability de rede, staging lógico `downloads/<id>.sqlite.part`, retenção da parte e estados visíveis do download.
  - [x] **EXECUTE**: Executar `$specsfy-documentator` e atualizar a documentação humana de finalidade, fronteiras, persistência, interface, endpoint R2 e limites de host sem afirmar suporte não verificado.
  - [x] **VERIFY**: `node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check` e `node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check` passaram.
  - [x] **EVIDENCE**: `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`, `.specsfy/PACKAGES.md`, `docs/` e `native-sdk-matrix.json` registram R2, capability `network`, staging, retenção, estados e limites; o registro derivado de pacotes foi reconstruído.
  - [x] **IMPROVE**: `PACKAGES.md` permaneceu derivado; o documentator preservou o conteúdo humano fora dos blocos gerenciados e a documentação não declara suporte para macOS/Windows.

### 15. Ordem de execução

- Caminho crítico: T001 → T002/T003/T004/T005/T006/T007/T008/T009/T010/T011/T012/T013 → T014 → T015 → T016 → T017 → T018/T019/T020 → T021 → T022 → T023 → T024 → T025 → T026.
- Tarefas paralelas: T002–T013 são testes independentes por AC; T005–T008
  compartilham o contrato do adapter e devem preservar isolamento de fixtures;
  T018–T020 são fatias de UI separadas e podem ser implementadas em paralelo após
  T016/T017, mas T021 depende das três. T024 materializa o contrato do download
  antes de T025; T026 reconstrói a documentação depois da implementação.
- Estratégia de MVP: T001–T013 entregam a evidência da spike disponível e os REDs
  dos contratos sem produção; T014–T017 provam o adapter e o harness; T018–T021
  adicionam a UI mínima por área e a conformance; T022–T023 fecham regressão e
  documentação.
- Gate operacional: se T001 não confirmar um seam executável para as ports, parar
  antes de T014, registrar a incompatibilidade e retornar à definição da spec.

## Ato III — Entregar e validar

### 16. Dependências, riscos e suposições

#### Dependências

- SPEC-0001 para tipos, parser, ports, façade e invariantes do domínio.
- SPEC-0002 para schema SQLite, fixture e semântica exception-safe/offline.
- SPEC-0003 para exports, tarballs e política de consumo versionado.
- Native SDK CLI/compiler/runtime e uma revisão fixável, com Node 24+ e host
  executável para pelo menos a primeira prova.
- Capability SQLite/filesystem ou driver/bridge autorizado pela spike.
- pnpm, Node 22 para o monorepo, TypeScript strict e Vitest já presentes; a CLI
  oficial exige uma toolchain Native separada com Node 24+.

#### Riscos

- **R-ISK-001**: a port Promise atual é incompatível com service síncrono/core
  Native → spike de T001 compara seams antes do adapter; se necessário, bridge
  fina ou ajuste explícito de contrato, nunca duplicação na UI.
- **R-ISK-002**: Native SDK pré-1.0 muda APIs → revisão fixada, evidence local,
  check reproducível e matriz por host.
- **R-ISK-003**: SQLite engine-owned não aceita schema/semântica legada →
  validação real, queries equivalentes e fallback Zig/C somente atrás da port.
- **R-ISK-004**: host ausente ou dependência de GUI/Metal/GTK → separar teste de
  código de verificação de plataforma e registrar não verificado.
- **R-ISK-005**: persistência nativa vaza para legado ou path arbitrário →
  namespace próprio, validação de IDs, fixtures e testes de isolamento.
- **R-ISK-006**: UI reproduz regras da engine → teste de imports e revisão de
  responsabilidades, com `update` limitado a estado e mensagens.

#### Suposições

- A primeira implementação usará a revisão oficial consultada como ponto de
  partida, mas fixará a revisão novamente no T001 antes de depender dela.
- A capacidade nativa de dados escolhida poderá manter bytes/texto e limites dos
  contratos existentes; se não puder, a incompatibilidade bloqueia a declaração
  de suporte em vez de ser escondida.
- O app de prova pode usar uma fixture sintética sem conteúdo bíblico protegido.
- O host local pode executar Vitest; a execução Native SDK pode exigir um host
  específico e será marcada como tal.
- O design visual Web serve como referência semântica, não como dependência de
  React, Tailwind, shadcn/ui ou ReUI.

### 17. Decisões

- **DEC-001**: Fazer uma spike oficial antes de fixar plataforma — reduz o risco
  de projetar adapter para uma API/host presumido; trade-off é manter a spec
  Draft até a evidência.
- **DEC-002**: Criar o consumer privado em `apps/consumer-native` — mantém
  conformance, CI e exports locais verificáveis sem publicação; não altera o
  legado nem cria repositório paralelo.
- **DEC-003**: Manter namespace nativo isolado e fixture sintética — evita
  migração, risco de privacidade e acoplamento ao path legado; trade-off é não
  provar ainda a migração de dados reais.
- **DEC-004**: Entregar janela única com Biblioteca, Leitor e Busca — é a menor
  UI humana que cobre a jornada vertical; trade-off é deixar produto desktop
  completo fora da fatia.
- **DEC-005**: Usar Native markup e não React/shadcn/ReUI no consumer — a fonte
  oficial comprova renderização nativa sem browser e o projeto só tem essas
  bibliotecas no consumer Web; trade-off é manter dois vocabulários de UI.
- **DEC-006**: Usar Vitest como runner TDD principal — é o runner existente e
  reduz toolchain nova; `native test` permanece uma verificação complementar
  condicionada à revisão oficial.
- **DEC-007**: Preservar a semântica das ports públicas e decidir o seam
  síncrono/assíncrono por evidência — evita quebrar o domínio ou duplicar regras;
  trade-off é deixar a implementação do adapter bloqueada até T001.
- **DEC-008**: Manter exception-safe/reconciliação best-effort, sem prometer
  crash-safety completa — alinha a garantia com as specs existentes e não inventa
  journal nesta fatia.
- **DEC-009**: Implementar o seam Native com filesystem síncrono e leitor SQLite
  legado puro em TypeScript, mantendo o registry como JSON atômico no namespace
  do app — `node:sqlite` foi rejeitado por `NS1066`, `Cmd.db` é pathless e a
  alternativa preserva as ports `Promise` e evita dependência de bridge Zig/C.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed` após validar a definição; o seam continua
  como saída obrigatória da spike antes da implementação.
- [x] `Plan Gate` está `Passed` após tarefas, TDD/BDD e RED observável.
- [x] `Delivery Gate` está `Passed` após GREEN, regressão e evidência por host.
- [x] Todos os cenários `AC-001` a `AC-012` aplicáveis passam ou têm limite de
  plataforma explicitamente aceito e registrado.
- [x] Todos os requisitos `FR-001` a `FR-004` e `NFR-001` a `NFR-003` possuem
  evidência de verificação.
- [x] O adapter Native não toca o legado, mantém namespace isolado e preserva
  instalação/rollback/reconciliação observáveis.
- [x] O consumer importa somente exports públicos e o core Native passa
  `native check` sem autoridade de plataforma.
- [x] A UI oferece Biblioteca, Leitor e Busca em janela única, estados essenciais,
  retry, teclado, foco visível e labels claros.
- [x] Todas as tarefas na seção 14 estão concluídas ou o limite de host está
  documentado sem declarar suporte indevido.
- [x] Vitest, checks estáticos, build e automação Native disponíveis passam.
- [x] `PROJECT.md`, `INTERFACE.md`, `.specsfy/STACK.md`, `.specsfy/DATABASE.md`,
  `.specsfy/PACKAGES.md` e `docs/` refletem a entrega real.
