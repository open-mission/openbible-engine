# Testes

<!-- specsfy:documentator:start -->
## Resumo

- Arquivos de teste: 91.
- Runner: Vitest.
- Scripts: build: turbo run build; build:web: turbo run build --filter=@openbible/consumer-web...; build:native: turbo run build --filter=@openbible/adapter-sqlite-native... && native build apps/consumer-native; test: turbo run test; test:tdd: vitest run tests; test:coverage: turbo run test:coverage; typecheck: turbo run typecheck; lint: turbo run lint; check: turbo run check; prepare: husky install.

| Arquivo |
| --- |
| apps/conformance-cli/src/__tests__/conformance.test.ts |
| apps/consumer-native/tests/accessibility-contract.test.ts |
| apps/consumer-native/tests/download-contract.test.ts |
| apps/consumer-native/tests/fixture.ts |
| apps/consumer-native/tests/harness.test.ts |
| apps/consumer-native/tests/offline-contract.test.ts |
| apps/consumer-native/tests/reopen.test.ts |
| apps/consumer-native/tests/ui-feedback.test.ts |
| apps/consumer-native/tests/ui-navigation.test.ts |
| apps/consumer-tui/tests/boundary.test.ts |
| apps/consumer-tui/tests/conformance.test.ts |
| apps/consumer-tui/tests/install-lifecycle.test.ts |
| apps/consumer-tui/tests/reader-reference.test.ts |
| apps/consumer-tui/tests/runtime-spike.test.ts |
| apps/consumer-tui/tests/search-offline.test.ts |
| apps/consumer-tui/tests/ui-navigation.test.ts |
| apps/consumer-web/tests/auth.test.ts |
| apps/consumer-web/tests/bible-preferences.test.ts |
| apps/consumer-web/tests/boundary.test.ts |
| apps/consumer-web/tests/browser/consumer.spec.ts |
| apps/consumer-web/tests/browser/fixtures.ts |
| apps/consumer-web/tests/install-failure.spec.tsx |
| apps/consumer-web/tests/library-source.spec.tsx |
| apps/consumer-web/tests/library-states.spec.tsx |
| apps/consumer-web/tests/library.spec.tsx |
| apps/consumer-web/tests/offline-empty.spec.tsx |
| apps/consumer-web/tests/pwa.spec.ts |
| apps/consumer-web/tests/reader.spec.tsx |
| apps/consumer-web/tests/search.spec.tsx |
| apps/consumer-web/tests/states.a11y.spec.tsx |
| apps/consumer-web/tests/sync-api.test.ts |
| apps/consumer-web/tests/sync-keys.test.ts |
| apps/distribution-harness/tests/harness-browser.spec.ts |
| apps/distribution-harness/tests/harness-node.spec.ts |
| packages/adapter-http/src/__tests__/http-source.test.ts |
| packages/adapter-sqlite-native/tests/adapter-install.test.ts |
| packages/adapter-sqlite-native/tests/adapter-read.test.ts |
| packages/adapter-sqlite-native/tests/adapter-rollback.test.ts |
| packages/adapter-sqlite-native/tests/conformance.test.ts |
| packages/adapter-sqlite-native/tests/native-storage.ts |
| packages/adapter-sqlite-native/tests/package-download.test.ts |
| packages/adapter-sqlite-native/tests/r2-schema.test.ts |
| packages/adapter-sqlite-native/tests/security-contract.test.ts |
| packages/adapter-sqlite-node/src/__tests__/sqlite-node.test.ts |
| packages/adapter-sqlite-web/tests/browser/harness/browser-entry.ts |
| packages/adapter-sqlite-web/tests/browser/initialization.spec.ts |
| packages/adapter-sqlite-web/tests/browser/install-library.spec.ts |
| packages/adapter-sqlite-web/tests/browser/lifecycle.spec.ts |
| packages/adapter-sqlite-web/tests/browser/package.spec.ts |
| packages/adapter-sqlite-web/tests/unit/capabilities.test.ts |
| packages/adapter-sqlite-web/tests/unit/helpers/fake-pool.ts |
| packages/adapter-sqlite-web/tests/unit/helpers/fake-registry.ts |
| packages/adapter-sqlite-web/tests/unit/helpers/fixture.ts |
| packages/adapter-sqlite-web/tests/unit/installer.test.ts |
| packages/adapter-sqlite-web/tests/unit/public-api.test.ts |
| packages/adapter-sqlite-web/tests/unit/reconciliation.test.ts |
| packages/adapter-sync-turso/src/__tests__/adapter.test.ts |
| packages/adapter-sync-turso/src/__tests__/schema.test.ts |
| packages/engine/src/__tests__/engine.test.ts |
| packages/engine/src/__tests__/install.test.ts |
| packages/engine/src/__tests__/search.test.ts |
| packages/engine-core/src/__tests__/contracts.test.ts |
| packages/engine-core/src/__tests__/parser.test.ts |
| packages/engine-core/src/__tests__/validation.test.ts |
| packages/engine-testing/src/__tests__/contract-suite.test.ts |
| packages/engine-testing/src/__tests__/fakes.test.ts |
| packages/personal-study/src/__tests__/personal-study.test.ts |
| packages/personal-study-core/src/__tests__/validation.test.ts |
| packages/sync/src/__tests__/account-delete.test.ts |
| packages/sync/src/__tests__/auth-state.test.ts |
| packages/sync/src/__tests__/bible-preferences.test.ts |
| packages/sync/src/__tests__/conflict.test.ts |
| packages/sync/src/__tests__/device-keys.test.ts |
| packages/sync/src/__tests__/import.test.ts |
| packages/sync/src/__tests__/limits.test.ts |
| packages/sync/src/__tests__/offline.test.ts |
| packages/sync/src/__tests__/outbox.test.ts |
| packages/sync/src/__tests__/privacy.test.ts |
| packages/sync/src/__tests__/reconcile.test.ts |
| packages/sync/src/__tests__/sync.test.ts |
| packages/sync-core/src/__tests__/validation.test.ts |
| packages/sync-testing/src/__tests__/fakes.test.ts |
| tests/arch/api-regression.test.ts |
| tests/arch/core-imports.test.ts |
| tests/arch/engine-purity.test.ts |
| tests/arch/exports.test.ts |
| tests/arch/personal-study-boundary.test.ts |
| tests/arch/sync-boundary.test.ts |
| tests/architecture/native-boundary.test.ts |
| tests/native-sdk-capability.test.ts |
| tests/native-sdk-spike.test.ts |
<!-- specsfy:documentator:end -->

## SPEC-0005 evidence

- `pnpm exec turbo run build test typecheck lint check`: 47/47 tasks passed.
- `native test apps/consumer-native`, `native check apps/consumer-native` and
  `native build apps/consumer-native -Dautomation=true`: passed.
- Native automation covered install/remove/reinstall, reopen, reader navigation,
  chapter selection, keyboard search, empty query, zero results, focus and
  `dispatch_errors=0` at wide and minimum window sizes.
- The Native adapter suite covers ordered staging, out-of-order rejection,
  cleanup after commit and the published `INTEGER PRIMARY KEY` SQLite shape in
  `tests/package-download.test.ts` and `tests/r2-schema.test.ts`.
- A direct R2 verification downloaded ARA in 22 consecutive `206` ranges of at
  most `204800` bytes, installed `4476928` bytes, read 66 books and removed the
  staged part after commit.
- `native doctor --manifest apps/consumer-native/app.json --strict` remains a
  documented environment limitation because WebKitGTK 6.0 is unavailable.
