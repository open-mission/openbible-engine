import type { BibleBook, SearchResult, Verse } from "@openbible/engine-core";
import type { BibleLibrary } from "@openbible/engine";
import { InMemoryWebLibrary } from "./in-memory.js";

/**
 * SqliteWebLibrary - wrapper that would use OPFS/Worker in future,
 * but for now delegates to InMemoryWebLibrary.
 * Keeps separate class for web boundary.
 */
export class SqliteWebLibrary implements BibleLibrary {
  private delegate: InMemoryWebLibrary;

  constructor(delegate?: InMemoryWebLibrary) {
    this.delegate = delegate ?? new InMemoryWebLibrary();
  }

  // Expose underlying for advanced usage
  getDelegate(): InMemoryWebLibrary {
    return this.delegate;
  }

  async install(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.delegate.install(versionId, bytes);
  }

  async installPackage(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.delegate.installPackage(versionId, bytes);
  }

  async save(versionId: string, bytes: Uint8Array): Promise<void> {
    return this.delegate.save(versionId, bytes);
  }

  async validatePackage(bytes: Uint8Array): Promise<{ valid: boolean; versionId?: string }> {
    return this.delegate.validatePackage(bytes);
  }

  async getVersionName(versionId: string): Promise<string | null> {
    return this.delegate.getVersionName(versionId);
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    return this.delegate.getBooks(versionId);
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    return this.delegate.getChapter(versionId, bookId, chapter);
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    return this.delegate.search(versionId, query, limit);
  }

  async uninstall(versionId: string): Promise<void> {
    return this.delegate.uninstall(versionId);
  }
  async remove(versionId: string): Promise<void> {
    return this.delegate.remove(versionId);
  }
  async delete(versionId: string): Promise<void> {
    return this.delegate.delete(versionId);
  }
}

// Alias for convenience
export const WebBibleLibrary = SqliteWebLibrary;
