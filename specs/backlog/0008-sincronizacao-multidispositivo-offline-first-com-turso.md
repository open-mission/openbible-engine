# Backlog: Sincronização multidispositivo offline-first com Turso

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0008 |
| Status | Promoted |
| Produto | A esclarecer |
| Épico | A esclarecer |
| Funcionalidade | A esclarecer |
| Tipo | A esclarecer |
| Prioridade | Não priorizado |
| Milestones | |
| Criado em | 2026-08-29 |
| Spec promovida | `specs/completed/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md` |

## Ideia original

Projetar sync opcional sobre dados locais sem tornar Turso obrigatório para leitura ou escrita offline.

## Problema percebido

Dados pessoais ficam isolados por dispositivo e ainda não existe protocolo de sincronização, identidade, conflitos ou retomada.

## Pessoa afetada ou beneficiada

Usuários com múltiplos dispositivos e equipes responsáveis por Web, desktop e mobile.

## Resultado ou valor esperado

Manter dados pessoais consistentes entre dispositivos preservando funcionamento 100% offline.

## Contexto

Bounded context Sync separado do Scripture Library e do Personal Study; TursoDB é uma opção futura para sincronização remota, enquanto leitura e escrita locais permanecem offline-first. A primeira investigação deve modelar protocolo, identidade, conflitos e retomada antes de escolher o adapter.

## Referências relacionadas

- `specs/inbox/2026-08-26-193950-sincronizacao-multidispositivo-offline-first-com-turso.md` — origem da captura.
- `specs/completed/0007-bounded-context-personal-study-offline/spec.md` — precedente; notas locais entregues e sincronização explicitamente fora daquela fatia.
- `specs/completed/0001-openbible-engine-scripture-library/spec.md` — contrato de versões instaladas, registry e redownload por `packageSource`.
- `docs/database.md` — documentação do registry local e dos arquivos SQLite instalados.
- `https://better-auth.com/docs/integrations/next` — integração oficial do Better Auth com Next.js.
- `https://better-auth.com/docs/plugins/device-authorization` — autorização de dispositivos por código/QR para clientes limitados.
- `https://better-auth.com/docs/adapters/other-relational-databases` e `https://github.com/libsql/kysely-libsql` — uso de dialeto Kysely compatível com libSQL/Turso, sujeito a validação.

## Comportamento esperado

- Usuários com conta autenticada podem sincronizar seus dados pessoais entre dispositivos.
- Usuários anônimos continuam usando os dados somente no dispositivo local, sem sincronização remota.
- O consumidor da aplicação realiza login e renovação de credenciais usando Better Auth e fornece ao Sync uma identidade opaca da conta e uma credencial válida.
- O bounded context Sync não conhece nem implementa um provedor específico de autenticação; Better Auth fica encapsulado na camada do consumidor/API.
- A primeira fatia de dados pessoais sincronizados cobre somente as notas do `Personal Study`; destaques e categorias ficam fora.
- A sincronização também deve contemplar versões bíblicas já baixadas pelo usuário, permitindo preservá-las para uso em outros dispositivos.
- Para versões bíblicas, a sincronização salva somente metadados da instalação; o dispositivo de destino faz redownload da fonte oficial.
- Ao autenticar uma conta em um dispositivo com notas anônimas, o consumidor oferece uma importação explícita dessas notas para a conta.
- Após a confirmação remota da importação, a nota deixa de pertencer à instalação anônima; a cópia local só é removida depois dessa confirmação.
- Quando a mesma nota for alterada em dispositivos diferentes antes da sincronização, ambas as versões serão preservadas para resolução explícita.
- A sincronização ocorre automaticamente quando possível e também pode ser iniciada manualmente; operações pendentes permanecem em fila local para retomada.
- Cada mutação sincronizável gera uma operação durável na outbox local, identificada para permitir reprocessamento idempotente e retomada por cursor.
- Quando a credencial expirar, for revogada ou estiver ausente, a sincronização pausa, preserva a outbox e solicita nova autenticação.
- Se uma versão sincronizada não puder ser redownloaded da fonte oficial, seu metadado permanece pendente, a indisponibilidade é informada e uma nova tentativa pode ocorrer depois.
- O conteúdo das notas é cifrado ponta a ponta antes do envio; recuperação e rotação das chaves ficam sob responsabilidade do consumidor.
- Uma nova instalação obtém a chave por aprovação explícita de um dispositivo confiável; uma chave de recuperação cobre o caso sem outro dispositivo disponível.
- O fluxo de autorização da conta por código ou QR pode usar o plugin Device Authorization do Better Auth; a aprovação do dispositivo confiável e a transferência de chaves continuam sendo responsabilidade do consumidor.
- A revogação de um dispositivo confiável invalida sua chave e provoca rotação das chaves das notas para os dispositivos restantes.
- O serviço remoto recebe apenas IDs opacos de conta, dispositivo e nota, revisões, cursores e estados técnicos; título, referência e datas permanecem cifrados.
- A exclusão de uma nota gera um tombstone sincronizável, que permanece até a política de retenção confirmar que a exclusão não será reaplicada por um dispositivo atrasado.
- Tombstones são retidos por prazo fixo; um dispositivo que retornar após esse prazo deve fazer reconciliação completa antes de enviar alterações.
- Operações da outbox usam retry automático com backoff exponencial limitado e jitter, preservando a ordem por nota; conflitos e falhas de autenticação interrompem a tentativa.
- A importação preserva o `id` estável da nota; se o mesmo `id` já existir na conta, a colisão gera conflito e não sobrescreve a nota existente.
- A revogação bloqueia novas sincronizações no dispositivo, mas não remove automaticamente suas cópias locais para preservar a leitura offline.
- O Sync expõe conflitos com as duas versões cifradas já descriptografadas no consumidor e uma operação explícita para escolher uma versão ou enviar conteúdo mesclado.
- A resolução oferece “manter local”, “manter remoto” ou “salvar versão mesclada”; qualquer escolha cria uma nova revisão e encerra o conflito.
- O tombstone permanece por exatamente 90 dias; após esse prazo, o dispositivo atrasado deve reconciliar o estado completo antes de enviar alterações.
- Após confirmação remota, a outbox remove o payload da operação e conserva somente checkpoint, cursor e estado mínimo de idempotência.
- A primeira entrega não inclui interface; contratos, ports e adapters serão consumidos pelas interfaces específicas de cada aplicação.
- Operações locais continuam disponíveis sem rede; a indisponibilidade apenas deixa a sincronização pendente.
- O consumidor recebe estados e erros discriminados de autenticação, rede, conflito, chave, fonte de versão e armazenamento local.
- Após 90 dias, a reconciliação baixa registros técnicos, revisões e tombstones, compara o estado localmente e preserva alterações concorrentes antes de qualquer envio.
- Cada operação terá até 5 tentativas automáticas, com backoff de 1s/2s/4s/8s/16s, jitter e limite de 5 minutos; operações da mesma nota são sequenciais e notas distintas podem executar em paralelo.
- Um novo dispositivo recebe a chave por código único ou QR aprovado em dispositivo confiável, com transferência cifrada entre os dispositivos e sem exposição da chave privada ao servidor.
- Dados remotos permanecem enquanto a conta existir; histórico de conflitos resolvidos permanece por 30 dias; a exclusão da conta apaga os dados remotos em até 30 dias, sem apagar cópias locais automaticamente.
- Cada conta pode sincronizar até 1.000 notas ou 20 MB cifrados; a auditoria registra somente eventos técnicos, contagens, latências, retries e códigos de erro.

## Regras de negócio

- A sincronização exige uma conta autenticada.
- O uso offline anônimo não exige conta e não envia dados para o servidor.
- A autenticação e a renovação de credenciais pertencem ao consumidor; Better Auth é a implementação adotada para contas e sessões, enquanto o Sync não implementa login nem escolhe provedor em seu contrato.
- O contrato do Sync deve aceitar somente a identidade e a credencial fornecidas pelo consumidor, sem depender de tipos ou SDKs de um provedor.
- Arquivos SQLite de versões bíblicas não são armazenados no serviço remoto de sincronização.
- Notas anônimas não podem ser migradas para uma conta silenciosamente; a importação exige uma ação explícita da pessoa.
- O Sync não pode descartar ou sobrescrever silenciosamente uma versão concorrente de uma nota.
- A sincronização manual e automática devem usar a mesma fila local e produzir o mesmo resultado observável.
- Falhas durante o envio não podem confirmar uma operação remotamente sem permitir sua retomada local.
- Falha de autenticação não pode apagar nem marcar como concluídas as operações pendentes.
- A indisponibilidade temporária ou permanente da fonte oficial não pode remover automaticamente o metadado da versão sincronizada.
- Falha na importação remota mantém a nota anônima local e permite nova tentativa.
- O serviço remoto não deve precisar acessar o conteúdo em claro das notas sincronizadas.
- O ingresso de um dispositivo deve ser explícito e não pode ocorrer apenas por possuir uma sessão autenticada.
- Uma sessão válida do Better Auth não substitui a aprovação criptográfica de um dispositivo confiável.
- Um dispositivo revogado não pode receber novas chaves nem participar de sincronizações futuras.
- A revogação não pode ser comunicada como garantia de apagamento de dados já armazenados localmente no dispositivo.
- A aprovação de dispositivo não pode enviar a chave privada em claro ao serviço remoto.
- A exclusão remota da conta não pode ser apresentada como exclusão automática das cópias locais.
- Logs e métricas não podem registrar conteúdo Markdown, título, referência, datas ou chaves em claro.
- A resolução não pode sobrescrever uma das versões conflitantes sem registrar a nova revisão resultante.
- A limpeza da outbox não pode remover o estado necessário para detectar reprocessamento ou retomar a sincronização.
- Se todos os dispositivos confiáveis e a chave de recuperação forem perdidos, as notas cifradas não podem ser recuperadas pelo serviço remoto.
- O pacote Sync não pode exigir telas ou componentes de uma plataforma específica.
- O contrato deve distinguir estados e erros de autenticação, rede, conflito, chave, fonte de versão e armazenamento local, preservando dados pendentes.
- O serviço remoto não deve conseguir interpretar título, referência ou datas das notas para indexação de conteúdo.
- Uma nota excluída não pode reaparecer por causa de uma outbox ou dispositivo atrasado.
- Um dispositivo atrasado não pode reenviar uma exclusão ou alteração sem primeiro reconciliar seu estado com o servidor.
- Retry não pode criar operações duplicadas nem reordenar mutações dependentes da mesma nota.
- A reconciliação completa não pode descartar alterações locais nem sobrescrever conflitos sem resolução explícita.
- O retry deve respeitar no máximo 5 tentativas automáticas por operação e não pode bloquear operações independentes de outras notas.
- Uma importação não pode descartar nem sobrescrever uma nota da conta quando houver colisão de identidade.
- A limpeza da outbox deve preservar somente o estado mínimo necessário para idempotência e retomada após confirmação remota.
- A resolução de conflito deve criar uma nova revisão e encerrar o conflito sem apagar o histórico necessário para auditoria local.
- Operações locais não podem ser bloqueadas por falha de rede ou indisponibilidade temporária do serviço remoto.

## Critérios de aceitação

- Given dois dispositivos autenticados, o segundo aprovado e uma fonte oficial disponível, When uma nota é criada, alterada, conflitua e é resolvida offline/online, Then ambas as versões são preservadas, a resolução cria nova revisão e o estado final chega aos dois dispositivos.
- Given uma versão bíblica instalada no primeiro dispositivo, When o segundo dispositivo sincroniza, Then recebe os metadados e redownloaded a versão da fonte oficial sem transportar o arquivo SQLite pelo Sync.
- Given uma nota excluída em um dispositivo, When outro dispositivo sincroniza dentro de 90 dias, Then aplica o tombstone e não recria a nota.
- Given um dispositivo atrasado além de 90 dias, When tenta enviar alterações, Then faz reconciliação completa antes de qualquer mutação remota.
- Given credencial ausente, expirada ou revogada, When o Sync é executado, Then pausa, preserva a outbox e informa necessidade de autenticação.
- Given a rede indisponível, When a pessoa cria ou altera uma nota local, Then a operação é confirmada localmente, entra na outbox e fica pendente sem erro de perda.

## Qualidades e operação

- Segurança: dados sincronizados devem ser associados à conta autenticada correta; o acesso anônimo não pode expor dados remotamente.
- Privacidade: conteúdo e contexto das notas protegidos por criptografia ponta a ponta; somente metadados técnicos opacos permanecem observáveis.
- Desempenho e volume: quota de 1.000 notas ou 20 MB cifrados por conta; retries limitados e operações por notas distintas podem ser paralelas.
- Auditoria e observabilidade: eventos técnicos, contagens, latências, retries e códigos de erro, sem dados em claro.

## Dependências

- Personal Study: notas locais já entregues em `SPEC-0007`.
- Scripture Library: origem e ciclo de instalação das versões bíblicas já baixados.
- Better Auth: camada adotada no consumidor/API para contas, sessões, renovação, revogação e eventual fluxo de autorização por código/QR; não é dependência do pacote Sync.

## Situações de erro

- Credencial ausente, expirada ou revogada: sincronização pausada e outbox preservada.
- Rede ou serviço remoto indisponível: operação local preservada e retry posterior.
- Conflito ou colisão de identidade: versões preservadas para resolução explícita.
- Chave indisponível ou dispositivo revogado: sincronização bloqueada sem apagar cópias locais.
- Fonte oficial de versão indisponível: metadado pendente e redownload posterior.
- Armazenamento local indisponível: mutação não confirmada localmente nem adicionada à outbox.

## Escopo

- Dentro: sincronização das notas do `Personal Study` e preservação das versões bíblicas já baixadas pelo usuário.
- Fora: destaques e categorias do `Personal Study`, salvo decisão posterior.

## Dúvidas, decisões e riscos

- Decisão confirmada na conversa de 2026-08-29 (opção 1): conta autenticada é obrigatória para sincronização; uso anônimo permanece somente local.
- Decisão confirmada na conversa de 2026-08-29 (opção 1): login e renovação ficam no consumidor; o Sync recebe identidade opaca da conta e credencial válida, sem conhecer o provedor.
- Decisão confirmada na conversa de 2026-08-29: Better Auth será adotado no consumidor/API como implementação da camada de contas, login, sessões, renovação e revogação; o contrato do Sync permanece agnóstico ao provedor.
- O plugin Device Authorization do Better Auth pode acelerar o ingresso por código/QR, mas não implementa o registro de dispositivos confiáveis nem o ciclo de chaves E2EE exigido pelo Sync.
- A integração Better Auth com Turso/libSQL será validada na especificação por meio do adapter Kysely compatível; a documentação consultada lista o dialeto libSQL como comunitário, não como adapter Turso nativo do Better Auth.
- Decisão confirmada na conversa de 2026-08-29 (opção 1): a primeira fatia sincroniza somente notas; destaques e categorias ficam para depois.
- Necessidade adicionada na mesma resposta: versões bíblicas já baixadas devem ser sincronizadas e salvas para uso em outros dispositivos.
- Decisão confirmada na conversa de 2026-08-29 (opção 1): versões sincronizam somente metadados da instalação; o dispositivo de destino faz redownload da fonte oficial, sem cópia remota do arquivo SQLite.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do ciclo adicional): o consumidor oferece importação explícita das notas anônimas locais para a conta autenticada.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): após confirmação remota, a nota importada passa a pertencer à conta e a cópia anônima local pode ser removida.
- Decisão confirmada na conversa de 2026-08-29 (opção 3 do novo ciclo): sincronização híbrida, automática quando possível e manual sob demanda, com fila local para retomada.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): outbox durável por operação, chave de idempotência, cursor de sincronização e retry seguro.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do ciclo adicional): conflitos preservam ambas as versões e exigem resolução explícita, sem sobrescrita silenciosa.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): credencial expirada, revogada ou ausente pausa a sincronização, preserva a outbox e exige nova autenticação.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): se a fonte oficial não puder fornecer uma versão, o metadado permanece pendente, a indisponibilidade é informada e uma nova tentativa fica permitida.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): conteúdo das notas usa criptografia ponta a ponta; recuperação e rotação de chaves ficam no consumidor.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): novo dispositivo é aprovado por dispositivo confiável, com chave de recuperação como contingência.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): dispositivo perdido ou revogado perde sua chave, e as chaves das notas são rotacionadas para os dispositivos restantes.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): perda de todos os dispositivos confiáveis e da chave de recuperação torna as notas cifradas irrecuperáveis.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): ficam visíveis somente IDs opacos, revisões, cursores e estados técnicos; dados de conteúdo e contexto da nota ficam cifrados.
- Decisão confirmada na conversa de 2026-08-29 (opção 2 do novo ciclo): dispositivo revogado apenas perde a capacidade de sincronizar; suas cópias locais permanecem disponíveis offline.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): novo dispositivo é aprovado por código único ou QR, com transferência cifrada entre dispositivos confiáveis e sem chave privada em claro no servidor.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): dados remotos permanecem durante a conta, conflitos resolvidos por 30 dias e exclusão da conta remove dados remotos em até 30 dias; cópias locais exigem ação separada.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): o consumidor recebe ambas as versões do conflito e pode escolher uma ou enviar uma versão mesclada.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): resolução por manter local, manter remoto ou salvar versão mesclada cria nova revisão e encerra o conflito.
- Detalhes técnicos de entrada/remoção de dispositivos, rotação, revogação, cópias locais antigas e retenção do histórico de conflitos serão materializados na spec, sem nova decisão de produto pendente.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): exclusões propagam tombstones, retidos até confirmação dos dispositivos ou o prazo definido pela política de retenção.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): tombstones são retidos por exatamente 90 dias; dispositivo posterior ao prazo faz reconciliação completa antes de enviar.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): reconciliação completa baixa registros técnicos, revisões e tombstones, compara localmente e preserva alterações concorrentes antes de enviar.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): retry automático usa backoff exponencial limitado e jitter, mantém ordem por nota e para diante de conflito ou autenticação.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): retry tem até 5 tentativas com backoff 1s/2s/4s/8s/16s, jitter e limite de 5 minutos; mantém ordem por nota e paraleliza notas distintas.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): após confirmação remota, a outbox remove o payload e mantém somente checkpoint, cursor e estado mínimo de idempotência.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): importação preserva o `id` da nota; colisão com nota existente gera conflito sem sobrescrita.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 do novo ciclo): a primeira entrega não inclui interface; entrega somente contratos, ports e adapters.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): rede indisponível não bloqueia operações locais; mutações entram na outbox para sincronização posterior.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): contrato usa estados e erros discriminados para autenticação, rede, conflito, chave, fonte de versão e armazenamento local, preservando operações pendentes.
- Decisão confirmada na conversa de 2026-08-29 (opção 1 deste ciclo): cada conta tem quota de 1.000 notas ou 20 MB cifrados; auditoria registra somente eventos técnicos, contagens, latências, retries e códigos de erro, sem conteúdo em claro.

### Síntese do ciclo de descoberta de 2026-08-29

O ciclo atingiu o limite de oito rodadas do contrato de perguntas. Foram confirmados: conta autenticada obrigatória para sincronização; autenticação pertencente ao consumidor; primeira fatia de dados pessoais limitada a notas; e sincronização de versões bíblicas apenas por metadados, com redownload oficial. As lacunas acima impedem o `Definition Gate` e a promoção para `$specsfy-03-specify`.

Em 2026-08-29, a pessoa responsável reabriu a descoberta com limite de quatro perguntas adicionais.

Em 2026-08-29, a pessoa responsável solicitou continuar sem confirmações intermediárias e iniciou novo ciclo com limite de oito perguntas adicionais.

O ciclo adicional também atingiu o limite de oito rodadas. As decisões novas cobrem importação segura, conflitos, gatilho híbrido, outbox durável, credenciais, redownload, posse pós-importação, criptografia ponta a ponta, ciclo de chaves, tombstones, retry e deduplicação. As lacunas de ciclo de vida das chaves, protocolo detalhado, retenção, exclusão e interface ainda impedem o `Definition Gate`.

Em 2026-08-29, a pessoa responsável iniciou outro ciclo com limite de oito perguntas adicionais. Foram fechados perda irrecuperável de chaves, revogação sem apagamento local, contrato e ações de resolução de conflitos, tombstone de 90 dias, limpeza da outbox e ausência de interface na primeira entrega. Permanecem pendentes os critérios de aceite, cenários de erro, reconciliação completa, limites do retry, detalhes do ciclo de chaves, retenção/auditoria/quotas e histórico de conflitos.

Em 2026-08-29, a pessoa responsável iniciou novo ciclo com limite de oito perguntas adicionais. Foram fechados o cenário principal de aceite, comportamento offline, erros discriminados, reconciliação não destrutiva, limites de retry, aprovação por código/QR, retenção remota, exclusão da conta, quota de 1.000 notas ou 20 MB e auditoria sem conteúdo. Permanecem pendentes apenas a materialização técnica dos contratos, o detalhamento final do ciclo de chaves, a retenção do histórico local de conflitos e a validação formal do Definition Gate.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promovido para `specs/defined/0008-sincronizacao-multidispositivo-offline-first-com-turso/spec.md`; a spec materializa contratos, tarefas e testes sem reabrir decisões de produto confirmadas.
