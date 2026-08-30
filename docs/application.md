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
| Outras fontes | apps/consumer-native/src/core.ts | DOWNLOAD_CHUNK_SIZE, ARA_PACKAGE_URL, NVI_PACKAGE_URL, VersionRow, BookRow, VerseRow, SearchRow, ChapterRow |
| Serviços | apps/consumer-native/src/services/scripture-library.ts | NativeStorage, NAMESPACE, physicalPath, createNativeStorage, decode, numberBytes, encodeLibraryResult, remoteVersion |
| Outras fontes | apps/consumer-native/src/shared.ts | StorageProbeRequest, StorageProbeResult, NativeLibraryRequest, NativeBookResult, NativeVerseResult, NativeLibraryResult, NativeVersionRequest, NativeMutationResult |
| Testes | apps/consumer-native/tests/accessibility-contract.test.ts | — |
| Testes | apps/consumer-native/tests/download-contract.test.ts | — |
| Testes | apps/consumer-native/tests/fixture.ts | BASE64, value, decode, ARA_FIXTURE_BYTES |
| Testes | apps/consumer-native/tests/harness.test.ts | HarnessStorage |
| Testes | apps/consumer-native/tests/offline-contract.test.ts | — |
| Testes | apps/consumer-native/tests/reopen.test.ts | — |
| Testes | apps/consumer-native/tests/ui-feedback.test.ts | — |
| Testes | apps/consumer-native/tests/ui-navigation.test.ts | — |
| Outras fontes | apps/consumer-tui/src/config.ts | CONSUMER_ROOT, DEFAULT_DATA_DIR, DEFAULT_REGISTRY_PATH, ConsumerTuiConfig, optionalUrl, isolatedPath, resolveConsumerTuiConfig |
| Outras fontes | apps/consumer-tui/src/engine.ts | ConsumerTuiEngine, ConsumerTuiEngineOptions, createConsumerTuiEngine |
| Outras fontes | apps/consumer-tui/src/index.ts | StartConsumerTuiOptions, startConsumerTui |
| Serviços | apps/consumer-tui/src/services/scripture-library.ts | ScriptureLibraryService, libraryErrorMessage |
| Outras fontes | apps/consumer-tui/src/ui/App.tsx | AppProps, areaLabel, App, refreshInstalled, installVersion, removeVersion, loadChapter, openReader |
| Componentes | apps/consumer-tui/src/ui/components/BookPicker.tsx | BookPickerProps, BookPicker |
| Componentes | apps/consumer-tui/src/ui/components/FeedbackArea.tsx | FeedbackAreaProps, FeedbackArea |
| Componentes | apps/consumer-tui/src/ui/components/LibraryPanel.tsx | LibraryVersion, LibraryPanelProps, LibraryPanel |
| Componentes | apps/consumer-tui/src/ui/components/ReaderPanel.tsx | ReaderPanelProps, ReaderPanel |
| Componentes | apps/consumer-tui/src/ui/components/SearchPanel.tsx | SearchPanelProps, SearchPanel, submit |
| Componentes | apps/consumer-tui/src/ui/components/VersionPicker.tsx | VersionPickerProps, VersionPicker |
| Testes | apps/consumer-tui/tests/boundary.test.ts | — |
| Testes | apps/consumer-tui/tests/conformance.test.ts | — |
| Testes | apps/consumer-tui/tests/install-lifecycle.test.ts | — |
| Testes | apps/consumer-tui/tests/reader-reference.test.ts | — |
| Testes | apps/consumer-tui/tests/runtime-spike.test.ts | — |
| Testes | apps/consumer-tui/tests/search-offline.test.ts | — |
| Testes | apps/consumer-tui/tests/ui-navigation.test.ts | — |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page.js | M |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/auth/[...all]/route.js | w, x, d, h, i, j |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/auth/[...all]/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/account-delete/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/account-delete/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/approve/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/approve/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/revoke/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/revoke/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/pull/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/pull/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/push/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/push/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/reconcile/route.js | w, x |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/reconcile/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/route.js | v, A, B, g |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/busca/page.js | M, f, g, h, from, e, l, m |
| Páginas | apps/consumer-web/.next/server/app/busca/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/ler/[versao]/[livro]/[capitulo]/page.js | f, from, g, h, p, q, r, e |
| Páginas | apps/consumer-web/.next/server/app/ler/[versao]/[livro]/[capitulo]/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/manifest.webmanifest/route.js | m, n, o, k, l, e, f, g |
| Páginas | apps/consumer-web/.next/server/app/manifest.webmanifest/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/page.js | M, f, g, h, n, p, w, x |
| Páginas | apps/consumer-web/.next/server/app/page_client-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/chunks/141.js | n, o, u, g, c, e, f, d |
| Outras fontes | apps/consumer-web/.next/server/chunks/191.js | f, g, h, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/204.js | h, k, from, i, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/275.js | f, d, e, h, i, j, k, g |
| Outras fontes | apps/consumer-web/.next/server/chunks/310.js | f, d, extends, a, c, e, i, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/42.js | l, n |
| Outras fontes | apps/consumer-web/.next/server/chunks/483.js | d, e, j, k, f, c, a, g |
| Outras fontes | apps/consumer-web/.next/server/chunks/503.js | e, f, g, c, i, o, p, q |
| Outras fontes | apps/consumer-web/.next/server/chunks/714.js | g, h, extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/860.js | — |
| Outras fontes | apps/consumer-web/.next/server/chunks/866.js | extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/966.js | extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/982.js | g, h, j, k, l, m, n, o |
| Outras fontes | apps/consumer-web/.next/server/chunks/static/media/worker.b46496cb.js | a, c, B, C, D, E, F, G |
| Outras fontes | apps/consumer-web/.next/server/interception-route-rewrite-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-build-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-react-loadable-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/next-font-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/pages/_app.js | h, i, d, g, j, k, l, o |
| Páginas | apps/consumer-web/.next/server/pages/_document.js | — |
| Páginas | apps/consumer-web/.next/server/pages/_error.js | e, c, d, f, g, i, j, z |
| Outras fontes | apps/consumer-web/.next/server/server-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/webpack-runtime.js | c |
| Outras fontes | apps/consumer-web/.next/static/VjmG9r7-fffD0svwuZOCy/_buildManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/VjmG9r7-fffD0svwuZOCy/_ssgManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/chunks/153-f2888457eb977c01.js | r, n, o, u, y, g, i, a |
| Outras fontes | apps/consumer-web/.next/static/chunks/414d96a7-bb8b2e9dd6508ed4.js | i, s, c, f, d, p, _, U |
| Outras fontes | apps/consumer-web/.next/static/chunks/625-eb7059476a4ae723.js | i, s, l, c, d, h, m, p |
| Outras fontes | apps/consumer-web/.next/static/chunks/694-63a1e196dd5a22eb.js | p, b |
| Outras fontes | apps/consumer-web/.next/static/chunks/831-09f18f876cbc58b1.js | r, n, o, e, m, E, d, p |
| Páginas | apps/consumer-web/.next/static/chunks/app/_not-found/page-371ea458c2a63220.js | o |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/auth/[...all]/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/account-delete/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/approve/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/revoke/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/pull/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/push/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/reconcile/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/route-f66cade2e1fcd6eb.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/busca/page-5138426d6bba6b52.js | n, r, u, x, f, j, v, g |
| Páginas | apps/consumer-web/.next/static/chunks/app/layout-505c80a649b00947.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/ler/[versao]/[livro]/[capitulo]/page-19c57efc64c7d9bb.js | l, a, n, i, p, b, j, c |
| Páginas | apps/consumer-web/.next/static/chunks/app/manifest.webmanifest/route-f66cade2e1fcd6eb.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/page-2d3ed119ec659710.js | l, r, n, i, x, b, y, k |
| Outras fontes | apps/consumer-web/.next/static/chunks/framework-54629660111d8b71.js | l, a, s, e, k, w, S, which |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-8579e0d658f1357a.js | a, i, o, f, d, h, u, r |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-app-19534ef1496d5b1a.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/pages/_app-737414d29f0a81d7.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/pages/_error-da60616077c89450.js | — |
| Outras fontes | apps/consumer-web/.next/static/chunks/polyfills-42372ed130431b0a.js | e, t, Jm, Qm, Zm, tb, eb, rb |
| Outras fontes | apps/consumer-web/.next/static/chunks/webpack-62d41f9d43ff54a5.js | r |
| Outras fontes | apps/consumer-web/.next/static/css/cc62159cdd2a08a6.css | — |
| Outras fontes | apps/consumer-web/.next/static/media/worker.424e21a9.js | e, l, N, R, D, j, M, z |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/auth/[...all]/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/account-delete/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/approve/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/revoke/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/pull/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/push/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/reconcile/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/route.ts | if, PageProps, LayoutProps, checkFields |
| Páginas | apps/consumer-web/.next/types/app/busca/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/ler/[versao]/[livro]/[capitulo]/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/page.ts | checkFields, if, PageProps, LayoutProps |
| Outras fontes | apps/consumer-web/.next/types/cache-life.d.ts | unstable_cacheLife |
| Outras fontes | apps/consumer-web/.next/types/routes.d.ts | ParamMap, LayoutSlotMap, Page, PageProps, Layout, GET, RouteContext |
| Outras fontes | apps/consumer-web/.next/types/validator.ts | — |
| Outras fontes | apps/consumer-web/next-env.d.ts | — |
| Outras fontes | apps/consumer-web/playwright.config.ts | — |
| Outras fontes | apps/consumer-web/public/engine-worker/worker.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/public/sw.js | — |
| Outras fontes | apps/consumer-web/public/workbox-5194662c.js | s, r, i, a, h, p, y, m |
| Rotas e APIs | apps/consumer-web/src/app/api/auth/[...all]/route.ts | — |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/__tests__/auth-boundary.test.ts | — |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/account-delete/route.ts | POST |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/devices/approve/route.ts | POST |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/devices/revoke/route.ts | POST |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/devices/route.ts | GET |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/pull/route.ts | GET |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/push/route.ts | POST |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/reconcile/route.ts | POST |
| Rotas e APIs | apps/consumer-web/src/app/api/sync/v1/route.ts | GET |
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
| Outras fontes | apps/consumer-web/src/engine/bible-preferences.ts | BiblePreferenceSyncDependencies, BiblePreferenceApplyResult, applyBibleVersionPreference |
| Outras fontes | apps/consumer-web/src/features/library/AppLibrary.tsx | AppLibrary, load, install, remove |
| Outras fontes | apps/consumer-web/src/features/library/VersionCard.tsx | VersionCard |
| Outras fontes | apps/consumer-web/src/features/reader/PrevNextNav.tsx | PrevNextNav |
| Outras fontes | apps/consumer-web/src/features/reader/Reader.tsx | param, Reader |
| Outras fontes | apps/consumer-web/src/features/search/Search.tsx | Search, search |
| Outras fontes | apps/consumer-web/src/features/search/SearchForm.tsx | SearchForm |
| Outras fontes | apps/consumer-web/src/features/search/SearchResults.tsx | DisplaySearchResult, SearchResults |
| Outras fontes | apps/consumer-web/src/features/search/search-installed.ts | searchInstalledVersions |
| Outras fontes | apps/consumer-web/src/lib/auth.ts | requiredRuntimeEnv, getServerSession, ServerSyncCredentials, getServerSyncCredentials |
| Outras fontes | apps/consumer-web/src/lib/cn.ts | cn |
| Outras fontes | apps/consumer-web/src/lib/sync-api.ts | SyncApiDependencies, createSyncApiHandlers, sanitizeOperation, parseDeviceKeyEnvelope, readObject, errorResponse, statusFor, json |
| Outras fontes | apps/consumer-web/src/lib/sync-keys.ts | CURVE, WRAPPING_ALGORITHM, DeviceIdentity, DeviceKeyManager, createDeviceKeyManager, importPublicKey, deriveWrappingKey, parseEnvelope |
| Outras fontes | apps/consumer-web/src/lib/sync-server.ts | getSyncRemote, required |
| Outras fontes | apps/consumer-web/src/styles/globals.css | — |
| Testes | apps/consumer-web/tests/auth.test.ts | authRequest |
| Testes | apps/consumer-web/tests/bible-preferences.test.ts | makeDependencies |
| Testes | apps/consumer-web/tests/boundary.test.ts | — |
| Testes | apps/consumer-web/tests/browser/consumer.spec.ts | — |
| Testes | apps/consumer-web/tests/browser/fixtures.ts | — |
| Testes | apps/consumer-web/tests/install-failure.spec.tsx | de |
| Testes | apps/consumer-web/tests/library-source.spec.tsx | — |
| Testes | apps/consumer-web/tests/library-states.spec.tsx | — |
| Testes | apps/consumer-web/tests/library.spec.tsx | — |
| Testes | apps/consumer-web/tests/offline-empty.spec.tsx | — |
| Testes | apps/consumer-web/tests/pwa.spec.ts | — |
| Testes | apps/consumer-web/tests/reader.spec.tsx | — |
| Testes | apps/consumer-web/tests/search.spec.tsx | — |
| Testes | apps/consumer-web/tests/states.a11y.spec.tsx | — |
| Testes | apps/consumer-web/tests/sync-api.test.ts | request, makeHandlers |
| Testes | apps/consumer-web/tests/sync-keys.test.ts | — |
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
| Outras fontes | packages/adapter-sqlite-native/src/index.ts | NativeAdapterOptions, NativeAdapter, createNativeAdapter |
| Outras fontes | packages/adapter-sqlite-native/src/legacy-sqlite.ts | SQLITE_HEADER, TableRecord, LegacyVerseRow, LegacySqliteBible, SchemaTable, NativeParseError, invalid, readU16 |
| Outras fontes | packages/adapter-sqlite-native/src/native-book-meta.ts | NativeBook, NATIVE_BOOKS |
| Outras fontes | packages/adapter-sqlite-native/src/native-installer.ts | basename, idFromFile, emit, NativeInstaller, NativeReconcileStats, reconcileNativeStorage |
| Outras fontes | packages/adapter-sqlite-native/src/native-library.ts | NativeBibleLibrary |
| Outras fontes | packages/adapter-sqlite-native/src/native-queries.ts | NativeVerse, NativeSearch, bookAt, nativeBooks, nativeChapter, nativeSearch |
| Outras fontes | packages/adapter-sqlite-native/src/native-registry-data.ts | REGISTRY_PATH, REGISTRY_TMP_PATH, NativeRegistryEntry, NativeRegistryDataError, encodeNativeRegistry, decodeNativeRegistry, readNativeRegistry |
| Outras fontes | packages/adapter-sqlite-native/src/native-registry.ts | NativeRegistry |
| Outras fontes | packages/adapter-sqlite-native/src/native-service.ts | NativeServiceReadRequest, NativeServiceReadResult, NativeServiceBook, NativeServiceVerse, NativePackageInstallRequest, NativeMutationResult, NativeDownloadResult, NativePackageDownloadInstallRequest |
| Outras fontes | packages/adapter-sqlite-native/src/native-sync.ts | NativeSyncAdapterOptions, NativeSyncAdapter, createNativeSyncAdapter, createNativeAdapter |
| Outras fontes | packages/adapter-sqlite-native/src/storage.ts | NativeStorage, requireNamespace |
| Testes | packages/adapter-sqlite-native/tests/adapter-install.test.ts | — |
| Testes | packages/adapter-sqlite-native/tests/adapter-read.test.ts | — |
| Testes | packages/adapter-sqlite-native/tests/adapter-rollback.test.ts | — |
| Testes | packages/adapter-sqlite-native/tests/conformance.test.ts | — |
| Testes | packages/adapter-sqlite-native/tests/native-storage.ts | TestNativeStorage |
| Testes | packages/adapter-sqlite-native/tests/package-download.test.ts | failRegistryRename |
| Testes | packages/adapter-sqlite-native/tests/r2-schema.test.ts | — |
| Testes | packages/adapter-sqlite-native/tests/security-contract.test.ts | — |
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
<!-- specsfy:documentator:end -->
