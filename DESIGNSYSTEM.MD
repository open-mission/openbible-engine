# Design System

## Consumer Web

- Tema escuro de alto contraste, fundo `slate-950`, superfícies `slate-900` e
  ação primária `sky-600`; o texto bíblico usa corpo amplo e line-height 8.
- Shell: app bar curta com Biblioteca e Busca, seguida de breadcrumb e conteúdo
  em uma coluna com largura máxima de leitura. Em mobile, cards e controles
  refluem para uma coluna sem esconder ações.
- Biblioteca: composição List/Card com Badge de estado e ações inline. Instalar
  e remover não usam modal; o botão assume estado ocupado e a lista anuncia
  atualizações com `aria-live`.
- Leitor: controles nativos de livro/capítulo e navegação anterior/próxima; os
  versículos aparecem em ordem canônica, com número em `sup` e corpo legível.
- Busca: formulário próprio com label acessível, resultados agrupados por
  versão e links para o contexto do versículo.
- Estados obrigatórios: skeleton para carregamento, EmptyState para ausência de
  conteúdo, ErrorState com retry e banner persistente explicando a operação
  offline. Foco visível em links, botões, inputs e selects.
- Primitives locais seguem o padrão de source ownership do shadcn/ui em
  `apps/consumer-web/src/components/ui`; as composições de domínio ficam em
  `src/features` e podem ser estendidas sem colocar regra de engine na rota.
