# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**TypeScript, Vitest, Node.js (SQLite real via `node:sqlite`)**.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| A confirmar | Nenhuma estrutura reconhecida | A confirmar |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| A confirmar | A confirmar | A confirmar | A confirmar | A confirmar |
<!-- specsfy:database:end -->

## Persistência Native SDK

- O adapter `@openbible/adapter-sqlite-native` recebe uma `NativeStorage` síncrona
  de nomes lógicos. O service Native resolve esses nomes dentro do namespace da
  aplicação; caminhos físicos não entram no `Model`, nas mensagens ou no markup.
- O registry é `registry.json`, gravado por substituição via
  `registry.json.tmp`, com os campos `id`, `name`, `installedAt` e `versionCode`.
  Cada versão usa `bibles/<id>.db`; durante operações podem existir
  `bibles/<id>.db.tmp`, `.bak` e `.trash`. Downloads remotos usam
  `downloads/<id>.sqlite.part`, sem entrada no registry, até o commit local ou
  limpeza por falha/reset.
- O `NativeInstaller` é o único escritor: grava temporário, valida header/schema,
  promove, registra e remove intermediários. Falhas restauram o arquivo anterior
  e o registry; a reconciliação de abertura remove temporários, restaura backups
  necessários e elimina órfãos. A garantia é exception-safe/best-effort, não
  crash-safe com journal.
- O consumer não importa fixture para sua execução: `Cmd.fetch` obtém ARA/NVI do
  R2 em blocos e o harness Vitest usa fixture SQLite sintética em storage de
  memória. Nenhum banco Native é compartilhado com o storage legado.

## Decisões, ownership e retenção

- Formato SQLite do legado preservado: `metadata(key,value)`, `book(id INTEGER)`, `verse(book_id INTEGER, chapter, verse, text[, translation])`. Fixture SQLite real pequena e sem conteúdo bíblico protegido é gerada para os testes (`buildLegacySqliteBibleFixture`), não um cabeçalho seguido de JSON; campos adicionais (`translation`, `copyright`) não quebram leitura.
- O arquivo ARA publicado no R2 foi verificado como SQLite com `metadata(name,dbversion)`, `book(id INTEGER PRIMARY KEY, book_reference_id, testament_reference_id, name)` e `verse(id INTEGER PRIMARY KEY, book_id, chapter, verse, text)`. O parser Native aceita a omissão de `INTEGER PRIMARY KEY` no payload SQLite e usa o `rowid` para preservar a leitura publicada e a fixture sintética.
- IDs SQLite 1..66 convertidos para os canônicos do domínio (`gen`..`rev`) via `legacy-book-map.ts` (ordem = `BOOKS`/`BOOK_META` legado) ao listar livros, ler capítulos e buscar.
- Instalação (dono: `BibleInstaller`) em 9 passos com atomicidade real e **exception-safe** (reconciliação best-effort na inicialização): bytes → tmp → validar header (`SQLite format 3\0`) → validar schema (`metadata/book/verse`) → validar identidade (`metadata.versionId` OPCIONAL; se presente valida, se ausente não rejeita) → sanity query → promote atômico (rename) → registrar `installed_bibles` → cleanup/rollback. Registro faz parte da garantia transacional com compensação verificável (sem parcial, preserva anterior, sem divergência registry/armazenamento). **Não** é crash-safe completa sem journal (ver ADR-013/DEC-020).
- Aquisição Native: ranges consecutivos de até `204800` bytes são gravados em `downloads/<id>.sqlite.part` com offset estritamente sequencial. O commit só chama o installer depois do último bloco; status HTTP, truncamento, erro de rede, cancelamento ou falha de validação limpam a parte e não promovem armazenamento parcial.
- Leitura read-only; versículos ordenados ASC; busca `LIKE ... COLLATE NOCASE` com limite explícito e `total` = `COUNT(*)` antes do LIMIT, em ordem canônica. Ciclo de conexões corrigido: `closeVersion`/`close`, fechar antes de substituir/remover arquivo, `NodeAdapter.close()` fecha library e registry.
- Startup reconciliation best-effort: `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash` na abertura do adapter, trata `.db` sem registry como órfão (removido) e documenta `.db + .bak` como ambíguo sem journal; estados intermediários testados. **Crash-safety completa** (journal por operação) fica como spec futura. Cancelamento via `CancellationToken` portátil em todos os checkpoints → code `cancelled`.
- **Adapter Web (`@openbible/adapter-sqlite-web`, SPEC-0002)** agora implementa os três ports sobre Worker dedicado + SQLite WASM + OPFS SAHPool (`opfs-sahpool`), sem COOP/COEP. Persistência: `store.db` (registry `installed_bibles(id,name,installed_at,version_code)`) e arquivos lógicos por versão (`/<id>.db` final, `.<id>.db.bak` backup, `.<id>.db.trash` trash, `.<id>.db.tmp-*` temporário) no mesmo pool/Worker. Sem rename público no SAHPool, promoção é cópia/importação (`importDb`/`exportFile`/`unlink`); capacidade reservada via `reserveMinimumCapacity`. Garantia nomeada: **SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort** — nunca atomic rename/crash-safe/power-loss-safe (DEC-008/DEC-009).
- Reconciliation web best-effort (`reconcilePool`): remove temporários, restaura backup quando não há final, faz rollback determinístico em par final+backup, restaura trash quando o registry ainda referencia, descarta trash órfão, remove final órfão sem registry, remove registry sem final e jamais trata `store.db` como órfão.
- Instalação web exception-safe: temporary → validar header/schema/identidade/sanity → backup do final (export/import) → promover final (cópia) → registrar → cleanup; falha controlada restaura o backup e remove intermediários (cancelamento → `cancelled`; colisão de directory → `storage_busy`). Segunda aba não usa coordenação nesta fatia.
- Persistência do registro e dos finais persiste enquanto a origem mantiver OPFS; negativa de persistência permite eviction; mudar `poolDirectory` cria namespace isolado. Adapter segue **Node.js** sem TursoDB nesta entrega; sync futuro poderá adicionar migrations versionadas. Bun não afirmado para o adapter Node.

<!-- specsfy:conversation-data:start -->
## Informações a guardar confirmadas

| Informação | Para que serve | O que guardar | Formato sugerido | Ligações | Quem usa | Quando muda ou sai | Fontes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nota de estudo pessoal | Permitir que a pessoa registre uma observação própria ligada a um versículo ou intervalo e a consulte offline | Texto original em Markdown seguro para exibição, não vazio, com até 10.000 caracteres, título opcional, livro, capítulo e versículo(s) de uma referência individual ou intervalo contíguo, sem versão bíblica específica, data de criação e data da última alteração | Texto livre em Markdown original, com pelo menos um caractere não vazio e no máximo 10.000 caracteres; texto curto opcional para o título; referência por livro/capítulo/versículo(s); datas de criação/alteração; consumidores exibem apenas Markdown seguro | Cada nota permanece ligada a um livro, capítulo e versículo(s) ou intervalo; não fica ligada a uma versão específica; referências inválidas não são aceitas; quando nenhuma Bíblia instalada resolve a referência, a nota permanece ligada à referência e é marcada como texto bíblico indisponível; o ownership é local à instalação ou dispositivo | A instalação ou dispositivo local que criou a nota consulta, altera e exclui seu conteúdo; consumidores devem impedir execução de HTML arbitrário e scripts | A nota é criada, consultada e alterada; referência inválida, conteúdo vazio ou acima de 10.000 caracteres é rejeitado; permanece enquanto não houver exclusão explícita; a exclusão é permanente e imediata; se nenhuma Bíblia instalada resolver a referência, a nota permanece na lista normal com aviso de texto bíblico indisponível; exportação e importação ficam fora da primeira fatia | specs/inbox/2026-08-26-193949-bounded-context-personal-study-offline.md,specs/backlog/0007-bounded-context-personal-study-offline.md |
<!-- specsfy:conversation-data:end -->
