# Inbox: Sincronização multidispositivo offline-first com Turso

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:50Z |
| Slug | sincronizacao-multidispositivo-offline-first-com-turso |
| Origem | Input do usuário |
| Processamento | Análise inicial sem perguntas |
| Sessão de descoberta | Captura avulsa. |
| Turno da conversa | Não se aplica. |
| Integridade do original | SHA-256 `3224d9db3dba553c88c27d0c7e4a0fc46e60d3cc744252d62d3def5ab0346558` |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

show vamos lá usando o specsgy eu preciso que configure o projeto engine para que ele saiba quais sao os proximos passos e especs, depois configurar preencha o inbox com as proximas etapas

## Contexto consultado

Nenhuma fonte contextual consultada.

## Resumo processado

**Inferência:** Projetar sync opcional sobre dados locais sem tornar Turso obrigatório para leitura ou escrita offline.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Dados pessoais ficam isolados por dispositivo e ainda não existe protocolo de sincronização, identidade, conflitos ou retomada.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Usuários com múltiplos dispositivos e equipes responsáveis por Web, desktop e mobile.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Manter dados pessoais consistentes entre dispositivos preservando funcionamento 100% offline.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** TursoDB é opção futura, não requisito local; separar domínio Sync, transporte e adapter remoto; considerar outbox, cursor, tombstone e idempotência.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Identidade remota, operações pendentes, revisões, tombstones, cursores, conflitos e timestamps lógicos.

### Riscos e dependências

**Análise preliminar:** Perda de dados, conflitos silenciosos, privacidade, autenticação, migrações e dependência de rede.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Modelar protocolo e política de conflitos antes do adapter Turso; iniciar com Personal Study, não com bancos bíblicos públicos.

## Pontos a revisar no futuro

**A revisar:** Definir identidade/autenticação, política por entidade, criptografia, retenção e fonte de verdade.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
