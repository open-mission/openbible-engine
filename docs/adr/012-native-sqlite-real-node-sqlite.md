# ADR 012 — Adapter nativo sobre arquivo SQLite real via `node:sqlite`

Data: 2026-08-26
Status: Aceita

## Decisão

`adapter-sqlite-native` opera contra um arquivo SQLite real com driver Node/Bun
injetável (implementado com `node:sqlite` `DatabaseSync`, sem addon nativo). O
banco temporário real contém `metadata`, `book`, `verse`; consultas são reais;
a fixture é gerada para os testes (`buildRealSqliteBibleFixture`) e removida ao
final. A persistência é provada fechando e reabrindo a engine.

## Consequências

- Suporte a reabertura de processo (registry `installed_bibles` persistente).
- Compatibilidade com Native SDK tratada como hipótese: um driver TS puro é
  mais aceitável em compilador estático; se não, adapter Zig/C na mesma port.
- `better-sqlite3` fica somente no adapter e não é dependência do core/engine.
