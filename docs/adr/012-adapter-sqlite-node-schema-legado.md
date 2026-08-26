# ADR 012 — Adapter `@openbible/adapter-sqlite-node` sobre o schema legado

Data: 2026-08-26
Status: Revisada

## Decisão

O adapter real do enginé opera sobre arquivo SQLite compatível com o schema do
Open Bible legado:
- `book(id INTEGER PRIMARY KEY)`;
- `verse(book_id INTEGER, chapter INTEGER, verse INTEGER, text TEXT[, translation])`;
- `metadata(key TEXT PRIMARY KEY, value TEXT)` com `name` (e `versionId` OPCIONAL);
- campos adicionais (ex. `translation`, `copyright`) não quebram leitura.

Os IDs numéricos 1..66 do SQLite são convertidos para os canônicos do domínio
(`gen`..`rev`) via `legacy-book-map.ts` (ordem = `BOOKS`/`BOOK_META` legada) ao
listar livros, ler capítulos e buscar. Driver injetável via `node:sqlite`.

Package renomeado para `@openbible/adapter-sqlite-node`; `@openbible/adapter-sqlite-native`
fica reservado para o futuro adapter do Native SDK (runtimes não compartilháveis).
Documentado como adapter **Node.js** (`node:fs`/`node:path`/`node:sqlite`);
compatibilidade com Bun não é afirmada (não executada).

## Consequências

- Identidade da versão vem do input/manifest; `metadata.versionId` é validado
  quando presente e não é exigido (bancos legados não são rejeitados).
- `NodeBibleLibrary` expõe `closeVersion`/`close`; a conexão é fechada antes de
  substituir/remover o arquivo; `NodeAdapter.close()` fecha library e registry.
- `SearchResult.total` = `COUNT(*)` antes do LIMIT, ordem canônica.

## Fonte

Spec 0001 (Revisão 2), DEC-015/016/017/019; `packages/adapter-sqlite-node/src/`.
