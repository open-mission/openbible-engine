# Design System

## Consumer Web

- Tema neutro do Tailwind/shadcn legado, com tokens `background`, `card`,
  `muted`, `accent`, `border`, `foreground` e `primary`; o texto bíblico usa
  corpo amplo e line-height 8. O consumer mantém os valores claro/escuro do
  tema padrão observado em `open-bible/apps/web/app/globals.css` e no provider
  de tema legado.
- Shell: composição full-viewport com dock flutuante para Leitura, Busca,
  configurações e tema. Biblioteca e Busca usam `page-frame`; o Leitor ocupa o
  espaço disponível com toolbar pill sticky e área de leitura independente.
  Em mobile, dock, toolbar, cards e controles refluem para uma coluna sem
  esconder ações válidas.
- Biblioteca: composição List/Card com Badge de estado e ações inline. Instalar
  e remover não usam modal; o botão assume estado ocupado e a lista anuncia
  atualizações com `aria-live`.
- Leitor: toolbar pill com pickers de livro/capítulo e versão, largura do texto e
  navegação anterior/próxima; o gatilho de capítulo exibe somente o número e os versículos aparecem em ordem
  canônica, com número em `sup`, fonte serifada e coluna centralizada.
- Busca: formulário próprio com label acessível, resultados agrupados por
  versão e links para o contexto do versículo.
- Estados obrigatórios: skeleton para carregamento, EmptyState para ausência de
  conteúdo, ErrorState com retry e banner persistente explicando a operação
  offline. Foco visível em links, botões e inputs.
- Primitives locais seguem o padrão de source ownership do shadcn/ui em
  `apps/consumer-web/src/components/ui`; as composições de domínio ficam em
  `src/features` e podem ser estendidas sem colocar regra de engine na rota.
