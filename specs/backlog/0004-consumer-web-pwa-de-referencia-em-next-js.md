# Backlog: Consumer Web/PWA de referência em Next.js

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0004 |
| Status | Promoted |
| Produto | openbible-engine (consumer de referência) |
| Épico | Engine consumível (M02 proposto) |
| Funcionalidade | Consumer Web/PWA de referência |
| Tipo | Historia |
| Prioridade | Alta — valida a migração strangler e prova o consumo real da engine |
| Milestones | M02 (proposto; ainda sem arquivo de milestone) |
| Criado em | 2026-08-27 |
| Spec promovida | `specs/draft/0004-consumer-web-pwa-de-referencia-em-next-js/spec.md` |

## Ideia original

Criar um consumer Web/PWA de referência em Next.js que consuma a engine (adapter-sqlite-web/OPFS) e prove a jornada offline-first de Biblioteca, Leitor e Busca.

## Problema percebido

O engine está pronto como biblioteca headless e distribuível (SPEC-0001/0002/0003), mas não há aplicação real que prove integração de bundler, assets Worker/WASM, lifecycle PWA e operação offline; o monorepo ainda não possui nenhuma UI.

## Pessoa afetada ou beneficiada

Equipe Web do Open Bible e usuários da futura PWA; valida a migração strangler do legado Web (Next.js, somente leitura) sem duplicar regras de negócio.

## Resultado ou valor esperado

Uma aplicação Next.js + React + Tailwind + shadcn/ui + ReUI, instalável como PWA, offline-first via OPFS, com Biblioteca (instalar/remover), Leitor (livro/capítulo) e Busca sobre todas as versões instaladas, usando os contratos públicos da engine.

## Contexto

Três rotas: / (Biblioteca), /ler/[versao]/[livro]/[capitulo] (Leitor), /busca (Busca); ações de instalar/remover inline na Biblioteca; busca em todas as versões instaladas com marcação por Bíblia. Dados: fixture local embarcada + adapter-http configurável. PWA instalável (manifest + next-pwa) com cache de app shell + assets Worker/WASM; Bíblias no OPFS via adapter-sqlite-web; offline após o primeiro acesso; Chromium/WebKit bloqueantes (0002). Interface para pessoas: Sim (primeira UI do monorepo); stack React/Tailwind → shadcn/ui + ReUI obrigatórios. Depende de SPEC-0003 (prontidão de distribuição) e do adapter-sqlite-web (0002).

## Referências relacionadas

- Inbox (origem): `specs/inbox/2026-08-26-193948-consumer-web-pwa-de-referencia-em-astro-ou-next-js.md` — captura de origem.
- Spec relacionada (consumo): `specs/completed/0002-adapter-web-sqlite-offline-com-opfs/spec.md` — `createWebAdapter`, assets `./worker` e OPFS; é o que o consumer consumirá.
- Spec relacionada (superfície pública): `specs/completed/0003-distribuicao-versionada-e-estabilidade-da-api-publica/spec.md` — `createBibleEngine`, guarda de API, `COMPATIBILITY.md` e prontidão de distribuição.
- Backlog relacionado (precedente): `specs/backlog/0003-distribuicao-versionada-e-estabilidade-da-api-publica.md`.
- Legado (somente leitura, não fonte normativa): `/home/claudio/Projects/open-bible/apps/web` — Next.js + React + Tailwind + shadcn + PWA (`@ducanh2912/next-pwa`); referência de comportamento e da migração strangler.
- Documentação relacionada: `INTERFACE.md` (hoje "Há interface para pessoas: Não", será a primeira UI), `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`, `PROJECT.md` (roadmap item 2).

## Comportamento esperado

- O consumer é a primeira UI do monorepo: aplicação **Next.js** (App Router) + React + Tailwind + shadcn/ui (primitives) + ReUI (composições) + PWA (`next-pwa`), em `apps/consumer-web`.
- **Biblioteca** (rota `/`): lista Bíblias instaladas e disponíveis; instalar/remover por ação inline no card; estados vazio/instalando/disponível.
- **Leitor** (rota `/ler/[versao]/[livro]/[capitulo]`): navegação de livros/capítulos e renderização ordenada dos versículos.
- **Busca** (rota `/busca`): campo + resultados sobre **todas as versões instaladas**, marcando a Bíblia de origem.
- **Offline-first via OPFS**: Bíblias instaladas vivem no OPFS (adapter-sqlite-web); o app funciona offline após o primeiro acesso; cache de app shell + assets Worker/WASM via service worker.
- **Origens de dados**: fixture local embarcada (SQLite legada, instalada sem rede) + `adapter-http` configurável para download real.
- A aplicação **não duplica regras de negócio** — delega à engine via `createBibleEngine`/`createWebAdapter`; `engine-core`/`engine` permanecem puros.

## Regras de negócio

- Consumir somente exports públicos da engine; nunca importar `src/` interno.
- A interface compõe blocos React (shadcn/ui + ReUI); a página/rota obtém dados e compõe componentes, sem concentrar grade/formulário/filtros/overlays. CRUD declarado (lista de Bíblias = DataGrid/List, busca = Filters/Form, instalar/remover = Dialog/Sheet/action).
- Nenhuma regra bíblica (parser, leitura, busca) vive na aplicação — apenas apresentação e navegação.
- A operação offline é garantia e não fallback: sem rede após o primeiro acesso, o consumer continua funcional com as Bíblias instaladas.
- A Bíblia embarcada/local é do consumidor (ARA não é distribuída pelo pacote da engine).
- Chromium e WebKit são bloqueantes (0002); Firefox e Astro/Next informativos — aqui o consumer usa Chromium/WebKit via Playwright.

## Critérios de aceitação

- AC-01 — Biblioteca instala e remove uma Bíblia com confirmação visual e persistência:
  Given o app aberto com uma Bíblia disponível não instalada e outra instalada
  When a pessoa instala a Bíblia disponível e remove a instalada
  Then a Biblioteca reflete a mudança, o OPFS persiste a versão e o app continua offline.

- AC-02 — Leitor abre livro/capítulo com versículos ordenados:
  Given uma Bíblia instalada
  When a pessoa navega até `/ler/[versao]/[livro]/[capitulo]`
  Then os versículos são exibidos em ordem canônica e a navegação de livros/capítulos funciona.

- AC-03 — Busca retorna em todas as versões instaladas com origem marcada:
  Given duas Bíblias instaladas
  When a pessoa busca um termo em `/busca`
  Then os resultados vêm de todas as versões instaladas, marcados por Bíblia, com limite aplicado.

- AC-04 — App funciona offline após o primeiro acesso (PWA):
  Given o app acessado uma vez online com uma Bíblia instalada
  When a rede é removida e o app é recarregado
  Then o app shell, o Worker/WASM e a Bíblia continuam disponíveis sem rede.

- AC-05 — Sem duplicação de regras de negócio:
  Given o consumer composto com a engine
  When a busca e a leitura são exercitadas
  Then nenhuma regra de parser/leitura/busca vive na aplicação (tudo via exports públicos da engine).

## Qualidades e operação

- Segurança: nenhuma credencial/`.env`; nenhum conteúdo bíblico embarcado pela engine; validação de entrada na busca (limite, null-safe).
- Privacidade: dados de leitura e versões instaladas ficam no armazenamento privado da origem (OPFS); nada sincronizado nesta entrega.
- Desempenho/volume: busca com limite explícito; leitura ordenada; bundle do consumer enxuto; sem copiar o banco para a thread principal.
- Acessibilidade: navegação por teclado e foco visível; resultados de busca anunciados; contraste adequado; estados vazio/loading/erro/offline claros.
- Auditoria/observabilidade: erros tipados da engine preservados (`version_not_installed`, `storage_unavailable`, etc.) sem mensagens de UI cruas; estados de download instalado/instalando.
- Operação: build/typecheck/lint/test verdes no app; conformance de browser (Playwright Chromium/WebKit); `INTERFACE.md` atualizado com blocos ReUI/shadcn criados; `docs/` via documentator.
- Compatibilidade: Chromium/WebKit bloqueantes; PWA instalável.

## Dependências

- SPEC-0003 (prontidão de distribuição) e SPEC-0002 (adapter-sqlite-web/OPFS, assets `./worker`) concluídas.
- Next.js (App Router) + React + Tailwind + shadcn/ui + ReUI + `next-pwa`; Node 22; Playwright (Chromium/WebKit); Vitest.
- Fixture SQLite legada reutilizável (de SPEC-0002/0001) para a instalação local sem rede.

## Situações de erro

- Versão não instalada ao abrir o leitor → navegação de volta à Biblioteca com feedback (`version_not_installed`).
- Instalação falha/interrompida → sem versão parcial utilizável; preserva a instalação anterior.
- Sem OPFS/Worker/WASM → erro público estável da engine (não simular persistência em memória).
- Offline sem Bíblia instalada → estado vazio orientando a instalar antes de usar offline.
- Busca vazia/sem termo → estado vazio com orientação; limite aplicado.

## Escopo

- Dentro: `apps/consumer-web` (Next.js + React + Tailwind + shadcn/ui + ReUI + PWA); Biblioteca, Leitor, Busca; instalação/remoção; fixture local + `adapter-http` configurável; PWA instalável offline-first; conformance de browser; `INTERFACE.md` e `docs/`.
- Fora: Personal Study, sync/Turso, API pública remota, componentes de e-mail/chat, UI de outras plataformas (TUI/desktop/mobile), publicação npm, alteração do legado (`/home/claudio/Projects/open-bible`), autenticação/contas.

## Dúvidas, decisões e riscos

- Decidido: Next.js neste monorepo (`apps/consumer-web`), React + Tailwind + shadcn/ui + ReUI + PWA.
- Decidido: fatia = Biblioteca + Leitor + Busca, offline via OPFS, instalável como PWA.
- Decidido: origens = fixture local embarcada + `adapter-http` configurável.
- Decidido: três rotas (`/`, `/ler/...`, `/busca`); ações inline na Biblioteca.
- Decidido: PWA instalável (`next-pwa`) cacheando app shell + assets; offline após o primeiro acesso.
- Decidido: busca em todas as versões instaladas, marcada por Bíblia.
- Aberto: detalhes de composição/estados finos (a definir na seção 10 da spec junto de ReUI/shadcn); PWA com downloads em segundo plano podem entrar depois.
- Risco: bundle do Next com Worker/WASM do engine — mitigado pelos assets relativos de 0002 e por overrides; escolha da engine headless diante de um app Next (evitar duplicação de regra).

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promover para `$specsfy-03-specify` com `Definition Gate: Pending` até a validação; candidato 04 da sequência em `specs.md`; dependente das SPEC-0002 e SPEC-0003 concluídas.
