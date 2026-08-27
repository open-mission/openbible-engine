# Compatibilidade — @openbible/engine

## Política de versionamento

Este pacote segue **semver/0.x**: em `0.x`, uma versão de `patch` não introduz
quebra compatível em `minor`; uma versão de `minor` **pode** introduzir quebra,
mas deve ser acompanhada de `changelog` e guia de migração. A passagem para
`major` (e eventual `1.0`) congela a superfície estável e passa a proibir quebra
em `minor`.

## Superfície estável

- `createBibleEngine(deps: BibleEngineDeps): BibleEngine`
- Métodos próximos da façada retornada: `listAvailableVersions`,
  `listInstalledVersions`, `installVersion`, `uninstallVersion`, `getBooks`,
  `getChapter`, `searchVerses`, `parseReference`.
- Contratos serializáveis e códigos de erro estáveis (`version_not_installed`,
  `invalid_reference`, `invalid_package`, `unsupported_schema`,
  `storage_unavailable`, `storage_full`, `database_locked`,
  `network_unavailable`, `cancelled`).

## Garantias preservadas

- `engine` continua puro (sem plataforma/SQLite/DOM) e só depende de
  `engine-core`.
- Nenhuma dependência de runtime nova é adicionada fora do contrato desta spec.

## Fonte normativa

Spec `0003-distribuicao-versionada-e-estabilidade-da-api-publica` (SPEC-0003).
