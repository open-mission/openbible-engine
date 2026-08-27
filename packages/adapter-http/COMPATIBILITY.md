# Compatibilidade — @openbible/adapter-http

## Política de versionamento

semver/0.x: `patch` não quebra; `minor` pode quebrar com changelog + guia de
migração; `major` congela a superfície estável.

## Superfície estável

- `HttpBiblePackageSource` e `HttpBiblePackageSourceOptions`

## Garantias preservadas

- Fonte/catálogo opcional; `fetch` injetável; sem URL fixa no core.

## Fonte normativa

Spec `0003-distribuicao-versionada-e-estabilidade-da-api-publica` (SPEC-0003).
