# Inbox: Journal durável para crash-safety completa

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:50Z |
| Slug | journal-duravel-para-crash-safety-completa |
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

**Inferência:** Evoluir instalação e desinstalação de best-effort para recuperação determinística onde o runtime permitir.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Adapters Node e Web recuperam estados conhecidos por heurística, mas não distinguem todos os crashes sem journal por operação.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Consumidores que exigem maior durabilidade e mantenedores dos adapters SQLite.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Reduzir ambiguidade após interrupção e comprovar recuperação por fase sem exagerar garantias de power loss.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** ADR-013 e DEC-020 já registram journal futuro com operação, versionId, fase e snapshot do registry; separar process crash de fsync/power loss.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Journal de operação, fase, versão, snapshot do registry e timestamps técnicos de recuperação.

### Riscos e dependências

**Análise preliminar:** Complexidade, escrita adicional, divergência Node/Web e falsa promessa de durabilidade física.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Refinar após uso real ou antes do 1.0, com spec distinta por garantia/runtimes suportados.

## Pontos a revisar no futuro

**A revisar:** Definir se Node e Web entram juntos, semântica de fsync, formato/versionamento do journal e custo aceitável.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
