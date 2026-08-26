# ADR 010 — Engine não interpreta SQLite; port BibleInstaller é dono da atomicidade

Data: 2026-08-26
Status: Revisada (correção de arquitetura)

## Contexto

A fundação experimental fazia a engine procurar JSON após `SQLite format 3\0`
e coordenar atomicidade entre `BibleLibrary` e `InstalledBibleRegistry`
independentes via descoberta dinâmica de `install`/`installPackage`/`save`.
Isso não constituía atomicidade real e acoplava a engine ao formato.

## Decisão

- A engine (`@openbible/engine`) NÃO interpreta header/schema/metadata/sanity:
  isso pertence ao adapter.
- Novo port `BibleInstaller` é o único escritor transacional do armazenamento
  bíblico e do registry, dono do ciclo stage → validate → commit →
  rollback/cleanup, com compensação verificável.
- `BibleLibrary` é somente-leitura; removidos hooks opcionais e descoberta
  dinâmica. Cancelamento via `CancellationToken` portátil; sem
  `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder`.

## Consequências

- Invariantes verificáveis em teste: instalação sem parcial, versão anterior
  preservada, temporários removidos, registry/armazenamento sem divergência.
- Adapter passa a ser responsável por validar e persistir; a engine mantém
  regras de domínio (IDs, parser, ordenação, limites).

## Fonte

Spec 0001 seção 2 (Revisão arquitetural), DEC-010/011/014; `packages/engine/src/ports.ts`,
`engine.ts`; `docs/architecture.md`.
