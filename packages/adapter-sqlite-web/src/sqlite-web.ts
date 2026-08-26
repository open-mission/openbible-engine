import { EngineError } from "@openbible/engine-core";
import type { BibleBook, Verse, SearchResult } from "@openbible/engine-core";
import type { BibleLibrary } from "@openbible/engine";

/**
 * Web/OPFS adapter boundary — a PLANNED SLICE, not a functional adapter.
 *
 * This type is intentionally NOT implemented against an in-memory Map (that
 * requirement belongs to fakes in `@openbible/engine-testing`). A real
 * integration requires a browser execution environment with:
 *   - a Web Worker;
 *   - SQLite compiled to WASM;
 *   - an OPFS/SAHPool (or equivalent origin-private virtual filesystem) VFS.
 *
 * Until those are present and verified in a real browser, every operation
 * fails deterministically with `storage_unavailable` and the adapter must not
 * be reported as concluded.
 */
export class SqliteWebLibrary implements BibleLibrary {
  readonly isWebSlice = true as const;

  private fail(): never {
    throw new EngineError(
      "storage_unavailable",
      "Web/OPFS SQLite adapter is a planned slice: requires Worker + SQLite WASM + OPFS/SAHPool browser integration. Not implemented in this slice.",
    );
  }

  async getBooks(_versionId: string): Promise<BibleBook[]> {
    return this.fail();
  }
  async getChapter(_versionId: string, _bookId: string, _chapter: number): Promise<Verse[]> {
    return this.fail();
  }
  async search(_versionId: string, _query: string, _limit: number): Promise<SearchResult> {
    return this.fail();
  }
  async getVersionName(_versionId: string): Promise<string | null> {
    return this.fail();
  }
}

/** Alias kept for consumers that referenced the old name. */
export const WebBibleLibrary = SqliteWebLibrary;
