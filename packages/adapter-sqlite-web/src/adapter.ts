import { EngineError } from "@openbible/engine-core";
import type { InstalledBible, BibleBook, Verse, SearchResult, InstallationProgress } from "@openbible/engine-core";
import type { BibleLibrary, InstalledBibleRegistry, BibleInstaller, InstallPackageInput, InstallationObserver } from "@openbible/engine";
import type { WebCapabilities } from "./capabilities.js";
import type { WorkerRunRequest } from "./protocol.js";
import { WebWorkerClient } from "./worker-client.js";

export interface WebAdapterOptions {
  /** Override for the Worker asset URL (defaults to a module-relative worker). */
  workerUrl?: URL | string;
  /** Override for the Worker factory (e.g. for tests or custom bundling). */
  workerFactory?: () => Worker;
  /** Override for the SQLite WASM asset URL (defaults to worker-relative). */
  wasmUrl?: URL | string;
  /** Stable SAHPool name (defaults to "opfs-sahpool"). */
  poolName?: string;
  /** SAHPool directory (must be stable; different dir creates an isolated namespace). */
  poolDirectory?: string;
  /** Minimum SAHPool capacity to reserve (defaults to 8). */
  minCapacity?: number;
  /** Request persistent storage best-effort (defaults to true). */
  persist?: boolean;
}

export interface WebReconcileStats {
  removedTmp: number;
  restored: number;
  removedStaleRegistry: number;
  removedOrphans: number;
  removedTrash: number;
}

export interface WebAdapter {
  library: BibleLibrary;
  registry: InstalledBibleRegistry;
  installer: BibleInstaller;
  capabilities: WebCapabilities;
  reconcile(): Promise<WebReconcileStats>;
  close(): Promise<void>;
}

function toWorkerUrl(value?: URL | string): URL | string | undefined {
  if (value instanceof URL) return value;
  if (typeof value === "string") return value;
  return value;
}

/**
 * Creates and initializes a headless Web adapter over a dedicated Worker and an
 * OPFS SAHPool. The Worker is the only owner of SQLite, the registry,
 * connections and the pool; the main thread only exchanges validated RPC.
 *
 * Guarantee: SQLite Web legacy-compatible, exception-safe and with best-effort
 * reconciliation. This adapter never claims atomic rename, crash safety or
 * power-loss safety.
 */
export async function createWebAdapter(options: WebAdapterOptions = {}): Promise<WebAdapter> {
  if (typeof Worker === "undefined") {
    throw new EngineError("storage_unavailable", "Web adapter requires Web Worker support");
  }

  const client = new WebWorkerClient({
    workerUrl: toWorkerUrl(options.workerUrl),
    workerFactory: options.workerFactory,
    poolName: options.poolName,
    poolDirectory: options.poolDirectory,
    minCapacity: options.minCapacity,
    persist: options.persist ?? true,
    wasmUrl: toWorkerUrl(options.wasmUrl),
  });

  let capabilities: WebCapabilities;
  try {
    capabilities = await client.init();
  } catch (err) {
    await client.close().catch(() => undefined);
    throw err;
  }

  if (!capabilities.opfs) {
    await client.close().catch(() => undefined);
    throw new EngineError("storage_unavailable", "OPFS SAHPool is not available");
  }

  const request = <T>(req: WorkerRunRequest, onProgress?: (e: unknown) => void): Promise<T> =>
    client.request<T>(req, onProgress as never);

  const library: BibleLibrary = {
    async getBooks(versionId): Promise<BibleBook[]> {
      return request<BibleBook[]>({ type: "library.getBooks", versionId });
    },
    async getChapter(versionId, bookId, chapter): Promise<Verse[]> {
      return request<Verse[]>({ type: "library.getChapter", versionId, bookId, chapter });
    },
    async search(versionId, query, limit): Promise<SearchResult> {
      return request<SearchResult>({ type: "library.search", versionId, query, limit });
    },
    async getVersionName(versionId): Promise<string | null> {
      return request<string | null>({ type: "library.getVersionName", versionId });
    },
  };

  const registry: InstalledBibleRegistry = {
    async list(): Promise<InstalledBible[]> {
      return request<InstalledBible[]>({ type: "registry.list" });
    },
    async get(id): Promise<InstalledBible | null> {
      return request<InstalledBible | null>({ type: "registry.get", id });
    },
    async set(bible): Promise<void> {
      await request<void>({ type: "registry.set", bible });
    },
    async remove(id): Promise<void> {
      await request<void>({ type: "registry.remove", id });
    },
  };

  const installer: BibleInstaller = {
    async install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible> {
      const operationId = `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let cancellationTimer: ReturnType<typeof setInterval> | undefined;
      if (input.token) {
        cancellationTimer = setInterval(() => {
          if (input.token?.aborted) client.cancel(operationId);
        }, 25);
      }
      const onProgress = (e: unknown) => {
        const p = e as InstallationProgress;
        try {
          observer?.onProgress(p);
        } catch {
          // observer errors do not abort installation
        }
      };
      try {
        return await request<InstalledBible>({ type: "installer.install", operationId, input }, onProgress);
      } finally {
        if (cancellationTimer !== undefined) clearInterval(cancellationTimer);
      }
    },
    async uninstall(versionId): Promise<void> {
      await request<void>({ type: "installer.uninstall", versionId });
    },
    async isInstalled(versionId): Promise<boolean> {
      return request<boolean>({ type: "installer.isInstalled", versionId });
    },
  };

  return {
    library,
    registry,
    installer,
    capabilities,
    async reconcile(): Promise<WebReconcileStats> {
      return request<WebReconcileStats>({ type: "reconcile" });
    },
    async close(): Promise<void> {
      await client.close();
    },
  };
}
