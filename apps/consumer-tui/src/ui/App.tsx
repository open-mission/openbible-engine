import { useEffect, useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";
import { isEngineError, type BibleBook, type SearchResult } from "@openbible/engine";
import type { ConsumerTuiEngine } from "../engine.js";
import { ScriptureLibraryService, libraryErrorMessage } from "../services/scripture-library.js";
import { BookPicker } from "./components/BookPicker.js";
import { FeedbackArea, type FeedbackKind } from "./components/FeedbackArea.js";
import { LibraryPanel, type LibraryVersion } from "./components/LibraryPanel.js";
import { ReaderPanel } from "./components/ReaderPanel.js";
import { SearchPanel } from "./components/SearchPanel.js";
import { VersionPicker } from "./components/VersionPicker.js";

export type AppArea = "library" | "reader" | "search";
type Overlay = "catalog" | "book-picker" | "help" | "history" | null;

export interface AppProps {
  engine: ConsumerTuiEngine;
  onQuit: () => void;
}

function areaLabel(area: AppArea): string {
  return area === "library" ? "Biblioteca" : area === "reader" ? "Leitor" : "Busca";
}

export function App({ engine, onQuit }: AppProps) {
  const [service] = useState(() => new ScriptureLibraryService(engine));
  const [area, setArea] = useState<AppArea>("library");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [availableVersions, setAvailableVersions] = useState<import("@openbible/engine").BibleVersion[]>([]);
  const [installedVersions, setInstalledVersions] = useState<import("@openbible/engine").InstalledBible[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>();
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<import("@openbible/engine").Verse[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult>();
  const [busy, setBusy] = useState(false);
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind>("offline");
  const [feedbackMessage, setFeedbackMessage] = useState("Pronto para trabalhar sem rede.");
  const [feedbackCode, setFeedbackCode] = useState<string>();
  const [retry, setRetry] = useState<(() => void) | undefined>();

  const installedIds = new Set(installedVersions.map((version) => version.id));
  const libraryVersions: LibraryVersion[] = [
    ...availableVersions.map((version) => ({ ...version, installed: installedIds.has(version.id) })),
    ...installedVersions
      .filter((installed) => !availableVersions.some((version) => version.id === installed.id))
      .map((installed) => ({ id: installed.id, name: installed.name, installed: true })),
  ];

  useEffect(() => {
    let active = true;
    void Promise.all([service.listAvailableVersions(), service.listInstalledVersions()])
      .then(([available, installed]) => {
        if (!active) return;
        setAvailableVersions(available);
        setInstalledVersions(installed);
        setFeedbackKind("offline");
        setFeedbackCode(undefined);
        setFeedbackMessage("Biblioteca carregada. Operações de leitura são locais.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFeedbackKind("error");
        setFeedbackMessage(libraryErrorMessage(error));
        setFeedbackCode(isEngineError(error) ? error.code : undefined);
      });
    return () => {
      active = false;
      service.close();
    };
  }, [service]);

  async function refreshInstalled(): Promise<void> {
    setInstalledVersions(await service.listInstalledVersions());
  }

  async function installVersion(versionId: string): Promise<void> {
    setBusy(true);
    setRetry(undefined);
    setFeedbackKind("loading");
    setFeedbackMessage(`Adquirindo ${versionId}...`);
    try {
      await service.installVersion(versionId, undefined, undefined, {
        onProgress: (progress) => {
          const received = progress.receivedBytes;
          const total = progress.totalBytes;
          setFeedbackMessage(total ? `${progress.stage} · ${received ?? 0}/${total} bytes` : progress.stage);
        },
      });
      await refreshInstalled();
      setSelectedVersionId(versionId);
      setOverlay(null);
      setFeedbackKind("success");
      setFeedbackCode(undefined);
      setFeedbackMessage(`${versionId} instalada no namespace do consumer.`);
    } catch (error: unknown) {
      setFeedbackKind("error");
      setFeedbackMessage(libraryErrorMessage(error));
      setFeedbackCode(isEngineError(error) ? error.code : undefined);
      setRetry(() => () => void installVersion(versionId));
    } finally {
      setBusy(false);
    }
  }

  async function removeVersion(versionId: string): Promise<void> {
    setBusy(true);
    setRetry(undefined);
    setFeedbackKind("loading");
    setFeedbackMessage(`Removendo ${versionId}...`);
    try {
      await service.uninstallVersion(versionId);
      await refreshInstalled();
      if (selectedVersionId === versionId) {
        setSelectedVersionId(undefined);
        setBooks([]);
        setVerses([]);
      }
      setFeedbackKind("success");
      setFeedbackCode(undefined);
      setFeedbackMessage(`${versionId} removida. O legado não foi alterado.`);
    } catch (error: unknown) {
      setFeedbackKind("error");
      setFeedbackMessage(libraryErrorMessage(error));
      setFeedbackCode(isEngineError(error) ? error.code : undefined);
      setRetry(() => () => void removeVersion(versionId));
    } finally {
      setBusy(false);
    }
  }

  async function loadChapter(versionId: string, bookId: string, nextChapter: number): Promise<void> {
    setBusy(true);
    setFeedbackKind("loading");
    setFeedbackMessage(`Carregando ${bookId} ${nextChapter}...`);
    try {
      const loaded = await service.getChapter(versionId, bookId, nextChapter);
      setVerses(loaded);
      setSelectedVersionId(versionId);
      setSelectedBookId(bookId);
      setChapter(nextChapter);
      setFeedbackKind("offline");
      setFeedbackCode(undefined);
      setFeedbackMessage("Conteúdo lido do armazenamento local.");
    } catch (error: unknown) {
      setFeedbackKind("error");
      setFeedbackMessage(libraryErrorMessage(error));
      setFeedbackCode(isEngineError(error) ? error.code : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function openReader(versionId: string): Promise<void> {
    if (!installedIds.has(versionId)) {
      setFeedbackKind("error");
      setFeedbackMessage("Instale a versão antes de abrir o Leitor.");
      return;
    }
    setArea("reader");
    setSelectedVersionId(versionId);
    setBusy(true);
    try {
      const loadedBooks = await service.getBooks(versionId);
      const firstBook = loadedBooks[0];
      setBooks(loadedBooks);
      if (firstBook) await loadChapter(versionId, firstBook.id, 1);
      else setFeedbackMessage("A versão instalada não possui livros disponíveis.");
    } catch (error: unknown) {
      setFeedbackKind("error");
      setFeedbackMessage(libraryErrorMessage(error));
      setFeedbackCode(isEngineError(error) ? error.code : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function selectBook(bookId: string): Promise<void> {
    if (selectedVersionId) await loadChapter(selectedVersionId, bookId, 1);
  }

  async function selectChapter(nextChapter: number): Promise<void> {
    if (selectedVersionId && selectedBookId) await loadChapter(selectedVersionId, selectedBookId, nextChapter);
  }

  async function search(query: string): Promise<void> {
    if (!selectedVersionId) {
      setFeedbackKind("error");
      setFeedbackMessage("Abra uma versão instalada no Leitor antes de buscar.");
      return;
    }
    setBusy(true);
    setFeedbackKind("loading");
    setFeedbackMessage("Consultando índice local...");
    try {
      const result = await service.searchVerses(selectedVersionId, query, 50);
      setSearchResult(result);
      setFeedbackKind("offline");
      setFeedbackCode(undefined);
      setFeedbackMessage(`${result.total} resultado(s), sem chamada de rede.`);
    } catch (error: unknown) {
      setFeedbackKind("error");
      setFeedbackMessage(libraryErrorMessage(error));
      setFeedbackCode(isEngineError(error) ? error.code : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function submitReference(query: string): Promise<void> {
    const reference = service.parseReference(query, books);
    if (!reference || !selectedVersionId) {
      setFeedbackKind("error");
      setFeedbackMessage("A referência não foi encontrada. Use Livro capítulo:versículo.");
      setFeedbackCode("invalid_reference");
      return;
    }
    setOverlay(null);
    await loadChapter(selectedVersionId, reference.bookId, reference.chapter);
  }

  const handleKey = (key: KeyEvent) => {
    const shifted = key.shift || key.name === key.name.toUpperCase();
    if (key.name.toLowerCase() === "q") {
      onQuit();
      return;
    }
    if (overlay) {
      if (key.name === "escape") setOverlay(null);
      return;
    }
    if (key.name === "?") {
      setOverlay("help");
      return;
    }
    if (key.name === "tab" && !busy) {
      setArea((current) => (current === "library" ? "reader" : current === "reader" ? "search" : "library"));
      return;
    }
    if (!busy && (key.name === "D" || (key.name === "d" && shifted))) {
      setOverlay("catalog");
      return;
    }
    if (key.name === "d" && !shifted && area === "library" && selectedVersionId) {
      if (installedIds.has(selectedVersionId)) void removeVersion(selectedVersionId);
      else {
        setFeedbackKind("error");
        setFeedbackMessage("A versão selecionada ainda não está instalada.");
      }
      return;
    }
    if (key.name === "d" && !shifted && area === "reader") {
      setOverlay("book-picker");
      return;
    }
    if (key.name === ":" && area === "reader") {
      setOverlay("book-picker");
      return;
    }
    if (key.name === "b") {
      setArea("library");
      return;
    }
    if (key.name === "h") {
      setOverlay("history");
      return;
    }
    if (key.name === "r" && feedbackKind === "error") {
      retry?.();
      return;
    }
    if (area === "library" && key.name === "return" && selectedVersionId) {
      void openReader(selectedVersionId);
      return;
    }
    if (area === "reader" && !busy && selectedVersionId && selectedBookId) {
      if (key.name === "n") {
        void selectChapter(chapter + 1);
      } else if (key.name === "p" && chapter > 1) {
        void selectChapter(chapter - 1);
      }
    }
  };

  useKeyboard(handleKey);

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor="#0f172a" padding={1} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text content="Scripture Library" fg="#e2e8f0" />
        <text content={`OFFLINE-FIRST · ${areaLabel(area)} · ? ajuda · q sai`} fg="#38bdf8" />
      </box>
      <text
        content={`[${area === "library" ? "●" : " "}] Biblioteca    [${area === "reader" ? "●" : " "}] Leitor    [${area === "search" ? "●" : " "}] Busca    · Tab alterna áreas`}
        fg="#cbd5e1"
      />
      <box flexGrow={1}>
        {area === "library" ? (
          <LibraryPanel
            versions={libraryVersions}
            selectedVersionId={selectedVersionId}
            busy={busy}
            onSelectVersion={setSelectedVersionId}
          />
        ) : area === "reader" ? (
          <ReaderPanel
            versions={installedVersions}
            books={books}
            verses={verses}
            selectedVersionId={selectedVersionId}
            selectedBookId={selectedBookId}
            chapter={chapter}
            busy={busy}
            onSelectVersion={(versionId) => void openReader(versionId)}
            onSelectBook={(bookId) => void selectBook(bookId)}
            onSelectChapter={(nextChapter) => void selectChapter(nextChapter)}
          />
        ) : (
          <SearchPanel
            versionId={selectedVersionId}
            result={searchResult}
            busy={busy}
            onSearch={(query) => void search(query)}
            onOpenResult={(bookId, nextChapter) => void loadChapter(selectedVersionId ?? "", bookId, nextChapter)}
          />
        )}
      </box>
      <FeedbackArea kind={feedbackKind} message={feedbackMessage} code={feedbackCode} onRetry={retry} />
      {overlay === "catalog" ? (
        <VersionPicker versions={availableVersions} selectedVersionId={selectedVersionId} busy={busy} onChoose={(versionId) => void installVersion(versionId)} />
      ) : overlay === "book-picker" ? (
        <BookPicker
          books={books}
          selectedBookId={selectedBookId}
          busy={busy}
          onSelectBook={(bookId) => void selectBook(bookId)}
          onSubmitReference={(query) => void submitReference(query)}
          onClose={() => setOverlay(null)}
        />
      ) : overlay === "history" ? (
        <box title="Histórico" border borderStyle="single" borderColor="#0ea5e9" padding={1}>
          <text content="O histórico é efêmero nesta fatia e não foi persistido." fg="#cbd5e1" />
          <text content="Esc fecha · q sai" fg="#64748b" />
        </box>
      ) : overlay === "help" ? (
        <box title="Ajuda" border borderStyle="single" borderColor="#0ea5e9" padding={1}>
          <text content="Tab áreas · setas/Enter selecionam · D catálogo · d remove/livro · : referência" fg="#cbd5e1" />
          <text content="n/p capítulo · b Biblioteca · h histórico · Esc fecha · ? ajuda · q sai" fg="#cbd5e1" />
        </box>
      ) : null}
    </box>
  );
}
