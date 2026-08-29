import {
  EngineError,
  isEngineError,
  type BibleBook,
  type BibleEngine,
  type BibleReference,
  type BibleVersion,
  type CancellationToken,
  type InstallationObserver,
  type InstalledBible,
  type SearchResult,
  type Verse,
} from "@openbible/engine";

export class ScriptureLibraryService {
  constructor(private readonly engine: BibleEngine & { close?(): void }) {}

  listAvailableVersions(): Promise<BibleVersion[]> {
    return this.engine.listAvailableVersions();
  }

  listInstalledVersions(): Promise<InstalledBible[]> {
    return this.engine.listInstalledVersions();
  }

  installVersion(
    versionId: string,
    name?: string,
    token?: CancellationToken,
    observer?: InstallationObserver,
  ): Promise<void> {
    return this.engine.installVersion({ versionId, name, token }, observer);
  }

  uninstallVersion(versionId: string): Promise<void> {
    return this.engine.uninstallVersion(versionId);
  }

  getBooks(versionId: string): Promise<BibleBook[]> {
    return this.engine.getBooks(versionId);
  }

  getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    return this.engine.getChapter({ versionId, bookId, chapter });
  }

  searchVerses(versionId: string, query: string, limit: number): Promise<SearchResult> {
    if (!query.trim()) return Promise.resolve({ versionId, query, results: [], total: 0 });
    return this.engine.searchVerses({ versionId, query, limit });
  }

  parseReference(query: string, books: BibleBook[]): BibleReference | null {
    return this.engine.parseReference({ query, books });
  }

  close(): void {
    this.engine.close?.();
  }
}

export function libraryErrorMessage(error: unknown): string {
  if (isEngineError(error)) {
    const messages: Partial<Record<EngineError["code"], string>> = {
      network_unavailable: "A origem remota está indisponível.",
      invalid_package: "O pacote recebido não é uma Bíblia válida.",
      unsupported_schema: "O pacote usa um schema não suportado.",
      cancelled: "A operação foi cancelada.",
      version_not_installed: "A versão selecionada não está instalada.",
      storage_unavailable: "O armazenamento local está indisponível.",
      invalid_reference: "A referência informada não é válida.",
    };
    return messages[error.code] ?? "A operação não pôde ser concluída.";
  }
  return "A operação não pôde ser concluída.";
}
