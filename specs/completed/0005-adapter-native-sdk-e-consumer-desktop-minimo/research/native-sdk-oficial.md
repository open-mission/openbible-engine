# Evidência: Native SDK oficial

## Proveniência

- Origem: `https://github.com/vercel-labs/native`
- Documentação: `https://native-sdk.dev/docs/quick-start`, `https://native-sdk.dev/docs/cli`, `https://native-sdk.dev/docs/typescript/services`, `https://native-sdk.dev/docs/native-ui`, `https://native-sdk.dev/docs/sqlite`, `https://native-sdk.dev/docs/files` e `https://native-sdk.dev/docs/platform-support`
- Referência consultada em: 2026-08-27
- Revisão do repositório consultada: `064ca9890cc0cf8adc198215bd0ddaeb586c220a` (gitHead de `@native-sdk/cli@0.10.1`)
- Licença declarada pelo repositório: Apache-2.0
- Tipo de artefato: notas próprias de pesquisa; nenhum conteúdo protegido foi copiado além de nomes de APIs e termos necessários para rastreabilidade.

## Plataforma e ciclo de execução

### #plataformas-desktop

O README e a matriz de plataformas descrevem macOS, Linux e Windows como hosts desktop do runtime. macOS é o host de desenvolvimento primário; Linux e Windows possuem hosts desktop e automação declarada. A matriz também registra diferenças de renderização, menus, notificações, empacotamento e automação. A fonte não autoriza declarar suporte do consumer sem executar a matriz relevante.

### #modelo-de-aplicação

O app possui `Model`, união discriminada `Msg`, `update` puro e síncrono, e uma view declarativa em `.native`. A CLI `0.10.1` documenta `native dev --core`, `native check`, `native test` e `native build`. O `core` não deve fazer I/O; efeitos retornam como comandos e respostas voltam como mensagens.

## TypeScript e I/O

### #typescript-core-e-services

A documentação separa o core determinístico da camada `src/services/`. O core compilável restringe ecossistema e operações ambientais; services usam TypeScript estático para operações imperativas, incluindo filesystem e outros efeitos, com contrato tipado de request/result encodável entre serviço e core. As operações exportadas pelo service são síncronas e `Promise` não atravessa a fronteira. Isso é compatível com a decisão do projeto de manter regras no engine e detalhes de plataforma atrás de ports, mas não prova que o código atual da engine compile diretamente no subset do core.

### #sqlite-relacional

A documentação oficial descreve SQLite relacional engine-owned, capability `sqlite`, migrations append-only em `src/schema/`, queries nomeadas em `src/queries.sql`, geração de API tipada e `native check` contra SQLite real em memória. As queries cruzam o limite como `Cmd`/`Msg` e o banco do app fica no diretório de dados resolvido pelo runtime; a API não é a mesma port `BibleLibrary`/`BibleInstaller` do projeto e exige um adapter próprio. Também há limites de páginas, transações e resultados, além de erros fechados.

### #filesystem

A documentação oficial descreve comandos de arquivo como efeitos retornando resultados por `Msg`, limites para operações de arquivo inteiro, streaming para arquivos maiores, escrita atômica por sink e diretórios de dados resolvidos pelo runtime. Services também podem usar `fs` na camada estática, mas `Promise` e paths físicos não devem cruzar para o core. Paths fora das raízes do app exigem permissão `filesystem`. A prova deve escolher entre a capacidade SQLite, os comandos de arquivo ou uma combinação, sem expor paths físicos ao core.

## Interface e verificação

### #native-ui

A UI padrão é markup `.native` renderizado pelo próprio runtime, não React, browser ou WebView. O catálogo inclui `tabs`, `list`, `table`, `text-field`, `search-field`, `button`, `badge`, `skeleton`, `spinner`, `alert`, `scroll`, `split` e componentes de navegação. Mensagens de controles são ligadas à união `Msg`; estados pertencem ao model.

### #automation

O README e a matriz documentam automação por snapshots, assertions, input, screenshots e record/replay em hosts desktop. A spec usa essa capacidade para provar a jornada da UI, mas exige também testes do adapter e do contrato, pois uma captura visual isolada não prova persistência ou atomicidade.

## Limites da evidência

- A consulta foi feita na branch `main`, que permanece pré-1.0; a revisão precisa ser fixada na implementação.
- A documentação oficial não prova que `@openbible/engine` ou `@openbible/adapter-sqlite-native` já existam para o Native SDK.
- A documentação não prova a compatibilidade direta das APIs assíncronas atuais do engine com o core síncrono; a separação por service e o adapter são hipóteses de projeto a verificar.
- A documentação não substitui execução nos três hosts; plataforma sem execução deve permanecer não declarada como suportada.

## Resultado da spike local

### #spike-local-2026-08-27

- Ambiente observado: Linux `7.1.9-arch1-2 x86_64`, monorepo em Node `v22.23.2`.
- A prova do SDK usa Node `v24.20.0` e CLI isolada `0.10.1`; portanto o Node do
  monorepo não é confundido com o runtime exigido pela ferramenta.
- O Quick Start oficial exige Node `24+` e documenta a instalação como
  `npm install -g @native-sdk/cli`; a CLI `0.10.1` foi instalada isoladamente
  com Node `v24.20.0` e Zig `0.16.0` foi baixado pelo comando de teste.
- Um scaffold temporário criado por `native init` passou `native check`,
  `native test` e `native build` no Linux. `native doctor --strict` falhou por
  WebKitGTK 6.0 ausente; o backend Chromium foi detectado, mas isso não prova
  a UI do consumer deste projeto.
- O `native check apps/consumer-native` não pode ser executado como app porque o
  consumer ainda não possui `app.json` ou `app.zon`; a matriz registra esse limite
  sem inferir suporte do produto.
- Um service temporário com `node:fs` passou no `native check`, confirmando o
  seam de filesystem. O mesmo teste com `node:sqlite` foi rejeitado por `NS1066`.
  A capability SQLite documentada abre somente o `app.db` engine-owned e não
  expõe abertura de arquivo SQLite externo.
- O seam final da port `Promise` permanece bloqueado para a fixture SQLite
  legada: o core usará `Cmd`/`Msg` e o service síncrono cuidará do filesystem e
  de um leitor SQLite puro em TypeScript, limitado ao schema legado. O registry
  será JSON atômico no namespace do app; nenhum host é declarado suportado para
  o consumer até sua execução própria.

### #decisao-seam-2026-08-27

- A alternativa selecionada é um leitor SQLite legado somente leitura em
  TypeScript, executado no service Native, com operações de arquivo síncronas e
  registry JSON atômico. Isso preserva a port `Promise` para os consumidores do
  monorepo e mantém `Promise`, paths físicos, SQL e a autoridade de plataforma
  fora do core Native.
- A alternativa é deliberadamente restrita às tabelas `metadata`, `book` e
  `verse` e aos tipos necessários ao schema legado; bases fora desse contrato
  devem falhar com erro tipado, não cair para rede nem para o banco `app.db`.

### #download-r2

- A documentação do Native SDK para `Cmd.fetch` registra que uma resposta
  buffered acima de 256 KiB é rejeitada como `truncated`; o comando retorna o
  status HTTP e o corpo como bytes, mas não expõe headers de resposta ao core.
- O bucket público usado pelo consumer Web é
  `https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles`. Em 2026-08-28,
  `curl -I -L` confirmou `Accept-Ranges: bytes` e arquivos
  `ARA.sqlite`/`NVI.sqlite` acima de 4 MiB.
- A solução compatível com os limites é emitir GETs com header `Range` em
  blocos menores que 256 KiB, encaminhar cada corpo imediatamente ao service e
  instalar somente após o último bloco. O core não guarda o pacote completo no
  `Model`, e a validação/rollback continuam sob o installer local.
- Limite residual: a API usada não fornece total de bytes ao core. O consumer
  considera o download concluído quando o corpo recebido é menor que o tamanho
  do bloco; uma resposta sem suporte a ranges ou com status diferente de
  `200/206` falha explicitamente e não é tratada como pacote válido.
