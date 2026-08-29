import { EngineError, normalizeVersionId } from "@openbible/engine-core";
import type { InstalledBible } from "@openbible/engine-core/types";
import type { InstalledBibleRegistry } from "@openbible/engine";
import { encodeNativeRegistry, readNativeRegistry, REGISTRY_PATH, REGISTRY_TMP_PATH, type NativeRegistryEntry } from "./native-registry-data.js";
import type { NativeStorage } from "./storage.js";

export class NativeRegistry implements InstalledBibleRegistry {
  constructor(private readonly storage: NativeStorage) {}

  private read(): InstalledBible[] {
    try {
      return readNativeRegistry(this.storage).map((entry: NativeRegistryEntry) => ({
        ...entry,
        id: normalizeVersionId(entry.id),
      }));
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && "message" in error) {
        throw new EngineError("storage_unavailable", "Native registry is corrupt");
      }
      throw error;
    }
  }

  private write(entries: readonly InstalledBible[]): void {
    this.storage.writeFile(REGISTRY_TMP_PATH, encodeNativeRegistry(entries));
    this.storage.rename(REGISTRY_TMP_PATH, REGISTRY_PATH);
  }

  listSync(): InstalledBible[] {
    return this.read();
  }

  getSync(id: string): InstalledBible | null {
    const normalized = normalizeVersionId(id);
    return this.read().find((entry) => entry.id === normalized) ?? null;
  }

  setSync(bible: InstalledBible): void {
    const normalized = normalizeVersionId(bible.id);
    const next = { ...bible, id: normalized };
    const entries = this.read();
    const index = entries.findIndex((entry) => entry.id === normalized);
    if (index < 0) entries.push(next);
    else entries[index] = next;
    this.write(entries);
  }

  removeSync(id: string): void {
    const normalized = normalizeVersionId(id);
    this.write(this.read().filter((entry) => entry.id !== normalized));
  }

  async list(): Promise<InstalledBible[]> {
    return this.listSync();
  }

  async get(id: string): Promise<InstalledBible | null> {
    return this.getSync(id);
  }

  async set(bible: InstalledBible): Promise<void> {
    this.setSync(bible);
  }

  async remove(id: string): Promise<void> {
    this.removeSync(id);
  }
}
