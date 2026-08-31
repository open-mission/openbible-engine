# Frontend e design system

<!-- specsfy:documentator:start -->
## Superfícies observadas

- Componentes, páginas ou views: 55.
- Tailwind: detectado.
- Tokens CSS: --background, --foreground, --card, --card-foreground, --popover, --popover-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --border, --input, --primary, --primary-foreground, --destructive, --ring, --color-background, --color-foreground, --color-card, --color-card-foreground, --color-popover, --color-popover-foreground, --color-secondary, --color-secondary-foreground, --color-muted, --color-muted-foreground, --color-accent, --color-accent-foreground, --color-border, --color-input, --color-primary, --color-primary-foreground, --color-destructive, --color-ring.

| Arquivo |
| --- |
| apps/consumer-tui/src/ui/App.tsx |
| apps/consumer-tui/src/ui/components/BookPicker.tsx |
| apps/consumer-tui/src/ui/components/FeedbackArea.tsx |
| apps/consumer-tui/src/ui/components/LibraryPanel.tsx |
| apps/consumer-tui/src/ui/components/ReaderPanel.tsx |
| apps/consumer-tui/src/ui/components/SearchPanel.tsx |
| apps/consumer-tui/src/ui/components/VersionPicker.tsx |
| apps/consumer-web/src/app/[version]/[book]/[chapter]/loading.tsx |
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
