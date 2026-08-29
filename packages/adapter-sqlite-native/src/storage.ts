/**
 * Synchronous logical filesystem used by the Native adapter.
 *
 * The implementation supplied by a Native service resolves these names inside
 * the app namespace. Physical paths never enter the engine or its model.
 */
export interface NativeStorage {
  exists(path: string): boolean;
  readFile(path: string): Uint8Array;
  writeFile(path: string, bytes: Uint8Array): void;
  rename(from: string, to: string): void;
  remove(path: string): void;
  list(prefix: string): readonly string[];
}

export function requireNamespace(namespace: string): string {
  if (typeof namespace !== "string" || namespace.length === 0) {
    throw new Error("Native adapter namespace is required");
  }
  if (namespace.includes("/") || namespace.includes("\\") || namespace.includes("..")) {
    throw new Error("Native adapter namespace cannot contain path traversal");
  }
  return namespace;
}
