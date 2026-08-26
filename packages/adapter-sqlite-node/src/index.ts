export * from "./driver.js";
export * from "./legacy-book-map.js";
export * from "./bible-store.js";
export * from "./registry.js";
export * from "./fixtures.js";
import { nodeSqliteDriverFactory } from "./driver.js";
import type { DriverFactory } from "./driver.js";
import { NodeBibleLibrary, NodeBibleInstaller, reconcileNodeDataDir } from "./bible-store.js";
import type { ReconcileStats } from "./bible-store.js";
import { NodeSqliteRegistry } from "./registry.js";
import type { InstalledBibleRegistry, BibleLibrary, BibleInstaller } from "@openbible/engine";

export interface NodeAdapterOptions {
  dataDir: string;
  registryPath: string;
  driverFactory?: DriverFactory;
}

export interface NodeAdapter {
  library: BibleLibrary & { closeVersion(id: string): void; close(): void };
  registry: InstalledBibleRegistry;
  installer: BibleInstaller;
  /** Crash-safety reconciliation outcomes from opening the store. */
  reconcile: ReconcileStats;
  close(): void;
}

/**
 * Composes the Node SQLite adapter against real legacy-schema files. On open it
 * runs crash-safety reconciliation (`.tmp`/`.bak`/`.trash`). `close()` closes
 * both the read-only bible library and the persistent registry.
 */
export function createNodeAdapter(options: NodeAdapterOptions): NodeAdapter {
  const driverFactory = options.driverFactory ?? nodeSqliteDriverFactory;
  const library = new NodeBibleLibrary(options.dataDir, driverFactory);
  const registry = new NodeSqliteRegistry(options.registryPath, driverFactory);
  const reconcile = reconcileNodeDataDir(options.dataDir, registry, library);
  const installer = new NodeBibleInstaller(options.dataDir, registry, library, driverFactory);
  return {
    library,
    registry,
    installer,
    reconcile,
    close() {
      library.close();
      (registry as NodeSqliteRegistry).close();
    },
  };
}
