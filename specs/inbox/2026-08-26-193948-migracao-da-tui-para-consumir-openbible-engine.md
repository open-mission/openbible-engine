# Inbox: Migração da TUI para consumir openbible-engine

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:48Z |
| Slug | migracao-da-tui-para-consumir-openbible-engine |
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

**Inferência:** Migrar a TUI pelo padrão strangler para usar parser, ports e adapter oficial do engine.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** A TUI legada mantém parsing e persistência próprios; o adapter Node é comprovado em Node.js, mas compatibilidade com Bun não foi afirmada.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Equipe da TUI OpenTUI e usuários de terminal.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Eliminar duplicação de regras e provar um segundo consumidor real mantendo rollback incremental.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** Avaliar executar a TUI em Node, comprovar Bun ou criar adapter específico; preservar UI e migrar uma jornada por vez.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Configuração local, registry e bancos bíblicos existentes da TUI.

### Riscos e dependências

**Análise preliminar:** Diferenças Node/Bun, incompatibilidade de driver, migração de paths e quebra de dados existentes.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Refinar primeiro a decisão de runtime/adapter e um slice leitura-busca antes da migração completa.

## Pontos a revisar no futuro

**A revisar:** Confirmar se a TUI continuará em Bun, estratégia de compatibilidade dos dados e ordem das jornadas migradas.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
