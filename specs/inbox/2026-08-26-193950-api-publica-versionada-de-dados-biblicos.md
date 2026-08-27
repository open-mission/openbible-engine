# Inbox: API pública versionada de dados bíblicos

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:50Z |
| Slug | api-publica-versionada-de-dados-biblicos |
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

**Inferência:** Expor dados bíblicos por uma API pública separada do funcionamento offline dos consumidores.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** Não existe contrato remoto estável para terceiros ou consumidores que queiram consultar catálogo, livros, capítulos e busca.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Desenvolvedores externos e aplicações Open Bible que precisem de acesso remoto opcional.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Permitir consumo autorizado e versionado dos dados bíblicos sem acoplar a engine local ao servidor.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** A API pode usar Turso ou outro armazenamento server-side, mas deve reutilizar contratos do domínio e permanecer opcional.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Versões, livros, versos, metadata, licenças, chaves de cliente, quotas e métricas agregadas.

### Riscos e dependências

**Análise preliminar:** Licenciamento de traduções, abuso, rate limit, custo de busca, versionamento e exposição indevida.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Fazer discovery de licenças e contrato API antes de escolher persistência/hosting.

## Pontos a revisar no futuro

**A revisar:** Definir traduções publicáveis, autenticação, rate limits, versionamento e SLA.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
