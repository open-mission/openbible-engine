import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  installNativePackageDownload,
  readNativeLibrary,
  resetNativePackageDownload,
  stageNativePackageDownloadChunk,
  uninstallNativePackage,
} from "@openbible/adapter-sqlite-native";
import type {
  NativeDownloadChunkRequest,
  NativeDownloadResult,
  NativeLibraryRequest,
  NativeLibraryResult,
  NativeMutationResult,
  NativeVersionRequest,
  StorageProbeRequest,
  StorageProbeResult,
} from "../shared.ts";

interface NativeStorage {
  exists(path: string): boolean;
  readFile(path: string): Uint8Array;
  writeFile(path: string, bytes: Uint8Array): void;
  rename(from: string, to: string): void;
  remove(path: string): void;
  list(prefix: string): string[];
}

const NAMESPACE = "scripture-library";

function physicalPath(root: string, logicalPath: string): string {
  if (logicalPath.length === 0 || logicalPath.startsWith("/") || logicalPath.includes("\\") || logicalPath.includes("..")) {
    throw { kind: "storage_unavailable", message: "Invalid local storage path" };
  }
  return join(root, logicalPath);
}

function createNativeStorage(): NativeStorage {
  const root = join(process.cwd(), NAMESPACE);
  return {
    exists(path: string): boolean {
      return existsSync(physicalPath(root, path));
    },
    readFile(path: string): Uint8Array {
      return new Uint8Array(readFileSync(physicalPath(root, path)));
    },
    writeFile(path: string, bytes: Uint8Array): void {
      const target = physicalPath(root, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes);
    },
    rename(from: string, to: string): void {
      const target = physicalPath(root, to);
      mkdirSync(dirname(target), { recursive: true });
      renameSync(physicalPath(root, from), target);
    },
    remove(path: string): void {
      const target = physicalPath(root, path);
      if (existsSync(target)) rmSync(target);
    },
    list(prefix: string): string[] {
      const target = physicalPath(root, prefix);
      if (!existsSync(target)) return [];
      return readdirSync(target).map((name: string) => `${prefix}/${name}`) as string[];
    },
  };
}

function decode(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

function numberBytes(value: number): Uint8Array {
  return new TextEncoder().encode(`${value}`);
}

function encodeLibraryResult(result: ReturnType<typeof readNativeLibrary>): NativeLibraryResult {
  const books = result.books.map((book) => ({
    id: numberBytes(book.id),
    name: book.name,
    chapters: numberBytes(book.chapters),
  }));
  const encodeVerse = (verse: (typeof result.verses)[number]) => ({
    id: numberBytes(verse.id),
    bookId: verse.bookId,
    reference: verse.reference,
    chapter: numberBytes(verse.chapter),
    verse: numberBytes(verse.verse),
    text: verse.text,
  });
  return {
    installed: result.installed,
    books,
    verses: result.verses.map(encodeVerse),
    results: result.results.map(encodeVerse),
    total: result.total,
  };
}

function remoteVersion(request: NativeVersionRequest): string {
  const versionId = decode(request.versionId);
  if (versionId !== "ara" && versionId !== "nvi") {
    throw { kind: "not_available", message: "This consumer only downloads versions published in the R2 catalog" };
  }
  return versionId;
}

/**
 * Probes one app-local storage entry. Physical paths stay in the service and
 * are never part of the deterministic Model or the Native markup.
 */
export function inspectStorage(request: StorageProbeRequest): StorageProbeResult {
  const path = decode(request.path);
  if (path !== "registry.json") throw { kind: "storage_unavailable", message: "Invalid local storage request" };
  const storage = createNativeStorage();
  try {
    if (!storage.exists(path)) return { exists: false, bytes: new Uint8Array(0) };
    return { exists: true, bytes: storage.readFile(path) };
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to inspect local Scripture storage" };
  }
}

export function readLibrary(request: NativeLibraryRequest): NativeLibraryResult {
  const storage = createNativeStorage();
  try {
    const result = readNativeLibrary(storage, {
      versionId: decode(request.versionId),
      bookId: decode(request.bookId),
      chapter: request.chapter,
      query: decode(request.query),
      limit: request.limit,
    });
    return encodeLibraryResult(result);
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to read local Scripture storage" };
  }
}

export function resetDownload(request: NativeVersionRequest): NativeDownloadResult {
  const versionId = remoteVersion(request);
  try {
    return resetNativePackageDownload(createNativeStorage(), versionId);
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to prepare the Scripture package download" };
  }
}

export function stageDownloadChunk(request: NativeDownloadChunkRequest): NativeDownloadResult {
  const versionId = remoteVersion({ versionId: request.versionId });
  try {
    return stageNativePackageDownloadChunk(createNativeStorage(), versionId, request.offset, request.bytes);
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to stage the Scripture package" };
  }
}

export function installDownloaded(request: NativeVersionRequest): NativeMutationResult {
  const versionId = remoteVersion(request);
  try {
    const result = installNativePackageDownload(createNativeStorage(), {
      versionId,
      name: versionId === "ara" ? "ARA · Almeida Revista e Atualizada" : "NVI · Nova Versão Internacional",
      installedAt: 0,
      versionCode: 1,
    });
    return { versionId: request.versionId, installed: result.installed };
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to install the downloaded Scripture package" };
  }
}

export function uninstallVersion(request: NativeVersionRequest): NativeMutationResult {
  const versionId = remoteVersion(request);
  try {
    uninstallNativePackage(createNativeStorage(), versionId);
    return { versionId: request.versionId, installed: false };
  } catch {
    throw { kind: "storage_unavailable", message: "Unable to remove the local Scripture version" };
  }
}
