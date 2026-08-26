# Inbox: Fundação openbible-engine monorepo TypeScript offline-first

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T17:23:01Z |
| Slug | fundacao-openbible-engine-monorepo-typescript-offline-first |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Sessão de descoberta | sessão única autorizada para fundação completa |
| Turno da conversa | turno 1 inbox captura integral |
| Integridade do original | SHA-256 `d5adba952082a2bab650574586718a0dfdf913dd41bb479b39eeaebcaccc8bac` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

use a pasta atual para criacao, Quero criar e implementar a fundação do novo projeto `openbible-engine` como um monorepo TypeScript independente, seguindo integralmente o framework Specsfy.

Raízes

- Use o diretório atual como raiz do novo projeto `openbible-engine`.
- Resolva esse diretório para um caminho absoluto e repita-o antes de trabalhar.
- O projeto legado usado apenas como referência está em:

  /home/claudio/Projects/open-bible

- Não altere nenhum arquivo do projeto legado.
- Não crie arquivos do novo projeto fora da raiz confirmada.

Autorização Specsfy

Autorizo explicitamente:

- executar `$specsfy-setup` na raiz do novo projeto;
- executar `specsfy doctor`;
- instalar no novo projeto as skills essenciais e especialistas detectados pelo `$specsfy-setup`;
- instalar as skills de workflow Specsfy necessárias, caso ainda não estejam disponíveis;
- inicializar os contextos e artefatos gerenciados do Specsfy;
- criar arquivos locais, instalar dependências npm/pnpm e inicializar o repositório Git local.

Não autorizo nesta tarefa:

- criar repositório remoto;
- publicar pacotes npm;
- criar issues, PRs ou releases externos;
- fazer push;
- modificar `/home/claudio/Projects/open-bible`;
- copiar bancos bíblicos reais, credenciais ou arquivos `.env`.

Orquestração obrigatória

Siga esta sequência sem pular gates:

1. `$specsfy-setup`
2. `$specsfy-01-inbox`
3. `$specsfy-02-backlog`
4. `$specsfy-03-specify`
5. `$specsfy-04-validate`
6. `$specsfy-05-tasks`
7. `$specsfy-06-tdd-bdd`
8. `$specsfy-07-implement`
9. `$specsfy-documentator`
10. `$specsfy-progress`

Reexecute `$specsfy-setup` nas transições automáticas quando exigido pelo framework.

Capture este prompt integralmente na Inbox antes de refiná-lo. Como o pedido também autoriza especificação e implementação, após preservar a Inbox faça os handoffs automáticos necessários até a entrega, respeitando os gates.

Não crie fontes normativas paralelas:

- não criar `plan.md`;
- não criar `tasks.md`;
- não criar `research.md`;
- não criar `data-model.md`;
- não criar arquivos `.feature`.

A única fonte normativa da entrega será:

specs/<estado>/<NNNN>-<slug>/spec.md

Use a seção 14 da própria spec para as tarefas. Mantenha BDD/Gherkin somente na spec e materialize seus cenários como testes TDD executáveis com Vitest.

Contexto persistente

Antes de planejar ou implementar, leia e mantenha:

- `PROJECT.md`
- `INTERFACE.md`
- `.specsfy/STACK.md`
- `.specsfy/RULES.md`
- `.specsfy/DATABASE.md`
- `.specsfy/PACKAGES.md`

Execute o monitor de contexto:

- no início;
- após cada tarefa;
- antes de concluir.

Resolva todo resultado `PENDING` por meio das skills `specsfy-aux-*`. Execute `$specsfy-documentator` depois de cada tarefa de implementação e exija que a verificação documental passe.

Classificação da entrega

- Interface para pessoas: Não.
- O `apps/conformance-cli` é uma ferramenta técnica de conformidade, não uma interface de produto.
- Runner TDD confirmado: Vitest.
- Linguagem da documentação e da spec: Português do Brasil.
- Código, nomes públicos, commits e identificadores técnicos: inglês.
- Não adotar Gitflow nesta tarefa.
- Usar Conventional Commits no repositório local.

Evite perguntas repetidas

As decisões abaixo já estão confirmadas. Registre-as no backlog e na spec sem perguntar novamente.

Faça perguntas somente quando existir uma lacuna material que não possa ser resolvida pela inspeção do projeto legado ou pelas decisões deste prompt. Ao perguntar, siga o Contrato de Perguntas Numeradas do Specsfy: exatamente uma pergunta por rodada.

Objetivo do produto

Criar o `openbible-engine`, um motor headless e offline-first que concentre as regras de negócio compartilhadas pelas futuras aplicações Open Bible:

- Web/PWA em Astro ou Next.js;
- desktop nativo usando Native SDK;
- TUI usando OpenTUI;
- futuro aplicativo React Native.

O engine deve ser independente de:

- React;
- Astro;
- Next.js;
- Native SDK;
- OpenTUI;
- componentes visuais;
- OPFS;
- TursoDB;
- drivers SQLite específicos;
- frameworks de autenticação;
- frameworks de sincronização.

Decisões arquiteturais confirmadas

1. O engine será escrito em TypeScript portátil, não Rust.
2. O engine viverá em repositório independente.
3. O repositório será um pnpm workspace.
4. Os pacotes usarão o escopo `@openbible`.
5. Os pacotes terão versionamento e releases próprios no futuro.
6. Nenhum pacote será publicado nesta primeira entrega.
7. A aplicação deverá operar offline desde a primeira abertura.
8. A versão ARA será futuramente embarcada pelos aplicativos consumidores.
9. O engine não deve depender de rede para leitura, busca ou acesso aos dados locais.
10. TursoDB não faz parte do primeiro milestone.
11. TursoDB poderá futuramente implementar sincronização multidispositivo ou abastecer uma API pública.
12. A primeira fatia cobre somente a biblioteca bíblica.
13. Notas, destaques, categorias, autenticação e sincronização estão fora desta entrega.
14. O projeto legado será futuramente o primeiro consumidor do engine em uma migração incremental com rollback.
15. Web, TUI e um novo aplicativo Native SDK deverão ser consumidores reais antes da versão estável `1.0`.

Bounded contexts

Modele explicitamente os seguintes contextos.

### Scripture Library — contexto desta entrega

Responsável por:

- versões bíblicas;
- livros;
- capítulos;
- versículos;
- referências bíblicas;
- biblioteca local;
- catálogo de versões;
- instalação;
- atualização;
- remoção;
- leitura;
- busca.

### Personal Study — futuro

Responsável futuramente por:

- notas;
- referências de notas;
- destaques;
- categorias.

Não implemente esse contexto agora.

### Sync — futuro

Responsável futuramente por:

- sincronização multidispositivo;
- conflitos;
- identidade remota;
- TursoDB;
- API pública.

Não implemente esse contexto agora e não deixe o core dependente dele.

Estrutura esperada

Crie os seguintes workspaces.

### `packages/engine-core`

Nome:

`@openbible/engine-core`

Responsabilidades:

- entidades;
- value objects;
- tipos públicos;
- normalização;
- validações;
- parser de referências;
- erros discriminados;
- eventos de domínio;
- regras puras;
- invariantes.

Restrições:

- zero dependências de runtime;
- somente TypeScript síncrono e determinístico;
- sem npm no código do core;
- sem Node;
- sem DOM;
- sem browser;
- sem SQL;
- sem filesystem;
- sem rede;
- sem Promise;
- sem objetos de framework.

O código deve ser conservador o suficiente para futura compilação pelo TypeScript subset do Native SDK.

### `packages/engine`

Nome:

`@openbible/engine`

Responsabilidades:

- portas;
- casos de uso;
- orquestração;
- façade pública;
- composição do engine.

Dependências permitidas:

- somente `@openbible/engine-core`.

### `packages/adapter-sqlite-web`

Nome:

`@openbible/adapter-sqlite-web`

Responsabilidades:
- boundary para SQLite WASM;
- Worker;
- OPFS;
- importação de bancos locais;
- implementação das portas Web.

Restrições:

- não importar React;
- não conter hooks;
- não conter componentes;
- não colocar APIs Web no engine-core.

Nesta primeira entrega, implemente somente o mínimo que possa ser testado sem navegador real. Não tente concluir toda a integração OPFS se ela não for necessária para provar a arquitetura.

### `packages/adapter-sqlite-native`

Nome:

`@openbible/adapter-sqlite-native`

Responsabilidades:

- boundary para SQLite nativo;
- driver injetável;
- paths locais;
- leitura de arquivos SQLite;
- implementação das portas nativas.

Restrições:

- `engine-core` e `engine` não podem depender de `better-sqlite3`;
- qualquer driver concreto fica contido neste adapter;
- Native SDK usará futuramente a mesma porta, mas não dependerá obrigatoriamente de `better-sqlite3`.

### `packages/adapter-http`

Nome:

`@openbible/adapter-http`

Responsabilidades:

- catálogo remoto opcional;
- download opcional de versões adicionais;
- progresso e cancelamento;
- implementação de `BiblePackageSource`.

Restrições:

- nenhuma operação local pode depender obrigatoriamente deste pacote;
- não implementar TursoDB;
- não colocar URL fixa no core.

### `packages/engine-testing`

Nome:

`@openbible/engine-testing`

Responsabilidades:

- fixtures;
- fake clock;
- fake registry;
- fake package source;
- contract suite;
- golden cases;
- builders de teste.

### `apps/conformance-cli`

Responsabilidades:

- provar consumo pelos exports públicos;
- executar cenários locais de conformidade;
- permitir smoke tests da composição do engine.

Não implementar uma TUI ou interface de produto.

Modelo de domínio inicial

Defina contratos serializáveis para, no mínimo:

- `BibleVersion`
- `BibleBook`
- `Verse`
- `BibleReference`
- `InstalledBible`
- `SearchRequest`
- `SearchResult`
- `InstallationProgress`
- `EngineError`

Use:

- records simples;
- arrays;
- números;
- booleanos;
- strings;
- `Uint8Array` quando necessário;
- unions discriminadas;
- shapes fixos.

Evite na API pública:

- objetos de ORM;
- `Date`;
- `Map`;
- `Set`;
- objetos de conexão;
- tipos DOM;
- tipos Node;
- objetos de driver;
- erros definidos apenas por mensagens livres.

Datas devem atravessar os contratos como Unix epoch em milissegundos.

Erros públicos

Modele erros discriminados com códigos estáveis, incluindo:

- `version_not_installed`
- `invalid_reference`
- `invalid_package`
- `unsupported_schema`
- `storage_unavailable`
- `storage_full`
- `database_locked`
- `network_unavailable`
- `cancelled`

O engine não contém mensagens de interface em português. Aplicações consumidoras traduzirão os códigos.

API inicial esperada

Exponha uma fábrica equivalente a:

```ts
const engine = createBibleEngine({
  library,
  registry,
  packageSource,
  clock,
})
A instância deverá oferecer:
- listAvailableVersions()
- listInstalledVersions()
- installVersion(input, observer?)
- uninstallVersion(versionId)
- getBooks(versionId)
- getChapter(input)
- searchVerses(input)
- parseReference(input)
Ajuste nomes somente se a spec demonstrar uma necessidade concreta. Não crie abstrações genéricas ou camadas sem consumidor real.
Portas mínimas
Modele portas orientadas ao domínio:
- BibleLibrary
- InstalledBibleRegistry
- BiblePackageSource
- Clock
Não exponha na API do engine:
- executeSql;
- query;
- connection objects;
- statements;
- detalhes de OPFS;
- detalhes de filesystem;
- objetos Response ou Request.
Invariantes
- IDs de versões e livros são normalizados e validados.
- IDs não permitem path traversal.
- Uma versão só é registrada após instalação e validação completas.
- Instalação é idempotente.
- Falha de instalação não destrói a versão íntegra anterior.
- Arquivos parciais não aparecem como versões instaladas.
- Bíblias instaladas são abertas como read-only durante leitura.
- Versículos de um capítulo são retornados ordenados.
- Busca preserva inicialmente substring case-insensitive.
- O limite de busca é explícito no request.
- Operações locais não provocam acesso de rede implícito.
- O bootstrap do consumidor deve conseguir manter ao menos uma versão utilizável.
- A ARA embarcada será uma responsabilidade de empacotamento do consumidor, não conteúdo distribuído pelo pacote npm do engine.
Projeto legado como referência
Inspecione, sem modificar:
- packages/domain-bible
- packages/application-bible
- packages/contracts
- packages/adapters-web
- apps/web/lib/database/
- apps/web/features/bible-reader/
- apps/tui/src/db/
- apps/tui/src/services/
- apps/tui/src/lib/parse-reference.ts
- testes de parsing;
- testes de leitura;
- testes de busca;
- testes de adapters;
- testes de download;
- specs relacionadas ao monorepo e ao TUI.
Registre na seção de research da spec:
- fontes consultadas;
- comportamentos observados;
- duplicações;
- divergências Web/TUI;
- decisões derivadas;
- riscos de compatibilidade.
Parsing observado
A Web reconhece exemplos como:
- rt 3
- GN 50
- 1co13
- genesis 1
- rt:3
- sl.23
Ela rejeita:
- capítulos fora do limite;
- capítulo zero;
- prefixos ambíguos;
- entradas vazias.
O TUI também reconhece:
- Gn 1:15
- 1Jo 3:16
- jo 3 16
Crie testes de caracterização para os comportamentos existentes antes de consolidar o novo parser.
Quando Web e TUI divergirem:
- registre a divergência;
- preserve compatibilidade com os casos válidos;
- escolha o comportamento mais abrangente somente quando não criar ambiguidade;
- não transforme prefixos ambíguos em referências válidas;
- inclua exemplo e contraexemplo na spec.
SQLite
Preserve inicialmente o formato observado:
- metadata(key, value)
- book(id, ...)
- verse(book_id, chapter, verse, text)
Não copie um banco real.
Crie uma fixture SQLite pequena e sintética, contendo apenas dados suficientes para:
- listar livros;
- ler capítulos;
- preservar ordenação;
- buscar texto;
- validar metadata;
- detectar schema inválido.
Ciclo de instalação esperado
A spec e os testes devem cobrir:
1. receber bytes locais ou de uma fonte remota;
2. escrever em destino temporário;
3. validar header SQLite;
4. validar schema;
5. validar identidade da versão;
6. executar consulta de sanidade;
7. promover atomicamente;
8. atualizar o registry;
9. limpar temporários após qualquer falha.
Native SDK
Registre um ADR com a seguinte decisão:
- @openbible/engine-core será projetado para futura compilação no Native SDK;
- o futuro app desktop tentará consumir o core em src/services;
- filesystem, rede e SQLite permanecerão atrás de effects/services;
- se um driver SQLite TypeScript não for aceito pelo compilador estático, será criado um adapter Zig/C fino atrás da mesma porta;
- Native SDK é consumidor substituível e nunca dependência do core.
Não implemente o aplicativo Native SDK nesta entrega.
Stack e tooling
Configure:
- Node.js 22;
- pnpm workspace;
- TypeScript strict;
- ESM;
- Vitest;
- ESLint;
- Changesets;
- Conventional Commits;
- declarations TypeScript;
- build real;
- typecheck real;
- GitHub Actions;
- testes arquiteturais;
- validação de exports.
Não configure ignoreBuildErrors.
Não publique pacotes.
Não adicione framework de frontend.
Documentação e ADRs
Crie documentação técnica por meio do $specsfy-documentator.
Registre pelo menos:
- arquitetura;
- mapa dos pacotes;
- direção de dependência;
- modelo de domínio;
- persistência;
- fluxos de leitura, busca e instalação;
- estratégia de testes;
- integração futura com consumidores.
Crie ADRs para:
- TypeScript portátil em vez de Rust;
- arquitetura hexagonal;
- adapters oficiais;
- SQLite local como fonte operacional;
- operação offline;
- ARA embarcada pelo consumidor;
- Native SDK como consumidor substituível;
- TursoDB fora do primeiro milestone;
- migração strangler futura.
Os ADRs são evidências e documentação arquitetural; não substituem a spec.md.
TDD/BDD obrigatório
Use Vitest.
Mantenha Gherkin somente na spec.md.
Crie testes TDD executáveis com marcadores:
// SPECSFY: US-001 FR-001 NFR-001 AC-001
Observe RED válido antes de código de produção.
Cada US, FR e NFR precisa da cobertura mínima exigida pelo Specsfy:
- caminho feliz;
- variação ou regra crítica;
- falha ou limite material.
Não use mocks para remover a fronteira que o cenário pretende provar.
Testes mínimos
- parser com acentos;
- parser case-insensitive;
- abreviações;
- prefixos numéricos;
- referências com capítulo;
- referências com versículo;
- entradas vazias;
- referências inválidas;
- prefixos ambíguos;
- limites de capítulos;
- normalização de IDs;
- rejeição de path traversal;
- delegação dos casos de uso;
- erros tipados;
- ausência de imports de plataforma no core;
- contract suite para livros;
- contract suite para capítulos;
- contract suite para busca;
- instalação idempotente;
- falha de instalação sem registro parcial;
- preservação da versão anterior;
- consumo pelos exports públicos;
- conformance CLI.
Cenários de qualidade mensuráveis
Registre como NFRs verificáveis:
- com rede indisponível, operações locais não tentam HTTP;
- os adapters retornam resultados equivalentes para a mesma fixture;
- leitura mantém ordenação determinística;
- interrupção da instalação não corrompe a biblioteca;
- o core compila sem dependências de plataforma;
- lint, typecheck, testes e build passam pela raiz;
- contratos públicos são serializáveis.
Fluxo de implementação
Depois dos gates:
1. criar testes de caracterização;
2. observar RED;
3. criar workspace e tooling;
4. implementar engine-core;
5. implementar portas;
6. implementar casos de uso;
7. implementar fakes e contract suite;
8. criar fixture SQLite sintética;
9. implementar boundaries mínimos dos adapters;
10. criar conformance CLI;
11. executar regressão;
12. atualizar contexto e documentação;
13. validar rastreabilidade;
14. concluir Delivery Gate somente com evidência completa.
Definition of Done
- Inbox preserva este prompt integralmente.
- Backlog registra as decisões confirmadas.
- Spec usa Specsfy/2.0.
- Definition Gate está Passed.
- Plan Gate está Passed.
- Delivery Gate está Passed.
- A spec está em specs/completed/.
- Todas as tarefas da seção 14 estão concluídas.
- Cada tarefa possui PREP, EXECUTE, VERIFY, EVIDENCE e IMPROVE.
- Testes possuem marcadores SPECSFY.
- RED, GREEN e regressão estão registrados.
- TypeScript strict passa.
- Lint passa.
- Testes passam.
- Build passa.
- Contract suite passa.
- Conformance CLI usa apenas exports públicos.
- Core não importa dependências de plataforma.
- Context monitor retorna CURRENT.
- Documentação passa no modo --check.
- .specsfy/PACKAGES.md está atualizado.
- Nenhum arquivo de /home/claudio/Projects/open-bible foi alterado.
- Nenhum banco bíblico real foi copiado.
- Nenhum pacote foi publicado.
- Nenhum repositório remoto foi criado.
- Nenhum push, issue ou PR foi realizado.
Relato final
Ao concluir, informe:
- raiz confirmada;
- caminho da Inbox;
- caminho da spec concluída;
- decisões arquiteturais;
- pacotes criados;
- tarefas concluídas;
- comandos executados;
- resultado de lint, typecheck, testes e build;
- evidência de rastreabilidade;
- pendências deliberadamente deixadas para Web, Native SDK, TUI, React Native e sync;
- confirmação de que o projeto legado permaneceu inalterado.
Comece executando $specsfy-setup. Não escreva código de produção antes de os gates do Specsfy autorizarem a implementação.

## Monorepo e orquestração

Use:

- pnpm workspaces para instalação, resolução e vinculação dos pacotes;
- Turborepo para o grafo de tarefas, execução paralela e cache;
- `workspace:*` para dependências internas;
- pnpm catalogs para centralizar versões compartilhadas;
- Changesets para versionamento e publicação futura.

Não use Nx ou Nx Cloud.

Configure `turbo.json` para orquestrar:

- `build`
- `test`
- `test:coverage`
- `typecheck`
- `lint`
- `check`

O `build` de cada pacote deve depender do `build` de suas dependências internas.

As fronteiras arquiteturais não devem depender do Turborepo. Elas devem ser garantidas por:

- dependências explícitas nos `package.json`;
- exports públicos de cada pacote;
- regras de ESLint;
- testes arquiteturais;
- testes de conformidade executados contra todos os adapters. e configure specsfy init aqui nesse monorepo.

## Contexto consultado

PROJECT.md inicial, .specsfy/STACK.md, templates, inspeção legado open-bible packages/domain-bible, application-bible, contracts, adapters-web, database, bible-reader, tui parse-reference

## Resumo processado

**Inferência:** Criar fundação do monorepo openbible-engine headless offline-first com pnpm, Turborepo e arquitetura hexagonal para biblioteca bíblica.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Necessidade de motor headless independente de frameworks para unificar regras bíblicas entre Web, desktop Native SDK, TUI e React Native, isolado de React, OPFS, TursoDB e drivers.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Desenvolvedores das aplicações Open Bible e usuários finais offline

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Motor portátil com leitura, busca, catálogo e instalação de versões bíblicas sem rede, testável via conformance CLI

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** pnpm workspace, Turborepo, @openbible escopo, engine-core zero deps sync determinístico, engine facade, adapters sqlite-web/native/http, engine-testing, conformance-cli, Vitest, ESLint, Changesets

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Versões, livros, capítulos, versículos, referências, instalação, busca, metadata SQLite

### Riscos e dependências

**Análise preliminar:** Compatibilidade parsing Web/TUI divergente, path traversal IDs, instalação atômica, schema SQLite, isolamento core vs adapters

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Inbox já autorizada para spec e implementação; implementar bounded context Scripture Library primeiro; deixar Personal Study e Sync para futuro

## Pontos a revisar no futuro

**A revisar:** Validar parsing observado rt 3 GN 50 1co13 genesis 1, schema metadata/book/verse, ciclo instalação 9 passos, ADRs TypeScript vs Rust

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
