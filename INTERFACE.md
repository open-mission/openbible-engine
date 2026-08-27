# Interface do projeto

<!-- markdownlint-disable MD013 -->

Este arquivo é a fonte canônica para construir e reaproveitar a interface.
Atualize-o antes e depois de cada tarefa que criar ou mudar uma tela React.
Leia `DESIGNSYSTEM.MD` antes de escolher a composição macro. Este arquivo
registra componentes, blocos e telas locais; as regras globais de SaaS vivem em
`DESIGNSYSTEM.MD`.

## Base observada

- Stack: TypeScript, Next.js App Router 15, React 19, Tailwind CSS 4, pnpm e
  Turborepo.
- Política: **Há interface para pessoas: Sim** — `apps/consumer-web` é o
  consumer PWA de referência; `apps/conformance-cli` continua sendo ferramenta
  técnica sem tela de produto.
- Primitives locais inspiradas em shadcn/ui: Button, Card, Badge, Input,
  Skeleton, Breadcrumbs e feedback states.
- Composições gratuitas: listas e estados de domínio em `src/features`, com
  registry ReUI registrado em `components.json`. Não foram usados itens premium.

## Design system

| Item | Localização ou valor | Uso no projeto |
| --- | --- | --- |
| Tokens e tema | Não aplicável | CLI técnica não usa design tokens |
| Configuração shadcn/ui | Não aplicável | — |
| Registry ReUI | Não aplicável | — |
| Padrão de dashboard | `DESIGNSYSTEM.MD` | Não aplicável |
| Padrão de linha | `DESIGNSYSTEM.MD` | Não aplicável |
| Padrão de formulário | `DESIGNSYSTEM.MD` | Não aplicável |
| Padrão de contexto | `DESIGNSYSTEM.MD` | Não aplicável |
| Primitives compartilhadas | Não aplicável | — |
| Composições de domínio | Não aplicável | — |

## Blocos criados e reaproveitáveis

Registre todos os blocos criados no projeto, inclusive os internos de uma
feature. Um bloco é um componente React com responsabilidade própria, como
grade, formulário, filtro, cabeçalho, cartão, diálogo, painel lateral, estado
vazio, upload ou ação em lote.

| Bloco | Tipo | Arquivo | Origem | Finalidade e API pública | Estados e acessibilidade | Consumidores | Reaproveitar ou estender |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AppShell | shadcn/ui-style | `apps/consumer-web/src/components/AppShell.tsx` | Header, links Biblioteca/Busca e main | loading inicial via provider; navegação por teclado | Todas as rotas | Estender somente para navegação global |
| VersionCard | shadcn/ui Card + Badge + Button | `apps/consumer-web/src/features/library/VersionCard.tsx` | Renderiza versão, estado e ações inline | disponível, instalada, instalando, removendo, erro; botões focáveis | Biblioteca | Reutilizar para versões, não duplicar ações na página |
| AppLibrary | List/Card de domínio | `apps/consumer-web/src/features/library/AppLibrary.tsx` | Carrega catálogo/registry pela engine e delega instalar/remover | loading, vazio, erro/retry, sucesso, offline; `aria-live` | `/` | Manter orquestração; extrair novas ações para blocos |
| PrevNextNav | shadcn/ui Button + Link | `apps/consumer-web/src/features/reader/PrevNextNav.tsx` | Navega capítulo/livro anterior e próximo | limites sem link inválido; teclado | Reader | Reutilizar em navegação sequencial |
| Reader | Card + selects nativos acessíveis | `apps/consumer-web/src/features/reader/Reader.tsx` | Busca livros/capítulo pela engine e renderiza versículos | loading, vazio, erro, conteúdo ordenado | `/ler/[versao]/[livro]/[capitulo]` | Não colocar parser ou ordenação no bloco |
| SearchForm | shadcn/ui Input + Button | `apps/consumer-web/src/features/search/SearchForm.tsx` | Valida termo não vazio e dispara busca | vazio, foco, submit por teclado | Busca | Reutilizar para busca local |
| SearchResults | List de domínio + Badge | `apps/consumer-web/src/features/search/SearchResults.tsx` | Lista resultados com versão e link contextual | vazio, resultados, `aria-live` | Busca | Preservar origem da versão |
| OfflineBanner / EmptyState / ErrorState | shadcn/ui-style feedback | `apps/consumer-web/src/components/ui/feedback.tsx` | Estados transversais do app | empty, error, retry e informação offline | Biblioteca, Leitor, Busca | Reutilizar antes de criar estado novo |

## Telas e composição

| Tela ou rota | Arquivo | Componentes React usados | Dados e ações | Estados |
| --- | --- | --- | --- | --- |
| Biblioteca `/` | `apps/consumer-web/src/app/page.tsx` + `src/features/library/AppLibrary.tsx` | AppShell, Breadcrumbs, OfflineBanner, VersionCard, feedback | catálogo e registry; instalar/remover/ler | loading, empty, error, installed/available/installing/removing |
| Leitor `/ler/[versao]/[livro]/[capitulo]` | `apps/consumer-web/src/app/ler/[versao]/[livro]/[capitulo]/page.tsx` + `src/features/reader/Reader.tsx` | Breadcrumbs, Card, PrevNextNav | livros, capítulo e versículos pela engine | loading, empty, error, conteúdo |
| Busca `/busca` | `apps/consumer-web/src/app/busca/page.tsx` + `src/features/search/Search.tsx` | Breadcrumbs, SearchForm, SearchResults, feedback | busca agregada em todas as versões instaladas | sem termo, loading, empty, error, resultados |
| Conformance CLI | `apps/conformance-cli/src/index.ts` | Nenhum (CLI Node) | comandos via `process.argv`, saída JSON | success, empty, error |

## Origem das Bíblias

- `BibleEngineProvider` configura `NEXT_PUBLIC_BIBLE_API_URL` para o catálogo e proxy CORS de produção (`https://openbible-prod.vercel.app`).
- `NEXT_PUBLIC_BIBLE_BUCKET_URL` aponta para o diretório público R2 `/bibles` e é usado como fallback direto pelo `HttpBiblePackageSource`.
- `AppLibrary` não baixa fixtures nem interpreta SQLite; a ação delega `installVersion` à engine. A fixture ARA permanece somente nos testes/harnesses determinísticos.

## Regras de composição

1. Páginas e rotas coordenam dados e compõem componentes; não concentram a
   grade, formulário, filtros, overlays ou cartões reutilizáveis. — Não aplicável (sem React).
2. Antes de criar um componente, consulte esta tabela e reaproveite o item
   existente quando ele atender à mesma intenção. — Não há componentes.
3. Todo item instalado de shadcn/ui ou ReUI entra na tabela com seu arquivo,
   origem, explicação, API, estados e consumidores reais. — Nenhum instalado.
4. ReUI usa somente itens gratuitos `@reui/c-*`; use shadcn/ui para
   primitives e ReUI para composições de produto. — Não aplicável.
5. Para dashboards, registre a pergunta operacional, escopo, filtros,
   indicadores, visualizações, tabela de investigação e estados. Prefira
   blocos existentes de ReUI e primitives shadcn/ui antes de criar uma nova
   composição. — Não aplicável.
6. Linhas de `DataGrid` com detalhe usam link acessível em toda a área; ações
   internas usam `TableRowAction` ou equivalente e não propagam a navegação. — Não aplicável.
7. Formulários de criar e editar usam seções com coluna de contexto e painel
   em duas colunas nos breakpoints largos, refluindo para uma no mobile. — Não aplicável.
8. Toda tela renderiza `Breadcrumb` com o nome da equipe ativa, o módulo e o
   título atual. Em Laravel, reaproveite o `Breadcrumb` ou `Breadcrumbs` do
   layout existente e registre o componente real em vez de criar outro. — Não há tela.
9. Ao criar um bloco, registre-o nesta tabela na mesma tarefa. Ao alterar ou
   remover um bloco, atualize seus consumidores e a orientação de reuso. — Nenhum bloco React.

<!-- markdownlint-enable MD013 -->
