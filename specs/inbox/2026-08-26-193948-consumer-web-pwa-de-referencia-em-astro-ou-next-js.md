# Inbox: Consumer Web PWA de referência em Astro ou Next.js

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:48Z |
| Slug | consumer-web-pwa-de-referencia-em-astro-ou-next-js |
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

**Inferência:** Provar o engine em um consumidor Web/PWA real usando o adapter SQLite Web concluído.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** A conformance do package passa isoladamente, mas ainda não existe uma aplicação Astro ou Next.js que prove integração de bundler, assets, lifecycle e operação offline.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Equipe Web do Open Bible e usuários da futura PWA.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Reduzir risco da migração strangler e validar a API pública em uma aplicação real sem duplicar regra de negócio.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** Decisão anterior: Web será Astro ou Next.js e cobrirá mobile inicialmente via PWA; a UI não pertence ao engine.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Somente configuração de consumo, versão instalada e fixtures de integração; dados de produto permanecem no app consumidor.

### Riscos e dependências

**Análise preliminar:** Acoplamento do engine a framework, problemas de bundling Worker/WASM e mistura entre spec do engine e spec da aplicação.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Criar consumer mínimo de referência ou contrato de integração; decidir se vive neste monorepo ou no novo app Web.

## Pontos a revisar no futuro

**A revisar:** Escolher Astro ou Next.js para o primeiro consumer e definir a fronteira exata entre engine e aplicação.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
