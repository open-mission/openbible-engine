# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**TypeScript, Vitest, Node.js (SQLite real via `node:sqlite`)**.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Biblioteca bíblica local | SQLite real compatível com o schema legado (arquivo `<version>.db`) com `metadata(key,value)`, `book(id INTEGER)`, `verse(book_id INTEGER, chapter, verse, text[, translation])` aberto read-only | `packages/adapter-sqlite-node/src/bible-store.ts` (`NodeBibleLibrary`), `legacy-book-map.ts`, `driver.ts`, `fixtures.ts` (`buildLegacySqliteBibleFixture`) |
| Registry de instaladas | SQLite real `installed_bibles(id,name,installed_at,version_code)` persistente | `packages/adapter-sqlite-node/src/registry.ts` (`NodeSqliteRegistry`) |
| Catálogo remoto opcional | `fetch` via `BiblePackageSource` (listAvailable/fetchPackage, ponte `CancellationToken`→`AbortSignal`) | `packages/adapter-http/src/http-source.ts` |
| Fakes in-memory (testes) | `FakeLibrary`, `FakeBibleInstaller`, `FakeRegistry` (Map) | `packages/engine-testing/src/fakes.ts`, `fixtures.ts` |
| Clock | epoch ms via `Clock` port | `packages/engine/src/ports.ts`, `packages/engine-testing/src/fakes.ts` (`FakeClock`) |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| BibleVersion | Record serializável (engine-core) | `id` kebab normalized, `name`, `language?`, `totalBooks?` | 1:N BibleBook | `packages/engine-core/src/types.ts` |
| BibleBook | Record | `id`, `name`, `abbreviation`, `testament` old/new, `chapters` | N:1 BibleVersion, 1:N Verse | `packages/engine-core/src/book-meta.ts` (BOOKS 66) |
| Verse | Record | `id`, `bookId`, `chapter`, `verse`, `text` | N:1 BibleBook | `packages/engine-core/src/types.ts` |
| InstalledBible | Record | `id`, `name`, `installedAt` epoch ms, `versionCode` | 1:1 BibleVersion | `packages/engine-core/src/types.ts` |
| metadata (SQLite real) | Tabela | `key` (PK), `value` | 1:1 bible DB | `bible-store.ts`, `fixtures.ts` |
| book (SQLite real) | Tabela | `id` (PK), `name` | 1:N verse | `bible-store.ts`, `fixtures.ts` |
| verse (SQLite real) | Tabela | `book_id`, `chapter`, `verse`, `text` | N:1 book | `bible-store.ts`, `fixtures.ts` |
| installed_bibles (SQLite real) | Tabela | `id` (PK), `name`, `installed_at`, `version_code` | 1:1 bible DB | `registry.ts` |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

- Formato SQLite do legado preservado: `metadata(key,value)`, `book(id INTEGER)`, `verse(book_id INTEGER, chapter, verse, text[, translation])`. Fixture SQLite real pequena e sem conteúdo bíblico protegido é gerada para os testes (`buildLegacySqliteBibleFixture`), não um cabeçalho seguido de JSON; campos adicionais (`translation`, `copyright`) não quebram leitura.
- IDs SQLite 1..66 convertidos para os canônicos do domínio (`gen`..`rev`) via `legacy-book-map.ts` (ordem = `BOOKS`/`BOOK_META` legado) ao listar livros, ler capítulos e buscar.
- Instalação (dono: `BibleInstaller`) em 9 passos com atomicidade real e **exception-safe** (reconciliação best-effort na inicialização): bytes → tmp → validar header (`SQLite format 3\0`) → validar schema (`metadata/book/verse`) → validar identidade (`metadata.versionId` OPCIONAL; se presente valida, se ausente não rejeita) → sanity query → promote atômico (rename) → registrar `installed_bibles` → cleanup/rollback. Registro faz parte da garantia transacional com compensação verificável (sem parcial, preserva anterior, sem divergência registry/armazenamento). **Não** é crash-safe completa sem journal (ver ADR-013/DEC-020).
- Leitura read-only; versículos ordenados ASC; busca `LIKE ... COLLATE NOCASE` com limite explícito e `total` = `COUNT(*)` antes do LIMIT, em ordem canônica. Ciclo de conexões corrigido: `closeVersion`/`close`, fechar antes de substituir/remover arquivo, `NodeAdapter.close()` fecha library e registry.
- Startup reconciliation best-effort: `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash` na abertura do adapter, trata `.db` sem registry como órfão (removido) e documenta `.db + .bak` como ambíguo sem journal; estados intermediários testados. **Crash-safety completa** (journal por operação) fica como spec futura. Cancelamento via `CancellationToken` portátil em todos os checkpoints → code `cancelled`.
- Sem TursoDB nesta entrega; OPFS/Worker/WASM é fatia planejada (web); sync futuro poderá adicionar migrations versionadas. Adapter é **Node.js** (`node:fs`/`node:path`/`node:sqlite`); Bun não afirmado.
