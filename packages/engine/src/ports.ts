import type {
  BibleBook,
  BibleVersion,
  InstalledBible,
  Verse,
  SearchResult,
  InstallationProgress,
} from "@openbible/engine-core";

/**
 * Read-only access to bible data for installed versions.
 * No SQL, no FS inside engine – implementations decide storage.
 */
export interface BibleLibrary {
  getBooks(versionId: string): Promise<BibleBook[]>;
  getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]>;
  search(versionId: string, query: string, limit: number): Promise<SearchResult>;
  getVersionName?(versionId: string): Promise<string | null> | string | null;
  validatePackage?(
    bytes: Uint8Array,
  ): { valid: boolean; versionId?: string } | Promise<{ valid: boolean; versionId?: string }>;

  // Optional promotion hooks used by installVersion if the concrete
  // library supports in-memory or persistent package storage.
  // Engine will call one of these if present, otherwise validation-only.
  install?(versionId: string, bytes: Uint8Array): Promise<void>;
  installPackage?(versionId: string, bytes: Uint8Array): Promise<void>;
  save?(versionId: string, bytes: Uint8Array): Promise<void>;
}

export interface InstalledBibleRegistry {
  list(): Promise<InstalledBible[]>;
  get(id: string): Promise<InstalledBible | null>;
  set(bible: InstalledBible): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface BiblePackageSource {
  listAvailable(): Promise<BibleVersion[]>;
  fetchPackage(
    versionId: string,
    signal?: AbortSignal,
    observer?: InstallationObserver,
  ): Promise<Uint8Array>;
}

export interface Clock {
  now(): number;
}

export interface InstallationObserver {
  onProgress(progress: InstallationProgress): void;
}
