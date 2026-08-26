# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**TypeScript, Vitest, Node.js (SQLite real via `node:sqlite`)**.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| Biblioteca bíblica local | SQLite real (arquivo `<version>.db`) com tabelas `metadata(key,value)`, `book(id,name)`, `verse(book_id,chapter,verse,text)` aberto read-only | `packages/adapter-sqlite-native/src/bible-store.ts` (`NativeBibleLibrary`), `driver.ts`, `fixtures.ts` (`buildRealSqliteBibleFixture`) |
| Registry de instaladas | SQLite real `installed_bibles(id,name,installed_at,version_code)` persistente | `packages/adapter-sqlite-native/src/registry.ts` (`SqliteInstalledRegistry`) |
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

- Formato SQLite preservado: `metadata(key,value)`, `book(id, ...)`, `verse(book_id, chapter, verse, text)`. Não copia banco real; fixture SQLite real pequena e sem conteúdo bíblico protegido é gerada para os testes (`buildRealSqliteBibleFixture`), não um cabeçalho seguido de JSON.
- Instalação (dono: `BibleInstaller`) em 9 passos com atomicidade real: bytes → tmp → validar header (`SQLite format 3\0`) → validar schema (`metadata/book/verse`) → validar identidade (`metadata.versionId`) → sanity query → promote atômico (rename) → registrar `installed_bibles` → cleanup/rollback em falha. Registro faz parte da garantia transacional com compensação verificável (sem parcial, preserva anterior, sem divergência registry/armazenamento).
- Leitura read-only; versículos ordenados ASC; busca `LIKE ... COLLATE NOCASE` com limite explícito. Desinstalação com compensação reversível (rename para trash → remove registry → restaura em falha).
- Cancelamento via `CancellationToken` portátil → code `cancelled`. Sem TursoDB nesta entrega; OPFS/Worker/WASM é fatia planejada (web); sync futuro poderá adicionar migrations versionadas.
