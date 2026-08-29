import { EngineError, normalizeBookId, normalizeVersionId } from "@openbible/engine-core";
import type { BibleBook, SearchResult, Verse } from "@openbible/engine-core";
import type { BibleLibrary } from "@openbible/engine";
import { inspectLegacySqlite, type NativeParseError } from "./legacy-sqlite.js";
import { nativeBooks, nativeChapter, nativeSearch } from "./native-queries.js";
import type { NativeStorage } from "./storage.js";

export class NativeBibleLibrary implements BibleLibrary {
  private closed = false;

  constructor(private readonly storage: NativeStorage) {}

  closeVersion(_versionId: string): void {}

  close(): void {
    this.closed = true;
  }

  private read(versionId: string) {
    if (this.closed) throw new EngineError("storage_unavailable", "Native bible library is closed");
    const id = normalizeVersionId(versionId);
    try {
      return inspectLegacySqlite(this.storage.readFile(`bibles/${id}.db`), id);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && "message" in error) {
        const parseError = error as NativeParseError;
        throw new EngineError(parseError.code, parseError.message);
      }
      throw error;
    }
  }

  getBooksSync(versionId: string): BibleBook[] {
    return nativeBooks(this.read(versionId));
  }

  getChapterSync(versionId: string, bookId: string, chapter: number): Verse[] {
    return nativeChapter(this.read(versionId), normalizeBookId(bookId), chapter);
  }

  searchSync(versionId: string, query: string, limit: number): SearchResult {
    return nativeSearch(this.read(versionId), versionId, query, limit);
  }

  getVersionNameSync(versionId: string): string | null {
    return this.read(versionId).name;
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    return this.getBooksSync(versionId);
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    return this.getChapterSync(versionId, bookId, chapter);
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    return this.searchSync(versionId, query, limit);
  }

  async getVersionName(versionId: string): Promise<string | null> {
    return this.getVersionNameSync(versionId);
  }
}
