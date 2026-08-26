export * from "./driver.js";
export * from "./bible-store.js";
export * from "./registry.js";
export * from "./fixtures.js";
import { nodeSqliteDriverFactory } from "./driver.js";
import type { DriverFactory } from "./driver.js";
import { NativeBibleLibrary } from "./bible-store.js";
import { NativeBibleInstaller } from "./bible-store.js";
import { SqliteInstalledRegistry } from "./registry.js";
import type { InstalledBibleRegistry, BibleLibrary, BibleInstaller } from "@openbible/engine";

export interface NativeAdapterOptions {
  dataDir: string;
  registryPath: string;
  driverFactory?: DriverFactory;
}

export interface NativeAdapter {
  library: BibleLibrary;
  registry: InstalledBibleRegistry;
  installer: BibleInstaller;
  close(): void;
}

/**
 * Composes the native SQLite adapter against real files:
 * a read-only `BibleLibrary`, a persistent `InstalledBibleRegistry` (real
 * `installed_bibles` table) and a transactional `BibleInstaller`.
 */
export function createNativeAdapter(options: NativeAdapterOptions): NativeAdapter {
  const driverFactory = options.driverFactory ?? nodeSqliteDriverFactory;
  const library = new NativeBibleLibrary(options.dataDir, driverFactory);
  const registry = new SqliteInstalledRegistry(options.registryPath, driverFactory);
  const installer = new NativeBibleInstaller(options.dataDir, registry, driverFactory);
  return {
    library,
    registry,
    installer,
    close() {
      (registry as SqliteInstalledRegistry).close();
    },
  };
}
