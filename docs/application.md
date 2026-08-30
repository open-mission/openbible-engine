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
| Páginas | apps/consumer-web/.next/server/app/[version]/[book]/[chapter]/page.js | from, M, f |
| Páginas | apps/consumer-web/.next/server/app/[version]/[book]/[chapter]/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page.js | M |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/auth/[...all]/route.js | d, w, x, h, i, j |
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
| Páginas | apps/consumer-web/.next/server/app/library/page.js | g, h, i, f, M, o, r, z |
| Páginas | apps/consumer-web/.next/server/app/library/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/manifest.webmanifest/route.js | m, n, o, k, l, e, f, g |
| Páginas | apps/consumer-web/.next/server/app/manifest.webmanifest/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/page.js | from, f, M |
| Páginas | apps/consumer-web/.next/server/app/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/search/page.js | e, f, g, h, i, from, M, l |
| Páginas | apps/consumer-web/.next/server/app/search/page_client-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/chunks/141.js | n, o, u, g, c, e, f, d |
| Outras fontes | apps/consumer-web/.next/server/chunks/191.js | f, g, h, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/275.js | f, d, e, h, i, j, k, g |
| Outras fontes | apps/consumer-web/.next/server/chunks/310.js | f, d, extends, a, c, e, i, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/322.js | d, e, j, k, f, c, a, g |
| Outras fontes | apps/consumer-web/.next/server/chunks/42.js | l, n |
| Outras fontes | apps/consumer-web/.next/server/chunks/503.js | e, f, g, c, i, o, p, q |
| Outras fontes | apps/consumer-web/.next/server/chunks/571.js | e, f, g, h, i, j, k, p |
| Outras fontes | apps/consumer-web/.next/server/chunks/6.js | f, g, k, e, d, h, i, j |
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
| Outras fontes | apps/consumer-web/.next/static/chunks/153-f2888457eb977c01.js | r, n, o, u, y, g, i, a |
| Outras fontes | apps/consumer-web/.next/static/chunks/158-86758bcb716cdfd5.js | s, n, h, b, k, f, g, v |
| Outras fontes | apps/consumer-web/.next/static/chunks/215-55ce57aceb661861.js | f, b, v, w, s |
| Outras fontes | apps/consumer-web/.next/static/chunks/414d96a7-bb8b2e9dd6508ed4.js | i, s, c, f, d, p, _, U |
| Outras fontes | apps/consumer-web/.next/static/chunks/438-75d5e61306eebd90.js | o, s, l, c, d, u, h, v |
| Outras fontes | apps/consumer-web/.next/static/chunks/694-63a1e196dd5a22eb.js | p, b |
| Outras fontes | apps/consumer-web/.next/static/chunks/831-09f18f876cbc58b1.js | r, n, o, e, m, E, d, p |
| Páginas | apps/consumer-web/.next/static/chunks/app/[version]/[book]/[chapter]/page-de86b36d30b08201.js | t |
| Páginas | apps/consumer-web/.next/static/chunks/app/_not-found/page-fd946ac87c19ceca.js | o |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/auth/[...all]/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/account-delete/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/approve/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/revoke/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/pull/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/push/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/reconcile/route-f66cade2e1fcd6eb.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/route-f66cade2e1fcd6eb.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/layout-9aa6c5cd3e88ea9b.js | l, c, d, u, m, h, x, p |
| Páginas | apps/consumer-web/.next/static/chunks/app/library/page-0f46a35abf934674.js | n, r, i, l, o, d, c, f |
| Páginas | apps/consumer-web/.next/static/chunks/app/manifest.webmanifest/route-f66cade2e1fcd6eb.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/page-23562203fb1aa650.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/search/page-07b641b3e401aeb5.js | t, a, u, m, b, j, N, w |
| Outras fontes | apps/consumer-web/.next/static/chunks/framework-54629660111d8b71.js | l, a, s, e, k, w, S, which |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-8579e0d658f1357a.js | a, i, o, f, d, h, u, r |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-app-1eecdffacc3abc22.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/pages/_app-737414d29f0a81d7.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/pages/_error-da60616077c89450.js | — |
| Outras fontes | apps/consumer-web/.next/static/chunks/polyfills-42372ed130431b0a.js | e, t, Jm, Qm, Zm, tb, eb, rb |
| Outras fontes | apps/consumer-web/.next/static/chunks/webpack-62d41f9d43ff54a5.js | r |
| Outras fontes | apps/consumer-web/.next/static/css/aeaa6177ae464c3b.css | — |
| Outras fontes | apps/consumer-web/.next/static/media/worker.424e21a9.js | e, l, N, R, D, j, M, z |
| Outras fontes | apps/consumer-web/.next/static/o6yp8gLOxTBxPBB8yR7lN/_buildManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/o6yp8gLOxTBxPBB8yR7lN/_ssgManifest.js | — |
| Páginas | apps/consumer-web/.next/types/app/[version]/[book]/[chapter]/page.ts | checkFields, if, PageProps, LayoutProps |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/auth/[...all]/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/account-delete/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/approve/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/revoke/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/devices/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/pull/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/push/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/reconcile/route.ts | if, PageProps, LayoutProps, checkFields |
| Rotas e APIs | apps/consumer-web/.next/types/app/api/sync/v1/route.ts | if, PageProps, LayoutProps, checkFields |
| Páginas | apps/consumer-web/.next/types/app/library/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/page.ts | checkFields, if, PageProps, LayoutProps |
| Páginas | apps/consumer-web/.next/types/app/search/page.ts | checkFields, if, PageProps, LayoutProps |
| Outras fontes | apps/consumer-web/.next/types/cache-life.d.ts | unstable_cacheLife |
| Outras fontes | apps/consumer-web/.next/types/routes.d.ts | ParamMap, LayoutSlotMap, Page, PageProps, Layout, GET, RouteContext |
| Outras fontes | apps/consumer-web/.next/types/validator.ts | — |
| Outras fontes | apps/consumer-web/next-env.d.ts | — |
| Outras fontes | apps/consumer-web/playwright.config.ts | — |
| Outras fontes | apps/consumer-web/public/engine-worker/worker.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/public/sw.js | — |
| Outras fontes | apps/consumer-web/public/workbox-5194662c.js | s, r, i, a, h, p, y, m |
| Páginas | apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx | ReaderPage |
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
| Páginas | apps/consumer-web/src/app/layout.tsx | RootLayout |
| Páginas | apps/consumer-web/src/app/library/page.tsx | LibraryPage |
| Páginas | apps/consumer-web/src/app/manifest.ts | manifest |
| Páginas | apps/consumer-web/src/app/page.tsx | HomePage |
| Páginas | apps/consumer-web/src/app/search/page.tsx | SearchPage |
| Componentes | apps/consumer-web/src/components/AppShell.tsx | AppShell |
| Componentes | apps/consumer-web/src/components/NavigationDock.tsx | Icon, BookIcon, LibraryIcon, SearchIcon, NoteIcon, HighlightIcon, SettingsIcon, SunIcon |
| Componentes | apps/consumer-web/src/components/ui/badge.tsx | Badge |
| Componentes | apps/consumer-web/src/components/ui/breadcrumbs.tsx | Breadcrumbs |
| Componentes | apps/consumer-web/src/components/ui/button.tsx | Button |
| Componentes | apps/consumer-web/src/components/ui/card.tsx | Card, CardHeader, CardContent, CardTitle |
| Componentes | apps/consumer-web/src/components/ui/download-toast.tsx | DownloadToast, updateDownloadToast, showDownloadStart, showDownloadProgress, showDownloadSuccess, showDownloadError |
| Componentes | apps/consumer-web/src/components/ui/feedback.tsx | EmptyState, ErrorState, OfflineBanner |
| Componentes | apps/consumer-web/src/components/ui/input.tsx | Input |
| Componentes | apps/consumer-web/src/components/ui/skeleton.tsx | Skeleton |
| Componentes | apps/consumer-web/src/components/ui/sonner.tsx | Toaster |
| Outras fontes | apps/consumer-web/src/engine/bible-engine-provider.tsx | EngineState, DEFAULT_STATE, DEFAULT_BIBLE_API_URL, DEFAULT_BIBLE_PACKAGE_BASE_URL, EngineContext, BibleEngineProvider, useBibleEngine |
| Outras fontes | apps/consumer-web/src/engine/bible-preferences.ts | BiblePreferenceSyncDependencies, BiblePreferenceApplyResult, applyBibleVersionPreference |
| Outras fontes | apps/consumer-web/src/features/library/AppLibrary.tsx | AppLibrary, load, install, cancel, remove |
| Outras fontes | apps/consumer-web/src/features/library/VersionCard.tsx | VersionCard |
| Outras fontes | apps/consumer-web/src/features/reader/BookChapterPicker.tsx | BookChapterPicker, close, handleEscape, selectChapter, BookSection |
| Outras fontes | apps/consumer-web/src/features/reader/PrevNextNav.tsx | PrevNextNav |
| Outras fontes | apps/consumer-web/src/features/reader/Reader.tsx | ReaderLoadingSkeleton, param, Reader, openBookPicker, openVersionPicker, selectBook, selectChapter, selectVersion |
| Outras fontes | apps/consumer-web/src/features/reader/ReaderToolbar.tsx | ReaderToolbar |
| Outras fontes | apps/consumer-web/src/features/reader/ResponsivePicker.tsx | useIsMobile, ResponsivePicker |
| Outras fontes | apps/consumer-web/src/features/reader/VersionPicker.tsx | VersionPicker, close, InstallationStatus |
| Rotas e APIs | apps/consumer-web/src/features/reader/reader-route.ts | routeSegment, bookRouteSegment, findBookByRouteSegment, readerPath |
| Outras fontes | apps/consumer-web/src/features/search/Search.tsx | Search, search |
| Outras fontes | apps/consumer-web/src/features/search/SearchForm.tsx | SearchForm |
| Outras fontes | apps/consumer-web/src/features/search/SearchResults.tsx | DisplaySearchResult, SearchResults |
| Outras fontes | apps/consumer-web/src/features/search/search-installed.ts | searchInstalledVersions |
| Outras fontes | apps/consumer-web/src/lib/auth.ts | requiredRuntimeEnv, getServerSession, ServerSyncCredentials, getServerSyncCredentials |
| Outras fontes | apps/consumer-web/src/lib/cn.ts | cn |
| Outras fontes | apps/consumer-web/src/lib/engine-error.ts | MESSAGES, errorCode, getEngineErrorMessage |
| Outras fontes | apps/consumer-web/src/lib/sync-api.ts | SyncApiDependencies, createSyncApiHandlers, sanitizeOperation, parseDeviceKeyEnvelope, readObject, errorResponse, statusFor, json |
| Outras fontes | apps/consumer-web/src/lib/sync-keys.ts | CURVE, WRAPPING_ALGORITHM, DeviceIdentity, DeviceKeyManager, createDeviceKeyManager, importPublicKey, deriveWrappingKey, parseEnvelope |
| Outras fontes | apps/consumer-web/src/lib/sync-server.ts | getSyncRemote, required |
| Outras fontes | apps/consumer-web/src/styles/globals.css | — |
| Testes | apps/consumer-web/tests/app-shell.spec.tsx | — |
| Testes | apps/consumer-web/tests/auth.test.ts | authRequest |
| Testes | apps/consumer-web/tests/bible-preferences.test.ts | makeDependencies |
| Testes | apps/consumer-web/tests/boundary.test.ts | — |
| Testes | apps/consumer-web/tests/browser/consumer.spec.ts | — |
| Testes | apps/consumer-web/tests/browser/fixtures.ts | — |
| Testes | apps/consumer-web/tests/download-toast.spec.tsx | — |
| Testes | apps/consumer-web/tests/feedback.spec.tsx | — |
| Testes | apps/consumer-web/tests/install-failure.spec.tsx | de |
| Testes | apps/consumer-web/tests/library-source.spec.tsx | — |
| Testes | apps/consumer-web/tests/library-states.spec.tsx | — |
| Testes | apps/consumer-web/tests/library.spec.tsx | — |
| Testes | apps/consumer-web/tests/offline-empty.spec.tsx | — |
| Testes | apps/consumer-web/tests/pwa.spec.ts | — |
| Testes | apps/consumer-web/tests/reader-pickers.spec.tsx | — |
| Testes | apps/consumer-web/tests/reader-root.spec.tsx | — |
| Testes | apps/consumer-web/tests/reader-toolbar.spec.tsx | — |
| Testes | apps/consumer-web/tests/reader.spec.tsx | mockReaderData |
| Testes | apps/consumer-web/tests/search.spec.tsx | — |
| Testes | apps/consumer-web/tests/states.a11y.spec.tsx | — |
| Testes | apps/consumer-web/tests/sync-api.test.ts | request, makeHandlers |
| Testes | apps/consumer-web/tests/sync-keys.test.ts | — |
| Testes | apps/consumer-web/tests/version-picker.spec.tsx | — |
| Outras fontes | apps/consumer-web/vitest.config.ts | — |
| Outras fontes | apps/consumer-web/vitest.setup.ts | — |
| Testes | apps/distribution-harness/tests/harness-browser.spec.ts | ROOT, WEB_DIR, WEB_PKG, exists |
| Testes | apps/distribution-harness/tests/harness-node.spec.ts | ROOT, RUNTIME, Packed, pack |
| Outras fontes | apps/distribution-harness/vitest.config.ts | — |
| Outras fontes | eslint.config.js | — |
| Testes | packages/adapter-http/src/__tests__/http-source.test.ts | SQLITE_HEADER, validHeaderBytes, makeFakeFetch |
| Outras fontes | packages/adapter-http/src/http-source.ts | HttpBiblePackageSourceOptions, R2_FILES, FALLBACK_VERSIONS, SQLITE_HEADER_TEXT, SQLITE_HEADER, headerValid, AbortBridge, toAbortSignal |
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
<!-- specsfy:documentator:end -->
