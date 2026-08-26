# ADR 007 — Native SDK como consumidor substituível

Data: 2026-08-26
Status: Aceita

## Decisão

`@openbible/engine-core` projetado para futura compilação no Native SDK. O futuro app desktop consumirá o core em `src/services` com filesystem/rede/SQLite atrás de effects/services. Se driver TypeScript não for aceito, adapter Zig/C fino atrás da mesma port.

