# Inbox: Adapter Native SDK e consumer desktop mínimo

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-08-26T22:39:48Z |
| Slug | adapter-native-sdk-e-consumer-desktop-minimo |
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

**Inferência:** Transformar a compatibilidade com Vercel Native SDK de hipótese em prova compilável e executável.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** O Native SDK está reservado como consumidor futuro, mas o subset TypeScript e o acesso SQLite/filesystem ainda não foram comprovados.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Equipe do novo aplicativo desktop nativo e usuários desktop.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Permitir um app desktop separado que consuma o mesmo domínio, com adapter nativo atrás das ports existentes.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** Decisão anterior: desktop será um novo app baseado em Vercel Native; preferir adapter TypeScript aceito pelo SDK e usar bridge Zig/C fina somente se necessário.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Registry local, bancos bíblicos instalados e capabilities do runtime nativo.

### Riscos e dependências

**Análise preliminar:** Incompatibilidade do compilador estático, driver SQLite inadequado, lifecycle diferente e expansão acidental do core.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Pesquisa técnica e consumer mínimo primeiro; depois promover implementação do adapter nativo.

## Pontos a revisar no futuro

**A revisar:** Confirmar versão/API do Native SDK, plataformas desktop iniciais, driver SQLite e local do consumer de prova.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.

## Próximo passo

Manter em `specs/inbox/` ou refinar com `$specsfy-02-backlog`.
