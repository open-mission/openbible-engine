/** Records crossing the synchronous Native service boundary. */
export interface StorageProbeRequest {
  readonly path: Uint8Array;
}

export interface StorageProbeResult {
  readonly exists: boolean;
  readonly bytes: Uint8Array;
}

export interface NativeLibraryRequest {
  readonly versionId: Uint8Array;
  readonly bookId: Uint8Array;
  readonly chapter: number;
  readonly query: Uint8Array;
  readonly limit: number;
}

export interface NativeBookResult {
  readonly id: Uint8Array;
  readonly name: Uint8Array;
  readonly chapters: Uint8Array;
}

export interface NativeVerseResult {
  readonly id: Uint8Array;
  readonly bookId: Uint8Array;
  readonly reference: Uint8Array;
  readonly chapter: Uint8Array;
  readonly verse: Uint8Array;
  readonly text: Uint8Array;
}

export interface NativeLibraryResult {
  readonly installed: boolean;
  readonly books: readonly NativeBookResult[];
  readonly verses: readonly NativeVerseResult[];
  readonly results: readonly NativeVerseResult[];
  readonly total: number;
}

export interface NativeVersionRequest {
  readonly versionId: Uint8Array;
}

export interface NativeMutationResult {
  readonly versionId: Uint8Array;
  readonly installed: boolean;
}

export interface NativeDownloadChunkRequest {
  readonly versionId: Uint8Array;
  readonly offset: number;
  readonly bytes: Uint8Array;
}

export interface NativeDownloadResult {
  readonly received: number;
}
