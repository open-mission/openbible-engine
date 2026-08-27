/**
 * Browser capability detection for the Web adapter.
 *
 * Pure, injectable detection: the caller (composition root) provides the
 * runtime facts (has Worker, WebAssembly and OPFS, and the outcome of the
 * persistent-storage request) and this module normalizes them into the
 * discriminated `WebCapabilities` contract.
 *
 * No DOM globals are read here, keeping the module unit-testable in Node.
 */

export type PersistentStorageDecision = "granted" | "denied" | "unavailable" | "not_requested";

export type PersistentStorageState =
  | "granted"
  | "denied"
  | "unsupported"
  | "not_requested";

export interface CapabilityRuntime {
  /** `"Worker" in globalThis`. */
  worker: boolean;
  /** `"WebAssembly" in globalThis`. */
  webAssembly: boolean;
  /** OPFS SAHPool availability (detected inside the Worker). */
  opfs: boolean;
  /** Outcome of `navigator.storage.persist()` (best-effort). */
  persistentStorage: PersistentStorageDecision;
}

export interface WebCapabilities {
  worker: boolean;
  webAssembly: boolean;
  opfs: boolean;
  persistentStorage: PersistentStorageState;
}

export function resolvePersistentStorageState(
  decision: PersistentStorageDecision,
): PersistentStorageState {
  switch (decision) {
    case "granted":
      return "granted";
    case "denied":
      return "denied";
    case "unavailable":
      return "unsupported";
    case "not_requested":
    default:
      return "not_requested";
  }
}

export function detectWebCapabilities(runtime: CapabilityRuntime): WebCapabilities {
  return {
    worker: runtime.worker,
    webAssembly: runtime.webAssembly,
    opfs: runtime.opfs,
    persistentStorage: resolvePersistentStorageState(runtime.persistentStorage),
  };
}

/** A runtime that can host the OPFS SAHPool needs Worker + WebAssembly + OPFS. */
export function capabilitiesAllowStorage(c: WebCapabilities): boolean {
  return c.worker && c.webAssembly && c.opfs;
}
