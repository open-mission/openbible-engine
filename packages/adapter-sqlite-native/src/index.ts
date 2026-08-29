import type { BibleInstaller, BibleLibrary, InstalledBibleRegistry } from "@openbible/engine";
import type { NativeStorage } from "./storage.js";
import type { NativeReconcileStats } from "./native-installer.js";
import { createNativeSyncAdapter } from "./native-sync.js";
import type { NativeSyncAdapter } from "./native-sync.js";
export {
  installNativePackage,
  installNativePackageDownload,
  readNativeLibrary,
  resetNativePackageDownload,
  stageNativePackageDownloadChunk,
  uninstallNativePackage,
} from "./native-service.js";
export type {
  NativeDownloadResult,
  NativeMutationResult as NativeServiceMutationResult,
  NativePackageDownloadInstallRequest,
  NativePackageInstallRequest,
  NativeServiceReadRequest,
  NativeServiceReadResult,
} from "./native-service.js";

export type { NativeStorage } from "./storage.js";
export type { NativeReconcileStats } from "./native-installer.js";
export type { NativeSyncAdapter } from "./native-sync.js";
export { createNativeSyncAdapter } from "./native-sync.js";

export interface NativeAdapterOptions {
  readonly namespace: string;
  readonly storage: NativeStorage;
}

export interface NativeAdapter {
  readonly library: BibleLibrary & { closeVersion(id: string): void; close(): void };
  readonly registry: InstalledBibleRegistry;
  readonly installer: BibleInstaller;
  readonly reconcile: NativeReconcileStats;
  readonly sync: NativeSyncAdapter;
  close(): void;
}

export function createNativeAdapter(options: NativeAdapterOptions): NativeAdapter {
  const sync = createNativeSyncAdapter(options);
  return {
    library: sync.library,
    registry: sync.registry,
    installer: sync.installer,
    reconcile: sync.reconcile,
    sync,
    close() {
      sync.close();
    },
  };
}
