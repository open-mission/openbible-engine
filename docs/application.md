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
| Páginas | apps/consumer-web/.next/server/app/busca/page.js | handler, ComponentMod, createPPRBoundarySentinel, from, toAbortSignal, DS, createWebAdapter, WebWorkerClient |
| Páginas | apps/consumer-web/.next/server/app/busca/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/ler/[versao]/[livro]/[capitulo]/page.js | handler, ComponentMod, createPPRBoundarySentinel, from, toAbortSignal, DS, createWebAdapter, WebWorkerClient |
| Páginas | apps/consumer-web/.next/server/app/ler/[versao]/[livro]/[capitulo]/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/manifest.webmanifest/route.js | handler, GET |
| Páginas | apps/consumer-web/.next/server/app/manifest.webmanifest/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/page.js | handler, ComponentMod, createPPRBoundarySentinel, from, toAbortSignal, DS, createWebAdapter, WebWorkerClient |
| Páginas | apps/consumer-web/.next/server/app/page_client-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/interception-route-rewrite-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-build-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-react-loadable-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/next-font-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/server-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/static/media/worker.aaeac274.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/.next/server/vendor-chunks/@swc+helpers@0.5.15.js | — |
| Outras fontes | apps/consumer-web/.next/server/vendor-chunks/next@15.5.24_@babel+core@7.29.7_@playwright+test@1.62.1_@types+node@22.20.1_react-dom@19.2.8_react@19.2.8__react@19.2.8.js | skipWhitespace, notSpecialChar, ContextAPI, DiagAPI, _logProxy, MetricsAPI, PropagationAPI, TraceAPI |
| Outras fontes | apps/consumer-web/.next/server/vendor-chunks/tailwind-merge@2.6.1.js | groups, omitted, not, initTailwindMerge, tailwindMerge, callTailwindMerge |
| Outras fontes | apps/consumer-web/.next/server/webpack-runtime.js | __webpack_require__, for, allow, RelativeURL |
| Páginas | apps/consumer-web/.next/static/chunks/app/busca/page.js | createPropError, onTouchStart, component, getComponentNameFromType, testStringCoercion, checkKeyStringCoercion, getTaskName, getOwner |
| Páginas | apps/consumer-web/.next/static/chunks/app/layout.js | createPropError, onTouchStart, component, getComponentNameFromType, testStringCoercion, checkKeyStringCoercion, getTaskName, getOwner |
| Páginas | apps/consumer-web/.next/static/chunks/app/ler/[versao]/[livro]/[capitulo]/page.js | createPropError, onTouchStart, component, getComponentNameFromType, testStringCoercion, checkKeyStringCoercion, getTaskName, getOwner |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/manifest.webmanifest/route.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/page.js | createPropError, onTouchStart, component, getComponentNameFromType, testStringCoercion, checkKeyStringCoercion, getTaskName, getOwner |
| Outras fontes | apps/consumer-web/.next/static/chunks/app-pages-internals.js | component, walkAddRefetch, findDOMNode, shouldSkipElement, topOfElementInViewport, getHashFragmentDomNode, InnerLayoutRouter, LoadingBoundary |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-app.js | component, callServer, findSourceMapURL, runAction, handleResult, Router, in, handlePageShow |
| Outras fontes | apps/consumer-web/.next/static/chunks/polyfills.js | e, t, Jm, Qm, Zm, tb, eb, rb |
| Outras fontes | apps/consumer-web/.next/static/chunks/webpack.js | __webpack_require__, for, allow, to, RelativeURL, createRequire, createModuleHotObject, setStatus |
| Páginas | apps/consumer-web/.next/static/css/app/layout.css | — |
| Outras fontes | apps/consumer-web/.next/static/development/_buildManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/development/_ssgManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/media/worker.321d57ae.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Páginas | apps/consumer-web/.next/static/webpack/app/layout.f4e6399faeaf8ff4.hot-update.js | — |
| Outras fontes | apps/consumer-web/.next/static/webpack/webpack.2494e18569effade.hot-update.js | — |
| Outras fontes | apps/consumer-web/.next/static/webpack/webpack.4139b1fd2fc78c94.hot-update.js | — |
| Outras fontes | apps/consumer-web/.next/static/webpack/webpack.f4e6399faeaf8ff4.hot-update.js | — |
| Páginas | apps/consumer-web/.next/types/app/busca/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/layout.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/ler/[versao]/[livro]/[capitulo]/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/page.ts | checkFields, if, PageProps, LayoutProps |
| Outras fontes | apps/consumer-web/.next/types/cache-life.d.ts | unstable_cacheLife |
| Outras fontes | apps/consumer-web/.next/types/routes.d.ts | ParamMap, LayoutSlotMap, Page, PageProps, Layout |
| Outras fontes | apps/consumer-web/.next/types/validator.ts | — |
| Outras fontes | apps/consumer-web/next-env.d.ts | — |
| Outras fontes | apps/consumer-web/playwright.config.ts | — |
| Outras fontes | apps/consumer-web/public/engine-worker/worker.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/public/sw.js | — |
| Outras fontes | apps/consumer-web/public/workbox-5194662c.js | s, r, i, a, h, p, y, m |
| Páginas | apps/consumer-web/src/app/busca/page.tsx | SearchPage |
| Páginas | apps/consumer-web/src/app/layout.tsx | RootLayout |
| Páginas | apps/consumer-web/src/app/ler/[versao]/[livro]/[capitulo]/page.tsx | ReaderPage |
| Páginas | apps/consumer-web/src/app/manifest.ts | manifest |
| Páginas | apps/consumer-web/src/app/page.tsx | HomePage |
| Componentes | apps/consumer-web/src/components/AppShell.tsx | AppShell |
| Componentes | apps/consumer-web/src/components/ui/badge.tsx | Badge |
| Componentes | apps/consumer-web/src/components/ui/breadcrumbs.tsx | Breadcrumbs |
| Componentes | apps/consumer-web/src/components/ui/button.tsx | Button |
| Componentes | apps/consumer-web/src/components/ui/card.tsx | Card, CardHeader, CardContent, CardTitle |
| Componentes | apps/consumer-web/src/components/ui/feedback.tsx | EmptyState, ErrorState, OfflineBanner |
| Componentes | apps/consumer-web/src/components/ui/input.tsx | Input |
| Componentes | apps/consumer-web/src/components/ui/skeleton.tsx | Skeleton |
| Outras fontes | apps/consumer-web/src/engine/bible-engine-provider.tsx | EngineState, DEFAULT_STATE, DEFAULT_BIBLE_API_URL, DEFAULT_BIBLE_PACKAGE_BASE_URL, EngineContext, BibleEngineProvider, useBibleEngine |
| Outras fontes | apps/consumer-web/src/features/library/AppLibrary.tsx | AppLibrary, load, install, remove |
| Outras fontes | apps/consumer-web/src/features/library/VersionCard.tsx | VersionCard |
| Outras fontes | apps/consumer-web/src/features/reader/PrevNextNav.tsx | PrevNextNav |
| Outras fontes | apps/consumer-web/src/features/reader/Reader.tsx | param, Reader |
| Outras fontes | apps/consumer-web/src/features/search/Search.tsx | Search, search |
| Outras fontes | apps/consumer-web/src/features/search/SearchForm.tsx | SearchForm |
| Outras fontes | apps/consumer-web/src/features/search/SearchResults.tsx | DisplaySearchResult, SearchResults |
| Outras fontes | apps/consumer-web/src/features/search/search-installed.ts | searchInstalledVersions |
| Outras fontes | apps/consumer-web/src/lib/cn.ts | cn |
| Outras fontes | apps/consumer-web/src/styles/globals.css | — |
| Testes | apps/consumer-web/tests/boundary.test.ts | — |
| Testes | apps/consumer-web/tests/browser/consumer.spec.ts | — |
| Testes | apps/consumer-web/tests/install-failure.spec.tsx | de |
| Testes | apps/consumer-web/tests/library-source.spec.tsx | — |
| Testes | apps/consumer-web/tests/library-states.spec.tsx | — |
| Testes | apps/consumer-web/tests/library.spec.tsx | — |
| Testes | apps/consumer-web/tests/offline-empty.spec.tsx | — |
| Testes | apps/consumer-web/tests/pwa.spec.ts | — |
| Testes | apps/consumer-web/tests/reader.spec.tsx | — |
| Testes | apps/consumer-web/tests/search.spec.tsx | — |
| Testes | apps/consumer-web/tests/states.a11y.spec.tsx | — |
| Outras fontes | apps/consumer-web/vitest.config.ts | — |
| Outras fontes | apps/consumer-web/vitest.setup.ts | — |
| Testes | apps/distribution-harness/tests/harness-browser.spec.ts | ROOT, WEB_DIR, WEB_PKG, exists |
| Testes | apps/distribution-harness/tests/harness-node.spec.ts | ROOT, RUNTIME, Packed, pack |
| Outras fontes | apps/distribution-harness/vitest.config.ts | — |
| Outras fontes | eslint.config.js | — |
| Testes | packages/adapter-http/src/__tests__/http-source.test.ts | SQLITE_HEADER, validHeaderBytes, makeFakeFetch |
| Outras fontes | packages/adapter-http/src/http-source.ts | HttpBiblePackageSourceOptions, R2_FILES, FALLBACK_VERSIONS, SQLITE_HEADER_TEXT, SQLITE_HEADER, headerValid, toAbortSignal, HttpBiblePackageSource |
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
| Testes | tests/arch/api-regression.test.ts | ROOT, GUARD |
| Testes | tests/arch/core-imports.test.ts | CORE_SRC, FORBIDDEN, walk |
| Testes | tests/arch/engine-purity.test.ts | ENGINE_SRC, FORBIDDEN_ENGINE |
| Testes | tests/arch/exports.test.ts | — |
| Outras fontes | vitest.config.ts | — |
<!-- specsfy:documentator:end -->
