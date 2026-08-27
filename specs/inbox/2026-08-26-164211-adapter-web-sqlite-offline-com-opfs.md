# Inbox: Adapter Web SQLite offline com OPFS

| Metadado | Valor |
| --- | --- |
| Status | Implementada — SPEC-0002 concluída |
| Capturada em | 2026-08-26T19:42:11Z |
| Slug | adapter-web-sqlite-offline-com-opfs |
| Origem | Input do usuário |
| Processamento | Promovida para backlog/spec e implementada |
| Sessão de descoberta | Captura avulsa. |
| Turno da conversa | Não se aplica. |
| Integridade do original | SHA-256 `4d569c31d6c7cb6292761b9dcc4d651d2169c643dd5be61df7bcc2b98e86c061` |
| Backlog derivado | `specs/backlog/0002-adapter-web-sqlite-offline-com-opfs.md` |
| Spec derivada | `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` |

## Texto original

ok vamos seguir

## Contexto consultado

Nenhuma fonte contextual consultada.

## Resumo processado

**Inferência:** Prosseguir para a próxima fatia do openbible-engine: um adapter Web real para operação bíblica offline em navegador.

## Análise inicial

### Problema ou oportunidade

**Declaração ou inferência identificada:** O package adapter-sqlite-web atual é apenas uma fatia planejada e não permite que consumidores Web/PWA usem a engine com persistência SQLite real offline.

### Pessoas afetadas ou beneficiadas

**Declaração ou inferência identificada:** Desenvolvedores e futuros consumidores Web/PWA do Open Bible; usuários finais que precisam de leitura e busca offline no navegador.

### Resultado ou valor esperado

**Declaração ou inferência identificada:** Permitir instalar, persistir, reabrir, consultar e remover Bíblias SQLite no navegador por meio dos contratos públicos da engine.

### Sinais de escopo, regras ou solução

**Sinais extraídos, não decisões:** Inferência confirmada pelo contexto imediatamente anterior: implementar Worker + SQLite WASM + OPFS/SAHPool, com testes em navegador real, sem alterar a spec 0001 concluída.

### Informações que talvez precisem ser guardadas

**Sinais para conversar depois, não confirmação:** Arquivos SQLite bíblicos locais, registry de versões instaladas e artefatos temporários de instalação no armazenamento privado do navegador.

### Riscos e dependências

**Análise preliminar:** Compatibilidade de OPFS e Worker, isolamento de acesso SQLite, concorrência, lifecycle do worker, instalação exception-safe, testes reais de navegador e empacotamento WASM.

## Possíveis direções futuras

**Hipóteses para backlog ou spec, não requisitos:** Criar backlog e nova spec para uma fatia vertical Web: instalar fixture SQLite legada, fechar/reabrir contexto, listar livros, ler capítulo, buscar e desinstalar.

## Pontos a revisar no futuro

**A revisar:** Definir navegadores suportados, estratégia exata de VFS/OPFS, runner de navegador real, ownership do registry Web e garantia de recuperação após interrupção.

## Rastreabilidade

- Formulação original preservada integralmente nesta captura.
- Análises não substituem decisões do usuário.
- Backlogs e specs derivados devem referenciar este arquivo.
- Implementação registrada em `SPEC-0002`; a captura permanece somente como fonte histórica.

## Próximo passo

Captura processada; nenhuma ação adicional nesta entrada.
