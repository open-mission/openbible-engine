# Evidência libSQL e Kysely

Data de acesso: 2026-08-29
Versão consultada: `@libsql/kysely-libsql` 0.4.1, conforme `npm view`.
Licença/conteúdo: somente metadados e síntese própria; nenhum trecho extenso da
documentação foi copiado.

## Kysely dialect

Fontes:

- https://better-auth.com/docs/adapters/other-relational-databases
- https://github.com/libsql/kysely-libsql

Better Auth permite usar dialetos Kysely e lista libSQL/sqld entre os dialetos
comunitários. `@libsql/kysely-libsql` fornece `LibsqlDialect` para conexões
HTTP/WebSocket libSQL e não suporta URL `file:` local.

Impacto: Turso é tecnicamente viável para a persistência remota de contas e Sync
por um adapter Kysely/libSQL, mas a integração não deve ser tratada como adapter
Turso nativo do Better Auth. A spec exige validar migrations, transações,
concorrência, conexão e comportamento de falha antes do Plan Gate.
