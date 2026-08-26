# Aplicação e implementações

<!-- specsfy:documentator:start -->
## Superfícies

Categorias: Serviços, Rotas e APIs, Páginas, Componentes, Testes e Outras fontes.

Relação: relaciona cada arquivo observado à sua superfície.

| Categoria | Arquivo | Símbolos |
| --- | --- | --- |
| Testes | apps/conformance-cli/src/__tests__/conformance.test.ts | tempNativeEngine |
| Outras fontes | apps/conformance-cli/src/index.ts | printJson, printError, makeRealEngine, ensureInstalled, runCheck, runListBooks, runGetChapter, runSearch |
| Outras fontes | apps/conformance-cli/vitest.config.ts | — |
| Outras fontes | eslint.config.js | — |
| Testes | packages/adapter-http/src/__tests__/http-source.test.ts | SQLITE_HEADER, validHeaderBytes, makeFakeFetch |
| Outras fontes | packages/adapter-http/src/http-source.ts | HttpBiblePackageSourceOptions, FALLBACK_VERSIONS, SQLITE_HEADER_TEXT, SQLITE_HEADER, headerValid, toAbortSignal, HttpBiblePackageSource, DS |
| Outras fontes | packages/adapter-http/src/index.ts | — |
| Outras fontes | packages/adapter-http/vitest.config.ts | — |
| Testes | packages/adapter-sqlite-native/src/__tests__/sqlite-native.test.ts | readDirList |
| Outras fontes | packages/adapter-sqlite-native/src/bible-store.ts | SQLITE_HEADER_TEXT, SQLITE_HEADER, canonicalOrder, ORDER, isSqliteHeader, ValidateResult, validateMaterializedBibleFile, readMetadata |
| Outras fontes | packages/adapter-sqlite-native/src/driver.ts | against, SqliteStatement, SqliteDriver, DriverOptions, NodeSqliteDriver |
| Outras fontes | packages/adapter-sqlite-native/src/fixtures.ts | REAL_ARABIC_VERSION_ID, REAL_ARABIC_VERSION_NAME, buildBooks, buildVerses, RealSqliteFixture, buildRealSqliteBibleFixture, REAL_ARA_FIXTURE |
| Outras fontes | packages/adapter-sqlite-native/src/index.ts | NativeAdapterOptions, NativeAdapter, createNativeAdapter |
| Outras fontes | packages/adapter-sqlite-native/src/registry.ts | SqliteInstalledRegistry |
| Outras fontes | packages/adapter-sqlite-native/vitest.config.ts | — |
| Testes | packages/adapter-sqlite-web/src/__tests__/sqlite-web-slice.test.ts | — |
| Outras fontes | packages/adapter-sqlite-web/src/index.ts | — |
| Outras fontes | packages/adapter-sqlite-web/src/sqlite-web.ts | SqliteWebLibrary, WebBibleLibrary |
| Outras fontes | packages/adapter-sqlite-web/vitest.config.ts | — |
| Testes | packages/engine/src/__tests__/engine.test.ts | — |
| Outras fontes | packages/engine/src/__tests__/helpers.ts | MakeEngineOptions, FALLBACK_SOURCE, makeEngine |
| Testes | packages/engine/src/__tests__/install.test.ts | — |
| Testes | packages/engine/src/__tests__/search.test.ts | — |
| Outras fontes | packages/engine/src/engine.ts | isEngineError, throwIfAborted, emit, wrapUnknown, BibleEngineDeps, BibleEngine, toBibleReference, createBibleEngine |
| Outras fontes | packages/engine/src/index.ts | — |
| Outras fontes | packages/engine/src/ports.ts | BibleLibrary, InstalledBibleRegistry, BiblePackageSource, Clock, InstallationObserver, InstallPackageInput, BibleInstaller |
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
| Testes | packages/engine-testing/src/__tests__/contract-suite.test.ts | seededLibrary |
| Testes | packages/engine-testing/src/__tests__/fakes.test.ts | — |
| Outras fontes | packages/engine-testing/src/builders.ts | BibleVersionBuilder, BibleBookBuilder, VerseBuilder, aBibleVersion, aBibleBook, aVerse |
| Outras fontes | packages/engine-testing/src/contract-suite.ts | assert, canonicalOrderMap, ORDER, isSortedByCanonical, isSortedVerses, isSearchSorted, ContractSuiteOptions, runContractSuite |
| Outras fontes | packages/engine-testing/src/fakes.ts | FakeClock, FakeRegistry, ORDER_MAP, stripAccents, normalizeForSearch, FakeLibraryEntry, FakeLibrary, FakeInstallerOptions |
| Outras fontes | packages/engine-testing/src/fixtures.ts | ARA_VERSION_ID, ARA_VERSION_NAME, buildDefaultBooks, buildDefaultVerses, BibleFixtureData, createAraFixture, createFixture, DEFAULT_ARA_FIXTURE |
| Outras fontes | packages/engine-testing/src/index.ts | — |
| Outras fontes | packages/engine-testing/vitest.config.ts | — |
| Testes | tests/arch/core-imports.test.ts | CORE_SRC, FORBIDDEN, walk |
| Testes | tests/arch/engine-purity.test.ts | ENGINE_SRC, FORBIDDEN_ENGINE |
| Testes | tests/arch/exports.test.ts | — |
| Outras fontes | vitest.config.ts | — |
<!-- specsfy:documentator:end -->
