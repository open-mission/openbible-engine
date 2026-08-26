# Aplicação e implementações

<!-- specsfy:documentator:start -->
## Superfícies

Categorias: Serviços, Rotas e APIs, Páginas, Componentes, Testes e Outras fontes.

Relação: relaciona cada arquivo observado à sua superfície.

| Categoria | Arquivo | Símbolos |
| --- | --- | --- |
| Testes | apps/conformance-cli/src/__tests__/conformance.test.ts | — |
| Outras fontes | apps/conformance-cli/src/index.ts | printJson, printError, createReadyEngine, runCheck, runListBooks, runGetChapter, runSearch, runParse |
| Outras fontes | apps/conformance-cli/vitest.config.ts | — |
| Outras fontes | eslint.config.js | — |
| Testes | packages/adapter-http/src/__tests__/placeholder.test.ts | makeFakeFetch |
| Outras fontes | packages/adapter-http/src/http-source.ts | HttpBiblePackageSourceOptions, FALLBACK_VERSIONS, SQLITE_HEADER_TEXT, SQLITE_HEADER, headerValid, HttpBiblePackageSource, DS |
| Outras fontes | packages/adapter-http/src/index.ts | — |
| Outras fontes | packages/adapter-http/vitest.config.ts | — |
| Testes | packages/adapter-sqlite-native/src/__tests__/placeholder.test.ts | — |
| Outras fontes | packages/adapter-sqlite-native/src/driver.ts | SqliteStatement, SqliteDriver, InMemoryDriver, BetterSqliteDriverOptions, BetterSqliteDriver, Database, createDriver |
| Outras fontes | packages/adapter-sqlite-native/src/index.ts | — |
| Outras fontes | packages/adapter-sqlite-native/src/sqlite-native.ts | SQLITE_HEADER_TEXT, SQLITE_HEADER, canonicalOrder, ORDER, stripAccents, normalizeForSearch, NativeStoreEntry, parseSyntheticBytes |
| Outras fontes | packages/adapter-sqlite-native/vitest.config.ts | — |
| Testes | packages/adapter-sqlite-web/src/__tests__/placeholder.test.ts | — |
| Outras fontes | packages/adapter-sqlite-web/src/in-memory.ts | SQLITE_HEADER_TEXT, SQLITE_HEADER, canonicalOrder, ORDER, stripAccents, normalizeForSearch, WebStoreEntry, parseSyntheticBytes |
| Outras fontes | packages/adapter-sqlite-web/src/index.ts | — |
| Outras fontes | packages/adapter-sqlite-web/src/sqlite-web.ts | for, SqliteWebLibrary, WebBibleLibrary |
| Outras fontes | packages/adapter-sqlite-web/vitest.config.ts | — |
| Testes | packages/engine/src/__tests__/engine.test.ts | — |
| Testes | packages/engine/src/__tests__/install.test.ts | — |
| Testes | packages/engine/src/__tests__/search.test.ts | — |
| Outras fontes | packages/engine/src/engine.ts | SQLITE_HEADER_TEXT, SQLITE_HEADER, isEngineError, throwIfAborted, emit, wrapUnknown, checkHeader, decodePayload |
| Outras fontes | packages/engine/src/index.ts | — |
| Outras fontes | packages/engine/src/ports.ts | BibleLibrary, InstalledBibleRegistry, BiblePackageSource, Clock, InstallationObserver |
| Outras fontes | packages/engine/src/use-cases/index.ts | — |
| Outras fontes | packages/engine/src/use-cases/install.ts | — |
| Outras fontes | packages/engine/vitest.config.ts | — |
| Testes | packages/engine-core/src/__tests__/contracts.test.ts | — |
| Testes | packages/engine-core/src/__tests__/parser.test.ts | — |
| Testes | packages/engine-core/src/__tests__/validation.test.ts | — |
| Outras fontes | packages/engine-core/src/book-meta.ts | BOOKS, BOOK_BY_ID, BOOK_MAP, BOOK_BY_ABBR, getBookById, getBookByAbbreviation |
| Outras fontes | packages/engine-core/src/errors.ts | EngineErrorOptions, EngineError, createEngineError, isEngineError, throwEngineError |
| Outras fontes | packages/engine-core/src/index.ts | — |
| Outras fontes | packages/engine-core/src/normalize.ts | KEBAB_REGEX, stripAccents, containsPathTraversal, normalizeKebabRaw, normalizeVersionId, normalizeBookId, normalizeId |
| Outras fontes | packages/engine-core/src/parser.ts | ParsedReference, normalizeForParse, getBookKeys, buildExactMap, parseReference, parseReferenceToBibleReference |
| Outras fontes | packages/engine-core/src/types.ts | BibleVersion, BibleBook, Verse, BibleReference, InstalledBible, SearchRequest, SearchResult, InstallationProgress |
| Outras fontes | packages/engine-core/src/validation.ts | KEBAB_REGEX, containsTraversal, validateVersionId, validateBookId, isValidVersionId, isValidBookId, isKebabId, assertValidVersionId |
| Outras fontes | packages/engine-core/vitest.config.ts | — |
| Testes | packages/engine-testing/src/__tests__/contract-suite.test.ts | — |
| Testes | packages/engine-testing/src/__tests__/placeholder.test.ts | — |
| Outras fontes | packages/engine-testing/src/builders.ts | BibleVersionBuilder, BibleBookBuilder, VerseBuilder, aBibleVersion, aBibleBook, aVerse |
| Outras fontes | packages/engine-testing/src/contract-suite.ts | assert, canonicalOrderMap, ORDER, isSortedByCanonical, isSortedVerses, isSearchSorted, ContractSuiteOptions, runContractSuite |
| Outras fontes | packages/engine-testing/src/fakes.ts | FakeClock, FakeRegistry, canonicalOrderMap, ORDER_MAP, stripAccents, normalizeForSearch, parsePayload, SQLITE_HEADER |
| Outras fontes | packages/engine-testing/src/fixtures.ts | SQLITE_HEADER_TEXT, SQLITE_HEADER, SQLITE_HEADER_BYTES, SQLITE_HEADER_STRING, SyntheticPayload, createSyntheticBibleBytes, ARA_VERSION_ID, ARA_VERSION_NAME |
| Outras fontes | packages/engine-testing/src/index.ts | — |
| Outras fontes | packages/engine-testing/vitest.config.ts | — |
| Testes | tests/arch/core-imports.test.ts | CORE_SRC, FORBIDDEN, walk |
| Testes | tests/arch/exports.test.ts | — |
| Testes | tests/arch/traceability-bulk.test.ts | — |
| Outras fontes | vitest.config.ts | — |
<!-- specsfy:documentator:end -->
