import { EngineError } from "@openbible/engine-core";
import type { EngineErrorCode } from "@openbible/engine-core";
import type { WebCapabilities } from "./capabilities.js";
import type { WorkerRunRequest } from "./protocol.js";

export interface WorkerClientOptions {
  workerUrl?: URL | string;
  workerFactory?: () => Worker;
  poolName?: string;
  poolDirectory?: string;
  minCapacity?: number;
  persist?: boolean;
  wasmUrl?: URL | string;
}

type Listener = (event: unknown) => void;

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  onProgress?: Listener;
}

/**
 * Main-thread RPC client to the dedicated adapter Worker. It owns the Worker
 * lifecycle, drives the discriminant protocol, routes progress events and maps
 * worker failures back to stable {@link EngineError} codes without exposing
 * SQL, stack traces or physical paths.
 */
export class WebWorkerClient {
  private readonly workerUrl?: URL | string;
  private readonly workerFactory?: () => Worker;
  private readonly initOptions: Record<string, unknown>;
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<string, Pending>();
  private closed = false;

  constructor(options: WorkerClientOptions) {
    this.workerUrl = options.workerUrl;
    this.workerFactory = options.workerFactory;
    this.initOptions = {
      poolName: options.poolName,
      poolDirectory: options.poolDirectory,
      minCapacity: options.minCapacity,
      persist: options.persist,
      wasmUrl: options.wasmUrl ? String(options.wasmUrl) : undefined,
    };
    const worker = options.workerFactory?.() ?? createWorker(options.workerUrl);
    this.worker = worker;
    worker.addEventListener("message", (ev) => this.onMessage(ev.data));
    worker.addEventListener("error", (ev) => this.onError(ev));
  }

  private onMessage(data: unknown): void {
    if (!data || typeof data !== "object") return;
    const msg = data as Record<string, unknown>;
    const requestId = msg.requestId;
    if (typeof requestId !== "string") return;
    const pending = this.pending.get(requestId);
    if (!pending) return;
    if (msg.type === "progress") {
      pending.onProgress?.(msg.progress);
      return;
    }
    this.pending.delete(requestId);
    if (msg.type === "success") {
      pending.resolve(msg.value);
    } else if (msg.type === "failure") {
      const err = msg.error as { code?: string; message?: string } | undefined;
      const code = (err?.code ?? "storage_unavailable") as EngineErrorCode;
      pending.reject(new EngineError(code, err?.message ?? "Adapter error"));
    } else {
      pending.reject(new EngineError("storage_unavailable", "Malformed worker response"));
    }
  }

  private onError(_ev: unknown): void {
    // A crashed worker: reject every pending request exactly once and mark the
    // client closed so a fresh factory is required.
    this.rejectPending(new EngineError("storage_unavailable", "Adapter worker terminated"));
    this.closed = true;
    if (this.worker) this.worker.terminate();
  }

  private rejectPending(error: unknown): void {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  async init(): Promise<WebCapabilities> {
    const value = await this.request({ type: "init", options: this.initOptions ?? {} });
    return value as WebCapabilities;
  }

  request<T>(req: WorkerRunRequest, onProgress?: Listener): Promise<T> {
    if (this.closed) {
      return Promise.reject(new EngineError("storage_unavailable", "Adapter is closed"));
    }
    const requestId = String(this.nextId++);
    const promise = new Promise<T>((resolve, reject) => {
      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject, onProgress });
    });
    this.worker.postMessage({ ...req, requestId });
    return promise;
  }

  cancel(operationId: string): void {
    this.request({ type: "installer.cancel", operationId }).catch(() => undefined);
  }

  async close(): Promise<void> {
    if (this.closed) return;
    try {
      await this.request({ type: "close" }, undefined);
    } catch {
      // ignore
    } finally {
      this.closed = true;
      this.worker?.terminate();
    }
  }

  get isClosed(): boolean {
    return this.closed;
  }
}

function createWorker(url?: URL | string): Worker {
  const target = url ?? new URL("./worker/worker.js", import.meta.url);
  return new Worker(target, { type: "module" });
}
