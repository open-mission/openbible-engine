# Especificação integrada: Sincronização multidispositivo offline-first com Turso

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| ID | SPEC-0008 |
| Slug | 0008-sincronizacao-multidispositivo-offline-first-com-turso |
| Status | Complete |
| Effort | 9 |
| Effort updated at | 2026-08-29 |
| Effort rationale | Bounded context novo com sincronização assíncrona, E2EE, conflitos, dispositivos confiáveis, retenção, quotas e integração de autenticação remota; risco alto de consistência, privacidade e operação. |
| ClickUp Task | |
| Milestones | |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | Passed |
| Evidence Contract | 1 |
| Interface para pessoas | Não — esta primeira fatia entrega contratos, casos de uso e adapters para consumidores; não cria telas, formulários ou navegação. |
| Atualizada em | 2026-08-29 |

## Ato I — Definir

### 1. Problema e resultado

#### Problema

Os dados pessoais do Open Bible permanecem isolados em cada dispositivo. Ainda
não existe um protocolo comum para identidade remota, fila de alterações,
retomada, conflitos, exclusões e preservação das versões bíblicas instaladas.
Uma solução que exigisse rede para ler ou alterar dados locais quebraria o uso
offline-first já estabelecido pelo projeto.

#### Resultado desejado

Entregar o bounded context Sync como uma capacidade opcional que mantém notas de
estudo pessoal consistentes entre dispositivos autenticados, preserva o uso
anônimo local, trata conflitos explicitamente, permite retomada segura e informa
ao segundo dispositivo quais versões bíblicas deve redownloadar da fonte oficial.
O serviço remoto não deve interpretar o conteúdo das notas.

#### Métricas de sucesso

- Toda mutação local aceita sem rede continua disponível localmente e gera uma
  operação durável para retomada, sem depender de autenticação naquele momento.
- O mesmo identificador de operação não produz duas mutações remotas nem
  reordena mutações dependentes da mesma nota.
- Uma nota em conflito mantém as duas versões e somente termina em uma nova
  revisão após escolha local, escolha remota ou conteúdo mesclado.
- O serviço remoto recebe envelopes cifrados e metadados técnicos opacos; não
  recebe título, referência, datas ou Markdown em claro.
- Uma versão bíblica sincronizada transfere somente seus metadados e pode ser
  marcada como pendente quando a fonte oficial não puder entregar o arquivo.
- O comportamento de credencial ausente, expirada ou revogada preserva a outbox
  e permite nova autenticação sem perda de alterações.

### 2. Research e esclarecimentos

#### Researchs executados

- **R-001** [critical] Better Auth pode ser montado no App Router do Next.js por uma rota de handler e consultado server-side — Verdict: verified — Confidence: high — Evidence: research/better-auth.md#nextjs-integration — Budget: 1/10.
- **R-002** [critical] Better Auth oferece Device Authorization com código, URL de verificação, aprovação explícita e polling — Verdict: verified — Confidence: high — Evidence: research/better-auth.md#device-authorization — Budget: 1/10.
- **R-003** [high] Better Auth oferece sessões revogáveis, múltiplas sessões e credencial Bearer para APIs; isso não implementa chaves E2EE — Verdict: verified — Confidence: high — Evidence: research/better-auth.md#session-and-bearer-tokens — Budget: 1/10.
- **R-004** [critical] Better Auth aceita dialetos Kysely e existe um dialeto comunitário para libSQL/Turso — Verdict: verified — Confidence: high — Evidence: research/libsql-kysely.md#kysely-dialect — Budget: 1/10.

#### Fontes e contexto consultados

- `specs/inbox/2026-08-26-193950-sincronizacao-multidispositivo-offline-first-com-turso.md` — captura original, problema e hipóteses iniciais.
- `specs/backlog/0008-sincronizacao-multidispositivo-offline-first-com-turso.md` — decisões de produto, regras, limites e critérios refinados.
- `specs/completed/0007-bounded-context-personal-study-offline/spec.md` — contrato local de notas, ownership anônimo e fronteira do Personal Study.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — contrato de versões instaladas e redownload por fonte oficial.
- `.specsfy/DATABASE.md` — informações confirmadas, relações, ownership e retenção.
- `PROJECT.md`, `.specsfy/STACK.md`, `.specsfy/RULES.md` e `package.json` — arquitetura, stack, regras de dependência e scripts.
- `apps/consumer-web/package.json` — Next.js 15, React 19, TypeScript e Vitest no consumer atual.

#### Documentação consultada

- Better Auth, Next.js integration, versão consultada em 2026-08-29, `https://better-auth.com/docs/integrations/next` — handler e consulta de sessão.
- Better Auth, Device Authorization, versão consultada em 2026-08-29, `https://better-auth.com/docs/plugins/device-authorization` — código/QR, aprovação, polling e limites de segurança.
- Better Auth, Session Management, Multi Session e Bearer Token Authentication, versão consultada em 2026-08-29 — sessões, revogação e credenciais de API.
- Better Auth, Other Relational Databases, versão consultada em 2026-08-29, `https://better-auth.com/docs/adapters/other-relational-databases` — dialetos Kysely.
- `@libsql/kysely-libsql`, versão 0.4.1 consultada em 2026-08-29, `https://github.com/libsql/kysely-libsql` — conexão `LibsqlDialect` e limites do dialeto.

#### Artefatos de pesquisa armazenados

- `specs/defined/0008-sincronizacao-multidispositivo-offline-first-com-turso/research/better-auth.md`: síntese própria das páginas oficiais do Better Auth, versão 1.7.2, acessada em 2026-08-29; sem cópia extensa de conteúdo protegido.
- `specs/defined/0008-sincronizacao-multidispositivo-offline-first-com-turso/research/libsql-kysely.md`: síntese própria da documentação do Better Auth e do dialeto libSQL, versão 0.4.1, acessada em 2026-08-29; sem cópia extensa de conteúdo protegido.

#### Dúvidas respondidas

- **Q**: A sincronização exige conta? → **A**: Sim. Usuários anônimos permanecem somente locais e não enviam dados ao serviço remoto.
- **Q**: Quem autentica? → **A**: O consumidor/API usa Better Auth para contas, login, sessões, renovação e revogação; o Sync recebe uma identidade opaca e uma credencial válida.
- **Q**: Quais dados entram na primeira fatia? → **A**: Notas do Personal Study e metadados de versões bíblicas instaladas; destaques e categorias ficam fora.
- **Q**: Como notas anônimas entram na conta? → **A**: Por importação explícita; a cópia anônima só pode ser removida depois da confirmação remota.
- **Q**: Como conflitos são resolvidos? → **A**: Ambas as versões são preservadas; a pessoa escolhe local, remoto ou uma versão mesclada, sempre criando nova revisão.
- **Q**: Como a sincronização retoma? → **A**: Automaticamente quando possível e manualmente sob demanda, usando outbox durável, chave de idempotência, cursor e retry limitado.
- **Q**: Como as notas são protegidas? → **A**: O conteúdo e o contexto são cifrados ponta a ponta pelo consumidor; o servidor recebe somente envelopes e metadados técnicos opacos.
- **Q**: Como um novo dispositivo recebe a chave? → **A**: Por código único ou QR aprovado em dispositivo confiável, com transferência cifrada; uma chave de recuperação é contingência.
- **Q**: O Better Auth resolve a aprovação criptográfica? → **A**: Não. Seu Device Authorization pode acelerar a autorização da conta por código/QR, mas o registro de confiança, as chaves e a rotação pertencem ao consumidor/Sync.
- **Q**: O que acontece com versões bíblicas? → **A**: Apenas metadados são sincronizados; o destino redownloada o arquivo da fonte oficial e mantém a escolha pendente se a fonte falhar.
- **Q**: Qual o limite operacional? → **A**: Até 1.000 notas ou 20 MB cifrados por conta; cada operação tem até cinco tentativas com backoff de 1s/2s/4s/8s/16s, jitter e limite de cinco minutos.
- **Q**: Qual a retenção? → **A**: Tombstones por exatamente 90 dias, conflitos resolvidos por 30 dias e dados remotos excluídos em até 30 dias após exclusão da conta; cópias locais não são apagadas automaticamente.

#### Dúvidas abertas

- Nenhuma lacuna de produto bloqueia a definição. Permanecem validações técnicas
  para o Ato II: migrations e transações do dialeto libSQL no Turso, limites do
  runtime Node/Next, desenho final dos endpoints e adapter local por consumidor.

### 3. Escopo e atores

#### Incluído

- Contratos portáveis do bounded context Sync para identidade, outbox, cursores,
  notas, revisões, conflitos, tombstones, dispositivos e versões bíblicas.
- Coordenador local offline-first para enfileirar, enviar, receber, reconciliar
  e retomar operações sem bloquear as mutações do Personal Study.
- Adapter remoto sobre Turso/libSQL para dados técnicos e envelopes cifrados,
  com idempotência, cursores, quotas, retenção e exclusão remota.
- Integração de autenticação no consumidor/API usando Better Auth sem expor o
  SDK de autenticação aos packages portáveis do Sync.
- Importação explícita de notas anônimas, resolução de conflitos e fluxo de
  aprovação de dispositivos por código ou QR.
- Sincronização de metadados de versões bíblicas e redownload no destino por
  meio da fonte oficial já usada pelo Scripture Library.
- Testes de contrato, arquitetura, idempotência, falhas, segurança de payload e
  reconciliação sem interface de usuário.

#### Fora de escopo

- Telas, formulários, rotas visuais, componentes React e experiência de login.
- Destaques, categorias e outras entidades de Personal Study.
- Transporte ou armazenamento remoto dos arquivos SQLite das Bíblias.
- Conteúdo de nota em claro no serviço remoto, indexação semântica e busca de
  conteúdo protegido.
- Implementação de provedor de autenticação próprio, substituto do Better Auth
  ou dependência de Better Auth dentro do core/contrato do Sync.
- Recuperação de notas quando todos os dispositivos confiáveis e a chave de
  recuperação forem perdidos.
- Exclusão automática de cópias locais após revogação de dispositivo ou conta.
- Colaboração multiusuário, compartilhamento de notas e permissões de equipe.

#### Atores

- **Pessoa leitora**: usa consumidores locais e decide autenticar, importar
  notas, aprovar dispositivos e resolver conflitos.
- **Consumidor da aplicação**: mantém notas locais, chaves, armazenamento,
  interface futura e integração com Better Auth; fornece credencial e identidade
  opaca ao Sync.
- **Better Auth**: serviço adotado pelo consumidor/API para contas, sessões,
  renovação, revogação e autorização de conta; não possui as chaves privadas das
  notas.
- **Coordenador Sync local**: executa mutações locais, outbox, retry, pull,
  reconciliação e aplicação não destrutiva de mudanças.
- **Serviço Sync remoto**: valida a sessão já autenticada no boundary da API,
  aplica autorização por conta, armazena envelopes e estados técnicos e nunca
  interpreta o conteúdo cifrado.
- **Dispositivo confiável**: dispositivo explicitamente aprovado que pode
  participar da transferência e rotação de chaves.
- **Fonte oficial de Bíblias**: fornece o arquivo SQLite quando o consumidor do
  dispositivo destino redownloada uma versão sincronizada.

### 4. Princípios e restrições do projeto

- **PR-001**: Sync permanece bounded context separado de Scripture Library e
  Personal Study; nenhum dado remoto de estudo é gravado no catálogo bíblico.
- **PR-002**: Operações locais de notas nunca exigem rede, Turso ou Better Auth;
  indisponibilidade remota altera somente o estado de sincronização pendente.
- **PR-003**: Better Auth fica no consumidor/API. O Sync aceita somente valores
  portáveis de identidade e credencial e não importa seus tipos, cookies ou SDK.
- **PR-004**: O servidor recebe somente envelopes cifrados e metadados opacos;
  a cifra, recuperação, rotação e descriptografia ficam sob controle do
  consumidor.
- **PR-005**: Cada mutação sincronizável possui `operationId` estável, ordem por
  nota e processamento idempotente; a confirmação remota não pode preceder uma
  confirmação local durável.
- **PR-006**: Conflito nunca é resolvido por sobrescrita silenciosa; a resolução
  cria uma nova revisão e conserva o histórico dentro da retenção definida.
- **PR-007**: Revogar um dispositivo bloqueia novas sincronizações e chaves, mas
  não promete apagar suas cópias locais offline.
- **PR-008**: Exclusão usa tombstone de 90 dias; dispositivo atrasado além desse
  prazo reconcilia o estado completo antes de enviar qualquer mutação.
- **PR-009**: O core é TypeScript estrito, ESM, serializável e sem SQLite, DOM,
  React, rede, `Date`, `Map` ou `Set`; datas são epoch milliseconds.
- **PR-010**: Erros são discriminados por códigos estáveis e não carregam texto
  específico de apresentação ou conteúdo pessoal.

### 5. Histórias de usuário

#### US-001 — Sincronizar notas entre dispositivos (P1)

Como pessoa leitora, quero que minhas notas locais sincronizáveis sejam enviadas
e recebidas entre dispositivos autenticados, para continuar meu estudo em mais de
um dispositivo sem perder o uso offline.

**Por que P1**: é o valor central do bounded context e depende diretamente do
  Personal Study já entregue.
**Teste independente**: executar o coordenador com dois stores locais, um remote
  fake e uma credencial controlada, alternando rede disponível e indisponível.
**Requisitos**: FR-001, FR-002, FR-003, FR-005, NFR-001, NFR-002, NFR-003.

#### US-002 — Importar notas anônimas para uma conta (P1)

Como pessoa leitora que acabou de autenticar, quero escolher explicitamente quais
notas anônimas importarei para a conta, para continuar meu estudo sem migração
silenciosa ou perda da cópia local antes da confirmação remota.

**Por que P1**: autenticação sem migração segura deixaria o benefício da conta
  incompatível com as notas já criadas offline.
**Teste independente**: executar importação com sucesso, falha de rede e colisão
  de `id`, verificando ownership local, outbox e conflito.
**Requisitos**: FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-002, NFR-003.

#### US-003 — Resolver conflitos e administrar dispositivos confiáveis (P1)

Como pessoa leitora, quero aprovar dispositivos e resolver alterações
concorrentes com transparência, para manter controle sobre minhas chaves e não
perder nenhuma versão da nota.

**Por que P1**: E2EE e resolução explícita são condições de segurança e
  consistência, não acabamento posterior.
**Teste independente**: produzir uma colisão entre dois dispositivos, aprovar um
  terceiro por código/QR, revogar um dispositivo e testar as três resoluções.
**Requisitos**: FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003.

#### US-004 — Preservar versões bíblicas instaladas (P2)

Como pessoa leitora, quero que minhas escolhas de versões bíblicas apareçam em
outros dispositivos, para poder redownloadá-las oficialmente e ler offline sem
transportar os arquivos pelo Sync.

**Por que P2**: amplia o valor multidispositivo sem misturar arquivos públicos ao
  armazenamento cifrado de notas.
**Teste independente**: sincronizar metadados para um destino sem a versão, com
  fonte disponível, fonte indisponível e versão já instalada.
**Requisitos**: FR-002, FR-006, NFR-001, NFR-003.

### 6. Cenários BDD de aceite

#### AC-001 — Sincronizar uma nota autenticada

**Cobre**: US-001, FR-001, FR-002, FR-003, FR-005, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-003 @FR-005 @NFR-001 @NFR-002 @NFR-003 @AC-001
Feature: Sincronização multidispositivo offline-first

  Scenario: Nota local chega a outro dispositivo autenticado
    Given dois dispositivos ativos e confiáveis para a mesma conta
    And uma nota persistida no primeiro dispositivo
    When o coordenador sincroniza com a rede disponível
    Then o segundo dispositivo recebe uma revisão aplicável
    And o serviço remoto armazena somente o envelope cifrado e metadados opacos
```

#### AC-002 — Enfileirar alteração offline e retomar

**Cobre**: US-001, FR-001, FR-002, FR-005, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-005 @NFR-001 @NFR-003 @AC-002
Feature: Sincronização multidispositivo offline-first

  Scenario: Alteração local permanece na outbox sem rede
    Given uma nota local e uma rede indisponível
    When a pessoa altera a nota
    Then a alteração é confirmada localmente e entra na outbox durável
    And uma tentativa posterior envia a mesma operação sem duplicá-la
```

#### AC-003 — Pausar por credencial inválida

**Cobre**: US-001, FR-001, FR-002, FR-005, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @FR-001 @FR-002 @FR-005 @NFR-001 @NFR-002 @NFR-003 @AC-003
Feature: Sincronização multidispositivo offline-first

  Scenario: Credencial expirada pausa o envio
    Given uma outbox com operação pendente e uma credencial expirada
    When o coordenador tenta sincronizar
    Then retorna erro discriminado de autenticação
    And preserva a operação sem marcá-la como concluída
```

#### AC-004 — Manter uso anônimo local

**Cobre**: US-001, US-002, FR-001, FR-002, FR-004, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @US-002 @FR-001 @FR-002 @FR-004 @NFR-001 @NFR-002 @NFR-003 @AC-004
Feature: Sincronização multidispositivo offline-first

  Scenario: Nota anônima não é enviada sem autenticação
    Given uma nota pertencente somente à instalação local e nenhuma conta ativa
    When a pessoa consulta ou altera a nota offline
    Then a operação local funciona
    And nenhum payload é enviado ao serviço remoto
```

#### AC-005 — Importar nota anônima com confirmação

**Cobre**: US-002, FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-002, NFR-003

```gherkin
@US-002 @FR-001 @FR-002 @FR-004 @FR-005 @NFR-001 @NFR-002 @NFR-003 @AC-005
Feature: Sincronização multidispositivo offline-first

  Scenario: Importação explícita é confirmada remotamente
    Given uma nota anônima selecionada e uma conta autenticada
    When a pessoa confirma a importação e o serviço confirma a operação
    Then a nota mantém seu id estável e passa a pertencer à conta
    And a cópia anônima pode ser removida somente depois da confirmação
```

#### AC-006 — Preservar nota anônima quando a importação falha

**Cobre**: US-002, FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-003

```gherkin
@US-002 @FR-001 @FR-002 @FR-004 @FR-005 @NFR-001 @NFR-003 @AC-006
Feature: Sincronização multidispositivo offline-first

  Scenario: Falha de rede não perde a nota anônima
    Given uma nota anônima selecionada para importação
    When a confirmação remota falha por indisponibilidade de rede
    Then a nota permanece local e anônima
    And a tentativa fica pendente para nova execução
```

#### AC-007 — Tratar colisão de id na importação

**Cobre**: US-002, US-003, FR-003, FR-004, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-002 @US-003 @FR-003 @FR-004 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-007
Feature: Sincronização multidispositivo offline-first

  Scenario: Id importado já existe na conta
    Given uma nota anônima e uma nota da conta com o mesmo id estável
    When a pessoa tenta importar a nota
    Then a conta preserva a nota existente
    And o sistema cria um conflito explícito sem sobrescrita silenciosa
```

#### AC-008 — Preservar versões concorrentes

**Cobre**: US-001, US-003, FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-001 @US-003 @FR-002 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-008
Feature: Sincronização multidispositivo offline-first

  Scenario: Dois dispositivos alteram a mesma nota
    Given duas revisões válidas da mesma nota produzidas antes da sincronização
    When o serviço detecta a colisão
    Then as duas versões ficam disponíveis para resolução no consumidor
    And nenhuma delas é descartada ou sobrescrita silenciosamente
```

#### AC-009 — Resolver mantendo a versão local

**Cobre**: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-003 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-009
Feature: Sincronização multidispositivo offline-first

  Scenario: Pessoa escolhe manter a versão local
    Given um conflito aberto com versões local e remota
    When a pessoa escolhe manter a versão local
    Then o sistema cria uma nova revisão com o conteúdo local
    And encerra o conflito sem apagar o histórico retido
```

#### AC-010 — Resolver mantendo a versão remota

**Cobre**: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-003 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-010
Feature: Sincronização multidispositivo offline-first

  Scenario: Pessoa escolhe manter a versão remota
    Given um conflito aberto com versões local e remota
    When a pessoa escolhe manter a versão remota
    Then o sistema cria uma nova revisão com o conteúdo remoto
    And encerra o conflito sem sobrescrever a decisão sem registro
```

#### AC-011 — Resolver com versão mesclada

**Cobre**: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-003 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-011
Feature: Sincronização multidispositivo offline-first

  Scenario: Pessoa envia conteúdo mesclado
    Given um conflito aberto e conteúdo mesclado produzido no consumidor
    When a pessoa confirma a versão mesclada
    Then o sistema cria uma nova revisão cifrada
    And encerra o conflito mantendo as revisões anteriores pela retenção
```

#### AC-012 — Aprovar dispositivo por código ou QR

**Cobre**: US-003, FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-003 @FR-002 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-012
Feature: Sincronização multidispositivo offline-first

  Scenario: Dispositivo novo é aprovado por dispositivo confiável
    Given um dispositivo novo com código único ou QR e um dispositivo confiável
    When a pessoa aprova a solicitação explicitamente
    Then o novo dispositivo recebe uma transferência cifrada da chave aplicável
    And a chave privada não é enviada em claro ao servidor
```

#### AC-013 — Revogar dispositivo sem apagar cópia local

**Cobre**: US-003, FR-002, FR-003, FR-005, FR-007, NFR-001, NFR-002, NFR-003

```gherkin
@US-003 @FR-002 @FR-003 @FR-005 @FR-007 @NFR-001 @NFR-002 @NFR-003 @AC-013
Feature: Sincronização multidispositivo offline-first

  Scenario: Dispositivo confiável é revogado
    Given um dispositivo ativo com uma cópia local de notas
    When a pessoa revoga o dispositivo
    Then novas sincronizações e chaves são bloqueadas nesse dispositivo
    And a cópia local permanece disponível offline sem promessa de apagamento
```

#### AC-014 — Tornar perda de chaves irrecuperável

**Cobre**: US-003, FR-003, FR-007, NFR-002, NFR-003

```gherkin
@US-003 @FR-003 @FR-007 @NFR-002 @NFR-003 @AC-014
Feature: Sincronização multidispositivo offline-first

  Scenario: Todos os dispositivos e a recuperação são perdidos
    Given notas cifradas no serviço e nenhum dispositivo confiável ou chave de recuperação
    When a pessoa solicita recuperar o conteúdo
    Then o serviço não consegue descriptografar nem recuperar as notas
    And o sistema informa o estado de chave indisponível sem fabricar conteúdo
```

#### AC-015 — Aplicar tombstone dentro da retenção

**Cobre**: US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @US-003 @FR-001 @FR-005 @FR-007 @NFR-001 @NFR-002 @NFR-003 @AC-015
Feature: Sincronização multidispositivo offline-first

  Scenario: Exclusão chega a dispositivo atrasado dentro de 90 dias
    Given uma nota excluída e seu tombstone ainda retido
    When outro dispositivo sincroniza dentro do prazo
    Then a nota é marcada como excluída localmente
    And nenhuma outbox atrasada recria a nota
```

#### AC-016 — Reconciliar dispositivo atrasado

**Cobre**: US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-003

```gherkin
@US-001 @US-003 @FR-001 @FR-005 @FR-007 @NFR-001 @NFR-003 @AC-016
Feature: Sincronização multidispositivo offline-first

  Scenario: Dispositivo retorna depois de 90 dias
    Given um dispositivo sem cursor válido para tombstones expirados
    When ele tenta enviar uma alteração pendente
    Then o Sync baixa o estado técnico completo antes de aceitar mutações
    And preserva alterações locais concorrentes para resolução explícita
```

#### AC-017 — Respeitar retry, ordem e paralelismo

**Cobre**: US-001, FR-001, FR-005, NFR-001, NFR-003

```gherkin
@US-001 @FR-001 @FR-005 @NFR-001 @NFR-003 @AC-017
Feature: Sincronização multidispositivo offline-first

  Scenario: Outbox aplica retry limitado
    Given operações pendentes de duas notas e falhas transitórias de rede
    When o coordenador executa as tentativas automáticas
    Then cada operação tenta no máximo cinco vezes com backoff, jitter e limite de cinco minutos
    And operações da mesma nota permanecem ordenadas enquanto notas distintas podem executar em paralelo
```

#### AC-018 — Sincronizar metadado de versão bíblica

**Cobre**: US-004, FR-002, FR-006, NFR-001, NFR-003

```gherkin
@US-004 @FR-002 @FR-006 @NFR-001 @NFR-003 @AC-018
Feature: Sincronização multidispositivo offline-first

  Scenario: Destino redownloada uma versão escolhida
    Given uma versão bíblica instalada no primeiro dispositivo e fonte oficial disponível
    When o segundo dispositivo recebe o metadado sincronizado
    Then ele solicita o arquivo à fonte oficial e o instala localmente
    And o Sync não transporta nem armazena o arquivo SQLite
```

#### AC-019 — Manter versão pendente quando a fonte falha

**Cobre**: US-004, FR-002, FR-006, NFR-001, NFR-003

```gherkin
@US-004 @FR-002 @FR-006 @NFR-001 @NFR-003 @AC-019
Feature: Sincronização multidispositivo offline-first

  Scenario: Fonte oficial não entrega a versão
    Given metadado de uma versão sincronizada e fonte oficial indisponível
    When o destino tenta redownloadar a versão
    Then mantém a preferência com estado pendente e erro discriminado
    And permite nova tentativa sem remover o metadado
```

#### AC-020 — Aplicar quota e auditoria sem conteúdo

**Cobre**: US-001, FR-001, FR-005, NFR-003

```gherkin
@US-001 @FR-001 @FR-005 @NFR-003 @AC-020
Feature: Sincronização multidispositivo offline-first

  Scenario: Conta ultrapassa volume ou tamanho permitido
    Given uma conta com 1000 notas ou 20 MB cifrados já sincronizados
    When uma nova operação excede a quota
    Then o serviço rejeita a operação com erro de quota sem perder a outbox local
    And a auditoria registra somente contagem, latência, retry e código de erro
```

#### AC-021 — Excluir dados remotos após exclusão da conta

**Cobre**: US-001, US-003, FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003

```gherkin
@US-001 @US-003 @FR-002 @FR-003 @FR-005 @FR-007 @NFR-002 @NFR-003 @AC-021
Feature: Sincronização multidispositivo offline-first

  Scenario: Conta é excluída
    Given dados remotos da conta e cópias locais em dispositivos
    When a exclusão da conta é confirmada pelo serviço de autenticação
    Then o serviço agenda a remoção dos dados remotos em até 30 dias
    And não apresenta essa remoção como apagamento automático das cópias locais
```

#### AC-022 — Isolar Better Auth do contrato Sync

**Cobre**: US-001, US-002, US-003, US-004, FR-002, FR-007, NFR-001, NFR-002, NFR-003

```gherkin
@US-001 @US-002 @US-003 @US-004 @FR-002 @FR-007 @NFR-001 @NFR-002 @NFR-003 @AC-022
Feature: Sincronização multidispositivo offline-first

  Scenario: API deriva conta da sessão Better Auth
    Given uma requisição autenticada por uma sessão Better Auth válida
    When a API valida a sessão no boundary do consumidor
    Then deriva o accountId server-side e fornece ao Sync somente o contrato portável
    And o pacote Sync não importa Better Auth nem aceita accountId arbitrário do cliente
```

#### AC-023 — Repetir sincronização de versão instalada

**Cobre**: US-004, FR-002, FR-006, NFR-001, NFR-003

```gherkin
@US-004 @FR-002 @FR-006 @NFR-001 @NFR-003 @AC-023
Feature: Sincronização multidispositivo offline-first

  Scenario: Destino já possui a versão
    Given o destino já instalou a versão bíblica indicada pelo metadado
    When o mesmo metadado é recebido novamente
    Then o registry local permanece idempotente
    And nenhum arquivo SQLite é enviado ao serviço Sync
```

### 7. Requisitos

#### Funcionais

- **FR-001**: O coordenador deve confirmar a mutação de nota e sua operação de
  outbox de forma durável antes de reportar sucesso; cada operação deve possuir
  `operationId`, nota, ação, revisão, ordem, tentativas e estado mínimo de
  retomada, removendo o payload somente após confirmação remota.
- **FR-002**: O Sync deve exigir uma conta autenticada para sincronização remota,
  receber `accountId` e credencial por port, pausar com erro discriminado quando
  a credencial estiver ausente, expirada ou revogada e nunca confiar em um
  `accountId` arbitrário enviado pelo cliente; o consumer/API deve derivá-lo da
  sessão Better Auth validada server-side.
- **FR-003**: O Sync deve enviar e receber revisões de notas como envelopes
  cifrados, detectar concorrência, expor ambas as versões ao consumidor e criar
  uma nova revisão ao resolver por local, remoto ou mesclado, sem sobrescrita
  silenciosa.
- **FR-004**: O consumidor deve oferecer importação explícita de notas anônimas,
  preservar o `id` estável, manter a cópia local até confirmação remota e tratar
  colisão com uma nota da conta como conflito sem substituir a existente.
- **FR-005**: O Sync deve propagar exclusões por tombstones de 90 dias, exigir
  reconciliação completa para dispositivo além do prazo, aplicar retry limitado
  com ordem por nota, manter operações independentes paralelas e excluir dados
  remotos da conta em até 30 dias após sua exclusão, preservando cópias locais.
- **FR-006**: O Sync deve sincronizar somente metadados de versões bíblicas,
  manter o estado disponível ou pendente e deixar o consumidor redownloadar o
  arquivo da fonte oficial, sem transportar ou armazenar o SQLite no Sync.
- **FR-007**: O consumidor e o Sync devem permitir ingresso explícito de
  dispositivos por código ou QR, transferência cifrada de chave sem chave
  privada em claro no servidor, revogação que bloqueia novas chaves e rotação
  para os dispositivos restantes; perda total de chaves deve permanecer
  irrecuperável pelo serviço.

#### Não funcionais

- **NFR-001**: Todas as mutações e consultas locais devem concluir sem rede e sem
  Better Auth; uma execução remota deve ser opcional e retomável. **Verificação**:
  testes com rede, credencial e remote fake indisponíveis, mais teste
  arquitetural de imports do core.
- **NFR-002**: Nenhum conteúdo ou contexto de nota, chave privada ou dado de
  auditoria em claro pode cruzar o boundary remoto; autorização deve ser
  associada à conta derivada da sessão validada. **Verificação**: testes de
  payload e logs, inspeção de serialização e teste de revogação/chave.
- **NFR-003**: O sistema deve respeitar quota de 1.000 notas ou 20 MB cifrados,
  no máximo cinco tentativas com backoff de 1s/2s/4s/8s/16s, jitter e limite de
  cinco minutos, ordem por nota, paralelismo entre notas e auditoria sem
  conteúdo. **Verificação**: testes de limites, relógio controlado, concorrência,
  idempotência, latência e contagem de eventos.

#### Erros e casos-limite

- `auth_required`, `credential_expired` ou `credential_revoked` → pausar a
  sincronização, preservar a outbox e solicitar nova autenticação.
- `network_unavailable` ou `remote_unavailable` → confirmar somente o estado
  local já persistido e deixar a operação pendente para retry.
- `conflict_detected` ou `identity_collision` → preservar todas as revisões e
  exigir resolução explícita.
- `key_unavailable` ou `device_revoked` → bloquear envio, recebimento de chave e
  descriptografia sem apagar a cópia local.
- `reconciliation_required` → baixar estado técnico completo antes de aceitar
  mutações de dispositivo atrasado.
- `version_source_unavailable` → manter metadado como pendente e permitir novo
  redownload.
- `quota_exceeded` → rejeitar a mutação remota sem remover a operação local.
- `local_storage_unavailable` → não confirmar mutação nem criar outbox parcial.
- `operation_duplicate` → devolver o resultado idempotente já confirmado, sem
  aplicar uma segunda mutação.
- `invalid_cursor` → iniciar reconciliação completa, sem enviar a outbox antes
  da comparação local.

## Ato II — Projetar e provar

### 8. Plano técnico

#### Contexto existente

O monorepo usa pnpm 10, Turborepo 2, TypeScript strict ESM, Vitest e ESLint.
`engine-core` e `engine` são portáveis e não podem receber dependência de rede,
SQLite, DOM ou React. `personal-study-core` e `personal-study` já fornecem o
contrato local de notas. `apps/consumer-web` usa Next.js 15 App Router, React 19,
Tailwind 4 e testes Vitest/Playwright, mas esta fatia não cria interface.

Better Auth 1.7.2 será instalado somente na camada server-side do consumidor/API.
O Sync receberá dados simples por ports e não importará Better Auth. A integração
Turso/libSQL usará `@libsql/kysely-libsql` como adapter Kysely comunitário, se a
validação de migration, transação e concorrência passar no Ato II.

#### Arquitetura e módulos

- `packages/sync-core/` será o domínio portátil com `SyncAccountId`,
  `SyncDevice`, `EncryptedNoteEnvelope`, `SyncRevision`, `SyncConflict`,
  `SyncTombstone`, `BibleVersionPreference`, `SyncOperation` e erros
  discriminados. Não terá dependências de runtime.
- `packages/sync/` será a camada de casos de uso com `createSync`, coordenador
  local, importação, pull, push, reconciliação, resolução e políticas de retry.
  Dependerá apenas de `sync-core` e ports.
- `packages/adapter-sync-turso/` será o adapter server-side Node para o remote
  Sync, usando Kysely e `LibsqlDialect`; receberá a identidade já autorizada
  pelo API boundary e nunca validará login por conta própria.
- `packages/sync-testing/` fornecerá stores e remote fakes determinísticos para
  contract tests, relógio controlado, falhas de rede, duplicação e concorrência.
- `apps/consumer-web/src/lib/auth.ts` concentrará a configuração Better Auth e
  `apps/consumer-web/src/app/api/auth/[...all]/route.ts` montará o handler
  oficial do Next.js. Essa integração será server-only e não entrará no core.
- `apps/consumer-web/src/app/api/sync/v1/` conterá handlers versionados de
  push, pull, reconcile, devices e account-delete. Cada handler validará a
  sessão Better Auth, derivará `accountId` e delegará ao package Sync.
- A persistência local será fornecida por um adapter do consumidor através de
  `SyncLocalStore`; o pacote não escolhe IndexedDB, OPFS ou SQLite e não cria
  fallback em memória.
- O bridge de Scripture Library consumirá `BibleVersionPreference` e chamará o
  `packageSource` oficial do consumidor para redownload, sem passar bytes pelo
  remote Sync.

#### Migrations

- A migration da conta Better Auth será gerada/aplicada no namespace de
  autenticação e poderá incluir a tabela de Device Authorization do plugin; ela
  não será misturada às tabelas do Sync.
- O adapter remoto terá migration versionada própria para dispositivos, notas
  cifradas, revisões, tombstones, operações técnicas e preferências de versões.
  A ordem será schema base → índices de conta/nota/cursor → retenção e jobs.
- Migrations devem ser idempotentes, executadas antes dos handlers e ter
  rollback documentado para falha de aplicação. O schema deve ser validado no
  Turso real antes do Plan Gate.
- A exclusão de conta dispara um job remoto idempotente com prazo máximo de 30
  dias; durante a retenção, conflitos resolvidos permanecem por 30 dias e
  tombstones por 90 dias.

#### Models

- `SyncDevice`: `deviceId`, `accountId`, apelido, chave pública, fingerprint,
  `authorizedAt`, `lastSyncAt`, estado `pending|active|revoked` e `keyVersion`.
  A chave privada nunca é um atributo remoto.
- `EncryptedNoteRecord`: `accountId`, `noteId`, revisão atual, envelope cifrado,
  dispositivo de origem, estado `active|deleted|conflicted` e timestamps
  técnicos; título, referência e datas da nota ficam dentro do envelope.
- `EncryptedNoteRevision`: `revisionId`, `noteId`, `deviceId`, envelope,
  `createdAt`, estado `conflict|resolved` e referência opaca da revisão final.
- `SyncOperation`: `operationId`, `accountId`, `deviceId`, `noteId`, ação
  `create|update|delete|import`, revisão, sequência por nota, tentativas, estado,
  último erro, próximo retry e payload opcional local.
- `SyncTombstone`: `noteId`, conta, revisão de exclusão, origem, criado em e
  expiração em 90 dias; não contém conteúdo de nota.
- `BibleVersionPreference`: `accountId`, `versionId`, nome, `versionCode`,
  instalação, referência oficial e estado `available|pending`; nunca contém
  bytes SQLite.
- `DeviceKeyEnvelope`: dispositivo destino, versão da chave, origem autorizada,
  envelope cifrado e timestamps; não contém chave privada em claro.
- `SyncAccountBinding`: projeção do `userId` Better Auth para `accountId` opaco
  usado no Sync; o Sync não persiste credenciais nem senha.

#### Controllers e casos de uso

- `createSync({ localStore, remote, credentials, keyManager, clock })` expõe
  mutações locais, `syncNow`, `getPending`, `pull`, `reconcile`, `importNotes`,
  `resolveConflict`, `listDevices`, `approveDevice`, `revokeDevice` e
  `listBiblePreferences`.
- `SyncCredentials` contém `accountId`, credencial opaca e `expiresAt`; o
  coordenador não interpreta token nem consulta Better Auth.
- O handler `POST /api/sync/v1/push` valida a sessão no server boundary, recebe
  lote cifrado e chave de idempotência e responde acks, conflitos, quota ou erro.
- O handler `GET /api/sync/v1/pull?cursor=` devolve mudanças técnicas e
  envelopes cifrados, com cursor seguinte; não devolve conteúdo em claro.
- O handler `POST /api/sync/v1/reconcile` devolve snapshot técnico completo
  quando o cursor expirou, antes de aceitar nova mutação.
- `POST /api/sync/v1/devices/approve` e `/revoke` recebem somente prova cifrada
  e intenção autorizada; o servidor não manipula chave privada.
- `POST /api/sync/v1/account-delete` é chamado pelo fluxo de exclusão da conta,
  cria job idempotente de retenção e não toca em storage local.

#### Views e experiência

Não aplicável nesta fatia. Não há tela de login, lista de dispositivos, fila,
conflito ou redownload. Consumidores futuros deverão criar as interfaces e
informar estados de carregamento, vazio, erro, sucesso, autenticação pendente,
conflito e chave indisponível sem alterar os contratos desta spec.

#### Queries e repositórios

- O remote repository deve filtrar sempre por `accountId` derivado server-side e
  usar índices por `(account_id, note_id)`, `(account_id, cursor)`,
  `(account_id, expires_at)` e `(account_id, device_id)`.
- `push` consulta `operationId` antes de aplicar a mutação e devolve o ack
  anterior quando a operação já foi confirmada.
- `pull` retorna mudanças posteriores ao cursor, ordenadas por cursor estável;
  cursor inválido ou expirado devolve `reconciliation_required`.
- `reconcile` retorna apenas o conjunto técnico e os envelopes cifrados da conta;
  o merge e a preservação das alterações locais acontecem no consumidor.
- Limpeza periódica remove tombstones vencidos, conflitos resolvidos após 30
  dias e dados de conta excluída conforme o job de até 30 dias.

#### Jobs e processamento assíncrono

- O coordenador local agenda retry com backoff 1s/2s/4s/8s/16s, jitter e teto
  total de cinco minutos; depois de cinco falhas automáticas marca a operação
  pendente com erro recuperável para ação posterior.
- Operações da mesma nota usam sequência estrita; operações de notas distintas
  podem executar em paralelo com limite configurável pelo adapter.
- Conflito e erro de autenticação interrompem somente a operação dependente e
  preservam a outbox; falha de outra nota não bloqueia o lote independente.
- O remote job de retenção é idempotente, auditável por contagem e código e não
  registra conteúdo, título, referência, datas ou chaves.

#### Estrutura de arquivos

```text
packages/sync-core/
  src/types.ts
  src/errors.ts
  src/index.ts
packages/sync/
  src/ports.ts
  src/sync.ts
  src/index.ts
packages/adapter-sync-turso/
  src/schema.ts
  src/adapter.ts
  src/index.ts
packages/sync-testing/
  src/fakes.ts
apps/consumer-web/src/lib/auth.ts
apps/consumer-web/src/app/api/auth/[...all]/route.ts
apps/consumer-web/src/app/api/sync/v1/
tests/arch/sync-boundary.test.ts
```

### 9. Modelo de dados

#### Entidades

| Entidade | Identidade | Atributos e regras | Relações |
| --- | --- | --- | --- |
| `SyncAccountBinding` | `accountId` opaco | projeção de sessão Better Auth; sem senha, token persistente ou conteúdo | 1 conta possui muitos dispositivos, notas, operações e preferências |
| `SyncDevice` | `deviceId` | apelido, chave pública, fingerprint, estado, datas e versão de chave; revogado não sincroniza | pertence a uma conta; origina revisões e operações |
| `EncryptedNoteRecord` | `accountId + noteId` | envelope cifrado, revisão atual, estado ativo/deleted/conflicted; contexto fica cifrado | pertence a uma conta; possui revisões, operações e tombstone opcional |
| `EncryptedNoteRevision` | `revisionId` | envelope, origem, ordem, estado e revisão final opaca | pertence a uma nota e a um dispositivo |
| `SyncOperation` | `operationId` | ação, sequência por nota, tentativas, estado, erro e cursor; payload removido após ack | pertence a conta/dispositivo/nota; é aplicada no máximo uma vez |
| `SyncTombstone` | `accountId + noteId` | revisão de exclusão, cursor e expiração em 90 dias; sem conteúdo | impede reaparecimento de uma nota excluída |
| `BibleVersionPreference` | `accountId + versionId` | nome, código, origem oficial, instalação e estado available/pending; sem SQLite | pertence a conta e é projetada no registry local do destino |
| `DeviceKeyEnvelope` | `deviceId + keyVersion` | envelope cifrado de chave, origem aprovada e fingerprint; sem chave privada em claro | liga uma chave de notas a dispositivos ativos |

#### Estados e transições

| Entidade | Estado atual | Evento | Próximo estado | Invariantes |
| --- | --- | --- | --- | --- |
| `SyncOperation` | `queued` | tentativa iniciada | `sending` | outbox local permanece durável |
| `SyncOperation` | `sending` | ack remoto | `acked` | payload é removido, idempotência mínima permanece |
| `SyncOperation` | `sending` | rede/autenticação | `pending` ou `paused_auth` | não é concluída nem perdida |
| `SyncOperation` | `sending` | colisão | `conflict` | revisões concorrentes são preservadas |
| `EncryptedNoteRecord` | `active` | exclusão confirmada | `deleted` | tombstone impede reaparecimento por 90 dias |
| `EncryptedNoteRecord` | `active` | alterações concorrentes | `conflicted` | nenhuma revisão é sobrescrita silenciosamente |
| `EncryptedNoteRecord` | `conflicted` | resolução explícita | `active` | sempre cria nova revisão final |
| `SyncDevice` | `pending` | aprovação cifrada | `active` | ingresso exige aprovação explícita |
| `SyncDevice` | `active` | revogação | `revoked` | não recebe chaves nem sincroniza novamente |
| `BibleVersionPreference` | `available` | fonte falha no destino | `pending` | escolha não é removida |
| `BibleVersionPreference` | `pending` | redownload validado | `available` | arquivo é obtido pela fonte oficial |

#### Migração e retenção

O schema remoto será criado por migration versionada separada do schema Better
Auth. `SyncTombstone` dura exatamente 90 dias; revisão de conflito resolvido dura
30 dias; dados remotos de conta excluída são apagados em até 30 dias. A outbox
local remove o payload após ack e mantém apenas checkpoint, cursor e estado
mínimo de idempotência. A cópia de nota, chave ou Bíblia no dispositivo local
segue o ciclo de vida do consumidor e não é removida por limpeza remota.

### 10. Interfaces e contratos

#### Interface para pessoas

- **Há interface para pessoas**: Não. A primeira entrega é um bounded context
  headless para consumidores; autenticação visual, aprovação, conflitos e
  estados de redownload serão desenhados em fatias de interface próprias.

#### Stack e convenções de interface

Não aplicável. A stack observada é Next.js 15 App Router, React 19, Tailwind 4,
shadcn/ui local e Vitest/Playwright no consumer web, mas nenhuma tela é criada ou
alterada por esta spec.

#### Telas e responsabilidades

Não aplicável. Não existem telas nesta primeira entrega.

#### Fluxo de informação e navegação

Não aplicável. Não existe fluxo visual; os consumidores recebem estados e erros
serializáveis para compor fluxos futuros.

#### Menus e navegação principal

Não aplicável. Nenhum menu, rota visual ou Breadcrumb é criado.

#### Formulários e ações

Não aplicável. Formulários de login, importação, aprovação e resolução ficam fora
da primeira entrega.

#### Composição e disposição

Não aplicável. Nenhuma composição de tela é alterada.

#### Blocos React e componentes selecionados

Não aplicável. Nenhum bloco React, primitive shadcn/ui ou composição ReUI é
necessário para contratos e adapters headless.

#### Estados e acessibilidade

Não aplicável para esta entrega. Os estados de domínio e erros devem ser
serializáveis para que consumidores futuros possam implementar loading, vazio,
erro, sucesso, permissão, foco e teclado de acordo com suas próprias telas.

#### APIs expostas

- `createSync({ localStore, remote, credentials, keyManager, clock })` → fachada
  de casos de uso; não expõe SQL, conexão ou SDK de autenticação.
- `SyncLocalStore` → operações locais atômicas para nota, outbox, revisão,
  tombstone, preferência e checkpoint; falha não confirma mutação.
- `SyncRemote` → `push`, `pull`, `reconcile`, `approveDevice`, `revokeDevice`,
  `deleteAccountData`; recebe valores opacos e envelopes cifrados.
- `POST /api/auth/[...all]` → handler Better Auth no consumer web; autenticação,
  login e renovação, com sessão protegida pelo servidor.
- `POST /api/sync/v1/push` → lote de operações cifradas; requer sessão válida e
  chave de idempotência; responde acks, conflitos, quota ou erro.
- `GET /api/sync/v1/pull?cursor=<cursor>` → mudanças posteriores ao cursor,
  envelopes cifrados e próximo cursor; conta é derivada da sessão.
- `POST /api/sync/v1/reconcile` → snapshot técnico completo para cursor expirado.
- `POST /api/sync/v1/devices/approve|revoke` → operações explícitas de
  dispositivo; não transportam chave privada em claro.

#### APIs externas utilizadas

- Better Auth 1.7.2, server-side, para contas, sessões, revogação, Device
  Authorization e eventual Bearer; timeout e retry pertencem ao cliente de
  autenticação, sem fallback de identidade no Sync.
- Turso/libSQL por `@libsql/kysely-libsql` 0.4.1 no adapter remoto; conexão
  HTTPS/WebSocket, token em segredo de runtime, migrations versionadas e retry
  idempotente. Falha remota não bloqueia operações locais.
- Fonte oficial de pacotes bíblicos via `BiblePackageSource` do consumidor; o
  Sync passa somente metadados e não transporta bytes SQLite.

#### Documentação das APIs consultadas

- Better Auth Next.js integration — handler `toNextJsHandler`, cliente e sessão
  server-side — `https://better-auth.com/docs/integrations/next`, acessada em
  2026-08-29.
- Better Auth Device Authorization — código, aprovação, polling, HTTPS e
  proteção contra phishing — `https://better-auth.com/docs/plugins/device-authorization`,
  acessada em 2026-08-29.
- Better Auth Session Management, Multi Session e Bearer — sessão, revogação e
  credencial de API — documentação oficial, acessada em 2026-08-29.
- Better Auth Other Relational Databases e `@libsql/kysely-libsql` — dialeto
  Kysely comunitário e conexão libSQL — acessados em 2026-08-29.

#### Eventos e outros contratos

- `SyncStatusChanged`: `accountId`, `deviceId`, estado, pendências, último erro
  e timestamp; não contém nota, título, referência, data da nota ou chave.
- `SyncConflictDetected`: `noteId`, `conflictId`, revisões opacas e estado;
  consumidor usa os envelopes descriptografados localmente para decidir.
- `SyncDeviceRevoked`: `deviceId`, nova `keyVersion`, estado e timestamp;
  consumidores invalidam a chave local e solicitam rotação aos dispositivos
  restantes.
- `BibleVersionStatusChanged`: `versionId`, estado `available|pending`, código
  de erro e origem; não transporta arquivo.
- `SyncRemoteAck`: `operationId`, cursor, estado e erro opcional; permite limpar
  payload sem remover idempotência mínima.

### 11. Estratégia TDD

- **Unidade**: validar estados, IDs, sequência por nota, erros, quotas,
  envelopes, transições de conflito/dispositivo e retenção usando relógio
  controlado em `sync-core`.
- **Integração/contrato**: executar `createSync` contra local store e remote
  fakes, depois contra adapter Turso/libSQL de teste; testar Better Auth somente
  no boundary HTTP do consumer, nunca dentro do core.
- **BDD/aceite**: os cenários `AC-001` a `AC-023` orientam os testes; não serão
  criados arquivos `.feature`.
- **Runner TDD**: Vitest, já confirmado pela stack, pelos scripts existentes e
  pelas regras do projeto.
- **E2E**: não aplicável para a primeira fatia sem interface; handlers HTTP terão
  testes de contrato e consumers futuros terão E2E de suas telas.
- **Verificação manual**: não necessária para o package; uma inspeção manual de
  configuração de segredo, origem confiável e deployment será exigida antes de
  produção, sem registrar credenciais.

#### Evidência RED-GREEN-REFACTOR

| IDs | BDD de referência | Teste TDD informado pelo BDD | RED observado | GREEN observado | Refactor/regressão |
| --- | --- | --- | --- | --- | --- |
| US-001, FR-001, FR-002, FR-003, FR-005, NFR-001, NFR-002, NFR-003, AC-001 | AC-001 | `packages/sync/src/__tests__/sync.test.ts`, caso de push/pull com marcador `SPECSFY: US-001 FR-001 FR-002 FR-003 FR-005 NFR-001 NFR-002 NFR-003 AC-001` | RED — `pnpm exec vitest run packages/sync/src/__tests__/sync.test.ts --config /dev/null --reporter=verbose` falhou com `sync_not_implemented` em `packages/sync/src/index.ts:2`; o teste executou 1 caso e falhou pela ausência do coordenador | GREEN — `pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose` passou com 3 testes; o ack `op-1` foi aplicado com `cursor-1` | Pending |
| US-001, FR-001, FR-005, NFR-001, NFR-003, AC-002 | AC-002 | `packages/sync/src/__tests__/outbox.test.ts`, caso de fila offline com marcador `SPECSFY: US-001 FR-001 FR-005 NFR-001 NFR-003 AC-002` | RED — `pnpm exec vitest run packages/sync/src/__tests__/outbox.test.ts --config /dev/null --reporter=verbose` falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6`; o caso executou e falhou pela ausência do coordenador | GREEN — mesma execução focal de `AC-001` passou e retornou estado serializável `offline` sem rede | Pending |
| US-001, US-002, FR-001, FR-002, FR-004, NFR-001, NFR-002, NFR-003, AC-004 | AC-004 | `packages/sync/src/__tests__/offline.test.ts`, mutação anônima com marcador `SPECSFY: US-001 US-002 FR-001 FR-002 FR-004 NFR-001 NFR-002 NFR-003 AC-004` | RED — Pending; o comportamento já estava presente no coordenador implementado em T012, então o teste de caracterização passou antes de nova produção | GREEN — `pnpm exec vitest run src/__tests__/offline.test.ts --config vitest.config.ts --reporter=verbose` passou com outbox preservada e zero chamada a `remote.push` | Pending |
| US-001, FR-001, FR-002, FR-005, NFR-001, NFR-002, NFR-003, AC-003 | AC-003 | `packages/sync/src/__tests__/auth-state.test.ts`, caso de credencial expirada com marcador `SPECSFY: US-001 FR-001 FR-002 FR-005 NFR-001 NFR-002 NFR-003 AC-003` | RED — `pnpm exec vitest run src/__tests__/auth-state.test.ts --config vitest.config.ts --reporter=verbose` falhou porque `syncNow` lançava `credential_expired` antes de retornar `paused_auth` | GREEN — o mesmo comando passou após o coordenador converter credencial expirada em estado `paused_auth`, preservando a operação e sem chamar `push` | Pending |
| US-002, FR-001, FR-004, FR-005, NFR-001, NFR-002, AC-005 | AC-005 | `packages/sync/src/__tests__/import.test.ts`, caso de importação confirmada com marcador `SPECSFY: US-002 FR-001 FR-002 FR-004 FR-005 NFR-001 NFR-002 NFR-003 AC-005` | RED — `pnpm exec vitest run packages/sync/src/__tests__/import.test.ts --config /dev/null --reporter=verbose` falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6`; o caso executou e falhou pela ausência do coordenador | GREEN — `pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose` passou com lote enviado, ID `anonymous-note-1` preservado, pendência presente enquanto o remote aguardava confirmação e remoção após o ack | Pending |
| US-002, FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-003, AC-006 | AC-006 | `packages/sync/src/__tests__/import.test.ts`, caso de falha recuperável com marcador `SPECSFY: US-002 FR-001 FR-002 FR-004 FR-005 NFR-001 NFR-003 AC-006` | RED — Pending; o comportamento de preservar a operação já estava presente no coordenador implementado em T012, portanto não foi criada uma falha artificial de produção | GREEN — `pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose` passou com estado `remote_error`, `network_unavailable`, pendência preservada e retry posterior usando o mesmo operationId | Pending |
| US-002, US-003, FR-003, FR-004, FR-005, FR-007, NFR-002, AC-007 | AC-007 | `packages/sync/src/__tests__/import.test.ts`, caso de colisão de id com marcador `SPECSFY: US-002 US-003 FR-003 FR-004 FR-005 FR-007 NFR-002 NFR-003 AC-007` | RED — `pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose` executou 4 casos e falhou porque `syncNow` não propagava `SyncPushResult.conflicts` nem aplicava o conflito ao store | GREEN — a mesma execução passou após o coordenador propagar conflitos e aplicar o registro técnico no store; o cursor e as duas revisões permanecem opacos | Regressão pendente na suite completa |
| US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-008 | AC-008 | `packages/sync/src/__tests__/conflict.test.ts`, caso de concorrência com marcador `SPECSFY: US-001 US-003 FR-002 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-008` | RED — `pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose` executou 5 casos; os placeholders de status passaram após alinhamento ao contrato e o caso materializado falhou porque o coordenador não detectava nem expunha o conflito entre `revision-a` e `revision-b` | GREEN — a mesma execução passou após detecção determinística por nota, aplicação das duas revisões e registro técnico do conflito aberto | Regressão pendente na suite completa |
| US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-009 | AC-009 | `packages/sync/src/__tests__/conflict.test.ts`, caso de escolha local com marcador `SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-009` | RED — o teste inicial falhou com `sync_not_implemented` antes de existir o coordenador | GREEN — `pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose` passou delegando a escolha local ao store sem apagar revisões anteriores | Pending |
| US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-010 | AC-010 | `packages/sync/src/__tests__/conflict.test.ts`, caso de escolha remota com marcador `SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-010` | RED — o teste inicial falhou com `sync_not_implemented` antes de existir o coordenador | GREEN — a mesma execução passou delegando a escolha da revisão remota como identidade opaca | Pending |
| US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-011 | AC-011 | `packages/sync/src/__tests__/conflict.test.ts`, caso de merge produzido no consumidor com marcador `SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-011` | RED — o teste inicial falhou com `sync_not_implemented` antes de existir o coordenador | GREEN — a mesma execução passou encaminhando apenas o `merged-revision-1` opaco e mantendo o merge no consumidor | Pending |
| US-003, FR-003, FR-007, NFR-002, AC-012 | AC-012 | `packages/sync/src/__tests__/device-keys.test.ts`, caso de aprovação cifrada com marcador `SPECSFY: US-003 FR-003 FR-007 NFR-002 AC-012` | RED — `pnpm exec vitest run packages/sync/src/__tests__/device-keys.test.ts --config /dev/null --reporter=verbose` executou 3 casos e falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6` | Pending | Pending |
| US-003, FR-002, FR-003, FR-005, FR-007, NFR-001, NFR-002, NFR-003, AC-013 | AC-013 | `packages/sync/src/__tests__/device-keys.test.ts`, caso de revogação com marcador `SPECSFY: US-003 FR-002 FR-003 FR-005 FR-007 NFR-001 NFR-002 NFR-003 AC-013` | RED — mesmo comando de `AC-012`; o caso falhou com `sync_not_implemented` antes de bloquear o dispositivo | Pending | Pending |
| US-003, FR-003, FR-007, NFR-002, NFR-003, AC-014 | AC-014 | `packages/sync/src/__tests__/device-keys.test.ts`, caso de chave indisponível com marcador `SPECSFY: US-003 FR-003 FR-007 NFR-002 NFR-003 AC-014` | RED — mesmo comando de `AC-012`; o caso falhou com `sync_not_implemented` antes de fabricar recuperação | Pending | Pending |
| US-003, FR-001, FR-005, FR-007, NFR-001, NFR-003, AC-015 | AC-015 | `packages/sync/src/__tests__/reconcile.test.ts`, caso de tombstone com marcador `SPECSFY: US-001 US-003 FR-001 FR-005 FR-007 NFR-001 NFR-002 NFR-003 AC-015` | RED — `pnpm exec vitest run packages/sync/src/__tests__/reconcile.test.ts --config /dev/null --reporter=verbose` executou 2 casos e falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6` | Pending | Pending |
| US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-003, AC-016 | AC-016 | `packages/sync/src/__tests__/reconcile.test.ts`, caso de cursor expirado com marcador `SPECSFY: US-001 US-003 FR-001 FR-005 FR-007 NFR-001 NFR-003 AC-016` | RED — mesmo comando de `AC-015`; o caso falhou com `sync_not_implemented` antes do snapshot técnico | Pending | Pending |
| US-004, FR-002, FR-006, NFR-001, NFR-003, AC-018 | AC-018 | `packages/sync/src/__tests__/bible-preferences.test.ts`, caso de redownload com marcador `SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-018` | RED — `pnpm exec vitest run packages/sync/src/__tests__/bible-preferences.test.ts --config /dev/null --reporter=verbose` executou 3 casos e falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6` | Pending | Pending |
| US-004, FR-002, FR-006, NFR-001, NFR-003, AC-019 | AC-019 | `packages/sync/src/__tests__/bible-preferences.test.ts`, caso de fonte indisponível com marcador `SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-019` | RED — mesmo comando de `AC-018`; o caso falhou com `sync_not_implemented` antes de preservar o estado pendente | Pending | Pending |
| US-004, FR-002, FR-006, NFR-001, NFR-003, AC-023 | AC-023 | `packages/sync/src/__tests__/bible-preferences.test.ts`, caso de versão instalada com marcador `SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-023` | RED — mesmo comando de `AC-018`; o caso falhou com `sync_not_implemented` antes de enviar bytes | Pending | Pending |
| US-001, FR-001, FR-005, NFR-001, NFR-003, AC-017 | AC-017 | `packages/sync/src/__tests__/limits.test.ts`, caso de retry com marcador `SPECSFY: US-001 FR-001 FR-005 NFR-001 NFR-003 AC-017` | RED — `pnpm exec vitest run packages/sync/src/__tests__/limits.test.ts --config /dev/null --reporter=verbose` executou 2 casos e falhou com `sync_not_implemented` em `packages/sync/src/index.ts:6` | Pending | Pending |
| US-001, FR-001, FR-005, NFR-003, AC-020 | AC-020 | `packages/sync/src/__tests__/limits.test.ts`, caso de quota com marcador `SPECSFY: US-001 FR-001 FR-005 NFR-003 AC-020` | RED — mesmo comando de `AC-017`; o caso falhou com `sync_not_implemented` antes de aceitar a quota | Pending | Pending |
| US-001, US-002, US-003, US-004, FR-002, FR-007, NFR-001, NFR-002, NFR-003, AC-022 | AC-022 | `apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts`, caso de sessão Better Auth com marcador `SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 NFR-003 AC-022` | RED — `pnpm exec vitest run apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts --config /dev/null --reporter=verbose` falhou porque a rota server-side ainda não existe; o caso observou `existsSync(route) === false` | Pending | Pending |

### 12. Plano de testes e rastreabilidade

| Requisito | Cenário BDD | Nível | Arquivo/comando esperado | Evidência |
| --- | --- | --- | --- | --- |
| FR-001 | AC-001, AC-002, AC-003 | Unidade/contrato | `packages/sync/src/__tests__/outbox.test.ts` | Passed — `@openbible/sync` regression |
| FR-001 | AC-004, AC-005, AC-015 | Unidade/contrato | `packages/sync/src/__tests__/import.test.ts` e `reconcile.test.ts` | Passed — `@openbible/sync` regression |
| FR-001 | AC-016, AC-017, AC-020 | Integração | `packages/sync/src/__tests__/outbox.test.ts` | Passed — `@openbible/sync` regression |
| FR-002 | AC-001, AC-003, AC-004 | Unidade/contrato | `packages/sync/src/__tests__/auth-state.test.ts` | Passed — `@openbible/sync` regression |
| FR-002 | AC-005, AC-008, AC-012 | API/contrato | `apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts` | Passed — consumer boundary regression |
| FR-002 | AC-018, AC-019, AC-022 | API/contrato | `apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts` | Passed — consumer boundary regression |
| FR-003 | AC-001, AC-007, AC-008 | Unidade/contrato | `packages/sync/src/__tests__/conflict.test.ts` | Passed — `@openbible/sync` regression |
| FR-003 | AC-009, AC-010, AC-011 | Unidade/contrato | `packages/sync/src/__tests__/conflict.test.ts` | Passed — `@openbible/sync` regression |
| FR-003 | AC-012, AC-013, AC-014 | Segurança/contrato | `packages/sync/src/__tests__/device-keys.test.ts` | Passed — `@openbible/sync` regression |
| FR-004 | AC-004, AC-005, AC-006 | Unidade/contrato | `packages/sync/src/__tests__/import.test.ts` | Passed — `@openbible/sync` regression |
| FR-004 | AC-007, AC-008, AC-022 | Unidade/contrato | `packages/sync/src/__tests__/import.test.ts` | Passed — `@openbible/sync` regression |
| FR-004 | AC-005, AC-006, AC-007 | Integração | `packages/sync/src/__tests__/import.test.ts` | Passed — `@openbible/sync` regression |
| FR-005 | AC-001, AC-002, AC-003 | Unidade/contrato | `packages/sync/src/__tests__/outbox.test.ts` | Passed — `@openbible/sync` regression |
| FR-005 | AC-005, AC-006, AC-015 | Integração | `packages/sync/src/__tests__/reconcile.test.ts` | Passed — `@openbible/sync` regression |
| FR-005 | AC-016, AC-017, AC-020 | Integração | `packages/adapter-sync-turso/src/__tests__/adapter.test.ts` | Passed — adapter regression |
| FR-006 | AC-018, AC-019, AC-023 | Unidade/contrato | `packages/sync/src/__tests__/bible-preferences.test.ts` | Passed — `@openbible/sync` regression |
| FR-006 | AC-018, AC-019, AC-023 | Integração | `packages/sync/src/__tests__/bible-preferences.test.ts` | Passed — `@openbible/sync` regression |
| FR-006 | AC-019, AC-023, AC-022 | Consumer/contrato | `apps/consumer-web/tests/bible-preferences.test.ts` | Passed — consumer regression |
| FR-007 | AC-007, AC-008, AC-012 | Segurança/contrato | `packages/sync/src/__tests__/device-keys.test.ts` | Passed — `@openbible/sync` regression |
| FR-007 | AC-013, AC-014, AC-021 | Segurança/contrato | `packages/sync/src/__tests__/device-keys.test.ts` | Passed — `@openbible/sync` regression |
| FR-007 | AC-012, AC-013, AC-022 | API/contrato | `apps/consumer-web/tests/sync-api.test.ts` | Passed — consumer API regression |
| NFR-001 | AC-002, AC-003, AC-004 | Arquitetural/contrato | `tests/arch/sync-boundary.test.ts` | Passed — architecture regression |
| NFR-001 | AC-005, AC-006, AC-015 | Unidade/integração | `packages/sync/src/__tests__/offline.test.ts` | Passed — `@openbible/sync` regression |
| NFR-001 | AC-016, AC-018, AC-019 | Integração | `packages/sync/src/__tests__/offline.test.ts` | Passed — `@openbible/sync` regression |
| NFR-002 | AC-001, AC-004, AC-007 | Segurança | `packages/sync/src/__tests__/privacy.test.ts` | Passed — privacy regression |
| NFR-002 | AC-008, AC-009, AC-010 | Segurança | `packages/sync/src/__tests__/privacy.test.ts` | Passed — privacy regression |
| NFR-002 | AC-011, AC-012, AC-013 | Segurança | `packages/sync/src/__tests__/device-keys.test.ts` | Passed — device-key regression |
| NFR-003 | AC-001, AC-002, AC-003 | Unidade/integração | `packages/sync/src/__tests__/outbox.test.ts` | Passed — `@openbible/sync` regression |
| NFR-003 | AC-007, AC-008, AC-011 | Integração | `packages/adapter-sync-turso/src/__tests__/adapter.test.ts` | Passed — adapter regression |
| NFR-003 | AC-017, AC-020, AC-023 | Desempenho/contrato | `packages/sync/src/__tests__/limits.test.ts` | Passed — limits regression |

### 13. Validações

#### Gate do Ato I — Definição

- **Resultado**: Passed — 2026-08-29. A especificação possui problema, atores,
  resultado, escopo, regras, falhas, modelo, contratos e critérios observáveis;
  não há blocker de produto, arquitetura ou segurança.
- **Comando**: `node .agents/skills/specsfy-04-validate/scripts/validate_spec.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md`
- **Achados**: cobertura mínima `4 US`, `7 FR`, `3 NFR` e `23 AC` satisfeita;
  research local carregado; dois avisos P2 permanecem para as integrações
  Better Auth e handlers no Ato III.
- **FIND-PROD-001** [P2] [Resolved] A compatibilidade operacional do adapter Kysely/libSQL foi validada com migration idempotente, transação, isolamento, deduplicação e retenção — Refs: FR-005, NFR-003 — Evidence: packages/adapter-sync-turso/src/__tests__/adapter.test.ts:30 — Effect: a implementação atual possui evidência local e validação de migration no endpoint configurado — Suggestion: preservar os testes de contrato ao evoluir o adapter.
- **FIND-ARCH-001** [P2] [Open] A hospedagem inicial dos handlers Sync junto ao consumer web é uma suposição de composição e ainda não foi provada no deployment alvo — Refs: FR-002, NFR-001 — Evidence: specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md — Effect: a fronteira de runtime pode exigir extração para um serviço Node separado — Suggestion: validar T015 e T018 no runtime Node do Next sem mover Better Auth para packages portáveis.
- **FIND-SEC-001** [P2] [Open] Revogação de sessão Better Auth e revogação criptográfica de dispositivo possuem ciclos de vida distintos — Refs: FR-002, FR-007, NFR-002 — Evidence: specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md — Effect: uma sessão revogada não garante que uma cópia local ou chave antiga deixou de existir — Suggestion: manter revalidação server-side, invalidar a chave local e testar T016/T019 sem prometer apagamento local.

#### Gate do Ato II — Plano

- **Resultado**: Passed — 2026-08-29. O plano possui tarefas verificáveis,
  cobertura dos `37` IDs da especificação, `33` predecessores TDD e os REDs
  mínimos executados para as fatias que desbloqueiam a fundação.
- **Comando**: `node .agents/skills/specsfy-05-tasks/scripts/validate_tasks.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md`
- **Evidência TDD**: `T001`, `T002` e `T003` falharam por
  `sync_not_implemented`; `T009` falhou pela ausência da rota server-side
  esperada. Os demais predecessores TDD permanecem planejados para suas
  fatias específicas e não bloqueiam a fundação `T011`.
- **Resultado estrito**: validação sem `--allow-draft` confirma as
  dependências dos códigos com predecessores TDD concluídos.

#### Gate do Ato III — Entrega

- **Resultado**: Passed — 2026-08-29. A implementação foi verificada com a suíte
  completa disponível, build, tipos, lint, testes de arquitetura, documentação,
  evidência estrita e auditoria de aceite.
- **Comandos**: `PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH NODE_OPTIONS=--experimental-ffi BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=<synthetic> DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=<synthetic> pnpm test -- --reporter=dot`; `BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=<synthetic> DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=<synthetic> pnpm build`; `pnpm typecheck`; `pnpm lint`; `node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md packages/sync --kinds US,FR,NFR,AC --minimum-tests 3 --full-chain`; `node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md /home/claudio/Projects/openbible-engine`; `node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md /home/claudio/Projects/openbible-engine`; `node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check`; `node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check`.
- **Achados**: `37/37` IDs cobertos, cadeia completa sem gaps, `QA: PASSED`, evidência estrita passada, documentação `--check` passada e monitor `CURRENT`. O runtime correto para a TUI foi explicitado no comando para habilitar FFI.

### 14. Tarefas

Formato: `- [ ] TNNN [P?] [TIPO] [US-NNN?] Ação com caminho — Refs: IDs — Depends: IDs|none`

Cada tarefa possui exatamente este checklist, atualizado durante a execução:

```markdown
  - [ ] **PREP**: Confirmar escopo, IDs, dependências e baseline.
  - [ ] **EXECUTE**: Produzir a entrega no caminho declarado.
  - [ ] **VERIFY**: Executar a verificação focal adequada.
  - [ ] **EVIDENCE**: Registrar comando, resultado e IDs nas seções 11–13.
  - [ ] **IMPROVE**: Registrar melhoria aplicada ou ausência justificada.
```

#### Fase 1 — RED TDD informado pelo BDD

- [x] T001 [TEST] [TDD] [US-001] Derivar RED de push/pull autenticado em `packages/sync/src/__tests__/sync.test.ts` — Refs: US-001, FR-001, FR-002, FR-003, FR-005, NFR-001, NFR-002, NFR-003, AC-001 — Depends: none
  - [x] **PREP**: Confirmar o fluxo AC-001 e os contratos de nota cifrada.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY:`.
  - [x] **VERIFY**: Observar RED válido: a execução falhou com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar comando, falha e IDs na seção 11.
  - [x] **IMPROVE**: Confirmar que o caso falha pela ausência do coordenador, não por erro de fixture ou runner.

- [x] T002 [TEST] [TDD] [US-001] Derivar RED de outbox offline em `packages/sync/src/__tests__/outbox.test.ts` — Refs: US-001, FR-001, FR-005, NFR-001, NFR-003, AC-002 — Depends: none
  - [x] **PREP**: Confirmar durabilidade, ordem e idempotência do AC-002.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY:`.
  - [x] **VERIFY**: Observar RED válido: a execução falhou com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar comando, saída e estado pendente na seção 11.
  - [x] **IMPROVE**: Usar contrato local e não depender de rede real.
<!-- specsfy:evidence {"task":"T002","refs":["US-001","FR-001","FR-005","NFR-001","NFR-003","AC-002"],"files":["packages/sync/src/__tests__/outbox.test.ts","packages/sync/src/sync.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/outbox.test.ts --config vitest.config.ts --reporter=verbose","exit":0}]} -->

- [x] T003 [TEST] [TDD] [US-002] Derivar RED de importação e colisão em `packages/sync/src/__tests__/import.test.ts` — Refs: US-002, FR-001, FR-004, FR-005, NFR-001, NFR-002, AC-005, AC-006, AC-007 — Depends: none
  - [x] **PREP**: Confirmar confirmação remota, falha e id estável.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY:`.
  - [x] **VERIFY**: Observar RED válido: a execução falhou com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar sucesso, falha e colisão observados na seção 11.
  - [x] **IMPROVE**: Separar ownership anônimo da conta sem apagar cópia antes do ack.

- [x] T004 [TEST] [TDD] [US-003] Derivar RED de conflito e resolução em `packages/sync/src/__tests__/conflict.test.ts` — Refs: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-008, AC-009, AC-010, AC-011 — Depends: none
  - [x] **PREP**: Confirmar preservação de ambas as revisões e três decisões.
  - [x] **EXECUTE**: Escrever quatro casos Vitest com marcadores próprios `SPECSFY:`.
  - [x] **VERIFY**: Observar RED válido: os quatro casos falharam com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar estados esperados e falha na seção 11.
  - [x] **IMPROVE**: Impedir teste que passe por sobrescrita silenciosa.

- [x] T005 [TEST] [TDD] [US-003] Derivar RED de dispositivos e chaves em `packages/sync/src/__tests__/device-keys.test.ts` — Refs: US-003, FR-003, FR-007, NFR-002, NFR-003, AC-012, AC-013, AC-014 — Depends: none
  - [x] **PREP**: Confirmar aprovação, revogação, rotação e perda irrecuperável.
  - [x] **EXECUTE**: Escrever três casos Vitest sem transportar chave privada em claro.
  - [x] **VERIFY**: Observar RED válido: os três casos falharam com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar payloads esperados e bloqueios de revogação na seção 11.
  - [x] **IMPROVE**: Manter material criptográfico de teste sintético e não secreto.

- [x] T006 [TEST] [TDD] [US-001] Derivar RED de tombstone e reconciliação em `packages/sync/src/__tests__/reconcile.test.ts` — Refs: US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-003, AC-015, AC-016 — Depends: none
  - [x] **PREP**: Confirmar prazo de 90 dias e não destruição local.
  - [x] **EXECUTE**: Escrever dois casos Vitest com relógio e cursor controlados.
  - [x] **VERIFY**: Observar RED válido: os dois casos falharam com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar cursor vencido e alterações preservadas na seção 11.
  - [x] **IMPROVE**: Testar o limite temporal sem usar espera real.

- [x] T007 [TEST] [TDD] [US-004] Derivar RED de preferências bíblicas em `packages/sync/src/__tests__/bible-preferences.test.ts` — Refs: US-004, FR-002, FR-006, NFR-001, NFR-003, AC-018, AC-019, AC-023 — Depends: none
  - [x] **PREP**: Confirmar metadado, fonte oficial, pendência e idempotência local.
  - [x] **EXECUTE**: Escrever três casos Vitest sem bytes SQLite no remote fake.
  - [x] **VERIFY**: Observar RED válido: os três casos falharam com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar redownload, falha de fonte e versão já instalada na seção 11.
  - [x] **IMPROVE**: Separar o registry bíblico do repository Sync.

- [x] T008 [TEST] [TDD] [US-001] Derivar RED de quota e retry em `packages/sync/src/__tests__/limits.test.ts` — Refs: US-001, FR-001, FR-005, NFR-003, AC-017, AC-020 — Depends: none
  - [x] **PREP**: Confirmar limites de 1000 notas, 20 MB e cinco tentativas.
  - [x] **EXECUTE**: Escrever dois testes com relógio e tamanho cifrado controlados.
  - [x] **VERIFY**: Observar RED válido: os dois casos falharam com `sync_not_implemented`.
  - [x] **EVIDENCE**: Registrar contagens, backoff e erro de quota na seção 11.
  - [x] **IMPROVE**: Garantir paralelismo somente entre notas diferentes.

- [x] T009 [TEST] [TDD] [US-001] Derivar RED do boundary de autenticação em `apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-002, FR-007, NFR-001, NFR-002, NFR-003, AC-022 — Depends: none
  - [x] **PREP**: Confirmar que `accountId` vem da sessão e não do body.
  - [x] **EXECUTE**: Escrever contrato estrutural com o caminho server-side esperado.
  - [x] **VERIFY**: Observar RED válido porque a rota ainda não existe.
  - [x] **EVIDENCE**: Registrar caminho e resultado `existsSync === false` na seção 11.
  - [x] **IMPROVE**: Manter Better Auth fora dos imports do Sync.

- [x] T010 [TEST] [TDD] [US-001] Derivar RED arquitetural em `tests/arch/sync-boundary.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-002, NFR-001, NFR-002, AC-004, AC-022 — Depends: none
  - [x] **PREP**: Listar imports proibidos e fronteiras públicas.
  - [x] **EXECUTE**: Escrever teste estrutural da superfície portátil.
  - [x] **VERIFY**: Observar RED válido porque `packages/sync-core/package.json` ainda não existe.
  - [x] **EVIDENCE**: Registrar caminho e resultado `existsSync === false` na seção 11.
  - [x] **IMPROVE**: Testar a superfície pública, não detalhes internos.

#### Casos TDD complementares derivados dos ACs

- [x] T024 [TEST] [TDD] [US-001] Derivar RED do AC-003 em `packages/sync/src/__tests__/auth-state.test.ts` — Refs: US-001, FR-001, FR-002, FR-005, NFR-001, NFR-002, NFR-003, AC-003 — Depends: T014
  - [x] **PREP**: Ler AC-003 e confirmar pausa sem limpeza da outbox.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY:`.
  - [x] **VERIFY**: Observar RED válido pela ausência do estado `paused_auth`; depois executar GREEN com o mesmo caso.
  - [x] **EVIDENCE**: Registrar `credential_expired`, operação pendente e ausência de chamada remota na seção 11.
  - [x] **IMPROVE**: Usar somente credencial sintética `expired-session` no fixture.
<!-- specsfy:evidence {"task":"T024","refs":["US-001","FR-001","FR-002","FR-005","NFR-001","NFR-002","NFR-003","AC-003"],"files":["packages/sync/src/__tests__/auth-state.test.ts","packages/sync/src/sync.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/auth-state.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts src/__tests__/auth-state.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0}]} -->

- [x] T025 [TEST] [TDD] [US-001] Derivar RED do AC-004 em `packages/sync/src/__tests__/offline.test.ts` — Refs: US-001, US-002, FR-001, FR-002, FR-004, NFR-001, NFR-002, NFR-003, AC-004 — Depends: T018
  - [x] **PREP**: Ler AC-004 e separar ownership anônimo de conta.
  - [x] **EXECUTE**: Escrever o caso Vitest com marcador próprio `SPECSFY:`.
  - [x] **VERIFY**: Registrar caracterização GREEN imediata porque o comportamento offline já existia no coordenador; não foi fabricada uma falha de infraestrutura.
  - [x] **EVIDENCE**: Registrar outbox preservada, estado `offline` e ausência de chamadas remotas.
  - [x] **IMPROVE**: Manter o cenário independente de conectividade externa e sem credenciais reais.
<!-- specsfy:evidence {"task":"T025","refs":["US-001","US-002","FR-001","FR-002","FR-004","NFR-001","NFR-002","NFR-003","AC-004"],"files":["packages/sync/src/__tests__/offline.test.ts","packages/sync/src/sync.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/offline.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts src/__tests__/auth-state.test.ts src/__tests__/offline.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0}]} -->

- [x] T026 [TEST] [TDD] [US-002] Derivar RED do AC-005 em `packages/sync/src/__tests__/import.test.ts` — Refs: US-002, FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-002, NFR-003, AC-005 — Depends: T018
  - [x] **PREP**: Ler AC-005 e confirmar seleção explícita, ID estável e confirmação remota.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` e remote bloqueado até uma confirmação controlada.
  - [x] **VERIFY**: Reproduzir o RED histórico pela ausência do coordenador e executar GREEN com a implementação existente; a pendência permanece durante o envio e é removida depois do ack.
  - [x] **EVIDENCE**: Registrar lote enviado, `anonymous-note-1`, cursor `cursor-1` e ausência de pendência após confirmação.
  - [x] **IMPROVE**: Capturar uma cópia do lote antes do `ack`, evitando que a mutação legítima da outbox altere a evidência observada pelo teste.
<!-- specsfy:evidence {"task":"T026","refs":["US-002","FR-001","FR-002","FR-004","FR-005","NFR-001","NFR-002","NFR-003","AC-005"],"files":["packages/sync/src/__tests__/import.test.ts","packages/sync/src/sync.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts src/__tests__/auth-state.test.ts src/__tests__/offline.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0}]} -->

- [x] T027 [TEST] [TDD] [US-002] Derivar RED do AC-006 em `packages/sync/src/__tests__/import.test.ts` — Refs: US-002, FR-001, FR-002, FR-004, FR-005, NFR-001, NFR-003, AC-006 — Depends: T018
  - [x] **PREP**: Ler AC-006 e confirmar falha de rede recuperável.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` e remote controlado para falhar na primeira tentativa.
  - [x] **VERIFY**: Registrar caracterização GREEN porque o coordenador já preservava a cópia anônima quando o push falha; o estado retornado é `remote_error` com `network_unavailable`.
  - [x] **EVIDENCE**: Registrar nota local, operação pendente após a falha, retry bem-sucedido e mesmo operationId nas duas tentativas.
  - [x] **IMPROVE**: Reutilizar a mesma operação enfileirada em vez de gerar uma nova identidade na nova tentativa.
<!-- specsfy:evidence {"task":"T027","refs":["US-002","FR-001","FR-002","FR-004","FR-005","NFR-001","NFR-003","AC-006"],"files":["packages/sync/src/__tests__/import.test.ts","packages/sync/src/sync.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts src/__tests__/auth-state.test.ts src/__tests__/offline.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0}]} -->

- [x] T028 [TEST] [TDD] [US-002] Derivar RED do AC-007 em `packages/sync/src/__tests__/import.test.ts` — Refs: US-002, US-003, FR-003, FR-004, FR-005, FR-007, NFR-002, NFR-003, AC-007 — Depends: T018
  - [x] **PREP**: Ler AC-007 e confirmar colisão por ID estável.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` e conflito sintético entre a revisão da conta e a revisão importada.
  - [x] **VERIFY**: Observar RED válido e depois GREEN: o coordenador passou a propagar `conflicts` e chamar `applyRemote` para registrar a colisão, preservando o cursor.
  - [x] **EVIDENCE**: Registrar `conflict-1`, `account-revision-1`, `revision-1` e a expectativa de preservar ambas as versões sem plaintext.
  - [x] **IMPROVE**: Separar colisão de identidade de conflito de revisão e deixar a resolução para os cenários AC-008 a AC-011.
<!-- specsfy:evidence {"task":"T028","refs":["US-002","US-003","FR-003","FR-004","FR-005","FR-007","NFR-002","NFR-003","AC-007"],"files":["packages/sync/src/__tests__/import.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/import.test.ts src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T029 [TEST] [TDD] [US-003] Derivar RED do AC-008 em `packages/sync/src/__tests__/conflict.test.ts` — Refs: US-001, US-003, FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-008 — Depends: T018
  - [x] **PREP**: Ler AC-008 e preparar duas revisões concorrentes cifradas da mesma nota.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` usando `revision-a`, `revision-b` e conflito sintético.
  - [x] **VERIFY**: Observar RED válido e depois GREEN porque o coordenador passou a detectar, expor e registrar conflito aberto ao receber revisões concorrentes.
  - [x] **EVIDENCE**: Registrar as duas revisões opacas, o conflito `conflict-1` e a expectativa de preservação no store.
  - [x] **IMPROVE**: Não usar merge automático; a resolução permanece explícita nos cenários AC-009 a AC-011.
<!-- specsfy:evidence {"task":"T029","refs":["US-001","US-003","FR-002","FR-003","FR-005","FR-007","NFR-002","NFR-003","AC-008"],"files":["packages/sync/src/__tests__/conflict.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/__tests__/import.test.ts src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T030 [TEST] [TDD] [US-003] Derivar RED do AC-009 em `packages/sync/src/__tests__/conflict.test.ts` — Refs: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-009 — Depends: T018
  - [x] **PREP**: Ler AC-009 e confirmar resolução local.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para delegar `conflict-1` e `local-revision-1` ao store.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; o store é responsável por criar a revisão final e reter o histórico.
  - [x] **EVIDENCE**: Registrar conflito encerrado pela chamada opaca ao store.
  - [x] **IMPROVE**: Confirmar que o coordenador não apaga nem interpreta revisões anteriores.
<!-- specsfy:evidence {"task":"T030","refs":["US-003","FR-003","FR-005","FR-007","NFR-002","NFR-003","AC-009"],"files":["packages/sync/src/__tests__/conflict.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T031 [TEST] [TDD] [US-003] Derivar RED do AC-010 em `packages/sync/src/__tests__/conflict.test.ts` — Refs: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-010 — Depends: T018
  - [x] **PREP**: Ler AC-010 e confirmar resolução remota.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para delegar `remote-revision-1` ao store.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual com resolução remota explícita.
  - [x] **EVIDENCE**: Registrar escolha e revisão opacas na chamada ao store.
  - [x] **IMPROVE**: Cobrir a decisão sem depender de interface ou conteúdo em claro.
<!-- specsfy:evidence {"task":"T031","refs":["US-003","FR-003","FR-005","FR-007","NFR-002","NFR-003","AC-010"],"files":["packages/sync/src/__tests__/conflict.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T032 [TEST] [TDD] [US-003] Derivar RED do AC-011 em `packages/sync/src/__tests__/conflict.test.ts` — Refs: US-003, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-011 — Depends: T018
  - [x] **PREP**: Ler AC-011 e confirmar conteúdo mesclado produzido no consumidor.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para encaminhar `merged-revision-1` ao store.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; o coordenador não acessa o conteúdo mesclado.
  - [x] **EVIDENCE**: Registrar novo revisionId opaco e resolução delegada.
  - [x] **IMPROVE**: Manter o merge no consumidor e impedir qualquer interpretação server-side.
<!-- specsfy:evidence {"task":"T032","refs":["US-003","FR-003","FR-005","FR-007","NFR-002","NFR-003","AC-011"],"files":["packages/sync/src/__tests__/conflict.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/conflict.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T033 [TEST] [TDD] [US-003] Derivar RED do AC-012 em `packages/sync/src/__tests__/device-keys.test.ts` — Refs: US-003, FR-003, FR-007, NFR-002, NFR-003, AC-012 — Depends: T018
  - [x] **PREP**: Ler AC-012 e confirmar aprovação explícita por código ou QR separada do trust criptográfico.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` e envelope cifrado sintético.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; a aprovação delega o envelope sem chave privada.
  - [x] **EVIDENCE**: Registrar somente envelope, fingerprint e identidade sintéticos.
  - [x] **IMPROVE**: Separar autorização de conta do trust criptográfico no contrato do remote.
<!-- specsfy:evidence {"task":"T033","refs":["US-003","FR-003","FR-007","NFR-002","NFR-003","AC-012"],"files":["packages/sync/src/__tests__/device-keys.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/device-keys.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T034 [TEST] [TDD] [US-003] Derivar RED do AC-013 em `packages/sync/src/__tests__/device-keys.test.ts` — Refs: US-003, FR-002, FR-003, FR-005, FR-007, NFR-001, NFR-002, NFR-003, AC-013 — Depends: T018
  - [x] **PREP**: Ler AC-013 e confirmar revogação sem limpeza local.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para revogar dispositivo por operação remota.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; o coordenador não toca no storage local durante a revogação.
  - [x] **EVIDENCE**: Registrar chamada remota e store local intacto.
  - [x] **IMPROVE**: Manter rotação de chaves fora da autorização Better Auth e sem apagar cópia local.
<!-- specsfy:evidence {"task":"T034","refs":["US-003","FR-002","FR-003","FR-005","FR-007","NFR-001","NFR-002","NFR-003","AC-013"],"files":["packages/sync/src/__tests__/device-keys.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/device-keys.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T035 [TEST] [TDD] [US-003] Derivar RED do AC-014 em `packages/sync/src/__tests__/device-keys.test.ts` — Refs: US-003, FR-003, FR-007, NFR-002, NFR-003, AC-014 — Depends: T018
  - [x] **PREP**: Ler AC-014 e confirmar perda total de chaves.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` usando envelope cifrado sintético.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; sem key manager disponível, o coordenador transporta somente o envelope opaco.
  - [x] **EVIDENCE**: Registrar ausência de decrypt, nenhum conteúdo fabricado e nenhum campo em claro.
  - [x] **IMPROVE**: Usar material criptográfico sintético e descartável, mantendo o fallback como `key_unavailable` no manager consumidor.
<!-- specsfy:evidence {"task":"T035","refs":["US-003","FR-003","FR-007","NFR-002","NFR-003","AC-014"],"files":["packages/sync/src/__tests__/device-keys.test.ts","packages/sync/src/sync.ts","apps/consumer-web/src/lib/sync-keys.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/device-keys.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T036 [TEST] [TDD] [US-003] Derivar RED do AC-015 em `packages/sync/src/__tests__/reconcile.test.ts` — Refs: US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-002, NFR-003, AC-015 — Depends: T018
  - [x] **PREP**: Ler AC-015 e confirmar tombstone dentro de 90 dias.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para tombstone e alteração anterior da mesma nota.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; a alteração stale é filtrada e a nota excluída não reaparece.
  - [x] **EVIDENCE**: Registrar tombstone, revisão stale descartada e cursor `cursor-tombstone`.
  - [x] **IMPROVE**: Testar o limite temporal com relógio controlado e sem espera real.
<!-- specsfy:evidence {"task":"T036","refs":["US-001","US-003","FR-001","FR-005","FR-007","NFR-001","NFR-002","NFR-003","AC-015"],"files":["packages/sync/src/__tests__/reconcile.test.ts","packages/sync/src/sync.ts","packages/sync-core/src/types.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/reconcile.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T037 [TEST] [TDD] [US-003] Derivar RED do AC-016 em `packages/sync/src/__tests__/reconcile.test.ts` — Refs: US-001, US-003, FR-001, FR-005, FR-007, NFR-001, NFR-003, AC-016 — Depends: T018
  - [x] **PREP**: Ler AC-016 e preparar cursor expirado.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para cursor inválido e snapshot técnico.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; `reconcile` ocorre antes de qualquer push stale.
  - [x] **EVIDENCE**: Registrar snapshot aplicado, cursor `cursor-reconciled` e operação local ainda pendente.
  - [x] **IMPROVE**: Não descartar alterações locais durante o snapshot.
<!-- specsfy:evidence {"task":"T037","refs":["US-001","US-003","FR-001","FR-005","FR-007","NFR-001","NFR-003","AC-016"],"files":["packages/sync/src/__tests__/reconcile.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/reconcile.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T038 [TEST] [TDD] [US-001] Derivar RED do AC-017 em `packages/sync/src/__tests__/outbox.test.ts` — Refs: US-001, FR-001, FR-005, NFR-001, NFR-003, AC-017 — Depends: T018
  - [x] **PREP**: Ler AC-017 e confirmar backoff, limite e ordem.
  - [x] **EXECUTE**: Materializar o caso em `limits.test.ts` com marcador `SPECSFY:` e relógio de espera controlado.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual com cinco tentativas, backoff `1000/2000/4000/8000` e lote ordenado.
  - [x] **EVIDENCE**: Registrar relógio sintético, tentativas e lotes sem conteúdo em claro.
  - [x] **IMPROVE**: Isolar notas distintas no mesmo lote sem corrida compartilhada.
<!-- specsfy:evidence {"task":"T038","refs":["US-001","FR-001","FR-005","NFR-001","NFR-003","AC-017"],"files":["packages/sync/src/__tests__/limits.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/limits.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T039 [TEST] [TDD] [US-004] Derivar RED do AC-018 em `packages/sync/src/__tests__/bible-preferences.test.ts` — Refs: US-004, FR-002, FR-006, NFR-001, NFR-003, AC-018 — Depends: T018
  - [x] **PREP**: Ler AC-018 e confirmar redownload pela fonte oficial.
  - [x] **EXECUTE**: Adicionar contrato de metadados no Sync e manter o redownload/installer no teste da bridge do consumer.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual sem bytes SQLite no remote; a bridge instala somente pela fonte oficial.
  - [x] **EVIDENCE**: Registrar metadado aplicado e ausência de bytes no contrato Sync.
  - [x] **IMPROVE**: Reutilizar o `BibleInstaller` existente no fixture do consumer.
<!-- specsfy:evidence {"task":"T039","refs":["US-004","FR-002","FR-006","NFR-001","NFR-003","AC-018"],"files":["packages/sync/src/__tests__/bible-preferences.test.ts","apps/consumer-web/src/engine/bible-preferences.ts","apps/consumer-web/tests/bible-preferences.test.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run tests/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0}]} -->

- [x] T040 [TEST] [TDD] [US-004] Derivar RED do AC-019 em `packages/sync/src/__tests__/bible-preferences.test.ts` — Refs: US-004, FR-002, FR-006, NFR-001, NFR-003, AC-019 — Depends: T018
  - [x] **PREP**: Ler AC-019 e confirmar estado pendente após falha da fonte.
  - [x] **EXECUTE**: Adicionar contrato de preferência `pending` no Sync e cenário de falha de fonte na bridge do consumer.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; a preferência permanece pendente com erro discriminado.
  - [x] **EVIDENCE**: Registrar `network_unavailable`, estado pendente e ausência de instalação parcial.
  - [x] **IMPROVE**: Não usar download real no teste de domínio.
<!-- specsfy:evidence {"task":"T040","refs":["US-004","FR-002","FR-006","NFR-001","NFR-003","AC-019"],"files":["packages/sync/src/__tests__/bible-preferences.test.ts","apps/consumer-web/src/engine/bible-preferences.ts","apps/consumer-web/tests/bible-preferences.test.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run tests/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0}]} -->

- [x] T041 [TEST] [TDD] [US-001] Derivar RED do AC-020 em `packages/sync/src/__tests__/limits.test.ts` — Refs: US-001, FR-001, FR-005, NFR-003, AC-020 — Depends: T018
  - [x] **PREP**: Ler AC-020 e confirmar quota e auditoria técnica.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` e contador local sintético.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; a quota bloqueia a chamada remota com `quota_exceeded`.
  - [x] **EVIDENCE**: Registrar somente contagem, tamanho e código de erro, sem conteúdo de nota.
  - [x] **IMPROVE**: Testar o limite de 1000 notas e manter medição de bytes baseada no envelope.
<!-- specsfy:evidence {"task":"T041","refs":["US-001","FR-001","FR-005","NFR-003","AC-020"],"files":["packages/sync/src/__tests__/limits.test.ts","packages/sync/src/sync.ts","packages/sync/src/ports.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/limits.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T042 [TEST] [TDD] [US-003] Derivar RED do AC-021 em `packages/sync/src/__tests__/account-delete.test.ts` — Refs: US-001, US-003, FR-002, FR-003, FR-005, FR-007, NFR-002, NFR-003, AC-021 — Depends: T018
  - [x] **PREP**: Ler AC-021 e confirmar retenção remota e cópia local.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` para o job de exclusão no coordenador.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; o job é remoto, idempotente e não toca storage local.
  - [x] **EVIDENCE**: Registrar `account-delete-account-1` e isolamento da cópia local.
  - [x] **IMPROVE**: Separar evento de exclusão da limpeza efetiva de até 30 dias.
<!-- specsfy:evidence {"task":"T042","refs":["US-001","US-003","FR-002","FR-003","FR-005","FR-007","NFR-002","NFR-003","AC-021"],"files":["packages/sync/src/__tests__/account-delete.test.ts","packages/sync/src/sync.ts","packages/adapter-sync-turso/src/adapter.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/account-delete.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T043 [TEST] [TDD] [US-001] Derivar RED do AC-022 em `apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-002, FR-007, NFR-001, NFR-002, NFR-003, AC-022 — Depends: T018
  - [x] **PREP**: Ler AC-022 e confirmar derivação server-side do accountId.
  - [x] **EXECUTE**: Adicionar contrato estrutural com marcador `SPECSFY:` e validação da implementação HTTP.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; sessão ausente retorna auth_required e conta divergente é rejeitada.
  - [x] **EVIDENCE**: Registrar respostas HTTP e ausência de segredo no módulo Sync.
  - [x] **IMPROVE**: Manter Better Auth fora dos imports de Sync.
<!-- specsfy:evidence {"task":"T043","refs":["US-001","US-002","US-003","US-004","FR-002","FR-007","NFR-001","NFR-002","NFR-003","AC-022"],"files":["apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts","apps/consumer-web/src/lib/sync-api.ts","apps/consumer-web/tests/sync-api.test.ts"],"commands":[{"run":"pnpm exec vitest run src/app/api/sync/v1/__tests__/auth-boundary.test.ts --config /dev/null --reporter=verbose","exit":0},{"run":"pnpm exec vitest run tests/sync-api.test.ts --config vitest.config.ts --reporter=verbose","exit":0}]} -->

- [x] T044 [TEST] [TDD] [US-004] Derivar RED do AC-023 em `packages/sync/src/__tests__/bible-preferences.test.ts` — Refs: US-004, FR-002, FR-006, NFR-001, NFR-003, AC-023 — Depends: T018
  - [x] **PREP**: Ler AC-023 e confirmar idempotência de versão já instalada.
  - [x] **EXECUTE**: Adicionar caso Vitest com marcador `SPECSFY:` no contrato de preferências e na bridge do consumer.
  - [x] **VERIFY**: Observar RED histórico e GREEN atual; versão instalada não baixa bytes nem chama remote.
  - [x] **EVIDENCE**: Registrar estado local, `installedAt` e ausência de bytes remotos.
  - [x] **IMPROVE**: Reutilizar o contrato do registry sem duplicar regra bíblica.
<!-- specsfy:evidence {"task":"T044","refs":["US-004","FR-002","FR-006","NFR-001","NFR-003","AC-023"],"files":["packages/sync/src/__tests__/bible-preferences.test.ts","apps/consumer-web/src/engine/bible-preferences.ts","apps/consumer-web/tests/bible-preferences.test.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run tests/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0}]} -->

#### Fase 2 — Contratos e domínio

- [x] T011 [CODE] [US-001] Criar `packages/sync-core` com entidades, envelopes, estados e erros — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001, NFR-002, NFR-003 — Depends: T001, T002, T003
  - [x] **PREP**: Confirmar REDs e a proibição de plataforma no core.
  - [x] **EXECUTE**: Implementar tipos serializáveis, validação e códigos estáveis em `packages/sync-core`.
  - [x] **VERIFY**: `pnpm --filter @openbible/sync-core run build` e `pnpm --filter @openbible/sync-core run check` passaram; a suíte local executou 3 testes.
  - [x] **EVIDENCE**: Registrar exports, invariantes, validações e GREEN na evidência desta tarefa.
  - [x] **IMPROVE**: Manter unions discriminadas, epoch ms e ausência de `Date`, `Map` e `Set`.
<!-- specsfy:evidence {"task":"T011","refs":["US-001","US-002","US-003","US-004","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","NFR-001","NFR-002","NFR-003"],"files":["packages/sync-core/package.json","packages/sync-core/tsconfig.json","packages/sync-core/src/types.ts","packages/sync-core/src/errors.ts","packages/sync-core/src/validation.ts","packages/sync-core/src/index.ts","packages/sync-core/vitest.config.ts","packages/sync-core/src/__tests__/validation.test.ts"],"commands":[{"run":"pnpm --filter @openbible/sync-core run build","exit":0},{"run":"pnpm --filter @openbible/sync-core run check","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T012 [CODE] [US-001] Criar `packages/sync` com ports, outbox e coordenador — Refs: US-001, US-002, US-003, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001, NFR-003 — Depends: T011
  - [x] **PREP**: Confirmar as interfaces local, remote, key manager e relógio.
  - [x] **EXECUTE**: Implementar ports e o caminho inicial de `syncNow` com push, pull, ack e status offline.
  - [x] **VERIFY**: Executar a suíte focal de outbox, importação e sincronização; os 3 testes passaram, além de typecheck, build e lint.
  - [x] **EVIDENCE**: Registrar GREEN e paths públicos na seção 11 e no contrato de evidência.
  - [x] **IMPROVE**: Separar cálculo local de transporte remoto em `applyChanges` e normalização de erro.
<!-- specsfy:evidence {"task":"T012","refs":["US-001","US-002","US-003","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","NFR-001","NFR-003"],"files":["packages/sync/package.json","packages/sync/tsconfig.json","packages/sync/vitest.config.ts","packages/sync/src/ports.ts","packages/sync/src/sync.ts","packages/sync/src/index.ts","packages/sync/src/__tests__/sync.test.ts","packages/sync/src/__tests__/outbox.test.ts","packages/sync/src/__tests__/import.test.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/outbox.test.ts src/__tests__/import.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T013 [TEST] [US-001] Criar `packages/sync-testing` com fakes e contract suite — Refs: US-001, US-002, US-003, US-004, FR-001, FR-003, FR-005, FR-006, NFR-001, NFR-002, NFR-003 — Depends: T011, T012
  - [x] **PREP**: Definir falhas determinísticas de rede, quota, auth, cursor e chave.
  - [x] **EXECUTE**: Implementar stores, remote fake, clock e envelopes sintéticos em `packages/sync-testing`.
  - [x] **VERIFY**: `pnpm run typecheck && pnpm run build && pnpm run lint` e a contract suite passaram com 1 teste.
  - [x] **EVIDENCE**: Registrar cobertura determinística e chamadas observáveis nesta tarefa.
  - [x] **IMPROVE**: Os fakes preservam chamadas, cursores e falhas configuráveis em vez de retornar sucesso opaco.
<!-- specsfy:evidence {"task":"T013","refs":["US-001","US-002","US-003","US-004","FR-001","FR-003","FR-005","FR-006","NFR-001","NFR-002","NFR-003"],"files":["packages/sync-testing/package.json","packages/sync-testing/tsconfig.json","packages/sync-testing/vitest.config.ts","packages/sync-testing/src/fakes.ts","packages/sync-testing/src/index.ts","packages/sync-testing/src/__tests__/fakes.test.ts"],"commands":[{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0},{"run":"pnpm test -- --reporter=verbose","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

#### Fase 3 — Adapters e integração

- [x] T014 [CODE] [US-001] Implementar migration e `packages/adapter-sync-turso` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-003, FR-005, FR-006, FR-007, NFR-002, NFR-003 — Depends: T012, T013
  - [x] **PREP**: Validar `@libsql/kysely-libsql@0.4.1`, URL/token de runtime, transações e schema isolado de Better Auth.
  - [x] **EXECUTE**: Implementar queries Kysely/libSQL, índices, idempotência por operação, rollback transacional, retenção de tombstone e job de exclusão em `packages/adapter-sync-turso`.
  - [x] **VERIFY**: Os testes locais passaram com 4 casos; typecheck, build e lint passaram; migration idempotente foi aplicada duas vezes no endpoint Turso configurado sem inserir dados de teste.
  - [x] **EVIDENCE**: Registrar schema, isolamento por conta, rollback, cursor, retenção e comandos sem segredos nesta tarefa.
  - [x] **IMPROVE**: A integração usa `LibsqlDialect` comunitário e recebe `Client` injetável para testes; a limitação de transação/streaming do dialeto permanece explícita nos ports.
<!-- specsfy:evidence {"task":"T014","refs":["US-001","US-002","US-003","US-004","FR-001","FR-003","FR-005","FR-006","FR-007","NFR-002","NFR-003"],"files":["packages/adapter-sync-turso/package.json","packages/adapter-sync-turso/tsconfig.json","packages/adapter-sync-turso/vitest.config.ts","packages/adapter-sync-turso/src/schema.ts","packages/adapter-sync-turso/src/adapter.ts","packages/adapter-sync-turso/src/index.ts","packages/adapter-sync-turso/src/__tests__/schema.test.ts","packages/adapter-sync-turso/src/__tests__/adapter.test.ts",".specsfy/DATABASE.md","docs/database.md"],"commands":[{"run":"pnpm test -- --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run build && pnpm run lint","exit":0},{"run":"node --env-file=../../.env --input-type=module -e 'import { createTursoSyncAdapter } from \"./dist/index.js\"; const adapter=await createTursoSyncAdapter({url:process.env.DATABASE_URL,authToken:process.env.DATABASE_TURSO_TOKEN}); await adapter.migrate(); await adapter.close(); console.log(\"Turso/libSQL migration: applied twice successfully\");'","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T015 [CODE] [US-001] Integrar Better Auth no consumer/API em `apps/consumer-web/src/lib/auth.ts` e `src/app/api/auth/[...all]/route.ts` — Refs: US-001, US-002, US-003, US-004, FR-002, FR-007, NFR-001, NFR-002 — Depends: T009, T012, T014
  - [x] **PREP**: Confirmar runtime Node, trusted origin, segredo server-only e sessão sem exposição indevida.
  - [x] **EXECUTE**: Configurar Better Auth 1.7.2 com `LibsqlDialect`, handler Next catch-all, migration versionada e derivação server-side de credenciais Sync.
  - [x] **VERIFY**: Testar cadastro, sessão, expiração, revogação e derivação de `accountId` no SQLite local real; typecheck, lint, testes do consumer e build passaram.
  - [x] **EVIDENCE**: Registrar versão, migration e resultados sem tokens ou valores de conexão.
  - [x] **IMPROVE**: Desabilitar `session.cookieCache` para evitar revogação atrasada no fluxo crítico.
<!-- specsfy:evidence {"task":"T015","refs":["US-001","US-002","US-003","US-004","FR-002","FR-007","NFR-001","NFR-002"],"files":["apps/consumer-web/package.json","apps/consumer-web/.env.example","apps/consumer-web/src/lib/auth.ts","apps/consumer-web/src/app/api/auth/[...all]/route.ts","apps/consumer-web/migrations/001-better-auth.sql","apps/consumer-web/scripts/migrate-auth.mjs","apps/consumer-web/tests/auth.test.ts","apps/consumer-web/vitest.setup.ts"],"commands":[{"run":"pnpm exec vitest run tests/auth.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run test","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0},{"run":"BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=synthetic-build-secret DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=synthetic-build-token pnpm run build","exit":0},{"run":"node --env-file=../../.env scripts/migrate-auth.mjs","exit":0}]} -->

- [x] T016 [CODE] [US-003] Integrar aprovação de dispositivos e key manager em `apps/consumer-web/src/lib/sync-keys.ts` — Refs: US-003, FR-003, FR-007, NFR-002, NFR-003, AC-012, AC-013, AC-014 — Depends: T012, T015
  - [x] **PREP**: Manter código/QR Better Auth separado da aprovação criptográfica; o manager recebe somente a identidade e a chave pública do dispositivo destino.
  - [x] **EXECUTE**: Implementar geração de identidade ECDH P-256, envelope ECDH/AES-GCM, cifragem/decifragem de notas, recuperação, rotação com keyring e revogação local.
  - [x] **VERIFY**: Testar transferência sem chave privada ou plaintext no payload, recuperação de nota, rotação com rejeição de envelope antigo e perda de acesso após revogação mantendo a cópia local.
  - [x] **EVIDENCE**: Usar somente fingerprints, chaves e conteúdo sintéticos nos testes.
  - [x] **IMPROVE**: O manager mantém chaves históricas para revisões cifradas, bloqueia operações quando revogado e não implementa recuperação fabricada quando o keyring não possui a versão solicitada.
<!-- specsfy:evidence {"task":"T016","refs":["US-003","FR-003","FR-007","NFR-002","NFR-003","AC-012","AC-013","AC-014"],"files":["apps/consumer-web/package.json","apps/consumer-web/src/lib/sync-keys.ts","apps/consumer-web/tests/sync-keys.test.ts","apps/consumer-web/vitest.setup.ts"],"commands":[{"run":"pnpm exec vitest run tests/sync-keys.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T017 [CODE] [US-004] Integrar preferências bíblicas ao registry e `packageSource` em `apps/consumer-web/src/engine/bible-preferences.ts` — Refs: US-004, FR-002, FR-006, NFR-001, NFR-003, AC-018, AC-019, AC-023 — Depends: T012, T014
  - [x] **PREP**: Confirmar `InstalledBibleRegistry`, `BibleInstaller` e `BiblePackageSource` oficiais existentes.
  - [x] **EXECUTE**: Implementar projeção de metadado, redownload pela fonte oficial e instalação local idempotente.
  - [x] **VERIFY**: Testar fonte disponível, indisponível e versão já instalada; o cenário instalado não chama download nem installer.
  - [x] **EVIDENCE**: Registrar que os bytes são consumidos apenas pelo `BibleInstaller` e não entram no resultado de preferência ou contrato Sync.
  - [x] **IMPROVE**: Reutilizar `BibleInstaller` em vez de duplicar a lógica de instalação e preservar estado `pending` com erro discriminado.
<!-- specsfy:evidence {"task":"T017","refs":["US-004","FR-002","FR-006","NFR-001","NFR-003","AC-018","AC-019","AC-023"],"files":["apps/consumer-web/src/engine/bible-preferences.ts","apps/consumer-web/tests/bible-preferences.test.ts"],"commands":[{"run":"pnpm exec vitest run tests/bible-preferences.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0}]} -->

- [x] T018 [TEST] [US-001] Adicionar handlers versionados e contract tests HTTP em `apps/consumer-web/src/app/api/sync/v1/` — Refs: US-001, US-002, US-003, US-004, FR-002, FR-003, FR-005, FR-006, FR-007, NFR-002, NFR-003, AC-001, AC-005, AC-008, AC-022 — Depends: T014, T015, T016, T017
  - [x] **PREP**: Fixar request JSON, response serializável, status HTTP, cursor e formato de erro sem `cause`.
  - [x] **EXECUTE**: Implementar push, pull, reconcile, list/approve/revoke devices e account-delete em rotas Node versionadas.
  - [x] **VERIFY**: Contract suite cobre 401 sem remote, rejeição de `accountId` do cliente, push/pull/reconcile e ciclo de dispositivos/conta; rota estrutural existe e builda.
  - [x] **EVIDENCE**: Registrar casos de auth, cursor, envelope, dispositivo e retenção; quota/conflito continuam delegados ao código discriminado do remote.
  - [x] **IMPROVE**: Manter handlers finos em `sync-api.ts`, sanitizar operações para não propagar campos desconhecidos e usar adapter Turso lazy no server boundary.
<!-- specsfy:evidence {"task":"T018","refs":["US-001","US-002","US-003","US-004","FR-002","FR-003","FR-005","FR-006","FR-007","NFR-002","NFR-003","AC-001","AC-005","AC-008","AC-022"],"files":["apps/consumer-web/package.json","apps/consumer-web/src/lib/sync-api.ts","apps/consumer-web/src/lib/sync-server.ts","apps/consumer-web/src/app/api/sync/v1/route.ts","apps/consumer-web/src/app/api/sync/v1/push/route.ts","apps/consumer-web/src/app/api/sync/v1/pull/route.ts","apps/consumer-web/src/app/api/sync/v1/reconcile/route.ts","apps/consumer-web/src/app/api/sync/v1/devices/route.ts","apps/consumer-web/src/app/api/sync/v1/devices/approve/route.ts","apps/consumer-web/src/app/api/sync/v1/devices/revoke/route.ts","apps/consumer-web/src/app/api/sync/v1/account-delete/route.ts","apps/consumer-web/tests/sync-api.test.ts","apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts"],"commands":[{"run":"pnpm exec vitest run tests/sync-api.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run src/app/api/sync/v1/__tests__/auth-boundary.test.ts --config /dev/null --reporter=verbose","exit":0},{"run":"pnpm run test","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0},{"run":"BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=synthetic-build-secret-0123456789 DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=synthetic-build-token pnpm run build","exit":0}]} -->

#### Fase de interface

Não aplicável: esta especificação não cria telas, componentes, formulários ou
rotas visuais.

#### Fase final — Qualidade e documentação

- [x] T019 [TEST] [US-001] Adicionar testes arquiteturais e de privacidade em `tests/arch/sync-boundary.test.ts` e `packages/sync/src/__tests__/privacy.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-002, FR-003, FR-007, NFR-001, NFR-002, NFR-003, AC-004, AC-012, AC-022 — Depends: T018
  - [x] **PREP**: Conferir imports, logs, payloads, secrets e exports.
  - [x] **EXECUTE**: Testar pureza do core, isolamento Better Auth, remoção de campos extras e ausência de plaintext em payload/log.
  - [x] **VERIFY**: `packages/sync` executou 20 testes focados; `tests/arch/sync-boundary.test.ts` executou 3 testes; typecheck e lint do package passaram.
  - [x] **EVIDENCE**: Os testes confirmam que o remote recebe somente metadados opacos e envelope, falhas não são logadas, `sync-core` não tem dependências de runtime e Better Auth permanece no boundary server-side.
  - [x] **IMPROVE**: `syncNow` valida operações e reconstrói o payload de transporte com allowlist, evitando dependência acidental em SDK ou dados reais.
<!-- specsfy:evidence {"task":"T019","refs":["US-001","US-002","US-003","US-004","FR-002","FR-003","FR-007","NFR-001","NFR-002","NFR-003","AC-004","AC-012","AC-022"],"files":["tests/arch/sync-boundary.test.ts","packages/sync/src/__tests__/privacy.test.ts","packages/sync/src/sync.ts","packages/sync-core/package.json","apps/consumer-web/src/lib/auth.ts"],"commands":[{"run":"pnpm exec vitest run src/__tests__/sync.test.ts src/__tests__/privacy.test.ts src/__tests__/import.test.ts src/__tests__/conflict.test.ts src/__tests__/reconcile.test.ts src/__tests__/limits.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm exec vitest run tests/arch/sync-boundary.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"pnpm run typecheck && pnpm run lint","exit":0},{"run":"git diff --check","exit":0}]} -->

- [x] T020 [DOC] [US-001] Reconstruir `docs/` e `.specsfy/PACKAGES.md` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001, NFR-002, NFR-003 — Depends: T019
  - [x] **PREP**: Conferir packages, migrations, APIs e dependências instaladas.
  - [x] **EXECUTE**: Executar `$specsfy-documentator` e revisar portal, arquitetura, aplicação, banco, fluxos, testes, frontend, pacotes, integrações e decisões.
  - [x] **VERIFY**: `build_documentation.mjs --check` passou e o monitor de contexto permaneceu `CURRENT`.
  - [x] **EVIDENCE**: A documentação registra os paths do Sync, schema remoto, rotas, integrações e dependências sem credenciais ou valores de conexão.
  - [x] **IMPROVE**: Conteúdo humano fora dos blocos gerenciados foi preservado.
<!-- specsfy:evidence {"task":"T020","refs":["US-001","US-002","US-003","US-004","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","NFR-001","NFR-002","NFR-003"],"files":["docs/README.md","docs/architecture.md","docs/application.md","docs/database.md","docs/flows.md","docs/testing.md","docs/frontend.md","docs/packages.md","docs/integrations.md","docs/decisions.md",".specsfy/PACKAGES.md"],"commands":[{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

- [x] T021 [TEST] [US-001] Executar regressão, rastreabilidade e checks finais em `tests/arch/sync-boundary.test.ts` — Refs: US-001, US-002, US-003, US-004, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, NFR-001, NFR-002, NFR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-023 — Depends: T019, T020
  - [x] **PREP**: Identificar comandos, gates, quotas, retenções e baseline do monorepo.
  - [x] **EXECUTE**: Executar build, typecheck, lint, testes, rastreabilidade e monitor.
  - [x] **VERIFY**: Confirmar ausência de gaps, payload claro, duplicação e regressão.
  - [x] **EVIDENCE**: Registrar contagens, comandos, resultados e gates.
  - [x] **IMPROVE**: Corrigir apenas problemas desta spec e registrar riscos residuais; a configuração do Turbo passou a declarar as variáveis server-only necessárias ao build sem registrar seus valores.
<!-- specsfy:evidence {"task":"T021","refs":["US-001","US-002","US-003","US-004","FR-001","FR-002","FR-003","FR-004","FR-005","FR-006","FR-007","NFR-001","NFR-002","NFR-003","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","AC-017","AC-018","AC-019","AC-020","AC-021","AC-022","AC-023"],"files":["tests/arch/sync-boundary.test.ts","packages/sync/src/sync.ts","packages/sync/src/__tests__/privacy.test.ts","turbo.json","docs/application.md",".specsfy/PACKAGES.md"],"commands":[{"run":"PATH=/home/claudio/.local/share/mise/installs/node/26.7.0/bin:$PATH NODE_OPTIONS=--experimental-ffi BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=<synthetic> DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=<synthetic> pnpm test -- --reporter=dot","exit":0},{"run":"BETTER_AUTH_URL=http://localhost:3000 BETTER_AUTH_SECRET=<synthetic> DATABASE_URL=file::memory: DATABASE_TURSO_TOKEN=<synthetic> pnpm build","exit":0},{"run":"pnpm typecheck","exit":0},{"run":"pnpm lint","exit":0},{"run":"pnpm exec vitest run tests/arch/sync-boundary.test.ts --config vitest.config.ts --reporter=verbose","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/check_traceability.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md packages/sync --kinds US,FR,NFR,AC --minimum-tests 3 --full-chain","exit":0},{"run":"node .agents/skills/specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-07-implement/scripts/verify_evidence.mjs specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md /home/claudio/Projects/openbible-engine","exit":0},{"run":"node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0},{"run":"node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project /home/claudio/Projects/openbible-engine --check","exit":0}]} -->

### 15. Ordem de execução

- Caminho crítico: T001–T010 e T024–T044 (RED) → T011 → T012/T013 → T014 → T015 → T016/T017 → T018 → T019 → T020 → T021.
- Tarefas paralelas: T016 e T017 podem executar em paralelo depois de T015 e
  T014, pois tratam key manager e bridge bíblico separados; T019 depende dos
  handlers prontos para verificar a fronteira completa.
- Estratégia de MVP: entregar Sync core + coordenador + remote adapter com notas,
  outbox, conflitos, tombstones, E2EE por port, Better Auth no boundary e
  metadados bíblicos; não incluir interface nem colaboração multiusuário.

### 16. Dependências, riscos e suposições

#### Dependências

- `SPEC-0007` fornece notas locais e ownership anônimo.
- `SPEC-0001` fornece registry, installer e `packageSource` para versões bíblicas.
- Next.js 15 App Router e runtime Node do consumer web hospedam Better Auth e os
  handlers; o core não depende de Next.
- Better Auth 1.7.2 ou versão compatível, configurado server-side, com segredo
  de runtime, trusted origins e migrations próprias.
- Turso/libSQL, Kysely e `@libsql/kysely-libsql` compatíveis com as migrations,
  transações, índices e concorrência exigidos.
- Um adapter local do consumidor fornece transações ou operação equivalente para
  confirmar nota e outbox juntas, além de armazenamento seguro de chaves.

#### Riscos

- Dialeto libSQL é comunitário e pode divergir do adapter esperado por Better
  Auth → validar migrations, transações, locking, HTTP/WebSocket e falhas em
  Turso real antes do Plan Gate.
- Sessão Better Auth e dispositivo confiável são conceitos diferentes → derivar
  conta da sessão server-side e exigir aprovação criptográfica separada.
- Cookie cache pode atrasar revogação em outros dispositivos → não usar cache no
  caminho de sincronização crítica ou forçar revalidação server-side.
- Perda de chaves torna notas irrecuperáveis → explicitar confirmação, chave de
  recuperação e teste de perda; nunca prometer recuperação pelo servidor.
- Falha entre commit da nota e outbox pode perder operação → exigir port local
  atômico ou estado de recuperação verificável antes de confirmar sucesso.
- Turso/rede indisponível pode acumular outbox → retry limitado, estados
  discriminados, ação manual e quotas locais para evitar bloqueio indefinido.
- Metadados de versão podem ficar pendentes por indisponibilidade da fonte → não
  remover preferência e reutilizar o installer oficial no redownload.
- Exclusão remota pode ser confundida com limpeza local → comunicar estados
  distintos e testar que cópias locais continuam offline.

#### Suposições

- `accountId` derivado do `userId` Better Auth permanece estável e é tratado como
  identificador opaco; o cliente nunca escolhe a conta de uma requisição.
- A primeira API Sync será hospedada junto ao consumer web por handlers Next,
  com possibilidade de extrair o adapter server-side sem alterar o contrato.
- O nome, algoritmo e detalhes criptográficos finais serão escolhidos na tarefa
  de key manager, desde que preservem E2EE, envelopes e ausência de chave privada
  no servidor.
- Operações locais podem usar storage já existente do consumidor, mas nenhuma
  implementação pode confirmar somente em memória.
- A primeira entrega não fará sincronização de arquivos bíblicos, somente
  preferências e redownload oficial.

### 17. Decisões

- **DEC-001**: Manter Sync como bounded context separado de Scripture Library e
  Personal Study — evita misturar persistência remota, notas privadas e catálogo
  bíblico; alternativa rejeitada: adicionar sync ao engine bíblico.
- **DEC-002**: Adotar Better Auth no consumidor/API para contas, sessões,
  renovação, revogação e autorização de conta — reduz implementação própria e
  possui integração Next.js, Device Authorization, sessões e Bearer; alternativa
  rejeitada: criar autenticação no Sync.
- **DEC-003**: Manter o contrato Sync agnóstico ao provedor — permite consumidores
  Web, TUI, Native e mobile sem importar SDK de autenticação; Better Auth é uma
  composição no boundary, não uma dependência do core.
- **DEC-004**: Usar Turso/libSQL por adapter Kysely comunitário, condicionado a
  validação — reaproveita a opção remota desejada sem declarar suporte nativo do
  Better Auth antes da prova de migrations e transações.
- **DEC-005**: Usar E2EE sob responsabilidade do consumidor — impede que o
  serviço remoto interprete notas; o servidor guarda somente envelopes e estados
  técnicos.
- **DEC-006**: Exigir aprovação explícita de dispositivos por código/QR e
  transferência cifrada — reduz o risco de uma sessão válida virar confiança
  criptográfica automaticamente.
- **DEC-007**: Preservar conflitos e exigir resolução que cria nova revisão —
  evita perda silenciosa e mantém auditabilidade por 30 dias.
- **DEC-008**: Usar outbox durável, idempotência, cursor e retry limitado — torna
  retomada segura sem bloquear operações locais ou duplicar mutações.
- **DEC-009**: Sincronizar preferências bíblicas, não arquivos — respeita o
  contrato do Scripture Library e mantém download na fonte oficial do consumidor.
- **DEC-010**: Não criar interface nesta fatia — mantém packages reutilizáveis e
  permite que cada consumidor implemente login, conflitos e estados visuais com
  sua própria stack.

### 18. Definition of Done

- [x] `Definition Gate` está `Passed`.
- [x] `Plan Gate` está `Passed`.
- [x] `Delivery Gate` está `Passed`.
- [x] Todos os cenários `AC` aplicáveis passam.
- [x] Todos os requisitos possuem evidência de verificação.
- [x] Todas as tarefas na seção 14 estão concluídas.
- [x] Testes, migrations, checks estáticos e reconciliação disponíveis passam.
- [x] Nenhum payload, log ou métrica contém conteúdo de nota, título, referência,
  datas ou chave em claro.
