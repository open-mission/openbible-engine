# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**TypeScript, Vitest, Node.js**.

Para TypeScript, explicite persistência via SQLite local e ports.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Biblioteca bíblica local | SQLite sintético (synthetic Bible bytes: header `SQLite format 3\0` + JSON `{metadata, books, verses}`) via `BibleLibrary` port | `packages/engine-testing/src/fixtures.ts` (`createSyntheticBibleBytes`), `packages/adapter-sqlite-native/src/sqlite-native.ts`, `packages/adapter-sqlite-web/src/sqlite-web.ts`, `packages/engine/src/engine.ts` (validação header/schema/identidade) |
| Registry de instaladas | In-memory `InstalledBibleRegistry` (Map) + futuro `installed_bibles(id, name, installed_at, version_code)` | `packages/engine-testing/src/fakes.ts` (`FakeRegistry`), `packages/engine/src/ports.ts` |
| Catálogo remoto opcional | `fetch` via `BiblePackageSource` (listAvailable/fetchPackage) | `packages/adapter-http/src/http-source.ts` |
| Clock | epoch ms via `Clock` port | `packages/engine/src/ports.ts`, `packages/engine-testing/src/fakes.ts` (`FakeClock`) |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| BibleVersion | Record serializável | `id` kebab normalized, `name`, `language?`, `totalBooks?` | 1:N BibleBook | `packages/engine-core/src/types.ts` |
| BibleBook | Record | `id`, `name`, `abbreviation`, `testament` old/new, `chapters` | N:1 BibleVersion, 1:N Verse | `packages/engine-core/src/book-meta.ts` (BOOKS 66, ex: gen 50, psa 150, rev 22) |
| Verse | Record | `id` `${book}-${chapter}-${verse}`, `bookId`, `chapter`, `verse`, `text` | N:1 BibleBook | `packages/engine-core/src/types.ts` |
| InstalledBible | Record | `id` (=versionId), `name`, `installedAt` epoch ms, `versionCode` | 1:1 BibleVersion | `packages/engine-core/src/types.ts` |
| metadata (SQLite) | Tabela sintética | `key`, `value` (ex: `name`, `versionId`) | 1:1 Bible DB | `packages/engine-testing/src/fixtures.ts` JSON dentro de bytes |
| book (SQLite) | Tabela sintética | `id` (int/string), `name` | 1:N verse | Fixture JSON |
| verse (SQLite) | Tabela sintética | `book_id`, `chapter`, `verse`, `text` | N:1 book | Fixture JSON |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

- SQLite formato observado preservado: `metadata(key,value)`, `book(id, ...)`, `verse(book_id, chapter, verse, text)`; não copia banco real; fixture sintética contém 3 livros (gen, exo, psa) ×2 caps ×3 versículos, ordenação, validação metadata e detecção schema inválido.
- Instalação 9 passos: validação header/schema/identidade/sanity antes de promover; `installed_bibles` só atualizado após sucesso; tmp limpo em falha; idempotente; preserva anterior.
- Leitura read-only; versículos ordenados ASC; busca LIKE COLLATE NOCASE com limite explícito.
- Sem TursoDB nesta entrega; persistência real (OPFS/SAHPool ou `better-sqlite3` file) fica atrás de adapters; futuro sync poderá adicionar migrations versionadas.
- Fixture gerada em teste (`createSyntheticBibleBytes`/`createAraFixture`), não distribuída; consumidores futuros embarcam ARA via empacotamento.

