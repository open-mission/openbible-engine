import type { InstalledBible } from "@openbible/engine-core";
import type { InstalledBibleRegistry } from "@openbible/engine";

/** In-memory registry used by installer/reconciliation unit tests. */
export class FakeRegistry implements InstalledBibleRegistry {
  private map = new Map<string, InstalledBible>();

  async list(): Promise<InstalledBible[]> {
    return [...this.map.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
  }
  async get(id: string): Promise<InstalledBible | null> {
    return this.map.get(id) ?? null;
  }
  async set(bible: InstalledBible): Promise<void> {
    this.map.set(bible.id, bible);
  }
  async remove(id: string): Promise<void> {
    this.map.delete(id);
  }

  getSync(id: string): InstalledBible | null {
    return this.map.get(id) ?? null;
  }
  setSync(bible: InstalledBible): void {
    this.map.set(bible.id, bible);
  }
  listSync(): InstalledBible[] {
    return [...this.map.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
  }
  removeSync(id: string): void {
    this.map.delete(id);
  }
}
