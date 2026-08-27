# Aplicação e implementações

<!-- specsfy:documentator:start -->
## Superfícies

Categorias: Serviços, Rotas e APIs, Páginas, Componentes, Testes e Outras fontes.

Relação: relaciona cada arquivo observado à sua superfície.

| Categoria | Arquivo | Símbolos |
| --- | --- | --- |
| Testes | apps/conformance-cli/src/__tests__/conformance.test.ts | tempNodeEngine |
| Outras fontes | apps/conformance-cli/src/index.ts | printJson, printError, makeRealEngine, ensureInstalled, runCheck, runListBooks, runGetChapter, runSearch |
| Outras fontes | apps/conformance-cli/vitest.config.ts | — |
| Outras fontes | eslint.config.js | — |
| Testes | packages/adapter-http/src/__tests__/http-source.test.ts | SQLITE_HEADER, validHeaderBytes, makeFakeFetch |
| Outras fontes | packages/adapter-http/src/http-source.ts | HttpBiblePackageSourceOptions, FALLBACK_VERSIONS, SQLITE_HEADER_TEXT, SQLITE_HEADER, headerValid, toAbortSignal, HttpBiblePackageSource, DS |
| Outras fontes | packages/adapter-http/src/index.ts | — |
| Outras fontes | packages/adapter-http/vitest.config.ts | — |
| Testes | packages/adapter-sqlite-node/src/__tests__/sqlite-node.test.ts | tmpDir, bytesOf, listNames, assertNoStrayFiles, makeFailingRegistry, installAra, touch, canonicalIndex |
| Outras fontes | packages/adapter-sqlite-node/src/bible-store.ts | SQLITE_HEADER, isSqliteHeader, readMetadata, ValidateResult, validateMaterializedBibleFile, loadBooks, RawVerse, toVerse |
| Outras fontes | packages/adapter-sqlite-node/src/driver.ts | with, SqliteStatement, SqliteDriver, DriverOptions, NodeSqliteDriver |
| Outras fontes | packages/adapter-sqlite-node/src/fixtures.ts | LEGACY_ARABIC_VERSION_ID, LEGACY_ARABIC_VERSION_NAME, bookIds, buildBooks, buildVerses, LegacySqliteFixture, buildLegacySqliteBibleFixture, LEGACY_ARA_FIXTURE |
| Outras fontes | packages/adapter-sqlite-node/src/index.ts | NodeAdapterOptions, NodeAdapter, createNodeAdapter |
| Outras fontes | packages/adapter-sqlite-node/src/legacy-book-map.ts | INT_TO_BOOK, BOOK_TO_INT, bookIdToInt, intToBook, intToCanonicalId, MAX_BOOK_ID |
| Outras fontes | packages/adapter-sqlite-node/src/registry.ts | NodeSqliteRegistry |
| Outras fontes | packages/adapter-sqlite-node/vitest.config.ts | — |
| Outras fontes | packages/adapter-sqlite-web/playwright.config.ts | dirname |
| Outras fontes | packages/adapter-sqlite-web/src/adapter.ts | WebAdapterOptions, WebReconcileStats, WebAdapter, toWorkerUrl, createWebAdapter |
| Outras fontes | packages/adapter-sqlite-web/src/capabilities.ts | CapabilityRuntime, WebCapabilities, resolvePersistentStorageState, detectWebCapabilities, capabilitiesAllowStorage |
| Outras fontes | packages/adapter-sqlite-web/src/index.ts | — |
| Outras fontes | packages/adapter-sqlite-web/src/pool.ts | SqlStatement, DbHandle, OpenOptions, PoolLike |
| Outras fontes | packages/adapter-sqlite-web/src/protocol.ts | WorkerInitOptions, WorkerResult, isWorkerRequest, isWorkerRunRequest |
| Outras fontes | packages/adapter-sqlite-web/src/worker/index.ts | Cancellable, WorkerRuntime, requestPersistentStorage, isBusyError, codeFromWorkerError |
| Outras fontes | packages/adapter-sqlite-web/src/worker/installer.ts | SQLITE_HEADER, isSqliteHeader, throwIfAborted, ValidateResult, validateImportedPackage, WebInstaller |
| Outras fontes | packages/adapter-sqlite-web/src/worker/legacy-book-map.ts | INT_TO_BOOK, BOOK_TO_INT, bookIdToInt, intToBook, intToCanonicalId, MAX_BOOK_ID |
| Outras fontes | packages/adapter-sqlite-web/src/worker/library.ts | RawVerse, rowToVerse, readMetadata, WebLibrary |
| Outras fontes | packages/adapter-sqlite-web/src/worker/paths.ts | REGISTRY_DB, finalPath, backupPath, trashPath, temporaryPath |
| Outras fontes | packages/adapter-sqlite-web/src/worker/reconciliation.ts | ReconcileStats, RegistryReconcile, copy, restore, reconcilePool |
| Outras fontes | packages/adapter-sqlite-web/src/worker/registry.ts | toBible, WebRegistry |
| Outras fontes | packages/adapter-sqlite-web/src/worker/sqlite.ts | OpfsPoolOptions, createOpfsPool, buildPoolLike, wrapDb |
| Outras fontes | packages/adapter-sqlite-web/src/worker-client.ts | WorkerClientOptions, Pending, WebWorkerClient, createWorker |
| Testes | packages/adapter-sqlite-web/tests/browser/harness/browser-entry.ts | — |
| Testes | packages/adapter-sqlite-web/tests/browser/initialization.spec.ts | createAdapter |
| Testes | packages/adapter-sqlite-web/tests/browser/install-library.spec.ts | BASE, HARNESS, MAIN_FIXTURE, SEARCH_FIXTURE, openHarness, captureExternal |
| Testes | packages/adapter-sqlite-web/tests/browser/lifecycle.spec.ts | HARNESS, FIXTURE |
| Testes | packages/adapter-sqlite-web/tests/browser/package.spec.ts | — |
| Testes | packages/adapter-sqlite-web/tests/unit/capabilities.test.ts | — |
| Testes | packages/adapter-sqlite-web/tests/unit/helpers/fake-pool.ts | Handle, FakePool |
| Testes | packages/adapter-sqlite-web/tests/unit/helpers/fake-registry.ts | FakeRegistry |
| Testes | packages/adapter-sqlite-web/tests/unit/helpers/fixture.ts | VerseRow, FixtureOptions, buildLegacyFixture, NON_SQLITE, INVALID_BYTES, GEN_VERSES, LEGACY_FIXTURE |
| Testes | packages/adapter-sqlite-web/tests/unit/installer.test.ts | pool, input, cancelledToken |
| Testes | packages/adapter-sqlite-web/tests/unit/public-api.test.ts | — |
| Testes | packages/adapter-sqlite-web/tests/unit/reconciliation.test.ts | pool, installed |
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
