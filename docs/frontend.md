# Frontend e design system

<!-- specsfy:documentator:start -->
## Superfícies observadas

- Componentes, páginas ou views: 56.
- Tailwind: detectado.
- Tokens CSS: --tw-rotate-x, --tw-rotate-y, --tw-rotate-z, --tw-skew-x, --tw-skew-y, --tw-space-y-reverse, --tw-border-style, --tw-leading, --tw-font-weight, --tw-tracking, --tw-shadow, --tw-shadow-color, --tw-shadow-alpha, --tw-inset-shadow, --tw-inset-shadow-color, --tw-inset-shadow-alpha, --tw-ring-color, --tw-ring-shadow, --tw-inset-ring-color, --tw-inset-ring-shadow, --tw-ring-inset, --tw-ring-offset-width, --tw-ring-offset-color, --tw-ring-offset-shadow, --tw-backdrop-blur, --tw-backdrop-brightness, --tw-backdrop-contrast, --tw-backdrop-grayscale, --tw-backdrop-hue-rotate, --tw-backdrop-invert, --tw-backdrop-opacity, --tw-backdrop-saturate, --tw-backdrop-sepia, --tw-translate-x, --tw-translate-y, --tw-translate-z, --tw-blur, --tw-brightness, --tw-contrast, --tw-grayscale, --tw-hue-rotate, --tw-invert, --tw-opacity, --tw-saturate, --tw-sepia, --tw-drop-shadow, --tw-drop-shadow-color, --tw-drop-shadow-alpha, --tw-drop-shadow-size, --font-sans, --font-mono, --color-emerald-300, --color-emerald-700, --color-rose-100, --color-rose-300, --color-rose-700, --color-rose-800, --color-rose-950, --color-black, --color-white, --spacing, --container-sm, --container-xl, --container-3xl, --text-xs, --text-xs--line-height, --text-sm, --text-sm--line-height, --text-lg, --text-lg--line-height, --text-xl, --text-xl--line-height, --text-3xl, --text-3xl--line-height, --font-weight-medium, --font-weight-semibold, --font-weight-bold, --tracking-tight, --tracking-wider, --radius-md, --radius-lg, --radius-xl, --radius-2xl, --radius-3xl, --animate-pulse, --blur-sm, --default-transition-duration, --default-transition-timing-function, --default-font-family, --default-mono-font-family, --default-font-feature-settings, --default-font-variation-settings, --default-mono-font-feature-settings, --default-mono-font-variation-settings, --border, --destructive, --primary, --background, --card, --muted, --foreground, --muted-foreground, --primary-foreground, --tw-ease, --tw-duration, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, --tw-outline-style, --accent, --ring, --card-foreground, --popover, --popover-foreground, --secondary, --secondary-foreground, --accent-foreground, --input, --color-background, --color-foreground, --color-card, --color-card-foreground, --color-popover, --color-popover-foreground, --color-secondary, --color-secondary-foreground, --color-muted, --color-muted-foreground, --color-accent, --color-accent-foreground, --color-border, --color-input, --color-primary, --color-primary-foreground, --color-destructive, --color-ring.

| Arquivo |
| --- |
| apps/consumer-tui/src/ui/App.tsx |
| apps/consumer-tui/src/ui/components/BookPicker.tsx |
| apps/consumer-tui/src/ui/components/FeedbackArea.tsx |
| apps/consumer-tui/src/ui/components/LibraryPanel.tsx |
| apps/consumer-tui/src/ui/components/ReaderPanel.tsx |
| apps/consumer-tui/src/ui/components/SearchPanel.tsx |
| apps/consumer-tui/src/ui/components/VersionPicker.tsx |
| apps/consumer-web/.next/dev/static/chunks/apps_consumer-web_src_styles_globals_14wunrk.css |
| apps/consumer-web/.next/static/css/a74936b2568c6c24.css |
| apps/consumer-web/src/app/[version]/[book]/[chapter]/page.tsx |
| apps/consumer-web/src/app/layout.tsx |
| apps/consumer-web/src/app/library/page.tsx |
| apps/consumer-web/src/app/page.tsx |
| apps/consumer-web/src/app/search/page.tsx |
| apps/consumer-web/src/components/AppShell.tsx |
| apps/consumer-web/src/components/NavigationDock.tsx |
| apps/consumer-web/src/components/ui/badge.tsx |
| apps/consumer-web/src/components/ui/breadcrumbs.tsx |
| apps/consumer-web/src/components/ui/button.tsx |
| apps/consumer-web/src/components/ui/card.tsx |
| apps/consumer-web/src/components/ui/download-toast.tsx |
| apps/consumer-web/src/components/ui/feedback.tsx |
| apps/consumer-web/src/components/ui/input.tsx |
| apps/consumer-web/src/components/ui/skeleton.tsx |
| apps/consumer-web/src/components/ui/sonner.tsx |
| apps/consumer-web/src/engine/bible-engine-provider.tsx |
| apps/consumer-web/src/features/library/AppLibrary.tsx |
| apps/consumer-web/src/features/library/VersionCard.tsx |
| apps/consumer-web/src/features/reader/BookChapterPicker.tsx |
| apps/consumer-web/src/features/reader/PrevNextNav.tsx |
| apps/consumer-web/src/features/reader/Reader.tsx |
| apps/consumer-web/src/features/reader/ReaderToolbar.tsx |
| apps/consumer-web/src/features/reader/ResponsivePicker.tsx |
| apps/consumer-web/src/features/reader/VerseRow.tsx |
| apps/consumer-web/src/features/reader/VerseSelectionPopover.tsx |
| apps/consumer-web/src/features/reader/VersionPicker.tsx |
| apps/consumer-web/src/features/search/Search.tsx |
| apps/consumer-web/src/features/search/SearchForm.tsx |
| apps/consumer-web/src/features/search/SearchResults.tsx |
| apps/consumer-web/src/styles/globals.css |
| apps/consumer-web/tests/app-shell.spec.tsx |
| apps/consumer-web/tests/download-toast.spec.tsx |
| apps/consumer-web/tests/feedback.spec.tsx |
| apps/consumer-web/tests/install-failure.spec.tsx |
| apps/consumer-web/tests/library-source.spec.tsx |
| apps/consumer-web/tests/library-states.spec.tsx |
| apps/consumer-web/tests/library.spec.tsx |
| apps/consumer-web/tests/offline-empty.spec.tsx |
| apps/consumer-web/tests/reader-pickers.spec.tsx |
| apps/consumer-web/tests/reader-root.spec.tsx |
| apps/consumer-web/tests/reader-toolbar.spec.tsx |
| apps/consumer-web/tests/reader.spec.tsx |
| apps/consumer-web/tests/search.spec.tsx |
| apps/consumer-web/tests/states.a11y.spec.tsx |
| apps/consumer-web/tests/verse-selection.spec.tsx |
| apps/consumer-web/tests/version-picker.spec.tsx |
<!-- specsfy:documentator:end -->

## Native markup surface

The Native consumer does not use React, Tailwind, shadcn/ui or ReUI. Its single
GPU/software window is composed from `src/app.native` and these Native markup
blocks:

| Area | File | Responsibilities | States |
| --- | --- | --- | --- |
| Biblioteca | `apps/consumer-native/src/components/library.native` | Versions, install/remove and local status | loading, empty, installed, failed |
| Leitor | `apps/consumer-native/src/components/reader.native` | Version/book/chapter selectors, verses and navigation | loading, content, limits, empty |
| Busca | `apps/consumer-native/src/components/search.native` | Keyboard-searchable query and contextual results | empty term, loading, zero results |
| Feedback | `apps/consumer-native/src/components/feedback.native` | Shared status, error and retry | loading, failed, retry |

Accessibility evidence includes named tabs, labelled controls, focusable search,
visible operation status and `dispatch_errors=0` in the final Native snapshot.
