# Regras do sistema

Estas regras complementam as instruções dos agentes sem substituir specs ou
critérios de aceite. Modelo inicial sugerido para **TypeScript, Vitest, Node.js**.

Para TypeScript, explicite regras de tipagem estrita e modularização.

## Arquitetura

- Hexagonal: `engine-core` (entidades, value objects, parser, erros, invariantes, zero deps, sync, sem plataforma) → `engine` (ports, use-cases, façade `createBibleEngine`, depende só de `engine-core`) → adapters (web/native/http substituíveis) → `engine-testing`/`conformance-cli` consomem apenas exports públicos.
- Bounded contexts explícitos: Scripture Library (esta entrega), Personal Study e Sync futuros sem acoplamento no core.
- Direção de dependência: adapters → engine → engine-core; consumidores (Web/TUI/Native SDK) são substituíveis.

## Código e qualidade

- TypeScript strict, ESM, declarations reais, sem `ignoreBuildErrors`.
- Conventional Commits no git local; sem Gitflow.
- Código em inglês, docs/spec em pt-BR.
- Sem objetos ORM, `Date`, `Map`, `Set`, conexões; datas como epoch ms; records + unions discriminadas.
- IDs normalizados (NFD, lower, kebab) e validados; path traversal negado (`/`, `\`, `..`, `%2f`).

## Testes

- Vitest runner; Gherkin só na `spec.md` (seção 6), materializado como TDD com marcador `// SPECSFY: US-XXX FR-XXX NFR-XXX AC-XXX`.
- RED válido antes de GREEN; sem mocks que escondam fronteira; contract suite para livros/capítulos/busca; testes arquiteturais para core imports e exports; conformance CLI via exports públicos.
- Cada US/FR/NFR com ≥3 ACs e ≥3 TDDs; `pnpm turbo run build test typecheck lint check` passam.

## Segurança e privacidade

- Instalação atômica: bytes → tmp → validar header (`SQLite format 3\0`) → validar schema (`metadata/book/verse`) → validar identidade → sanity query → promote atômico → registry → cleanup em falha; falha não destrói versão anterior; sem arquivos parciais como instalados; sem credenciais/`.env`/bancos reais copiados.
- Erros por códigos estáveis (`version_not_installed`, `invalid_reference`, etc.) sem mensagens UI; apps traduzem.

## Operação

- Offline-first: operações locais nunca provocam rede; `BiblePackageSource` opcional.
- TursoDB fora do milestone 1; ARA embarcada pelo consumidor, não distribuída no npm.
- pnpm + Turborepo + Changesets; GitHub Actions para lint/typecheck/test/build; `docs/` via `specsfy-documentator` e `.specsfy/PACKAGES.md`.

## Regras específicas do projeto

- Não criar `plan.md`, `tasks.md`, `research.md`, `data-model.md`, `.feature`; fonte normativa é `specs/<estado>/<NNNN>-<slug>/spec.md` e seção 14 para tarefas.
- Monitor de contexto (`node .agents/skills/specsfy-setup/scripts/monitor_context.mjs --project . --check`) no início, após cada tarefa e antes de concluir; resolver PENDING via `specsfy-aux-*`.
- Documentator após cada implementação; `PACKAGES.md` derivado de manifests/lockfiles.
- Não alterar `/home/claudio/Projects/open-bible`; não criar remoto/publish/PR/push.

