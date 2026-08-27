# Compatibilidade — @openbible/engine-core

## Política de versionamento

semver/0.x: `patch` não quebra; `minor` pode quebrar com changelog + guia de
migração; `major` congela a superfície estável.

## Superfície estável

- `normalizeId`, `normalizeBookId`, `normalizeVersionId`, `validateIdNoTraversal`
- `parseReference`, `parseReferenceToBibleReference`
- `BOOKS`, `BOOK_MAP`, `BOOK_BY_ID`, `BOOK_BY_ABBR`
- `EngineError`, `createEngineError`, `isEngineError`, `throwEngineError`
- Tipos e contratos: `BibleBook`, `BibleReference`, `BibleVersion`, `Verse`,
  `InstalledBible`, `ParsedReference`, `SearchRequest`, `SearchResult`,
  `CancellationToken`, `EngineErrorCode`, `InstallationStage`, `InstallationProgress`

## Garantias preservadas

- zero dependências de runtime; determinístico/síncrono; sem plataforma.

## Fonte normativa

Spec `0003-distribuicao-versionada-e-estabilidade-da-api-publica` (SPEC-0003).
