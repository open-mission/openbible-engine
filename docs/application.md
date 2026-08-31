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
| Outras fontes | apps/consumer-web/next-env.d.ts | — |
| Outras fontes | apps/consumer-web/playwright.config.ts | — |
| Outras fontes | apps/consumer-web/public/engine-worker/worker.js | _EngineError, callee, callee2, sqlite3InitModule, locateFile, updateMemoryViews, initMemory, preRun |
| Outras fontes | apps/consumer-web/public/sw.js | — |
| Outras fontes | apps/consumer-web/public/workbox-5194662c.js | s, r, i, a, h, p, y, m |
| Páginas | apps/consumer-web/src/app/[version]/[book]/[chapter]/loading.tsx | — |
| Páginas | apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx | ReaderRoute, ReaderPage |
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
| Outras fontes | apps/consumer-web/src/features/reader/Reader.tsx | ReaderLoadingSkeleton, Reader, openBookPicker, openVersionPicker, selectBook, selectChapter, selectVersion, cancelInstall |
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
| Testes | apps/consumer-web/tests/verse-reference.test.ts | — |
| Testes | apps/consumer-web/tests/verse-selection.spec.tsx | mockReaderData, setClipboard |
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
| Testes | packages/adapter-sync-turso/src/__tests__/adapter.test.ts | createLocalClient |
| Testes | packages/adapter-sync-turso/src/__tests__/schema.test.ts | — |
| Outras fontes | packages/adapter-sync-turso/src/adapter.ts | TursoSyncAdapterOptions, TursoSyncAdapter, RETENTION_TOMBSTONE_MS, ACCOUNT_DELETE_RETENTION_MS, createTursoSyncAdapter, required, parseCursor |
| Outras fontes | packages/adapter-sync-turso/src/index.ts | — |
| Outras fontes | packages/adapter-sync-turso/src/schema.ts | SyncDatabase, SYNC_MIGRATION_VERSION, SYNC_MIGRATIONS, applySyncMigrations |
| Outras fontes | packages/adapter-sync-turso/vitest.config.ts | — |
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
| Testes | packages/personal-study/src/__tests__/personal-study.test.ts | createStore |
| Outras fontes | packages/personal-study/src/index.ts | — |
| Outras fontes | packages/personal-study/src/personal-study.ts | createPersonalStudy, withAvailability, validateInput, runStorage |
| Outras fontes | packages/personal-study/src/ports.ts | PersonalStudyStore, ReferenceAvailability, Clock, NoteIdFactory, StudyNoteInput, PersonalStudyOptions, PersonalStudy |
| Outras fontes | packages/personal-study/vitest.config.ts | — |
| Testes | packages/personal-study-core/src/__tests__/validation.test.ts | — |
| Outras fontes | packages/personal-study-core/src/errors.ts | PersonalStudyError, isPersonalStudyError |
| Outras fontes | packages/personal-study-core/src/index.ts | — |
| Outras fontes | packages/personal-study-core/src/types.ts | StudyReference, StudyNote |
| Outras fontes | packages/personal-study-core/src/validation.ts | BOOK_ID_PATTERN, MAX_MARKDOWN_LENGTH, validateStudyReference, validateNoteContent, isRecord, isPositiveInteger |
| Outras fontes | packages/personal-study-core/vitest.config.ts | — |
| Testes | packages/sync/src/__tests__/account-delete.test.ts | — |
| Testes | packages/sync/src/__tests__/auth-state.test.ts | — |
| Testes | packages/sync/src/__tests__/bible-preferences.test.ts | — |
| Testes | packages/sync/src/__tests__/conflict.test.ts | — |
| Testes | packages/sync/src/__tests__/device-keys.test.ts | — |
| Testes | packages/sync/src/__tests__/import.test.ts | — |
| Testes | packages/sync/src/__tests__/limits.test.ts | — |
| Testes | packages/sync/src/__tests__/offline.test.ts | — |
| Testes | packages/sync/src/__tests__/outbox.test.ts | — |
| Testes | packages/sync/src/__tests__/privacy.test.ts | — |
| Testes | packages/sync/src/__tests__/reconcile.test.ts | — |
| Testes | packages/sync/src/__tests__/sync.test.ts | — |
| Outras fontes | packages/sync/src/index.ts | — |
| Outras fontes | packages/sync/src/ports.ts | SyncCredentials, SyncClock, SyncLocalStore, SyncPushResult, SyncPullResult, SyncReconcileResult, SyncRemote, SyncKeyManager |
| Outras fontes | packages/sync/src/sync.ts | SyncStatus, SyncCoordinator, createSync, getPending, credentials, applyChanges, remoteError, syncNow |
| Outras fontes | packages/sync/vitest.config.ts | — |
| Testes | packages/sync-core/src/__tests__/validation.test.ts | — |
| Outras fontes | packages/sync-core/src/errors.ts | SyncErrorOptions, SyncError, createSyncError, isSyncError, throwSyncError |
| Outras fontes | packages/sync-core/src/index.ts | — |
| Outras fontes | packages/sync-core/src/types.ts | EncryptedNoteEnvelope, SyncAccountBinding, SyncDevice, SyncRevision, EncryptedNoteRecord, SyncConflict, SyncTombstone, SyncOperation |
| Outras fontes | packages/sync-core/src/validation.ts | ID_PATTERN, validateSyncIdentifier, validateEncryptedNoteEnvelope, validateSyncOperation, isRecord, isPositiveInteger, isNonNegativeInteger |
| Outras fontes | packages/sync-core/vitest.config.ts | — |
| Testes | packages/sync-testing/src/__tests__/fakes.test.ts | — |
| Outras fontes | packages/sync-testing/src/fakes.ts | ControlledClock, FakeSyncLocalStore, FakeSyncRemoteOptions, FakeSyncRemote |
<!-- specsfy:documentator:end -->
