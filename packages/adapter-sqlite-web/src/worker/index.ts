import { EngineError } from "@openbible/engine-core";
import type { CancellationToken } from "@openbible/engine-core";
import type { WorkerRequest } from "../protocol.js";
import type { WebCapabilities } from "../capabilities.js";
import { createOpfsPool } from "./sqlite.js";
import { WebRegistry } from "./registry.js";
import { WebLibrary } from "./library.js";
import { WebInstaller } from "./installer.js";
import { reconcilePool } from "./reconciliation.js";

declare const self: {
  onmessage: ((ev: MessageEvent) => void) | null;
  postMessage(message: unknown): void;
};

interface Cancellable {
  aborted: boolean;
  reason?: unknown;
}

class WorkerRuntime {
  pool?: Awaited<ReturnType<typeof createOpfsPool>>;
  registry?: WebRegistry;
  library?: WebLibrary;
  installer?: WebInstaller;
  capabilities?: WebCapabilities;
  private cancellables = new Map<string, Cancellable>();

  async dispatch(req: WorkerRequest): Promise<unknown> {
    switch (req.type) {
      case "init":
        return this.init(req.options);
      case "capabilities":
        this.requireInit();
        return this.capabilities;
      case "registry.list":
        this.requireInit();
        return this.registry!.list();
      case "registry.get":
        this.requireInit();
        return this.registry!.get(req.id);
      case "registry.set":
        this.requireInit();
        await this.registry!.set(req.bible);
        return null;
      case "registry.remove":
        this.requireInit();
        await this.registry!.remove(req.id);
        return null;
      case "library.getBooks":
        this.requireInit();
        return this.library!.getBooks(req.versionId);
      case "library.getChapter":
        this.requireInit();
        return this.library!.getChapter(req.versionId, req.bookId, req.chapter);
      case "library.search":
        this.requireInit();
        return this.library!.search(req.versionId, req.query, req.limit);
      case "library.getVersionName":
        this.requireInit();
        return this.library!.getVersionName(req.versionId);
      case "installer.install":
        this.requireInit();
        return this.install(req.operationId, req.input, req.requestId);
      case "installer.cancel": {
        const c = this.cancellables.get(req.operationId);
        if (c) c.aborted = true;
        return null;
      }
      case "installer.uninstall":
        this.requireInit();
        await this.installer!.uninstall(req.versionId);
        return null;
      case "installer.isInstalled":
        this.requireInit();
        return this.installer!.isInstalled(req.versionId);
      case "reconcile":
        this.requireInit();
        return reconcilePool(this.pool!, this.registry!);
      case "close":
        return this.close();
      default:
        throw new EngineError("storage_unavailable", "Unknown worker request");
    }
  }

  private async init(options: { poolName?: string; poolDirectory?: string; minCapacity?: number; persist?: boolean; wasmUrl?: string }) {
    // OPFS/SAHPool detection: a successful install proves the capability. A
    // collision (another tab) throws, which the client maps to storage_busy.
    try {
      this.pool = await createOpfsPool({
        poolName: options.poolName,
        poolDirectory: options.poolDirectory,
        minCapacity: options.minCapacity,
        wasmUrl: options.wasmUrl,
      });
    } catch (err) {
      const code = isBusyError(err) ? "storage_busy" : "storage_unavailable";
      throw new EngineError(
        code,
        code === "storage_busy" ? "Storage pool is busy" : "Adapter storage pool unavailable",
        { cause: err },
      );
    }

    const persistDecision = await requestPersistentStorage(options.persist);
    this.capabilities = {
      worker: true,
      webAssembly: typeof WebAssembly !== "undefined",
      opfs: true,
      persistentStorage: persistDecision,
    };

    this.registry = new WebRegistry(this.pool);
    this.library = new WebLibrary(this.pool);
    this.installer = new WebInstaller(this.pool, this.registry);
    this.installer.closeVersionHook = (versionId) => this.library!.closeVersion(versionId);

    // Warm reconciliation on the freshly-acquired pool, before any read handle
    // is opened, so the store starts from a consistent best-effort state.
    await reconcilePool(this.pool, this.registry);
    return this.capabilities;
  }

  private async install(
    operationId: string,
    input: Parameters<WebInstaller["install"]>[0],
    requestId: string,
  ): Promise<unknown> {
    const cancellable: Cancellable = { aborted: Boolean(input.token?.aborted), reason: input.token?.reason };
    this.cancellables.set(operationId, cancellable);
    // The worker postMessage is only available inside a real worker; in a hidden
    // sandbox there is no other observer. progress is emitted via onProgress.
    const progress = (input: unknown) => {
      this.emitProgress(requestId, operationId, input);
    };
    const token: CancellationToken = cancellable as CancellationToken;
    try {
      return await this.installer!.install(
        { ...input, token },
        {
          onProgress: (p) => progress({ versionId: p.versionId, stage: p.stage, receivedBytes: p.receivedBytes, totalBytes: p.totalBytes }),
        },
      );
    } finally {
      this.cancellables.delete(operationId);
    }
  }

  private emitProgress(requestId: string, operationId: string, progress: unknown): void {
    self.postMessage({ requestId, type: "progress", operationId, progress });
  }

  private close(): unknown {
    this.library?.close();
    this.registry?.close();
    return null;
  }

  private requireInit(): void {
    if (!this.pool || !this.registry || !this.library || !this.installer || !this.capabilities) {
      throw new EngineError("storage_unavailable", "Adapter not initialized");
    }
  }
}

async function requestPersistentStorage(requested: boolean | undefined): Promise<"granted" | "denied" | "unsupported"> {  if (requested === false) return "unsupported";
  const storage = (globalThis as { navigator?: { storage?: { persist?: () => Promise<boolean> } } }).navigator
    ?.storage;
  if (!storage?.persist) return "unsupported";
  try {
    const granted = await storage.persist();
    return granted ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

function isBusyError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("busy") ||
    message.includes("already") ||
    message.includes("in use") ||
    message.includes("pool") ||
    message.includes("locked") ||
    message.includes("another open access") ||
    message.includes("access handle")
  );
}

export function codeFromWorkerError(error: unknown): { code: string; message: string } {
  if (error instanceof EngineError) {
    return { code: error.code, message: error.message };
  }
  return { code: "storage_unavailable", message: "Unexpected adapter error" };
}

const runtime = new WorkerRuntime();

self.onmessage = async (ev: MessageEvent) => {
  const data = ev.data as WorkerRequest;
  if (!data || typeof data !== "object" || typeof (data as { requestId?: unknown }).requestId !== "string") {
    self.postMessage({ requestId: "unknown", type: "failure", error: { code: "storage_unavailable", message: "Malformed request" } });
    return;
  }
  try {
    const value = await runtime.dispatch(data);
    self.postMessage({ requestId: data.requestId, type: "success", value });
  } catch (err) {
    self.postMessage({ requestId: data.requestId, type: "failure", error: codeFromWorkerError(err) });
  }
};
