# ADR 009 — Migração strangler futura

Data: 2026-08-26
Status: Aceita

## Decisão

O projeto legado `open-bible` será o primeiro consumidor do engine em migração incremental com rollback. Web, TUI e novo app Native SDK deverão ser consumidores reais antes da versão estável `1.0` do engine.

