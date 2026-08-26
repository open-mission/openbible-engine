# ADR 013 — Instalação exception-safe E crash-safe via reconciliação

Data: 2026-08-26
Status: Aceita

## Decisão

A instalação/desinstalação do adapter Node é **exception-safe** (compensação
verificável: sem parcial, preserva versão anterior, sem divergência
registry/armazenamento, sem `.tmp`/`.bak` residuais) e **crash-safe**: ao abrir
o adapter, `reconcileNodeDataDir` repara os estados intermediários de
`.tmp`/`.bak`/`.trash`.

## Estados reconciliados

- final ausente + `.bak` presente → restaura o anterior;
- final + `.bak` presentes → rollback para o anterior;
- `.trash` presente + registry presente + final ausente → restaura;
- `.trash` presente + registry ausente + final ausente → descarta;
- `.tmp` abandonado → removido;
- registro sem arquivo no disco → registro obsoleto removido.

## Consequências

A operação deixa de ser meramente "crash-atomic por intenção" e passa a ter uma
garantia recuperável comprovada por testes dos estados intermediários.

## Fonte

Spec 0001 (Revisão 2), DEC-018; `packages/adapter-sqlite-node/src/bible-store.ts`.
