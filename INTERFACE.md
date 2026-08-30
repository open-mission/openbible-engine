# Interface do projeto

<!-- markdownlint-disable MD013 -->

Este arquivo é a fonte canônica para construir e reaproveitar a interface.
Atualize-o antes e depois de cada tarefa que criar ou mudar uma tela React ou
Native markup.
Leia `DESIGNSYSTEM.MD` antes de escolher a composição macro. Este arquivo
registra componentes, blocos e telas locais; as regras globais de SaaS vivem em
`DESIGNSYSTEM.MD`.

## Base observada

- Stack: TypeScript, Next.js App Router 15, React 19, Tailwind CSS 4, pnpm e
  Turborepo para Web; OpenTUI React 0.5.8 em Node.js 26.4+ com
  `--experimental-ffi` para a TUI.
- Política: **Há interface para pessoas: Sim** — `apps/consumer-web` é o
  consumer PWA de referência e `apps/consumer-native` é a prova desktop Native;
  `apps/consumer-tui` é o consumer terminal da Biblioteca, Leitor e Busca;
  `apps/conformance-cli` continua sendo ferramenta técnica sem tela de produto.
- A prova Native usa Native SDK `0.10.1` na revisão
  `064ca9890cc0cf8adc198215bd0ddaeb586c220a`, uma janela GPU/software e Native
  markup; a matriz de hosts não declara suporte além do ambiente executado.
- Primitives locais inspiradas em shadcn/ui: Button, Card, Badge, Input,
  Skeleton, Breadcrumbs e feedback states; todas usam tokens do tema do
  consumer Web.
- A composição visual Web segue o aplicativo legado como referência: shell em
  `100dvh`, dock flutuante responsivo, toolbar pill do Leitor e coluna de leitura
  serifada centralizada. Notas e Destaques aparecem como ações desabilitadas até
  as fatias de Personal Study correspondentes.
- O consumer Web usa os tokens neutros Tailwind/shadcn do tema padrão legado
  (`background`, `card`, `muted`, `accent`, `border`, `foreground` e `primary`).
  O gatilho de capítulo mostra somente o número; o nome acessível continua sendo
  `Capítulo`.
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
| Composição terminal | OpenTUI React | `apps/consumer-tui/src/ui/App.tsx` e componentes locais; sem shadcn/ui ou ReUI |

## Blocos criados e reaproveitáveis

Registre todos os blocos criados no projeto, inclusive os internos de uma
feature. Um bloco é um componente React com responsabilidade própria, como
grade, formulário, filtro, cabeçalho, cartão, diálogo, painel lateral, estado
vazio, upload ou ação em lote.

| Bloco | Tipo | Arquivo | Origem | Finalidade e API pública | Estados e acessibilidade | Consumidores | Reaproveitar ou estender |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AppShell | shell React | `apps/consumer-web/src/components/AppShell.tsx` | Shell full-viewport, área de rota e dock global | altura `100dvh`, safe area, navegação por teclado | Todas as rotas | Estender somente para navegação global |
| NavigationDock | composição React | `apps/consumer-web/src/components/NavigationDock.tsx` | Dock flutuante com Leitura, Busca, configurações e tema | `role=toolbar`, `aria-current`, ações futuras desabilitadas, dialog de configurações | AppShell | Reutilizar no shell; não adicionar estado de domínio bíblico |
| VersionCard | shadcn/ui Card + Badge + Button | `apps/consumer-web/src/features/library/VersionCard.tsx` | Renderiza versão, estado, progresso e ações inline | disponível, instalada, instalando, removendo, erro; progresso `aria-live`, cancelar e botões focáveis | Biblioteca | Reutilizar para versões, não duplicar ações na página |
| AppLibrary | List/Card de domínio | `apps/consumer-web/src/features/library/AppLibrary.tsx` | Carrega catálogo/registry pela engine e delega instalar/remover/cancelar | loading, vazio, erro/retry, sucesso, offline; catálogo remoto não oculta instaladas; lista `aria-live` | `/biblioteca` | Manter orquestração; extrair novas ações para blocos |
| PrevNextNav | shadcn/ui Button + Link | `apps/consumer-web/src/features/reader/PrevNextNav.tsx` | Navega capítulo/livro anterior e próximo | limites sem link inválido; teclado | Reader | Reutilizar em navegação sequencial |
| Reader | composição de leitura | `apps/consumer-web/src/features/reader/Reader.tsx` | Resolve a primeira versão instalada na entrada, busca livros/capítulo pela engine, renderiza versículos e delega o chrome visual | loading, vazio, erro/retry, offline e conteúdo ordenado; foco e navegação válidos | `/` e `/ler/[versao]/[livro]/[capitulo]` | Não colocar parser, ordenação ou persistência no bloco |
| ReaderToolbar | composição React | `apps/consumer-web/src/features/reader/ReaderToolbar.tsx` | Toolbar pill com pickers de livro/capítulo/versão, gatilho numérico, navegação e largura do texto | botões nomeados, `aria-haspopup`, `aria-expanded`, `aria-pressed`, links somente para destinos válidos | Reader | Reutilizar para o chrome do leitor; dados continuam vindo da engine |
| ResponsivePicker | overlay React | `apps/consumer-web/src/features/reader/ResponsivePicker.tsx` | Fornece a moldura comum dos pickers, com modal central no desktop e drawer inferior no mobile | `role=dialog`, `aria-modal`, título nomeado, Escape e fechamento pelo backdrop | BookChapterPicker, VersionPicker | Manter somente comportamento de overlay; não colocar regra da engine |
| BookChapterPicker | picker React de domínio | `apps/consumer-web/src/features/reader/BookChapterPicker.tsx` | Filtra livros retornados pela engine, separa AT/NT e seleciona capítulo válido com tokens neutros do tema legado | busca, livros vazios, seleção, capítulos numéricos, retorno, Escape e foco visível | Reader | Reutilizar para seleção de contexto; não duplicar catálogo bíblico |
| VersionPicker | picker React de domínio | `apps/consumer-web/src/features/reader/VersionPicker.tsx` | Lista versões instaladas/disponíveis, filtra, seleciona e delega instalação com tokens neutros do tema legado | abas, vazio, loading, erro/retry, progresso, cancelar e ações nomeadas | Reader | Reutilizar para versões; aquisição continua na fachada pública da engine |
| SearchForm | shadcn/ui Input + Button | `apps/consumer-web/src/features/search/SearchForm.tsx` | Valida termo não vazio e dispara busca | vazio, foco, submit por teclado | Busca | Reutilizar para busca local |
| SearchResults | List de domínio + Badge | `apps/consumer-web/src/features/search/SearchResults.tsx` | Lista resultados com versão e link contextual | vazio, resultados, `aria-live` | Busca | Preservar origem da versão |
| OfflineBanner / EmptyState / ErrorState | shadcn/ui-style feedback | `apps/consumer-web/src/components/ui/feedback.tsx` | Estados transversais do app | empty, error, retry e informação offline | Biblioteca, Leitor, Busca | Reutilizar antes de criar estado novo |
| Native library area | Native markup | `apps/consumer-native/src/components/library.native` e `src/app.native` | Lista de versões, badges e ações inline; instalar baixa explicitamente do R2 e grava localmente via service/adapter | loading/download, empty, failed/retry, installed; ações focáveis e bloqueadas durante operação | `apps/consumer-native` | Preservar ranges, staging e commit no adapter; não duplicar paths no markup |
| Native reader area | Native markup | `apps/consumer-native/src/components/reader.native` e `src/app.native` | Selects de versão/livro/capítulo, versículos e anterior/próximo | loading, conteúdo ordenado, limites e foco | `apps/consumer-native` | Não duplicar parser ou queries |
| Native search area | Native markup | `apps/consumer-native/src/components/search.native` e `src/app.native` | Campo, submit e resultados locais | termo vazio, loading, zero resultados, foco e labels | `apps/consumer-native` | Manter busca no service/adapter |
| Native feedback area | Native markup | `apps/consumer-native/src/components/feedback.native` e `src/app.native` | Status, erro e retry compartilhados | loading, failed, retry e mensagens acessíveis | `apps/consumer-native` | Reutilizar o mesmo contrato de `Model` |
| TUI App | OpenTUI React shell | `apps/consumer-tui/src/ui/App.tsx` | Áreas, atalhos, overlays, lifecycle e feedback | Biblioteca, Leitor, Busca, loading, offline, erro/retry, sucesso; foco e ajuda textual | `apps/consumer-tui/src/index.ts` | Estender somente para navegação do consumer TUI |
| TUI LibraryPanel | OpenTUI React panel | `apps/consumer-tui/src/ui/components/LibraryPanel.tsx` | Lista versões instaladas/disponíveis e seleção | vazio, busy, instalar/remover, foco e instruções de teclado | TUI App | Reutilizar para o catálogo local; ações permanecem no service |
| TUI VersionPicker | OpenTUI React picker | `apps/consumer-tui/src/ui/components/VersionPicker.tsx` | Catálogo remoto e instalação | catálogo vazio, download/progresso, busy, foco e Esc | TUI App | Não duplicar aquisição ou validação |
| TUI ReaderPanel | OpenTUI React panel | `apps/consumer-tui/src/ui/components/ReaderPanel.tsx` | Selectors de versão/livro/capítulo e versículos | loading, vazio, conteúdo longo ordenado e navegação n/p | TUI App | Não duplicar parser ou ordenação |
| TUI BookPicker | OpenTUI React picker/form | `apps/consumer-tui/src/ui/components/BookPicker.tsx` | Filtro de livros e entrada de referência | referência válida/inválida, vazio, busy, foco e Esc | TUI App | Encaminhar parsing para a engine |
| TUI SearchPanel | OpenTUI React panel/form | `apps/consumer-tui/src/ui/components/SearchPanel.tsx` | Termo, submit e resultados locais selecionáveis | termo vazio, loading, zero resultados, limite e foco | TUI App | Encaminhar busca para o service |
| TUI FeedbackArea | OpenTUI React feedback | `apps/consumer-tui/src/ui/components/FeedbackArea.tsx` | Status comum de operação e retry | loading, success, offline, error e código seguro | TUI App | Reutilizar em novas áreas TUI |

## Telas e composição

| Tela ou rota | Arquivo | Componentes React usados | Dados e ações | Estados |
| --- | --- | --- | --- | --- |
| Leitor `/` | `apps/consumer-web/src/app/page.tsx` + `src/features/reader/Reader.tsx` | AppShell, NavigationDock, ReaderToolbar, ResponsivePicker, BookChapterPicker, VersionPicker, OfflineBanner, feedback | primeira versão instalada, livros, capítulo e versículos pela engine; seleção e largura do texto | loading, empty, error, offline, conteúdo, limites, pickers |
| Biblioteca `/biblioteca` | `apps/consumer-web/src/app/biblioteca/page.tsx` + `src/features/library/AppLibrary.tsx` | AppShell, NavigationDock, page-frame, Breadcrumbs, OfflineBanner, VersionCard, feedback | catálogo e registry; instalar/remover/ler | loading, empty, error, installed/available/installing/removing |
| Leitor `/ler/[versao]/[livro]/[capitulo]` | `apps/consumer-web/src/app/ler/[versao]/[livro]/[capitulo]/page.tsx` + `src/features/reader/Reader.tsx` | AppShell, NavigationDock, ReaderToolbar, ResponsivePicker, BookChapterPicker, VersionPicker, OfflineBanner, feedback | livros, capítulo e versículos pela engine; seleção e largura do texto | loading, empty, error, offline, conteúdo, limites, pickers |
| Busca `/busca` | `apps/consumer-web/src/app/busca/page.tsx` + `src/features/search/Search.tsx` | AppShell, NavigationDock, page-frame, Breadcrumbs, SearchForm, SearchResults, feedback | busca agregada em todas as versões instaladas | sem termo, loading, empty, error, resultados |
| Conformance CLI | `apps/conformance-cli/src/index.ts` | Nenhum (CLI Node) | comandos via `process.argv`, saída JSON | success, empty, error |
| Native desktop consumer | `apps/consumer-native/src/app.native` + `src/core.ts` | Native markup, uma janela GPU/software | tabs Biblioteca/Leitor/Busca; instalar via R2 em ranges, remover, ler, buscar, retry e navegação | loading/download, ready, empty, failed; snapshot Native confirma foco e labels |
| Consumer TUI | `apps/consumer-tui/src/index.ts` + `src/ui/App.tsx` | OpenTUI React, uma janela terminal | Biblioteca, catálogo, Leitor, referência, Busca, remoção, atalhos e encerramento; runtime Node.js 26.7.0 validado | loading/progresso, offline, empty, error/retry, success; smoke OpenTUI confirma renderer e foco de ajuda |

## Origem das Bíblias

- `BibleEngineProvider` configura `NEXT_PUBLIC_BIBLE_API_URL` para o catálogo e proxy CORS de produção (`https://openbible-prod.vercel.app`).
- `NEXT_PUBLIC_BIBLE_BUCKET_URL` aponta para o diretório público R2 `/bibles` e é usado como fallback direto pelo `HttpBiblePackageSource`.
- `AppLibrary` não baixa fixtures nem interpreta SQLite; a ação delega `installVersion` à engine. A fixture ARA permanece somente nos testes/harnesses determinísticos.
- O consumer Native mapeia `ara`/`nvi` para `ARA.sqlite`/`NVI.sqlite` no mesmo bucket público e usa `Cmd.fetch` com `Range`; a parte é staged pelo adapter e nunca entra no `Model`.

## Regras de composição

1. Páginas, shells e rotas coordenam dados e compõem componentes; não concentram
   a grade, formulário, filtros, overlays ou cartões reutilizáveis. — Aplicado ao
   Web, Native e TUI conforme suas respectivas stacks.
2. Antes de criar um componente, consulte esta tabela e reaproveite o item
   existente quando ele atender à mesma intenção. — Componentes TUI não
   reutilizam markup Web/Native porque os runtimes são diferentes.
3. Todo item instalado de shadcn/ui ou ReUI entra na tabela com seu arquivo,
   origem, explicação, API, estados e consumidores reais. — A TUI usa somente
   primitives nativos do OpenTUI; nenhum item shadcn/ui ou ReUI foi instalado.
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
   remover um bloco, atualize seus consumidores e a orientação de reuso. — Os
   blocos TUI estão registrados acima; novos blocos devem seguir a mesma regra.

<!-- markdownlint-enable MD013 -->
