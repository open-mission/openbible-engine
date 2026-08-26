# ADR 002 — Arquitetura hexagonal

Data: 2026-08-26
Status: Aceita

## Contexto

Isolar regras puras de I/O (SQLite WASM/Worker/OPFS, better-sqlite3, fetch) para garantir offline-first e substituição de adapters.

## Decisão

Adotar hexagonal: `engine-core` (entidades, parser, erros, invariantes, zero deps) ← `engine` (`BibleLibrary`, `InstalledBibleRegistry`, `BiblePackageSource`, `Clock`, use-cases, façade `createBibleEngine`) ← adapters (web/native/http) e `engine-testing`/`conformance-cli` consomem apenas exports públicos.

## Consequências

- Core testável sem plataforma; frontend via ports.
- Fronteiras garantidas por `package.json`/`exports`/`eslint`/`contract suite`, não por Turborepo.

## Alternativas

Camadas implícitas rejeitadas por acoplamento e vazamento de SQL/conexões.

