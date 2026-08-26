# ADR 003 — Adapters oficiais

Data: 2026-08-26
Status: Aceita

## Decisão

Prover `adapter-sqlite-web` (boundary WASM/Worker/OPFS mínimo), `adapter-sqlite-native` (driver injetável) e `adapter-http` (catálogo/download opcional) atrás de ports orientadas ao domínio.

## Consequências

Cada adapter implementa `BibleLibrary`/`BiblePackageSource` e é validado por suite única contra mesma fixture sintética; operadores locais nunca dependem de HTTP.

