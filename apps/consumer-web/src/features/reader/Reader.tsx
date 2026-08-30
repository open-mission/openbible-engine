"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { BibleBook, BibleVersion, CancellationToken, InstalledBible, InstallationProgress, Verse } from "@openbible/engine-core";
import type { InstallationObserver } from "@openbible/engine";
import { useBibleEngine } from "@/engine/bible-engine-provider";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { showDownloadError, showDownloadProgress, showDownloadStart, showDownloadSuccess } from "@/components/ui/download-toast";
import { EmptyState, ErrorState, OfflineBanner } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { BookChapterPicker } from "@/features/reader/BookChapterPicker";
import { ReaderToolbar, type ReaderWidth } from "@/features/reader/ReaderToolbar";
import { VersionPicker } from "@/features/reader/VersionPicker";
import { bookRouteSegment, findBookByRouteSegment, readerPath } from "@/features/reader/reader-route";
import { getEngineErrorMessage } from "@/lib/engine-error";

type ReaderReference = { versionId: string; bookId: string; chapter: number };

function ReaderLoadingSkeleton() {
  const verseLines = ["w-full", "w-[92%]", "w-full", "w-[84%]", "w-[96%]", "w-[88%]"];

  return (
    <div data-testid="reader-loading" aria-label="Carregando capítulo" aria-busy="true" className="reader-screen min-h-[calc(100dvh-5.5rem)]">
      <div data-testid="reader-loading-toolbar" className="reader-loading-toolbar" aria-hidden="true">
        <Skeleton className="h-10 w-full max-w-3xl rounded-full" />
      </div>
      <div className="reader-content">
        <div data-testid="reader-loading-heading" className="reader-loading-heading" aria-hidden="true">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto mt-4 h-10 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-4 h-3 w-32" />
        </div>
        <article data-testid="reader-loading-verses" className="reader-loading-copy" aria-hidden="true">
          {verseLines.map((width, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className={`h-5 ${width}`} />
              <Skeleton className={`h-5 ${index % 2 === 0 ? "w-[94%]" : "w-[78%]"}`} />
            </div>
          ))}
        </article>
      </div>
    </div>
  );
}

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function Reader() {
  const params = useParams<{ version?: string | string[]; book?: string | string[]; chapter?: string | string[] }>();
  const requestedVersionId = param(params?.version);
  const requestedBookSegment = param(params?.book);
  const requestedChapterValue = param(params?.chapter);
  const requestedChapter = requestedChapterValue ? Number.parseInt(requestedChapterValue, 10) : undefined;
  const isRoot = !requestedVersionId && !requestedBookSegment && !requestedChapterValue;
  const router = useRouter();
  const { engine, status, refresh } = useBibleEngine();
  const [reference, setReference] = useState<ReaderReference>();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [installedVersions, setInstalledVersions] = useState<InstalledBible[]>([]);
  const [availableVersions, setAvailableVersions] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [versionPickerError, setVersionPickerError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [readerWidth, setReaderWidth] = useState<ReaderWidth>("medium");
  const [displayOpen, setDisplayOpen] = useState(false);
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [versionPickerOpen, setVersionPickerOpen] = useState(false);
  const [pickerInitialView, setPickerInitialView] = useState<"books" | "chapters">("books");
  const [installingVersionId, setInstallingVersionId] = useState<string>();
  const [installProgress, setInstallProgress] = useState<InstallationProgress>();
  const [installError, setInstallError] = useState<string>();
  const installControl = useRef<{ aborted: boolean; reason?: unknown } | undefined>(undefined);
  const pickerBookId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!engine || status !== "ready") return;
    let active = true;
    setLoading(true);
    setError(undefined);

    void (async () => {
      const installed = await engine.listInstalledVersions();
      if (!active) return;
      setInstalledVersions(installed);
      const versionId = requestedVersionId || installed[0]?.id;

      if (!versionId) {
        setReference(undefined);
        setBooks([]);
        setVerses([]);
        return;
      }

      const nextBooks = await engine.getBooks(versionId);
      if (!active) return;
      setBooks(nextBooks);
       const requestedBook = requestedBookSegment ? findBookByRouteSegment(nextBooks, requestedBookSegment) : undefined;
       const bookId = requestedBook?.id ?? (isRoot ? nextBooks[0]?.id : undefined);
      const book = nextBooks.find((item) => item.id === bookId);
      const chapter = requestedChapter ?? (isRoot ? 1 : 0);
      setReference({ versionId, bookId: bookId ?? "", chapter });

      if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
        setVerses([]);
        return;
      }

      const nextVerses = await engine.getChapter({ versionId, bookId: book.id, chapter });
      if (!active) return;
      setVerses(nextVerses);
    })().catch((cause: unknown) => {
      if (active) setError(getEngineErrorMessage(cause, "Não foi possível abrir este capítulo."));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [engine, isRoot, requestedBookSegment, requestedChapter, requestedVersionId, retry, status]);

  const versionId = reference?.versionId ?? requestedVersionId;
  const bookId = reference?.bookId;
  const chapter = reference?.chapter ?? requestedChapter ?? 0;
  const bookIndex = books.findIndex((book) => book.id === bookId);
  const book = bookIndex >= 0 ? books[bookIndex] : undefined;
  const versionName = installedVersions.find((item) => item.id === versionId)?.name ?? versionId.toUpperCase();
  const previous = versionId && book && chapter > 1
    ? { href: readerPath(versionId, bookRouteSegment(book, books), chapter - 1), label: "Capítulo anterior" }
    : versionId && bookIndex > 0 && books[bookIndex - 1]
      ? { href: readerPath(versionId, bookRouteSegment(books[bookIndex - 1], books), 1), label: books[bookIndex - 1].name }
      : undefined;
  const next = versionId && book && chapter < book.chapters
    ? { href: readerPath(versionId, bookRouteSegment(book, books), chapter + 1), label: "Próximo capítulo" }
    : versionId && bookIndex >= 0 && bookIndex < books.length - 1 && books[bookIndex + 1]
      ? { href: readerPath(versionId, bookRouteSegment(books[bookIndex + 1], books), 1), label: books[bookIndex + 1].name }
      : undefined;

  function openBookPicker(initialView: "books" | "chapters" = "books") {
    pickerBookId.current = bookId;
    setPickerInitialView(initialView);
    setBookPickerOpen(true);
  }

  function openVersionPicker() {
    setVersionPickerOpen(true);
    setInstallError(undefined);
    setVersionPickerError(undefined);
    if (!engine || availableLoading || availableVersions.length > 0) return;
    setAvailableLoading(true);
    void engine.listAvailableVersions().then((versions) => {
      setAvailableVersions(versions);
      setVersionPickerError(undefined);
    }).catch((cause: unknown) => {
      setVersionPickerError(getEngineErrorMessage(cause, "Não foi possível carregar as versões disponíveis."));
    }).finally(() => setAvailableLoading(false));
  }

  function selectBook(bookIdToSelect: string) {
    pickerBookId.current = bookIdToSelect;
  }

  function selectChapter(chapterToSelect: number) {
    const nextBookId = pickerBookId.current || bookId;
    const nextBook = books.find((item) => item.id === nextBookId);
    if (!versionId || !nextBook) return;
    setBookPickerOpen(false);
    router.push(readerPath(versionId, bookRouteSegment(nextBook, books), chapterToSelect));
  }

  function selectVersion(versionIdToSelect: string) {
    const nextBook = books.find((item) => item.id === bookId) ?? books[0];
    if (!nextBook) return;
    const nextChapter = chapter > 0 ? chapter : 1;
    setVersionPickerOpen(false);
    router.push(readerPath(versionIdToSelect, bookRouteSegment(nextBook, books), nextChapter));
  }

  function cancelInstall() {
    if (!installControl.current) return;
    installControl.current.aborted = true;
    installControl.current.reason = "user_cancelled";
  }

  function installVersion(version: BibleVersion) {
    if (!engine || installingVersionId) return;
    const control = { aborted: false, reason: undefined as unknown };
    installControl.current = control;
    setInstallingVersionId(version.id);
    setInstallProgress(undefined);
    setInstallError(undefined);
    const toastId = showDownloadStart(version.name);
    const token: CancellationToken = {
      get aborted() { return control.aborted; },
      get reason() { return control.reason; },
    };
    const observer: InstallationObserver = {
      onProgress(progress) {
        setInstallProgress(progress);
        showDownloadProgress(toastId, version.name, progress);
      },
    };
    void engine.installVersion({ versionId: version.id, name: version.name, token }, observer).then(async () => {
      showDownloadSuccess(toastId, version.name);
      const installed = await engine.listInstalledVersions();
      setInstalledVersions(installed);
      setAvailableVersions((current) => current.filter((item) => item.id !== version.id));
      setRetry((value) => value + 1);
    }).catch((cause: unknown) => {
      showDownloadError(toastId, version.name);
      setInstallError(getEngineErrorMessage(cause, "Não foi possível instalar esta versão."));
    }).finally(() => {
      installControl.current = undefined;
      setInstallingVersionId(undefined);
      setInstallProgress(undefined);
    });
  }

  if (status === "loading" || loading) return <ReaderLoadingSkeleton />;
  if (status === "error") return <div className="page-frame"><Breadcrumbs current="Leitor" /><ErrorState message={error ?? "Armazenamento local indisponível."} onRetry={refresh} /><Link href="/library" className="mt-4 inline-block underline">Abrir Biblioteca</Link></div>;
  if (error) return <div className="page-frame"><Breadcrumbs current="Leitor" /><ErrorState message={error} onRetry={() => setRetry((value) => value + 1)} /><Link href="/library" className="mt-4 inline-block underline">Abrir Biblioteca</Link></div>;

  if (!versionId || installedVersions.length === 0) {
    return (
      <div className="page-frame">
        <Breadcrumbs current="Leitor" />
        <OfflineBanner />
        <EmptyState title="Nenhuma Bíblia instalada" description="Escolha uma versão para começar a ler offline neste dispositivo." />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={openVersionPicker}>Escolher versão</Button>
          <Link href="/library" className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent">Abrir Biblioteca</Link>
        </div>
        <VersionPicker open={versionPickerOpen} versionId="" installedVersions={installedVersions} availableVersions={availableVersions} loading={availableLoading} error={versionPickerError ?? installError} installingId={installingVersionId} progress={installProgress} onClose={() => setVersionPickerOpen(false)} onSelect={selectVersion} onInstall={installVersion} onCancel={cancelInstall} onRetry={openVersionPicker} />
      </div>
    );
  }

  if (!book || verses.length === 0) {
    return (
      <div className="page-frame">
        <Breadcrumbs current="Leitor" />
        <EmptyState title="Capítulo indisponível" description="Escolha um livro ou capítulo válido para esta versão instalada." />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => openBookPicker()}>Escolher capítulo</Button>
          <Link href="/library" className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent">Abrir Biblioteca</Link>
        </div>
        <BookChapterPicker open={bookPickerOpen} books={books} selectedBookId={bookId || null} selectedChapter={chapter || null} initialView={pickerInitialView} onClose={() => setBookPickerOpen(false)} onSelectBook={selectBook} onSelectChapter={selectChapter} />
        <VersionPicker open={versionPickerOpen} versionId={versionId} installedVersions={installedVersions} availableVersions={availableVersions} loading={availableLoading} error={versionPickerError ?? installError} installingId={installingVersionId} progress={installProgress} onClose={() => setVersionPickerOpen(false)} onSelect={selectVersion} onInstall={installVersion} onCancel={cancelInstall} onRetry={openVersionPicker} />
      </div>
    );
  }

  return (
    <div data-testid="reader-screen" className="reader-screen min-h-[calc(100dvh-5.5rem)]">
      <ReaderToolbar bookName={book.name} chapter={chapter} versionName={versionName} previous={previous} next={next} width={readerWidth} displayOpen={displayOpen} onOpenBookPicker={() => openBookPicker()} onOpenChapterPicker={() => openBookPicker("chapters")} onOpenVersionPicker={openVersionPicker} onDisplayToggle={() => setDisplayOpen((open) => !open)} onWidthChange={setReaderWidth} />
      <div className="reader-content">
        <OfflineBanner />
        <header className="reader-heading">
          <p className="reader-version">{versionName}</p>
          <h1>{book.name} {chapter}</h1>
          <div className="reader-heading-rule" aria-hidden="true"><span>Capítulo {chapter}</span></div>
          <p className="reader-count">{verses.length} versículos</p>
        </header>
        <article className={`reader-copy reader-copy-${readerWidth}`}>
          {verses.map((verse) => <p key={verse.id}><sup>{verse.verse}</sup>{verse.text}</p>)}
        </article>
      </div>
      <BookChapterPicker open={bookPickerOpen} books={books} selectedBookId={bookId || null} selectedChapter={chapter || null} initialView={pickerInitialView} onClose={() => setBookPickerOpen(false)} onSelectBook={selectBook} onSelectChapter={selectChapter} />
      <VersionPicker open={versionPickerOpen} versionId={versionId} installedVersions={installedVersions} availableVersions={availableVersions} loading={availableLoading} error={versionPickerError ?? installError} installingId={installingVersionId} progress={installProgress} onClose={() => setVersionPickerOpen(false)} onSelect={selectVersion} onInstall={installVersion} onCancel={cancelInstall} onRetry={openVersionPicker} />
    </div>
  );
}
