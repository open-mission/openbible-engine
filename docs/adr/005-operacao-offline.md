# ADR 005 — Operação offline-first

Data: 2026-08-26
Status: Aceita

## Decisão

Garantir que leitura, busca e acesso via `BibleLibrary`/`InstalledBibleRegistry` nunca provoquem rede; `BiblePackageSource` é opcional e injetado. Com rede indisponível, operações locais não tentam HTTP (teste NFR).

