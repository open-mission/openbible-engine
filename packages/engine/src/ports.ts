import type {
  BibleBook,
  BibleVersion,
  InstalledBible,
  Verse,
  SearchResult,
  InstallationProgress,
  CancellationToken,
} from "@openbible/engine-core";

/**
 * Read-only access to bible data for installed versions.
 *
 * This port deliberately contains NO write/install/save/uninstall surface and
 * NO knowledge of SQLite, bytes, header or schema. Implementations open the
 * underlying storage read-only; the engine never interprets storage format.
 */
export interface BibleLibrary {
  getBooks(versionId: string): Promise<BibleBook[]>;
  getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]>;
  search(versionId: string, query: string, limit: number): Promise<SearchResult>;
  getVersionName(versionId: string): Promise<string | null>;
}

/**
 * Registry of installed bible versions. Implementations decide persistence
 * (in-memory fake, or a real SQLite table). Reads only.
 */
export interface InstalledBibleRegistry {
  list(): Promise<InstalledBible[]>;
  get(id: string): Promise<InstalledBible | null>;
  set(bible: InstalledBible): Promise<void>;
  remove(id: string): Promise<void>;
}

/**
 * Optional remote catalogue / download. Never required for local operations.
 */
export interface BiblePackageSource {
  listAvailable(): Promise<BibleVersion[]>;
  fetchPackage(
    versionId: string,
    token?: CancellationToken,
    observer?: InstallationObserver,
  ): Promise<Uint8Array>;
}

export interface Clock {
  now(): number;
}

export interface InstallationObserver {
  onProgress(progress: InstallationProgress): void;
}

/**
 * Input to {@link BibleInstaller.install}. The engine normalizes id and
 * resolves bytes before delegating; the installer owns validation + commit.
 */
export interface InstallPackageInput {
  /** Normalized version id (no path traversal, kebab). */
  versionId: string;
  /** Opaque package bytes. The installer interprets the storage format. */
  bytes: Uint8Array;
  name?: string;
  installedAt: number;
  versionCode: number;
  token?: CancellationToken;
}

/**
 * Single owner of the install/uninstall lifecycle.
 *
 * It is the ONLY writer of both the bible storage and the installed registry,
 * so atomicity is expressible and verifiable:
 *   stage → validate → commit → rollback/cleanup
 *
 * Guarantees the engine relies on (verified in tests):
 * - a failed install leaves no partial data;
 * - a previous version stays usable after a failed reinstall;
 * - temporary files are removed after any failure;
 * - registry and storage never diverge.
 */
export interface BibleInstaller {
  install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible>;
  uninstall(versionId: string): Promise<void>;
  /** Consistency probe: true when both storage and registry agree. */
  isInstalled(versionId: string): Promise<boolean>;
}
