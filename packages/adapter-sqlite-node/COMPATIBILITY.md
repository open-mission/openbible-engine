# Compatibilidade — @openbible/adapter-sqlite-node

## Política de versionamento

semver/0.x: `patch` não quebra; `minor` pode quebrar com changelog + guia de
migração; `major` congela a superfície estável.

## Superfície estável

- `createNodeAdapter` e `NodeAdapterOptions`, `NodeAdapter`
- Drivers injetáveis para leitura, instalação e registry (`NodeBibleLibrary`,
  `NodeBibleInstaller`, `NodeSqliteRegistry`)

## Garantias preservadas

- Node.js (`node:fs`/`node:path`/`node:sqlite`); exception-safe com reconciliação
  best-effort; compatibilidade com Bun não afirmada.

## Fonte normativa

Spec `0003-distribuicao-versionada-e-estabilidade-da-api-publica` (SPEC-0003).
