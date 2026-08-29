import { inspectLegacySqlite } from "./legacy-sqlite.js";
import { nativeBooks, nativeChapter, nativeSearch, type NativeVerse } from "./native-queries.js";
import type { NativeBook } from "./native-book-meta.js";
import { encodeNativeRegistry, readNativeRegistry, REGISTRY_PATH, REGISTRY_TMP_PATH, type NativeRegistryEntry } from "./native-registry-data.js";
import type { NativeStorage } from "./storage.js";

export type { NativeStorage } from "./storage.js";

export interface NativeServiceReadRequest {
  readonly versionId: string;
  readonly bookId: string;
  readonly chapter: number;
  readonly query: string;
  readonly limit: number;
}

export interface NativeServiceReadResult {
  readonly installed: boolean;
  readonly books: NativeServiceBook[];
  readonly verses: NativeServiceVerse[];
  readonly results: NativeServiceVerse[];
  readonly total: number;
}

export interface NativeServiceBook {
  readonly id: number;
  readonly name: Uint8Array;
  readonly chapters: number;
}

export interface NativeServiceVerse {
  readonly id: number;
  readonly bookId: Uint8Array;
  readonly reference: Uint8Array;
  readonly chapter: number;
  readonly verse: number;
  readonly text: Uint8Array;
}

export interface NativePackageInstallRequest {
  readonly versionId: string;
  readonly bytes: Uint8Array;
  readonly name: string;
  readonly installedAt: number;
  readonly versionCode: number;
}

export interface NativeMutationResult {
  readonly versionId: string;
  readonly installed: boolean;
}

export interface NativeDownloadResult {
  readonly received: number;
}

export interface NativePackageDownloadInstallRequest {
  readonly versionId: string;
  readonly name: string;
  readonly installedAt: number;
  readonly versionCode: number;
}

const MAX_DOWNLOAD_CHUNK_BYTES = 204800;

function downloadPartPath(versionId: string): string {
  return `downloads/${versionId}.sqlite.part`;
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void }} storage
 * @param {string} versionId
 * @returns {{ received: number }}
 */
export function resetNativePackageDownload(storage: NativeStorage, versionId: string): NativeDownloadResult {
  if (!isSafeVersionId(versionId)) throw { kind: "invalid_package", message: "Invalid Scripture version" };
  storage.remove(downloadPartPath(versionId));
  return { received: 0 };
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void }} storage
 * @param {string} versionId
 * @param {number} offset
 * @param {Uint8Array} bytes
 * @returns {{ received: number }}
 */
export function stageNativePackageDownloadChunk(
  storage: NativeStorage,
  versionId: string,
  offset: number,
  bytes: Uint8Array,
): NativeDownloadResult {
  if (!isSafeVersionId(versionId)) throw { kind: "invalid_package", message: "Invalid Scripture version" };
  if (offset < 0 || Math.trunc(offset) !== offset || bytes.length === 0 || bytes.length > MAX_DOWNLOAD_CHUNK_BYTES) {
    throw { kind: "invalid_package", message: "Invalid Scripture package chunk" };
  }
  const path = downloadPartPath(versionId);
  const current = storage.exists(path) ? storage.readFile(path) : new Uint8Array(0);
  if (current.length !== offset) throw { kind: "storage_busy", message: "Scripture package chunks arrived out of order" };
  if (offset === 0) storage.writeFile(path, bytes);
  else {
    const next = new Uint8Array(current.length + bytes.length);
    next.set(current);
    next.set(bytes, current.length);
    storage.writeFile(path, next);
  }
  return { received: offset + bytes.length };
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void }} storage
 * @param {{ versionId: string, name: string, installedAt: number, versionCode: number }} request
 * @returns {{ versionId: string, installed: boolean }}
 */
export function installNativePackageDownload(
  storage: NativeStorage,
  request: NativePackageDownloadInstallRequest,
): NativeMutationResult {
  if (!isSafeVersionId(request.versionId)) throw { kind: "invalid_package", message: "Invalid Scripture version" };
  const path = downloadPartPath(request.versionId);
  if (!storage.exists(path)) throw { kind: "not_available", message: "Scripture package download is incomplete" };
  try {
    const result = installNativePackage(storage, {
      versionId: request.versionId,
      bytes: storage.readFile(path),
      name: request.name,
      installedAt: request.installedAt,
      versionCode: request.versionCode,
    });
    storage.remove(path);
    return result;
  } catch (error) {
    try { storage.remove(path); } catch { /* Cleanup is best effort after installer rollback. */ }
    throw error;
  }
}

function isSafeVersionId(value: string): boolean {
  if (value.length === 0 || value.includes("/") || value.includes("\\") || value.includes("..") || value.includes("%")) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (!((code >= 48 && code <= 57) || (code >= 97 && code <= 122) || code === 45)) return false;
  }
  return true;
}

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function encodeBooks(books: readonly NativeBook[]): NativeServiceBook[] {
  /** @type {{ id: number, name: Uint8Array, chapters: number }[]} */
  const result: NativeServiceBook[] = [];
  let index = 0;
  for (const book of books) {
    result.push({ id: index + 1, name: text(book.name), chapters: book.chapters });
    index += 1;
  }
  return result;
}

function encodeVerses(verses: readonly NativeVerse[]): NativeServiceVerse[] {
  /** @type {{ id: number, bookId: Uint8Array, reference: Uint8Array, chapter: number, verse: number, text: Uint8Array }[]} */
  const result: NativeServiceVerse[] = [];
  let index = 0;
  for (const verse of verses) {
    result.push({
      id: index + 1,
      bookId: text(verse.bookId),
      reference: text(`${verse.bookId} ${verse.chapter}:${verse.verse}`),
      chapter: verse.chapter,
      verse: verse.verse,
      text: text(verse.text),
    });
    index += 1;
  }
  return result;
}

function writeRegistry(storage: NativeStorage, entries: readonly NativeRegistryEntry[]): void {
  storage.writeFile(REGISTRY_TMP_PATH, encodeNativeRegistry(entries));
  storage.rename(REGISTRY_TMP_PATH, REGISTRY_PATH);
}

function restoreFile(storage: NativeStorage, path: string, bytes: Uint8Array): void {
  try {
    storage.writeFile(path, bytes);
  } catch {
    // Preserve the original operation error when rollback storage is unavailable.
  }
}

function removeFile(storage: NativeStorage, path: string): void {
  try {
    storage.remove(path);
  } catch {
    // Cleanup is best effort after the primary rollback.
  }
}

function restoreRegistry(storage: NativeStorage, bytes: Uint8Array | null): void {
  if (bytes === null) removeFile(storage, REGISTRY_PATH);
  else restoreFile(storage, REGISTRY_PATH, bytes);
  removeFile(storage, REGISTRY_TMP_PATH);
}

function replaceRegistryEntry(
  entries: readonly NativeRegistryEntry[],
  versionId: string,
  replacement: NativeRegistryEntry,
): NativeRegistryEntry[] {
  /** @type {{ id: string, name: string, installedAt: number, versionCode: number }[]} */
  const result: NativeRegistryEntry[] = [];
  let replaced = false;
  for (const entry of entries) {
    if (entry.id === versionId) {
      result.push(replacement);
      replaced = true;
    } else {
      result.push(entry);
    }
  }
  if (!replaced) result.push(replacement);
  return result;
}

function removeRegistryEntry(entries: readonly NativeRegistryEntry[], versionId: string): NativeRegistryEntry[] {
  const result: NativeRegistryEntry[] = [];
  for (const entry of entries) if (entry.id !== versionId) result.push(entry);
  return result;
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array }} storage
 * @param {{ versionId: string, bookId: string, chapter: number, query: string, limit: number }} request
 * @returns {{ installed: boolean, books: { id: number, name: Uint8Array, chapters: number }[], verses: { id: number, bookId: Uint8Array, reference: Uint8Array, chapter: number, verse: number, text: Uint8Array }[], results: { id: number, bookId: Uint8Array, reference: Uint8Array, chapter: number, verse: number, text: Uint8Array }[], total: number }}
 */
export function readNativeLibrary(storage: NativeStorage, request: NativeServiceReadRequest): NativeServiceReadResult {
  if (!isSafeVersionId(request.versionId)) throw { kind: "storage_unavailable", message: "Invalid Scripture version" };
  const versionId = request.versionId;
  const installed = readNativeRegistry(storage).some((entry) => entry.id === versionId) && storage.exists(`bibles/${versionId}.db`);
  if (!installed) return { installed: false, books: [], verses: [], results: [], total: 0 };
  const data = inspectLegacySqlite(storage.readFile(`bibles/${versionId}.db`), versionId);
  const search = nativeSearch(data, versionId, request.query, request.limit);
  return {
    installed: true,
    books: encodeBooks(nativeBooks(data)),
    verses: encodeVerses(nativeChapter(data, request.bookId, request.chapter)),
    results: encodeVerses(search.results),
    total: search.total,
  };
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void }} storage
 * @param {{ versionId: string, bytes: Uint8Array, name: string, installedAt: number, versionCode: number }} request
 * @returns {{ versionId: string, installed: boolean }}
 */
export function installNativePackage(
  storage: NativeStorage,
  request: NativePackageInstallRequest,
): NativeMutationResult {
  if (!isSafeVersionId(request.versionId)) throw { kind: "invalid_package", message: "Invalid Scripture version" };
  inspectLegacySqlite(request.bytes, request.versionId);

  const final = `bibles/${request.versionId}.db`;
  const temporary = `bibles/${request.versionId}.db.tmp`;
  const backup = `bibles/${request.versionId}.db.bak`;
  const previousFinal = storage.exists(final) ? storage.readFile(final) : null;
  const previousBackup = storage.exists(backup) ? storage.readFile(backup) : null;
  const previousRegistry = storage.exists(REGISTRY_PATH) ? storage.readFile(REGISTRY_PATH) : null;
  const entries = readNativeRegistry(storage);

  try {
    storage.remove(temporary);
    storage.remove(backup);
    if (previousFinal !== null) storage.writeFile(backup, previousFinal);
    storage.writeFile(temporary, request.bytes);
    storage.rename(temporary, final);
    writeRegistry(storage, replaceRegistryEntry(entries, request.versionId, {
      id: request.versionId,
      name: request.name,
      installedAt: request.installedAt,
      versionCode: request.versionCode,
    }));
    storage.remove(backup);
    return { versionId: request.versionId, installed: true };
  } catch (error) {
    if (previousFinal === null) removeFile(storage, final);
    else restoreFile(storage, final, previousFinal);
    if (previousBackup === null) removeFile(storage, backup);
    else restoreFile(storage, backup, previousBackup);
    removeFile(storage, temporary);
    restoreRegistry(storage, previousRegistry);
    throw error;
  }
}

/**
 * @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void }} storage
 * @param {string} versionId
 * @returns {{ versionId: string, installed: boolean }}
 */
export function uninstallNativePackage(storage: NativeStorage, versionId: string): NativeMutationResult {
  if (!isSafeVersionId(versionId)) throw { kind: "invalid_package", message: "Invalid Scripture version" };

  const final = `bibles/${versionId}.db`;
  const backup = `bibles/${versionId}.db.bak`;
  const previousFinal = storage.exists(final) ? storage.readFile(final) : null;
  const previousBackup = storage.exists(backup) ? storage.readFile(backup) : null;
  const previousRegistry = storage.exists(REGISTRY_PATH) ? storage.readFile(REGISTRY_PATH) : null;
  const entries = readNativeRegistry(storage);

  try {
    storage.remove(backup);
    if (previousFinal !== null) storage.writeFile(backup, previousFinal);
    storage.remove(final);
    writeRegistry(storage, removeRegistryEntry(entries, versionId));
    storage.remove(backup);
    return { versionId, installed: false };
  } catch (error) {
    if (previousFinal === null) removeFile(storage, final);
    else restoreFile(storage, final, previousFinal);
    if (previousBackup === null) removeFile(storage, backup);
    else restoreFile(storage, backup, previousBackup);
    restoreRegistry(storage, previousRegistry);
    throw error;
  }
}
