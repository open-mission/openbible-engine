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
| Rotas e APIs | apps/consumer-web/.next/dev/server/app/manifest.webmanifest/route.js | — |
| Páginas | apps/consumer-web/.next/dev/server/app/manifest.webmanifest/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/dev/server/app/page/client-components-ssr.js | — |
| Páginas | apps/consumer-web/.next/dev/server/app/page.js | — |
| Páginas | apps/consumer-web/.next/dev/server/app/page_client-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/1jdc__next-internal_server_app_manifest_webmanifest_route_actions_1dhnqmb.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/1r6w_next_1jgpd4j._.js | _export, resolveRobots, resolveSitemap, resolveManifest, resolveRouteData, DYNAMIC_ERROR_CODE, DynamicServerError, isDynamicServerError |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/[root-of-the-server]__1dcfj5t._.js | GET, manifest |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/[turbopack]_runtime.js | REEXPORTED_OBJECTS, Context, defineProp, getOverwrittenModule, createModuleObject, createModuleWithDirection, BindingTag_Value, esm |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1m27_tailwind-merge_dist_bundle-mjs_mjs_0e7tbg_._.js | CLASS_PART_SEPARATOR, groups, IMPORTANT_MODIFIER, SPLIT_CLASSES_REGEX, result, not, twJoin, createTailwindMerge |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_0_fdd1a._.js | buildCompletedShellCacheKey, createAppPageEntrypoint, handler, ComponentMod, returns, only, createPPRBoundarySentinel, instrumentModuleGetter |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_1h9dpu1._.js | stringifyCookie, parseCookie, parseSetCookie, compact, parseSameSite, parsePriority, splitCookiesString, skipWhitespace |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_client_1vvm-5f._.js | addBasePath, callServer, _export, isModifiedEvent, linkClicked, formatStringOrUrl, LinkComponent, createPropError |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_client_components_0ld0-f6._.js | NotFound, HTTPAccessErrorFallback |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_client_components_builtin_forbidden_0hmrvbz.js | Forbidden |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_client_components_builtin_global-error_10p0608.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_client_components_builtin_unauthorized_0e5krv_.js | Unauthorized |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_compiled_14nzhu2._.js | stringifyCookie, parseCookie, parseSetCookie, compact, parseSameSite, parsePriority, splitCookiesString, skipWhitespace |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_0hhhvd8._.js | TEXT_PLAIN_CONTENT_TYPE_HEADER, HTML_CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE_HEADER, NEXT_QUERY_PARAM_PREFIX, NEXT_INTERCEPTION_MARKER_PREFIX, MATCHED_PATH_HEADER, PRERENDER_REVALIDATE_HEADER, PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_1gzksed._.js | LOGGING_METHOD, prefixedLog, bootstrap, wait, error, warn, ready, info |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_client_0rx7jui._.js | callServer, findSourceMapURL, RSC_HEADER, ACTION_HEADER, NEXT_ROUTER_STATE_TREE_HEADER, NEXT_ROUTER_PREFETCH_HEADER, NEXT_ROUTER_SEGMENT_PREFETCH_HEADER, NEXT_HMR_REFRESH_HEADER |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_lib_0ouzk6-._.js | Batcher, that, to, in, isServerReference, isUseCacheFunction, getUseCacheFunctionInfo, isClientReference |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_server_1cqfm3q._.js | createRuntimeBodyError, createDynamicBodyError, createRuntimeBodyErrorInNavigation, createLinkBodyErrorInNavigation, createDynamicBodyErrorInNavigation, createDynamicOrRuntimeBodyError, createLinkMetadataError, createRuntimeMetadataError |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_esm_server_20fj7bz._.js | getCookieParser, parseCookie, wrapApiHandler, sendStatusCode, redirect, checkIsOnDemandRevalidate, COOKIE_NAME_PRERENDER_BYPASS, COOKIE_NAME_PRERENDER_DATA |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_dist_server_route-modules_app-page_1_ds0j6._.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/1r6w_next_navigation_11e5mzl.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/[externals]__05yr04l._.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/[root-of-the-server]__0cdrx66._.js | HomePage, Reader, from |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/[root-of-the-server]__0u6sww0._.js | Icon, BookIcon, LibraryIcon, SearchIcon, NoteIcon, HighlightIcon, SettingsIcon, SunIcon |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/[turbopack]_runtime.js | REEXPORTED_OBJECTS, Context, defineProp, getOverwrittenModule, createModuleObject, createModuleWithDirection, BindingTag_Value, esm |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/_1q1ia0z._.js | RootLayout, AppShell, NavigationDock, from, Toaster, BibleEngineProvider |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/apps_consumer-web__next-internal_server_app_page_actions_18gjr3a.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/apps_consumer-web_src_1oo7ekf._.js | Breadcrumbs, Button, Card, CardHeader, CardContent, CardTitle, DownloadToast, updateDownloadToast |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/node_modules__pnpm_0692rqy._.js | _getRequireWildcardCache, _interop_require_wildcard, __insertCSS, Loader, SuccessIcon, WarningIcon, InfoIcon, ErrorIcon |
| Outras fontes | apps/consumer-web/.next/dev/server/chunks/ssr/node_modules__pnpm_07_ayfb._.js | _interop_require_default, _export, WarningIcon, DefaultGlobalError, handleISRError |
| Outras fontes | apps/consumer-web/.next/dev/server/interception-route-rewrite-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/middleware-build-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/next-font-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/server/server-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/0zix_@swc_helpers_cjs_0hi-e47._.js | _interop_require_default, _getRequireWildcardCache, _interop_require_wildcard |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1m27_tailwind-merge_dist_bundle-mjs_mjs_0uyodpf._.js | CLASS_PART_SEPARATOR, groups, IMPORTANT_MODIFIER, SPLIT_CLASSES_REGEX, result, not, twJoin, createTailwindMerge |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_11rxipy._.js | _export, TEXT_PLAIN_CONTENT_TYPE_HEADER, HTML_CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE_HEADER, NEXT_QUERY_PARAM_PREFIX, NEXT_INTERCEPTION_MARKER_PREFIX, MATCHED_PATH_HEADER, PRERENDER_REVALIDATE_HEADER |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_build_polyfills_polyfill-nomodule.js | e, t, Jm, Qm, Zm, tb, eb, rb |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_client_0xysnfi._.js | addBasePath, loadScriptsInSequence, appBootstrap, callServer, findSourceMapURL, nextServerDataCallback, isStreamErrorOrUnfinished, nextServerDataRegisterWriter |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_compiled_0mh32rr._.js | isSafeExport, registerExportsForReactRefresh, getRefreshBoundarySignature, isReactRefreshBoundary, shouldInvalidateReactRefreshBoundary, aggregates, scheduleUpdate, canApplyUpdate |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_compiled_next-devtools_index_00-daup.js | r, n, e, as, s, l, c, u |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_compiled_react-dom_1nxp3y1._.js | findHook, copyWithSetImpl, copyWithRename, copyWithRenameImpl, copyWithDeleteImpl, shouldSuspendImpl, shouldErrorImpl, warnInvalidHookAccess |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/1r6w_next_dist_compiled_react-server-dom-turbopack_1tsm0i5._.js | checkEvalAvailabilityOnceDev, resolveClientReference, resolveServerReference, requireAsyncModule, ignoreReject, preloadModule, requireModule, getIteratorFn |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_00-dp_j._.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/[turbopack]_browser_dev_hmr-client_hmr-client_ts_1mojsay._.js | connect, component, sendJSON, resourceKey, subscribeToUpdates, handleSocketConnected, aggregateUpdates, applyAggregatedUpdates |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/_1bju7ck._.js | Icon, BookIcon, LibraryIcon, SearchIcon, NoteIcon, HighlightIcon, SettingsIcon, SunIcon |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/apps_consumer-web_1anvha4._.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/apps_consumer-web_219uq1s._.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/apps_consumer-web_src_1-4tsft._.js | Breadcrumbs, Button, Card, CardHeader, CardContent, CardTitle, DownloadToast, updateDownloadToast |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/apps_consumer-web_src_styles_globals_14wunrk.css | — |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/node_modules__pnpm_0y6a60d._.js | _export, isModifiedEvent, linkClicked, formatStringOrUrl, LinkComponent, createPropError, onTouchStart, LinkStatusContext |
| Outras fontes | apps/consumer-web/.next/dev/static/chunks/turbopack-apps_consumer-web_0v6yq4b._.js | SUPPORT_COMPONENT_CHUNKS, REEXPORTED_OBJECTS, Context, defineProp, getOverwrittenModule, createModuleObject, createModuleWithDirection, BindingTag_Value |
| Outras fontes | apps/consumer-web/.next/dev/static/development/_buildManifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/development/_clientMiddlewareManifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/development/_ssgManifest.js | — |
| Outras fontes | apps/consumer-web/.next/dev/static/media/worker.43nlx67ehw613.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/.next/dev/types/cache-life.d.ts | cacheLife |
| Outras fontes | apps/consumer-web/.next/dev/types/root-params.d.ts | — |
| Outras fontes | apps/consumer-web/.next/dev/types/routes.d.ts | ParamMap, LayoutSlotMap, Page, PageProps, Layout, GET, RouteContext |
| Outras fontes | apps/consumer-web/.next/dev/types/validator.ts | — |
| Outras fontes | apps/consumer-web/.next/required-server-files.js | — |
| Páginas | apps/consumer-web/.next/server/app/[version]/[book]/[chapter]/page.js | f, from |
| Páginas | apps/consumer-web/.next/server/app/[version]/[book]/[chapter]/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/_global-error/page.js | d, i |
| Páginas | apps/consumer-web/.next/server/app/_global-error/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page.js | — |
| Páginas | apps/consumer-web/.next/server/app/_not-found/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/auth/[...all]/route.js | h, i, j, d, y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/auth/[...all]/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/account-delete/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/account-delete/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/approve/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/approve/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/revoke/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/revoke/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/devices/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/pull/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/pull/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/push/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/push/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/reconcile/route.js | y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/reconcile/route_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/route.js | g, e, y, z |
| Rotas e APIs | apps/consumer-web/.next/server/app/api/sync/v1/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/library/page.js | e, from, f, g, o, r, z, A |
| Páginas | apps/consumer-web/.next/server/app/library/page_client-reference-manifest.js | — |
| Rotas e APIs | apps/consumer-web/.next/server/app/manifest.webmanifest/route.js | f, k, is, cached, g, e, h, i |
| Páginas | apps/consumer-web/.next/server/app/manifest.webmanifest/route_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/page.js | from, f |
| Páginas | apps/consumer-web/.next/server/app/page_client-reference-manifest.js | — |
| Páginas | apps/consumer-web/.next/server/app/search/page.js | e, f, g, from, h, i, l, m |
| Páginas | apps/consumer-web/.next/server/app/search/page_client-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/chunks/265.js | e, i, j, k, m, n, o, p |
| Outras fontes | apps/consumer-web/.next/server/chunks/348.js | g, h, f, d, e, i, j, k |
| Outras fontes | apps/consumer-web/.next/server/chunks/349.js | f, e, n, r, s, c, p, h |
| Outras fontes | apps/consumer-web/.next/server/chunks/386.js | d, f, g, h, i, j, l, m |
| Outras fontes | apps/consumer-web/.next/server/chunks/407.js | r, s, u, k, p, t, v, l |
| Outras fontes | apps/consumer-web/.next/server/chunks/425.js | extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/467.js | e, p, q, x, r, s, t, z |
| Outras fontes | apps/consumer-web/.next/server/chunks/49.js | l, m |
| Outras fontes | apps/consumer-web/.next/server/chunks/566.js | — |
| Outras fontes | apps/consumer-web/.next/server/chunks/571.js | g, h, extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/680.js | f, g, h, j |
| Outras fontes | apps/consumer-web/.next/server/chunks/761.js | c, i, j, k, m, e, n, h |
| Outras fontes | apps/consumer-web/.next/server/chunks/877.js | extends |
| Outras fontes | apps/consumer-web/.next/server/chunks/994.js | g, j, k, c, i, await, and, h |
| Outras fontes | apps/consumer-web/.next/server/chunks/static/media/worker.01dbf253.js | a, c, B, C, D, E, F, G |
| Outras fontes | apps/consumer-web/.next/server/interception-route-rewrite-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-build-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/middleware-react-loadable-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/next-font-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/server-reference-manifest.js | — |
| Outras fontes | apps/consumer-web/.next/server/webpack-runtime.js | k |
| Outras fontes | apps/consumer-web/.next/static/aCtP1xNJqO8Xnuj2PTio8/_buildManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/aCtP1xNJqO8Xnuj2PTio8/_ssgManifest.js | — |
| Outras fontes | apps/consumer-web/.next/static/chunks/185-3fe54b62ea0b7bfb.js | p, u |
| Outras fontes | apps/consumer-web/.next/static/chunks/328-930e8982aa5e4088.js | o, u, l, c, f, s, p, d |
| Outras fontes | apps/consumer-web/.next/static/chunks/38140c26-f8cdead45fb93ae9.js | u, s, c, f, d, p, m, h |
| Outras fontes | apps/consumer-web/.next/static/chunks/674-9372f083266e3125.js | f, b, v, w, n |
| Outras fontes | apps/consumer-web/.next/static/chunks/685-bb24b2d5be353b7e.js | i, r, n, o, s, l, c, u |
| Outras fontes | apps/consumer-web/.next/static/chunks/829-15dcfa87d33ff50e.js | n, h, f, w, b, g, v, C |
| Outras fontes | apps/consumer-web/.next/static/chunks/858-d19434efb32fb5b5.js | i, r, u, e, o, s, l, w |
| Páginas | apps/consumer-web/.next/static/chunks/app/[version]/[book]/[chapter]/page-7bc6db780cd44de1.js | t |
| Páginas | apps/consumer-web/.next/static/chunks/app/_global-error/page-9bb13dc1f2daebb5.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/_not-found/page-9c1651b38b79bffb.js | o |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/auth/[...all]/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/account-delete/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/approve/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/revoke/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/devices/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/pull/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/push/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/reconcile/route-9bb13dc1f2daebb5.js | — |
| Rotas e APIs | apps/consumer-web/.next/static/chunks/app/api/sync/v1/route-9bb13dc1f2daebb5.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/layout-e828f57e69b51d9c.js | n, l, d, c, u, m, h, x |
| Páginas | apps/consumer-web/.next/static/chunks/app/library/page-ba32baecc29b0355.js | f, g, k, C, t, n, i, l |
| Páginas | apps/consumer-web/.next/static/chunks/app/manifest.webmanifest/route-9bb13dc1f2daebb5.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/page-a899949c7e7e946f.js | — |
| Páginas | apps/consumer-web/.next/static/chunks/app/search/page-cca9b8b95c9f4445.js | a, u, m, b, g, N, w, t |
| Outras fontes | apps/consumer-web/.next/static/chunks/framework-8d86bf67af353465.js | l, a, s, e, k, w, S, which |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-5744cd80784ef899.js | o, i, u, s, l, c, f, d |
| Outras fontes | apps/consumer-web/.next/static/chunks/main-app-3d751a33f5e5c4fd.js | — |
| Outras fontes | apps/consumer-web/.next/static/chunks/polyfills-42372ed130431b0a.js | e, t, Jm, Qm, Zm, tb, eb, rb |
| Outras fontes | apps/consumer-web/.next/static/chunks/webpack-1785eaaa96a352be.js | f |
| Outras fontes | apps/consumer-web/.next/static/css/a74936b2568c6c24.css | — |
| Outras fontes | apps/consumer-web/.next/static/media/worker.ee8c6977.js | e, r, I, A, T, O, F, P |
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
| Outras fontes | apps/consumer-web/.next/types/cache-life.d.ts | cacheLife |
| Outras fontes | apps/consumer-web/.next/types/root-params.d.ts | — |
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
| Outras fontes | apps/consumer-web/src/features/reader/VerseRow.tsx | VerseRow |
| Outras fontes | apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx | SelectionAnchor, CopyIcon, copyToClipboard, VerseSelectionPopover, handleKeyDown, handlePointerDown, handleCopy |
| Outras fontes | apps/consumer-web/src/features/reader/VersionPicker.tsx | VersionPicker, close, InstallationStatus |
| Rotas e APIs | apps/consumer-web/src/features/reader/reader-route.ts | routeSegment, bookRouteSegment, findBookByRouteSegment, readerPath |
| Outras fontes | apps/consumer-web/src/features/reader/verse-reference.ts | groupVerseNumbers, formatVerseReference, formatVerseText |
| Outras fontes | apps/consumer-web/src/features/search/Search.tsx | Search, search |
| Outras fontes | apps/consumer-web/src/features/search/SearchForm.tsx | SearchForm |
| Outras fontes | apps/consumer-web/src/features/search/SearchResults.tsx | DisplaySearchResult, SearchResults |
<!-- specsfy:documentator:end -->
