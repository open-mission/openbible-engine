import { normalizeVersionId } from "@openbible/engine-core";
import { NativeBibleLibrary } from "./native-library.js";
import { NativeInstaller, reconcileNativeStorage } from "./native-installer.js";
import { NativeRegistry } from "./native-registry.js";
import { requireNamespace } from "./storage.js";
import type { NativeStorage } from "./storage.js";
import type { NativeReconcileStats } from "./native-installer.js";

export interface NativeSyncAdapterOptions {
  readonly namespace: string;
  readonly storage: NativeStorage;
}

export interface NativeSyncAdapter {
  readonly library: NativeBibleLibrary;
  readonly registry: NativeRegistry;
  readonly installer: NativeInstaller;
  readonly reconcile: NativeReconcileStats;
  close(): void;
}

/**
 * @param {{ namespace: string, storage: { exists: (path: string) => boolean, readFile: (path: string) => Uint8Array, writeFile: (path: string, bytes: Uint8Array) => void, rename: (from: string, to: string) => void, remove: (path: string) => void, list: (prefix: string) => string[] } }} options
 * @returns {{ library: { getBooksSync: (versionId: string) => { id: string, name: string, chapters: number }[], getChapterSync: (versionId: string, bookId: string, chapter: number) => { id: string, bookId: string, chapter: number, verse: number, text: string }[], searchSync: (versionId: string, query: string, limit: number) => { versionId: string, query: string, results: { id: string, bookId: string, chapter: number, verse: number, text: string }[], total: number } }, registry: { listSync: () => { id: string, name: string, installedAt: number, versionCode: number }[] }, installer: { isInstalledSync: (versionId: string) => boolean }, close: () => void }}
 */
export function createNativeSyncAdapter(options: NativeSyncAdapterOptions): NativeSyncAdapter {
  requireNamespace(normalizeVersionId(options.namespace));
  const registry = new NativeRegistry(options.storage);
  const library = new NativeBibleLibrary(options.storage);
  const reconcile = reconcileNativeStorage(options.storage, registry);
  const installer = new NativeInstaller(options.storage, registry, library);
  return {
    library,
    registry,
    installer,
    reconcile,
    close() {
      library.close();
    },
  };
}

export function createNativeAdapter(options: NativeSyncAdapterOptions): NativeSyncAdapter {
  return createNativeSyncAdapter(options);
}
