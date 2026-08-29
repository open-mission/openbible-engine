# Proveniência do contexto local

Data: 2026-08-29

## Propósito

Registrar quais fontes locais foram consultadas para montar a SPEC-0007, sem
copiar conteúdo protegido e sem criar uma fonte normativa paralela.

## Fontes consultadas

- `specs/inbox/2026-08-26-193949-bounded-context-personal-study-offline.md` —
  captura original e sinais de escopo.
- `specs/backlog/0007-bounded-context-personal-study-offline.md` — decisões
  confirmadas durante o refinamento.
- `.specsfy/DATABASE.md` — dados, relações, ownership e ciclo de vida
  confirmados.
- `PROJECT.md`, `.specsfy/STACK.md` e `.specsfy/RULES.md` — finalidade,
  stack e regras de arquitetura.
- `packages/engine-core/src/types.ts` e `packages/engine*/package.json` —
  contratos seriais, epoch milliseconds e convenções de package.

## Conclusão

O Personal Study deve permanecer separado do Scripture Library, operar por
ports locais injetados e manter o core sem dependências de plataforma. Nenhuma
API externa foi consultada e nenhum banco ou dado real foi copiado.
