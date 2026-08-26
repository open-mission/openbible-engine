# ADR 013 — Instalação exception-safe + reconciliação best-effort na inicialização

Data: 2026-08-26
Status: Revista (não reivindica crash-safety completa)

## Decisão

A instalação/desinstalação do adapter Node é **exception-safe** (compensação
verificável: sem parcial, preserva versão anterior, sem divergência
registry/armazenamento, sem `.tmp`/`.bak` residuais).

Na inicialização, `reconcileNodeDataDir` faz **reconciliação best-effort**
(startup reconciliation), reparando estados intermediários de
`.tmp`/`.bak`/`.trash` por heurística determinística:

- `.tmp` abandonado → removido;
- final ausente + `.bak` presente → restaura o anterior;
- final + `.bak` presentes → **ambíguo sem journal**; rollback determinístico
  ao anterior;
- `.trash` + registry presente + final ausente → restaura;
- `.trash` sem registry + final ausente → descarta;
- `.db` sem entrada no registry → **órfão**, removido (ex.: primeira instalação
  interrompida após o promote e antes do registry);
- registro sem arquivo no disco → registro obsoleto removido.

## Limites (não crash-safe completa)

- `.db + .bak` é ambíguo sem journal por operação;
- `node:fs` renames não são fsync'd: não há durabilidade contra *power loss*,
  apenas contra *process interruption*;
- crash-safety total exigiria journal por operação (tipo, versionId, fase,
  snapshot do registry anterior), atualização antes de cada transição,
  reconciliação determinística de todas as fases e teste de interrupção após
  cada rename e após `registry.set`. Fica como **spec futura** (DEC-020).

## Fonte

Spec 0001 (Revisão 2, item 7) e DEC-018/020; `packages/adapter-sqlite-node/src/bible-store.ts`.
