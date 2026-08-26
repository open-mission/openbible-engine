# Interface do projeto

<!-- markdownlint-disable MD013 -->

Este arquivo é a fonte canônica para construir e reaproveitar a interface.
Atualize-o antes e depois de cada tarefa que criar ou mudar uma tela React.
Leia `DESIGNSYSTEM.MD` antes de escolher a composição macro. Este arquivo
registra componentes, blocos e telas locais; as regras globais de SaaS vivem em
`DESIGNSYSTEM.MD`.

## Base observada

- Stack: TypeScript, Node.js, pnpm, Turborepo (sem React/Astro/Next)
- Política: **Há interface para pessoas: Não** — `apps/conformance-cli` é ferramenta técnica de conformidade, não interface de produto. Não implementar telas, React, Tailwind, shadcn/ui ou ReUI.
- Primitives: Não aplicável.
- Composições gratuitas: Não aplicável.

Sem telas de produto.

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
| Não há blocos React | — | — | — | CLI `apps/conformance-cli/src/index.ts` com comandos `check`, `list-books`, `get-chapter`, `search`, `parse` que compõem `createBibleEngine` com o adapter nativo real (`createNativeAdapter`) e provam persistência após fechar/reabrir | success JSON, empty array, error `EngineError` code | Desenvolvedores | Não aplicável |

## Telas e composição

| Tela ou rota | Arquivo | Componentes React usados | Dados e ações | Estados |
| --- | --- | --- | --- | --- |
| Não há tela de produto | `apps/conformance-cli/src/index.ts` | Nenhum (CLI Node) | Comandos via `process.argv`, instanciação de `createNativeAdapter` (SQLite real) + `createBibleEngine`, saída JSON, exit 0/1 | success, empty, error |

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
