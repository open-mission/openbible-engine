import type { InstalledBible, BibleBook, Verse, SearchResult, InstallationProgress } from "@openbible/engine-core";
import type { InstallPackageInput } from "@openbible/engine";
import type { WebCapabilities } from "./capabilities.js";
import type { WebReconcileStats } from "./adapter.js";

/**
 * Discriminated RPC contract between the main thread and the worker.
 *
 * The worker is the only owner of SQLite, the registry, connections and the
 * SAHPool; no SQL or connection crosses this boundary. Every request carries a
 * `requestId`; long installs additionally carry `operationId` so cancellation
 * can be targeted without exposing SQL.
 */

export interface WorkerInitOptions {
  poolName?: string;
  poolDirectory?: string;
  minCapacity?: number;
  persist?: boolean;
  wasmUrl?: string;
}

/** Semantic requests (payload only; the client adds `requestId`). */
export type WorkerRunRequest =
  | { type: "init"; options: WorkerInitOptions }
  | { type: "capabilities" }
  | { type: "registry.list" }
  | { type: "registry.get"; id: string }
  | { type: "registry.set"; bible: InstalledBible }
  | { type: "registry.remove"; id: string }
  | { type: "library.getBooks"; versionId: string }
  | { type: "library.getChapter"; versionId: string; bookId: string; chapter: number }
  | { type: "library.search"; versionId: string; query: string; limit: number }
  | { type: "library.getVersionName"; versionId: string }
  | { type: "installer.install"; operationId: string; input: InstallPackageInput }
  | { type: "installer.cancel"; operationId: string }
  | { type: "installer.uninstall"; versionId: string }
  | { type: "installer.isInstalled"; versionId: string }
  | { type: "reconcile" }
  | { type: "close" };

export type WorkerRequest = WorkerRunRequest & { requestId: string };

export interface WorkerResult {
  requestId: string;
  type: "success" | "failure";
  value?: unknown;
  error?: { code: string; message: string };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (!isRecord(value)) return false;
  if (typeof value.requestId !== "string") return false;
  const payload: Record<string, unknown> = { ...value };
  delete payload.requestId;
  return isWorkerRunRequest(payload);
}

export function isWorkerRunRequest(value: unknown): value is WorkerRunRequest {
  if (!isRecord(value)) return false;
  const type = value.type;
  if (typeof type !== "string") return false;
  switch (type) {
    case "init":
      return isRecord(value.options);
    case "registry.set":
      return isRecord(value.bible);
    case "library.getChapter":
      return typeof value.versionId === "string" && typeof value.bookId === "string" && typeof value.chapter === "number";
    case "library.search":
      return typeof value.versionId === "string" && typeof value.query === "string" && typeof value.limit === "number";
    case "installer.install":
      return typeof value.operationId === "string" && isRecord(value.input);
    case "registry.list":
    case "registry.get":
    case "registry.remove":
    case "library.getBooks":
    case "library.getVersionName":
    case "installer.cancel":
    case "installer.uninstall":
    case "installer.isInstalled":
    case "capabilities":
    case "reconcile":
    case "close":
      return true;
    default:
      return false;
  }
}
