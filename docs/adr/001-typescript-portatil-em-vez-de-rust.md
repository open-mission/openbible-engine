# ADR 001 — TypeScript portátil em vez de Rust

Data: 2026-08-26
Status: Aceita

## Contexto

O engine precisa ser consumido por Web/PWA, desktop Native SDK e TUI, mantendo instalação atômica e parsing determinístico. A equipe domina TypeScript; Rust exigiria bridge e aumentaria curva de migração strangler do legado (`domain-bible`).

## Decisão

Escrever `engine-core` em TypeScript portátil, síncrono e determinístico, conservador o suficiente para futura compilação pelo subset TypeScript do Native SDK. Se um driver SQLite TypeScript não for aceito pelo compilador estático, criar adapter fino em Zig/C atrás da mesma `BibleLibrary` port.

## Consequências

- Ganho de velocidade de entrega e compartilhamento de tipos.
- Perda de safety de borrow checker compensada por testes arquiteturais, contract suite e tipagem strict.
- Native SDK permanece consumidor substituível, nunca dependência do core.

## Alternativas

Rust (compilação WASM + bridge) rejeitada por custo de integração e time-to-market.

## Fonte

Spec 0001 seção 17 DEC-001, engine-core zero deps, `docs/architecture.md`.

