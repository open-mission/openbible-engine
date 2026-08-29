# ADR 003 — Adapters oficiais

Data: 2026-08-26
Status: Aceita

## Decisão

Prover `adapter-sqlite-web` (boundary WASM/Worker/OPFS plano), `adapter-sqlite-node` (driver injetável, schema legado), `adapter-http` (catálogo/download opcional) e `@openbible/adapter-sqlite-native` (filesystem Native síncrono, parser legado e staging de downloads) atrás de ports orientadas ao domínio.

## Consequências

Cada adapter implementa `BibleLibrary`/`BiblePackageSource` e é validado por suite única contra mesma fixture sintética; operadores locais nunca dependem de HTTP.
