import type { InstalledBible } from "@openbible/engine-core";
import type { InstalledBibleRegistry } from "@openbible/engine";
import type { PoolLike } from "../pool.js";
import { REGISTRY_DB } from "./paths.js";

function toBible(row: Record<string, unknown>): InstalledBible {
  return {
    id: String(row.id),
    name: String(row.name),
    installedAt: Number(row.installed_at),
    versionCode: Number(row.version_code),
  };
}

/**
 * Registry of installed bibles backed by a control SQLite database (`store.db`)
 * living in the same SAHPool and Worker, so it persists across reloads and is
 * never treated as an orphan bible file.
 */
export class WebRegistry implements InstalledBibleRegistry {
  private db;

  constructor(private readonly pool: PoolLike) {
    this.db = this.pool.open(REGISTRY_DB, { create: true });
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS installed_bibles (id TEXT PRIMARY KEY, name TEXT NOT NULL, installed_at INTEGER NOT NULL, version_code INTEGER NOT NULL DEFAULT 1)",
    );
  }

  async list(): Promise<InstalledBible[]> {
    const rows = this.db
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id")
      .all();
    return rows.map(toBible);
  }

  async get(id: string): Promise<InstalledBible | null> {
    const row = this.db
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?")
      .get(id);
    return row ? toBible(row) : null;
  }

  async set(bible: InstalledBible): Promise<void> {
    this.db
      .prepare(
        "INSERT INTO installed_bibles (id, name, installed_at, version_code) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, installed_at=excluded.installed_at, version_code=excluded.version_code",
      )
      .run(bible.id, bible.name, bible.installedAt, bible.versionCode);
  }

  async remove(id: string): Promise<void> {
    this.db.prepare("DELETE FROM installed_bibles WHERE id = ?").run(id);
  }

  // Sync accessors used by startup reconciliation (the registry DB lives in a
  // worker and reconciliation runs before any awaiting RPC is guaranteed).
  listSync(): InstalledBible[] {
    return this.db
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id")
      .all()
      .map(toBible);
  }

  getSync(id: string): InstalledBible | null {
    const row = this.db
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?")
      .get(id);
    return row ? toBible(row) : null;
  }

  removeSync(id: string): void {
    this.db.prepare("DELETE FROM installed_bibles WHERE id = ?").run(id);
  }

  close(): void {
    this.db.close();
  }
}
