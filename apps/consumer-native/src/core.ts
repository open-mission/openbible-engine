import { Cmd, asciiBytes, utf8Bytes } from "@native-sdk/core";
import { type TextInputEvent, applyTextInputEvent, trimAsciiSpaces } from "@native-sdk/core/text";
import { scriptureLibraryInstallDownloaded, scriptureLibraryReadLibrary, scriptureLibraryResetDownload, scriptureLibraryStageDownloadChunk, scriptureLibraryUninstallVersion } from "@native-sdk/services";
import type { NativeDownloadChunkRequest, NativeDownloadResult, NativeLibraryRequest, NativeLibraryResult, NativeMutationResult, NativeVersionRequest } from "./shared.ts";

const DOWNLOAD_CHUNK_SIZE = 204800;
const ARA_PACKAGE_URL = "https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles/ARA.sqlite";
const NVI_PACKAGE_URL = "https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles/NVI.sqlite";

export interface VersionRow {
  readonly id: number;
  readonly name: Uint8Array;
  readonly installed: boolean;
}

export interface BookRow {
  readonly id: number;
  readonly name: Uint8Array;
  readonly chapters: number;
}

export interface VerseRow {
  readonly id: number;
  readonly reference: Uint8Array;
  readonly text: Uint8Array;
}

export interface SearchRow {
  readonly id: number;
  readonly reference: Uint8Array;
  readonly text: Uint8Array;
}

export interface ChapterRow {
  readonly id: number;
  readonly label: Uint8Array;
}

export type ActiveArea = "library" | "reader" | "search";
export type LoadState = "loading" | "ready" | "empty" | "failed";

export interface Model {
  readonly activeArea: ActiveArea;
  readonly loadState: LoadState;
  readonly statusText: Uint8Array;
  readonly errorText: Uint8Array;
  readonly query: Uint8Array;
  readonly querySelectionAnchor: number;
  readonly querySelectionFocus: number;
  readonly selectedVersion: number;
  readonly selectedBook: number;
  readonly selectedChapter: number;
  readonly selectedVersionLabel: Uint8Array;
  readonly selectedBookLabel: Uint8Array;
  readonly selectedChapterLabel: Uint8Array;
  readonly activeAreaLabel: Uint8Array;
  readonly chapterCount: number;
  readonly versionPickerOpen: boolean;
  readonly bookPickerOpen: boolean;
  readonly chapterPickerOpen: boolean;
  readonly versions: readonly VersionRow[];
  readonly books: readonly BookRow[];
  readonly chapters: readonly ChapterRow[];
  readonly verses: readonly VerseRow[];
  readonly searchResults: readonly SearchRow[];
  readonly showSearchResults: boolean;
  readonly downloadVersion: number;
  readonly downloadOffset: number;
  readonly downloadChunkFull: boolean;
  readonly downloadRetryable: boolean;
}

export type Msg =
  | { readonly kind: "show_library" }
  | { readonly kind: "show_reader" }
  | { readonly kind: "show_search" }
  | { readonly kind: "select_version"; readonly id: number }
  | { readonly kind: "select_book"; readonly id: number }
  | { readonly kind: "select_chapter"; readonly chapter: number }
  | { readonly kind: "toggle_version_picker" }
  | { readonly kind: "toggle_book_picker" }
  | { readonly kind: "toggle_chapter_picker" }
  | { readonly kind: "previous_chapter" }
  | { readonly kind: "next_chapter" }
  | { readonly kind: "install_version"; readonly id: number }
  | { readonly kind: "remove_version"; readonly id: number }
  | { readonly kind: "query_edit"; readonly edit: TextInputEvent }
  | { readonly kind: "search_submit" }
  | { readonly kind: "retry" }
  | { readonly kind: "library_read_succeeded"; readonly result: NativeLibraryResult }
  | { readonly kind: "library_read_failed"; readonly error: Uint8Array }
  | { readonly kind: "library_mutation_succeeded"; readonly result: NativeMutationResult }
  | { readonly kind: "library_mutation_failed"; readonly error: Uint8Array }
  | { readonly kind: "download_reset_succeeded"; readonly result: NativeDownloadResult }
  | { readonly kind: "download_chunk_received"; readonly status: number; readonly body: Uint8Array }
  | { readonly kind: "download_chunk_staged"; readonly result: NativeDownloadResult }
  | { readonly kind: "download_failed"; readonly error: Uint8Array }
  | { readonly kind: "download_cleanup_succeeded"; readonly result: NativeDownloadResult }
  | { readonly kind: "download_cleanup_failed"; readonly error: Uint8Array };

export const viewUnbound = [
  "querySelectionAnchor",
  "querySelectionFocus",
  "library_read_succeeded",
  "library_read_failed",
  "library_mutation_succeeded",
  "library_mutation_failed",
  "download_reset_succeeded",
  "download_chunk_received",
  "download_chunk_staged",
  "download_failed",
  "download_cleanup_succeeded",
  "download_cleanup_failed",
  "downloadVersion",
  "downloadOffset",
  "downloadChunkFull",
  "downloadRetryable",
] as const;

function initialVersions(): readonly VersionRow[] {
  return [
    { id: 1, name: utf8Bytes("ARA · Almeida Revista e Atualizada"), installed: false },
    { id: 2, name: utf8Bytes("NVI · Nova Versão Internacional"), installed: false },
  ];
}

function initialData(): Model {
  return {
    activeArea: "library",
    loadState: "loading",
    statusText: utf8Bytes("Verificando o armazenamento local…"),
    errorText: utf8Bytes(""),
    query: utf8Bytes(""),
    querySelectionAnchor: 0,
    querySelectionFocus: 0,
    selectedVersion: 1,
    selectedBook: 1,
    selectedChapter: 1,
    selectedVersionLabel: utf8Bytes("ARA · Almeida Revista e Atualizada"),
    selectedBookLabel: utf8Bytes("Gênesis"),
    selectedChapterLabel: utf8Bytes("Capítulo 1"),
    activeAreaLabel: utf8Bytes("Biblioteca"),
    chapterCount: 0,
    versionPickerOpen: false,
    bookPickerOpen: false,
    chapterPickerOpen: false,
    versions: initialVersions(),
    books: [],
    chapters: [],
    verses: [],
    searchResults: [],
    showSearchResults: false,
    downloadVersion: 1,
    downloadOffset: 0,
    downloadChunkFull: false,
    downloadRetryable: false,
  };
}

function versionIdFor(id: number): Uint8Array {
  return id === 1 ? asciiBytes("ara") : asciiBytes("nvi");
}

function bookIdFor(id: number): Uint8Array {
  if (id === 2) return asciiBytes("exo");
  if (id === 3) return asciiBytes("jhn");
  return asciiBytes("gen");
}

function versionLabelFor(id: number): Uint8Array {
  return id === 1 ? utf8Bytes("ARA · Almeida Revista e Atualizada") : utf8Bytes("NVI · Nova Versão Internacional");
}

function packageUrlFor(id: number): Uint8Array {
  return id === 1 ? asciiBytes(ARA_PACKAGE_URL) : asciiBytes(NVI_PACKAGE_URL);
}

function packageRangeFor(offset: number): Uint8Array {
  return asciiBytes(`bytes=${offset}-${offset + DOWNLOAD_CHUNK_SIZE - 1}`);
}

function bookLabelFor(id: number): Uint8Array {
  if (id === 2) return utf8Bytes("Êxodo");
  if (id === 3) return utf8Bytes("João");
  return utf8Bytes("Gênesis");
}

function chapterLabelFor(chapter: number): Uint8Array {
  return utf8Bytes(`Capítulo ${chapter}`);
}

function areaLabelFor(area: ActiveArea): Uint8Array {
  if (area === "reader") return utf8Bytes("Leitor");
  if (area === "search") return utf8Bytes("Busca");
  return utf8Bytes("Biblioteca");
}

function versionRequest(id: number): NativeVersionRequest {
  return { versionId: versionIdFor(id) };
}

function downloadFailureModel(model: Model, error: Uint8Array): Model {
  return {
    ...model,
    loadState: "failed" as const,
    statusText: utf8Bytes("Não foi possível baixar a versão do R2"),
    errorText: error,
    downloadRetryable: true,
  };
}

function libraryRequest(model: Model, query: Uint8Array): NativeLibraryRequest {
  return {
    versionId: versionIdFor(model.selectedVersion),
    bookId: bookIdFor(model.selectedBook),
    chapter: model.selectedChapter,
    query,
    limit: 5,
  };
}

function updateInstalledVersion(versions: readonly VersionRow[], id: number, installed: boolean): VersionRow[] {
  const result: VersionRow[] = [];
  for (const version of versions) {
    result.push(version.id === id ? { ...version, installed } : version);
  }
  return result;
}

function readNatural(bytes: Uint8Array, fallback: number): number {
  if (bytes.length === 0) return fallback;
  let value = 0;
  for (const byte of bytes) {
    if (byte < 48 || byte > 57) return fallback;
    value = value * 10 + byte - 48;
  }
  if (value >= 0 && value <= 9007199254740991) return Math.trunc(value);
  return fallback;
}

function toBookRows(rows: readonly NativeLibraryResult["books"][number][]): BookRow[] {
  const result: BookRow[] = [];
  for (const row of rows) {
    const id = readNatural(row.id, 0);
    const chapters = readNatural(row.chapters, 0);
    if (id >= 0 && id <= 9007199254740991 && chapters >= 0 && chapters <= 9007199254740991) {
      result.push({ id: Math.trunc(id), name: row.name, chapters: Math.trunc(chapters) });
    } else {
      result.push({ id: 0, name: row.name, chapters: 0 });
    }
  }
  return result;
}

function toVerseRows(rows: readonly NativeLibraryResult["verses"][number][]): VerseRow[] {
  const result: VerseRow[] = [];
  for (const row of rows) {
    const id = readNatural(row.id, 0);
    if (id >= 0 && id <= 9007199254740991) {
      result.push({ id: Math.trunc(id), reference: row.reference, text: row.text });
    } else {
      result.push({ id: 0, reference: row.reference, text: row.text });
    }
  }
  return result;
}

function toSearchRows(rows: readonly NativeLibraryResult["results"][number][]): SearchRow[] {
  const result: SearchRow[] = [];
  for (const row of rows) {
    const id = readNatural(row.id, 0);
    if (id >= 0 && id <= 9007199254740991) {
      result.push({ id: Math.trunc(id), reference: row.reference, text: row.text });
    } else {
      result.push({ id: 0, reference: row.reference, text: row.text });
    }
  }
  return result;
}

function toChapterRows(rows: readonly BookRow[], selectedBook: number): ChapterRow[] {
  let count = 0;
  for (const row of rows) if (row.id === selectedBook) count = row.chapters;
  const result: ChapterRow[] = [];
  for (let id = 1; id <= count; id += 1) result.push({ id: Math.trunc(id), label: chapterLabelFor(id) });
  return result;
}

export function initialModel(): [Model, Cmd<Msg>] {
  const model = initialData();
  return [
    model,
    scriptureLibraryReadLibrary({
      versionId: versionIdFor(model.selectedVersion),
      bookId: bookIdFor(model.selectedBook),
      chapter: model.selectedChapter,
      query: asciiBytes(""),
      limit: 5,
    }, {
      key: "library-read",
      ok: "library_read_succeeded",
      err: "library_read_failed",
    }),
  ];
}

export function update(model: Model, msg: Msg): Model | [Model, Cmd<Msg>] {
  switch (msg.kind) {
    case "show_library":
      return { ...model, activeArea: "library", activeAreaLabel: areaLabelFor("library"), versionPickerOpen: false, bookPickerOpen: false, chapterPickerOpen: false };
    case "show_reader": {
      const next: Model = { ...model, activeArea: "reader", activeAreaLabel: areaLabelFor("reader"), loadState: "loading", statusText: utf8Bytes("Abrindo a versão local…"), versionPickerOpen: false, bookPickerOpen: false, chapterPickerOpen: false };
      return [
        next,
        scriptureLibraryReadLibrary(libraryRequest(next, asciiBytes("")), {
          key: "library-read",
          ok: "library_read_succeeded",
          err: "library_read_failed",
        }),
      ];
    }
    case "show_search":
      return { ...model, activeArea: "search", activeAreaLabel: areaLabelFor("search"), versionPickerOpen: false, bookPickerOpen: false, chapterPickerOpen: false };
     case "select_version":
       if (msg.id !== 1 && msg.id !== 2) return { ...model, statusText: utf8Bytes("Esta versão ainda não está disponível neste consumer.") };
      return [
        { ...model, selectedVersion: msg.id, selectedVersionLabel: versionLabelFor(msg.id), versionPickerOpen: false, activeArea: "reader", activeAreaLabel: areaLabelFor("reader"), loadState: "loading" },
        scriptureLibraryReadLibrary(libraryRequest({ ...model, selectedVersion: msg.id }, asciiBytes("")), {
          key: "library-read",
          ok: "library_read_succeeded",
          err: "library_read_failed",
        }),
      ];
    case "select_book": {
      const bookId = Math.trunc(msg.id);
      let available = false;
      for (const book of model.books) if (book.id === bookId) available = true;
      if (msg.id !== bookId || !available) return { ...model, statusText: utf8Bytes("Livro inválido") };
      const next: Model = { ...model, selectedBook: bookId, selectedBookLabel: bookLabelFor(bookId), selectedChapter: 1, selectedChapterLabel: chapterLabelFor(1), bookPickerOpen: false, chapterPickerOpen: false, loadState: "loading" };
      return [next, scriptureLibraryReadLibrary(libraryRequest(next, asciiBytes("")), {
        key: "library-read",
        ok: "library_read_succeeded",
        err: "library_read_failed",
      })];
    }
    case "select_chapter": {
      const chapter = Math.trunc(msg.chapter);
      let available = false;
      for (const item of model.chapters) if (item.id === chapter) available = true;
      if (msg.chapter !== chapter || !available) return { ...model, statusText: utf8Bytes("Capítulo inválido") };
      const next: Model = { ...model, selectedChapter: chapter, selectedChapterLabel: chapterLabelFor(chapter), chapterPickerOpen: false, loadState: "loading" };
      return [next, scriptureLibraryReadLibrary(libraryRequest(next, asciiBytes("")), {
        key: "library-read",
        ok: "library_read_succeeded",
        err: "library_read_failed",
      })];
    }
     case "install_version": {
       if (msg.id !== 1 && msg.id !== 2) return { ...model, statusText: utf8Bytes("Esta versão ainda não está disponível neste consumer.") };
       const next: Model = {
         ...model,
         activeArea: "library",
         selectedVersion: msg.id,
         selectedVersionLabel: versionLabelFor(msg.id),
         loadState: "loading",
         statusText: utf8Bytes("Preparando o download do R2…"),
         errorText: utf8Bytes(""),
         downloadVersion: msg.id,
         downloadOffset: 0,
         downloadChunkFull: false,
         downloadRetryable: false,
       };
       return [next, scriptureLibraryResetDownload(versionRequest(next.downloadVersion), {
         key: "download-reset",
         ok: "download_reset_succeeded",
         err: "download_failed",
       })];
     }
     case "remove_version":
       if (msg.id !== 1 && msg.id !== 2) return { ...model, statusText: utf8Bytes("Esta versão não está instalada neste consumer.") };
       return [
          { ...model, activeArea: "library", loadState: "loading", statusText: utf8Bytes("Removendo a versão local…"), errorText: utf8Bytes("") },
         scriptureLibraryUninstallVersion(versionRequest(msg.id), {
          key: "library-remove",
          ok: "library_mutation_succeeded",
          err: "library_mutation_failed",
        }),
      ];
    case "toggle_version_picker":
      return { ...model, versionPickerOpen: !model.versionPickerOpen, bookPickerOpen: false, chapterPickerOpen: false };
    case "toggle_book_picker":
      return { ...model, versionPickerOpen: false, bookPickerOpen: !model.bookPickerOpen, chapterPickerOpen: false };
    case "toggle_chapter_picker":
      return { ...model, versionPickerOpen: false, bookPickerOpen: false, chapterPickerOpen: !model.chapterPickerOpen };
    case "previous_chapter":
      if (model.selectedChapter > 1 && model.selectedChapter <= 150) {
        const chapter = Math.trunc(model.selectedChapter - 1);
        if (chapter >= 1 && chapter <= 150) return update(model, { kind: "select_chapter", chapter });
      }
      return model;
    case "next_chapter":
      if (model.selectedChapter >= 1 && model.selectedChapter < model.chapters.length && model.selectedChapter < 150) {
        const chapter = Math.trunc(model.selectedChapter + 1);
        if (chapter >= 1 && chapter <= 150) return update(model, { kind: "select_chapter", chapter });
      }
      return model;
    case "query_edit": {
      const next = applyTextInputEvent(
        {
          text: model.query,
          selection: { anchor: model.querySelectionAnchor, focus: model.querySelectionFocus },
          composition: null,
        },
        msg.edit,
        256,
      );
      if (next === null) return model;
      return {
        ...model,
        query: next.text,
        querySelectionAnchor: next.selection.anchor,
        querySelectionFocus: next.selection.focus,
      };
    }
    case "search_submit":
      return trimAsciiSpaces(model.query).length === 0
        ? { ...model, activeArea: "search", activeAreaLabel: areaLabelFor("search"), statusText: utf8Bytes("Digite um termo para pesquisar."), showSearchResults: false }
        : [
          { ...model, activeArea: "search", activeAreaLabel: areaLabelFor("search"), loadState: "loading", statusText: utf8Bytes("Pesquisando na biblioteca local…"), showSearchResults: false },
        scriptureLibraryReadLibrary(libraryRequest(model, trimAsciiSpaces(model.query)), {
            key: "library-search",
            ok: "library_read_succeeded",
            err: "library_read_failed",
          }),
        ];
     case "retry":
       if (model.downloadRetryable) {
         const next: Model = {
           ...model,
           loadState: "loading",
           statusText: utf8Bytes("Tentando baixar novamente…"),
           errorText: utf8Bytes(""),
           downloadOffset: 0,
           downloadChunkFull: false,
           downloadRetryable: false,
         };
           return [next, scriptureLibraryResetDownload(versionRequest(next.downloadVersion), {
             key: "download-reset",
             ok: "download_reset_succeeded",
             err: "download_failed",
           })];
       }
       return [
        { ...model, loadState: "loading", statusText: utf8Bytes("Tentando novamente…"), errorText: utf8Bytes("") },
        scriptureLibraryReadLibrary(libraryRequest(model, asciiBytes("")), {
          key: "library-read",
          ok: "library_read_succeeded",
          err: "library_read_failed",
        }),
      ];
     case "library_read_succeeded":
      {
      const books = toBookRows(msg.result.books);
      const noSearchResults = model.activeArea === "search" && trimAsciiSpaces(model.query).length > 0 && msg.result.total === 0;
      const chapters = toChapterRows(books, model.selectedBook);
      const chapterCount = chapters.length;
      return {
        ...model,
        loadState: msg.result.installed && !noSearchResults ? "ready" : "empty",
        statusText: !msg.result.installed ? utf8Bytes("Nenhuma biblioteca instalada ainda") : noSearchResults ? utf8Bytes("Nenhum resultado encontrado") : utf8Bytes("Biblioteca local disponível"),
         versions: updateInstalledVersion(model.versions, model.selectedVersion, msg.result.installed),
        books,
        chapters,
        chapterCount: chapterCount >= 0 && chapterCount <= 150 ? Math.trunc(chapterCount) : 0,
        verses: toVerseRows(msg.result.verses),
        searchResults: toSearchRows(msg.result.results),
         showSearchResults: msg.result.total > 0,
         downloadRetryable: false,
       };
      }
    case "library_read_failed":
      return {
        ...model,
        loadState: "failed",
        statusText: utf8Bytes("Não foi possível ler a biblioteca local"),
        errorText: msg.error,
      };
     case "library_mutation_succeeded":
       return [
         { ...model, loadState: "loading", statusText: msg.result.installed ? utf8Bytes("Versão instalada. Atualizando a biblioteca…") : utf8Bytes("Versão removida. Atualizando a biblioteca…"), downloadRetryable: false },
        scriptureLibraryReadLibrary(libraryRequest(model, asciiBytes("")), {
          key: "library-read",
          ok: "library_read_succeeded",
          err: "library_read_failed",
        }),
      ];
    case "library_mutation_failed":
      return {
        ...model,
        loadState: "failed",
        statusText: utf8Bytes("Não foi possível alterar a biblioteca local"),
         errorText: msg.error,
       };
      case "download_reset_succeeded":
        return [
          { ...model, statusText: utf8Bytes("Baixando a versão do R2…") },
          Cmd.fetch({
            url: packageUrlFor(model.downloadVersion),
            method: "GET",
            headers: {
              Range: packageRangeFor(model.downloadOffset),
              Accept: "application/octet-stream",
            },
            timeoutMs: 30000,
          }, {
            key: "download-fetch",
            ok: "download_chunk_received",
            err: "download_failed",
          }),
        ];
     case "download_chunk_received": {
        const status = msg.status;
        const bytes = msg.body;
        if (status === 416 && model.downloadOffset > 0 && model.downloadChunkFull) {
         return [
           { ...model, statusText: utf8Bytes("Validando a versão baixada…") },
           scriptureLibraryInstallDownloaded(versionRequest(model.downloadVersion), {
             key: "download-install",
             ok: "library_mutation_succeeded",
             err: "library_mutation_failed",
           }),
         ];
       }
        if (status !== 200 && status !== 206) {
          const failed = downloadFailureModel(model, utf8Bytes("O R2 retornou um bloco de pacote inválido"));
          return [failed, scriptureLibraryResetDownload(versionRequest(failed.downloadVersion), {
            key: "download-cleanup",
            ok: "download_cleanup_succeeded",
            err: "download_cleanup_failed",
          })];
        }
        if (bytes.length < 1 || bytes.length > DOWNLOAD_CHUNK_SIZE) {
          const failed = downloadFailureModel(model, utf8Bytes("O R2 retornou um bloco de pacote inválido"));
          return [failed, scriptureLibraryResetDownload(versionRequest(failed.downloadVersion), {
            key: "download-cleanup",
            ok: "download_cleanup_succeeded",
            err: "download_cleanup_failed",
          })];
        }
        const next: Model = {
          ...model,
          downloadChunkFull: bytes.length === DOWNLOAD_CHUNK_SIZE,
          statusText: utf8Bytes("Baixando a versão do R2…"),
       };
       const chunk: NativeDownloadChunkRequest = {
         versionId: versionRequest(model.downloadVersion).versionId,
         offset: model.downloadOffset,
         bytes,
       };
       return [next, scriptureLibraryStageDownloadChunk(chunk, {
         key: "download-stage",
         ok: "download_chunk_staged",
         err: "download_failed",
       })];
     }
     case "download_chunk_staged": {
       const received = msg.result.received;
        const expected = model.downloadOffset;
        if (received <= expected) {
          const failed = downloadFailureModel(model, utf8Bytes("O staging do pacote ficou fora de ordem"));
          return [failed, scriptureLibraryResetDownload(versionRequest(failed.downloadVersion), {
            key: "download-cleanup",
            ok: "download_cleanup_succeeded",
            err: "download_cleanup_failed",
          })];
        }
       if (!model.downloadChunkFull) {
         return [
           { ...model, downloadOffset: received, statusText: utf8Bytes("Validando a versão baixada…") },
           scriptureLibraryInstallDownloaded(versionRequest(model.downloadVersion), {
             key: "download-install",
             ok: "library_mutation_succeeded",
             err: "library_mutation_failed",
           }),
         ];
       }
       const next: Model = {
         ...model,
         downloadOffset: received,
         statusText: utf8Bytes(`Baixando a versão do R2… ${Math.trunc(received / 1024)} KiB`),
       };
       return [next, Cmd.fetch({
         url: packageUrlFor(next.downloadVersion),
         method: "GET",
         headers: {
           Range: packageRangeFor(next.downloadOffset),
           Accept: "application/octet-stream",
         },
         timeoutMs: 30000,
       }, {
         key: "download-fetch",
         ok: "download_chunk_received",
         err: "download_failed",
       })];
     }
     case "download_failed":
       {
         const failed = downloadFailureModel(model, msg.error);
         return [failed, scriptureLibraryResetDownload(versionRequest(failed.downloadVersion), {
           key: "download-cleanup",
           ok: "download_cleanup_succeeded",
           err: "download_cleanup_failed",
         })];
       }
     case "download_cleanup_succeeded":
     case "download_cleanup_failed":
       return model;
   }
}
