# ADR 011 — Web/OPFS como fatia planejada (adapter não funcional)

Data: 2026-08-26
Status: Revisada (correção de arquitetura)

## Contexto

A fundação experimental rotulava `SqliteWebLibrary` como adapter SQLite
"funcional" delegando a um `Map`, o que não é um adapter real.

## Decisão

- `adapter-sqlite-web` é uma FATIA PLANEJADA: não implementa storage real e não
  é apresentado como concluído.
- Critérios de aceite: Worker + SQLite WASM + OPFS/SAHPool + testes de
  integração em navegador real.
- Implementações in-memory foram movidas para fakes em
  `@openbible/engine-testing` (`FakeLibrary`, `FakeBibleInstaller`).

## Consequências

- Nenhuma operação de produção depende do adapter web nesta entrega.
- A fatia planejada é rastreável na spec (escopo + DoD) e documentada em
  `docs/`.
