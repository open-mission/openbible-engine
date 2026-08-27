# Backlog: Distribuição versionada e estabilidade da API pública

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0003 |
| Status | Promoted |
| Produto | openbible-engine |
| Épico | Engine consumível (M02 proposto) |
| Funcionalidade | Distribuição dos packages + compatibilidade da API pública |
| Tipo | Técnico |
| Prioridade | Alta — desbloqueia consumidores Web/PWA, Native SDK, TUI e React Native |
| Milestones | M02 (proposto; ainda sem arquivo de milestone) |
| Criado em | 2026-08-27 |
| Spec promovida | `specs/draft/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` |

## Ideia original

Preparar os packages do engine para consumo real: versionamento semver/0.x, artefatos verificáveis e política de compatibilidade da API pública, sem publicar nem criar release.

## Problema percebido

Os packages estão em 0.1.0 e ainda não existe uma entrega consumível que prove exports, assets Worker/WASM, semver e compatibilidade entre consumidores. O adapter-sqlite-web não expõe subpath para os assets e os deps workspace:* precisariam virar versão real no tarball.

## Pessoa afetada ou beneficiada

Desenvolvedores dos futuros consumidores do engine (Web/PWA, desktop Native SDK, TUI OpenTUI e React Native) e a equipe que mantém a engine.

## Resultado ou valor esperado

Permitir que consumidores adotem versões reproduzíveis do engine com contrato público estável (semver/0.x) e rollback claros, provado por harness de consumo por tarball (Node 22 e bundle browser com esbuild), sem publicar nem criar release.

## Contexto

Sem publish; regra semver 0.x (patch não quebra; minor pode quebrar com changelog+guia de migração; 1.0 congela o estável). Matriz bloqueante: Node 22 + Chromium + WebKit + esbuild; Astro/Next informativo. Superfície pública: engine-core, engine, adapter-http, adapter-sqlite-node, adapter-sqlite-web; engine-testing e conformance-cli são dev/privados. Evidência: harness de tarball + conformance fora do workspace + COMPATIBILITY.md + guarda de regressão de API.

## Referências relacionadas

- Inbox (origem): `specs/inbox/2026-08-26-193947-distribuicao-versionada-e-estabilidade-da-api-publica.md` — captura de origem.
- Spec relacionada (limita e define a superfície): `specs/completed/0001-openbible-engine-scripture-library/spec.md` — define `createBibleEngine`, exports públicos (FR-009/AC-019), Changesets e "não publicar"; é o contrato que este item estabiliza.
- Spec relacionada (assets): `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — define `createWebAdapter` e assets Worker/WASM relativos ao módulo com overrides; o pipeline de assets que este item precisa distribuir.
- Backlog relacionado (precedente): `specs/backlog/0001-fundacao-openbible-engine.md` e `specs/backlog/0002-adapter-web-sqlite-offline-com-opfs.md` — estabelecem Changesets, validação de exports, pipeline de assets e a regra "sem publish".
- Documentação relacionada: `PROJECT.md` (roadmap item 1: estabilizar distribuição/exports/semver/conformance), `.specsfy/RULES.md` (sem publish; Changesets `access: restricted`; Node 22; assets do adapter Web), `.specsfy/STACK.md` (assets Worker/WASM via esbuild, runtimes suportados).
- Relacionada, NÃO duplicata: `specs/inbox/2026-08-26-193950-api-publica-versionada-de-dados-biblicos.md` — API remota HTTP de dados bíblicos (candidato 09); compartilha a expressão "API pública versionada", mas é um produto distinto (serviço remoto vs distribuição dos packages). Mantida separada.

## Comportamento esperado

- A engine fica pronta para consumo externo: os 5 pacotes de runtime (engine-core, engine, adapter-http, adapter-sqlite-node, adapter-sqlite-web) podem ser empacotados (`pnpm pack`) e consumidos fora do workspace, com `exports` e declarations resolvendo e deps `workspace:*` transpiladas para versões semver reais.
- Matriz de exports por ambiente verificada: Node 22 (import ESM + types) e bundle browser via esbuild (incluindo Worker/WASM) resolvem, com types e runtime coerentes; Chromium e WebKit bloqueiam, Firefox informativo.
- Conformance é executada através dos exports públicos, fora do workspace, em Node 22 limpo e em bundle browser real; Astro/Next são verificações informativas de bundler (não são produto desta entrega).
- `adapter-sqlite-web` expõe caminho(s) de export (subpath e/ou convenção) para o Worker e os assets SQLite WASM, permitindo que o bundler resolva sem caminho fixo em `public/`, preservando o design de 0002 (URLs relativas ao módulo + overrides).
- `COMPATIBILITY.md`/seção pública por package declara a superfície estável (métodos, tipos públicos, códigos de erro, contratos serializáveis) e a política semver/0.x.
- Guarda de regressão de API falha se uma mudança em `patch` (ou `minor` de 0.x) alterar a superfície pública tipada; é paralela à conformance e não a substitui.
- Nenhum pacote é publicado e nenhum release remoto é criado nesta entrega.

## Regras de negócio

- Semver/0.x: `patch` não quebra; `minor` pode quebrar e exige changelog + guia de migração; `major` (→1.0) congela o conjunto estável e quebras deixam de acontecer em `minor`.
- Superfície pública distribuível: apenas `engine-core`, `engine`, `adapter-http`, `adapter-sqlite-node`, `adapter-sqlite-web`. `engine-testing` e `conformance-cli` são dev/privados e ficam fora da matriz.
- `engine-core` e `engine` permanecem puros (sem plataforma/SQLite/DOM); nenhuma dependência de runtime nova é adicionada.
- Os contratos públicos continuam serializáveis e com erros discriminados por códigos estáveis; não muda o contrato definido em 0001/0002.
- Assets Worker/WASM continuam relativos ao módulo, com overrides, e não dependem de caminho fixo em `public/` (preserva a decisão de 0002).
- Esta entrega é prontidão para distribuição, não distribuição: nenhum publish, nenhum release, nenhum push/PR/remoto.
- O item só segue para especificação quando o brief estiver suficiente; o backlog não autoriza implementação.

## Critérios de aceitação

- AC-01 — Tarball consumível fora do workspace:
  Given os 5 pacotes de runtime construídos e deps `workspace:*` transpiladas para versões semver reais
  When um consumidor Node 22 instala os tarballs e importa `createBibleEngine` pelos exports públicos
  Then types e runtime resolvem fora do workspace e a conformance roda pelos exports públicos.

- AC-02 — Bundle browser resolve assets:
  Given o pacote web construído com Worker e assets SQLite WASM em `dist`
  When um bundle esbuild importa `createWebAdapter` e os assets são resolvidos via subpath/convenção do módulo
  Then Worker/WASM são incluídos sem caminho fixo em `public/` e a conformance de browser roda em Chromium e WebKit.

- AC-03 — Guarda de regressão de API:
  Given a superfície pública tipada estável registrada em `COMPATIBILITY.md`
  When uma mudança em `patch` (ou `minor` de 0.x) altera a assinatura/tipo público
  Then a guarda de regressão de API falha e exige changelog + guia de migração.

- AC-04 — Quebra documentada em minor:
  Given uma quebra de comportamento em `minor` com changelog + guia de migração registrados
  When a mudança segue a política semver/0.x
  Then a quebra é aceita de forma documentada e mensurável, mantendo `patch` livre de quebra.

- AC-05 — Nada é publicado:
  Given a entrega de prontidão concluída
  When o pipeline de prontidão termina localmente
  Then nenhum pacote é publicado e nenhum release remoto é criado.

## Qualidades e operação

- Segurança: superfície pública mínima e exports explícitos; tarball validado como autocontido (deps sem `workspace:*`, `files` mínimo); sem credenciais/`.env`; nenhum publish/remoto.
- Privacidade: sem dados pessoais; conteúdo bíblico (ARA) continua sendo responsabilidade do consumidor, não distribuído pelo pacote.
- Desempenho e volume: bundle browser sem assets duplicados; sem copiar o banco para a thread principal; build reproduzível e tarball enxuto.
- Auditoria e observabilidade: guarda de regressão de API, changelog via Changesets e harness provando consumibilidade; verificação de que `files`/`exports` produzem um tarball autocontido.
- Operação: build/typecheck/lint/test gates verdes; harness e guarda integrados a `turbo run check`/GitHub Actions; docs e `PACKAGES.md` via `$specsfy-documentator`.

## Dependências

- M01 concluído tecnicamente (specs 0001 e 0002) e contratos/adapters entregues.
- Tooling já presente: pnpm 10 + Turborepo, TypeScript 5.7 strict ESM, Vitest, ESLint 9, Changesets, esbuild (adapter web), Playwright, Node 22.
- Decisão de 0002 sobre assets Worker/WASM relativos ao módulo com overrides.
- Futuros: consumo real Web/PWA (candidato 04), Native SDK (05), TUI (06) e React Native (10) dependem deste item (registrado em `specs.md`).

## Situações de erro

- Tarball com `workspace:*` não transpilado → harness falha (deps não resolvem fora do workspace).
- `exports` não resolvendo types ou runtime → consumidor não importa; harness/guarda falha.
- Assets Worker/WASM ausentes de `files`/subpath → bundle browser não resolve; conformance de browser falha.
- Quebra da superfície pública sem changelog/guia de migração → guarda de regressão de API falha.
- Mudança que altera o contrato de 0001/0002 (código de erro, contratos serializáveis) → reprovada por conformance/guarda de regressão.

## Escopo

- Dentro: prontidão para distribuição — `pnpm pack`/dry-run e harness de consumo por tarball; matriz de exports por ambiente (Node 22, browser/esbuild, Chromium/WebKit bloqueantes; Astro/Next informativo); conformance executada fora do workspace; expor subpath/convenção para assets Worker/WASM; `COMPATIBILITY.md` + política semver/0.x; guarda de regressão de API; ajustes de `files`/`exports` e dependências sem `workspace:*`; testes de prontidão; documentação (ADRs, docs, `PACKAGES.md`).
- Fora (desta entrega): publicar pacotes ou criar release; API remota HTTP de dados bíblicos (candidato 09); aplicação consumer real em Astro/Next (candidato 04); adapter Native SDK / TUI / React Native (candidatos 05/06/10); `engine-testing` e `conformance-cli` como distribuíveis; Turso/sync; Personal Study. Astro/Next são usados apenas como verificação informativa de bundler, não como produto.

## Dúvidas, decisões e riscos

- Decidido: prontidão para distribuição sem publicar nem criar release.
- Decidido: política semver/0.x (patch não quebra; minor pode quebrar com changelog + guia de migração; 1.0 congela o estável).
- Decidido: matriz bloqueante Node 22 + Chromium + WebKit + esbuild; Astro/Next informativo.
- Decidido: evidência verificável = harness de consumo por tarball com conformance fora do workspace.
- Decidido: superfície pública = 5 pacotes de runtime; `engine-testing` e `conformance-cli` dev/privados.
- Decidido: `COMPATIBILITY.md` por package + guarda de regressão de API.
- Aberto: registry alvo (npm público vs privado) — adiado até haver publicação real (fora desta entrega).
- Aberto: proveniência/atestação e checksum dos artefatos — só relevante no momento da publicação.
- Risco: quebra prematura de API — mitigado pela guarda de regressão de API e pela política semver/0.x.
- Risco: assets Worker/WASM ausentes do pacote — mitigado pelo harness de bundle browser.
- Risco: supply chain / publicação acidental — mitigado pela ausência de publish e pela validação de tarball autocontido.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promovido para `$specsfy-03-specify` em `specs/draft/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` (depois `defined` → `planned` → `in-progress` → `review` → `completed`). Candidato 03 da sequência em `specs.md`; dependência dos futuros consumidores (04, 05, 06).
