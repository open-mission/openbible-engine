/**
 * Serializable contracts for openbible-engine
 * No Date/Map/Set, epoch ms for timestamps, plain records only.
 */

export interface BibleVersion {
  id: string;
  name: string;
  language?: string;
  totalBooks?: number;
}

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: "old" | "new";
  chapters: number;
}

export interface Verse {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleReference {
  bookId: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export interface InstalledBible {
  id: string;
  name: string;
  installedAt: number;
  versionCode: number;
}

export interface SearchRequest {
  versionId: string;
  query: string;
  limit: number;
}

export interface SearchResult {
  versionId: string;
  query: string;
  results: Verse[];
  total: number;
}

export type InstallationStage =
  | "receiving"
  | "validating_header"
  | "validating_schema"
  | "validating_identity"
  | "sanity_check"
  | "promoting"
  | "registering";

export interface InstallationProgress {
  versionId: string;
  stage: InstallationStage;
  receivedBytes?: number;
  totalBytes?: number;
}

/**
 * BookMeta is alias for BibleBook used by parser and book-meta.
 */
export type BookMeta = BibleBook;
