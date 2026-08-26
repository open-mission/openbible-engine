# Regras do sistema

Estas regras complementam as instruções dos agentes sem substituir specs ou
critérios de aceite. Modelo inicial sugerido para **TypeScript, Vitest, Node.js**.

Para TypeScript, explicite regras de tipagem estrita e modularização.

## Arquitetura

- Hexagonal (revisada): `engine-core` (entidades, value objects, parser, erros, `CancellationToken`, invariantes, zero deps, sync, sem plataforma) → `engine` (ports incl. `BibleInstaller` transacional, use-cases, façade `createBibleEngine`, depende só de `engine-core`) → adapters → `engine-testing`/`conformance-cli` consomem apenas exports públicos.
- `BibleLibrary` é somente-leitura; `BibleInstaller` é o único escritor do armazenamento bíblico e do registry, dono do ciclo stage → validate → commit → rollback/cleanup, com compensação verificável.
- A engine NÃO interpreta o formato SQLite (header/schema/metadata/sanity são do adapter) e NÃO usa `AbortSignal`/`DOMException`/`TextEncoder`/`TextDecoder` (usa `CancellationToken` portátil).
- Bounded contexts explícitos: Scripture Library (esta entrega), Personal Study e Sync futuros sem acoplamento no core.
- Direção de dependência: adapters → engine → engine-core; consumidores (Web/TUI/Native SDK) são substituíveis. Compatibilidade com Native SDK = hipótese até consumer mínimo compilar/executar.

## Código e qualidade

- TypeScript strict, ESM, declarations reais, sem `ignoreBuildErrors`.
- Conventional Commits no git local; sem Gitflow.
- Código em inglês, docs/spec em pt-BR.
- Sem objetos ORM, `Date`, `Map`, `Set`, conexões; datas como epoch ms; records + unions discriminadas.
- IDs normalizados (NFD, lower, kebab) e validados; path traversal negado (`/`, `\`, `..`, `%2f`).

## Testes

- Vitest runner; Gherkin só na `spec.md` (seção 6), materializado como TDD comportamental com marcador `// SPECSFY: US-XXX FR-XXX NFR-XXX AC-XXX`.
- TDD comportamental: cada requisito tem teste que FALHA se a capacidade real for removida. NÃO usar marcadores de massa/`traceability-bulk` para satisfazer rastreabilidade.
- RED válido antes de GREEN; sem mocks que escondam fronteira; contract suite para livros/capítulos/busca; testes arquiteturais para core imports, engine purity (sem SQLite/DOM globals) e exports; conformance CLI via exports públicos sobre SQLite real, provando persistência após fechar/reabrir.
- Adapter `@openbible/adapter-sqlite-node` (Node.js) testado contra banco SQLite temporário real com o schema legado (`book.id`/`verse.book_id` INTEGER, `metadata` com somente `name`) com consultas reais e limpeza ao final; garante exception-safe e reconciliação best-effort na inicialização (não crash-safe completa sem journal); `adapter-sqlite-web` NÃO é tratado como funcional (fatia planejada); `@openbible/adapter-sqlite-native` reservado para o futuro Native SDK.
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

