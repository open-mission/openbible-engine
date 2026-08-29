import type { NativeStorage } from "./storage.js";

export const REGISTRY_PATH = "registry.json";
export const REGISTRY_TMP_PATH = "registry.json.tmp";

export interface NativeRegistryEntry {
  readonly id: string;
  readonly name: string;
  readonly installedAt: number;
  readonly versionCode: number;
}

export interface NativeRegistryDataError {
  readonly code: "storage_unavailable";
  readonly message: string;
}

/** @param {{ id: string, name: string, installedAt: number, versionCode: number }[]} value @returns {Uint8Array} */
export function encodeNativeRegistry(value: readonly NativeRegistryEntry[]): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}

/** @param {Uint8Array} bytes @returns {{ id: string, name: string, installedAt: number, versionCode: number }[]} */
export function decodeNativeRegistry(bytes: Uint8Array): NativeRegistryEntry[] {
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(value)) throw new Error("registry is not an array");
    return value.map((item) => {
      if (!item || typeof item !== "object") throw new Error("registry entry is not an object");
      const entry = item as Record<string, unknown>;
      if (typeof entry.id !== "string" || typeof entry.name !== "string" ||
        typeof entry.installedAt !== "number" || typeof entry.versionCode !== "number") {
        throw new Error("registry entry has invalid fields");
      }
      return {
        id: entry.id,
        name: entry.name,
        installedAt: entry.installedAt,
        versionCode: entry.versionCode,
      };
    });
  } catch (error) {
    throw { code: "storage_unavailable", message: "Native registry is corrupt" } satisfies NativeRegistryDataError;
  }
}

/** @param {{ exists: (path: string) => boolean, readFile: (path: string) => Uint8Array }} storage @returns {{ id: string, name: string, installedAt: number, versionCode: number }[]} */
export function readNativeRegistry(storage: NativeStorage): NativeRegistryEntry[] {
  if (!storage.exists(REGISTRY_PATH)) return [];
  return decodeNativeRegistry(storage.readFile(REGISTRY_PATH));
}
