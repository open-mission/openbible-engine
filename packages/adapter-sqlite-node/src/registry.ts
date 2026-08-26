import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { InstalledBible } from "@openbible/engine-core";
import type { InstalledBibleRegistry } from "@openbible/engine";
import type { DriverFactory } from "./driver.js";

/**
 * Persistent installed-bible registry backed by a real SQLite file
 * (`installed_bibles`), so `listInstalledVersions` survives a process restart.
 */
export class NodeSqliteRegistry implements InstalledBibleRegistry {
  private readonly driver: ReturnType<DriverFactory>;

  constructor(
    private readonly dbPath: string,
    private readonly driverFactory: DriverFactory,
  ) {
    this.driver = this.open();
  }

  private open(): ReturnType<DriverFactory> {
    mkdirSync(dirname(this.dbPath), { recursive: true });
    const driver = this.driverFactory(this.dbPath, { readOnly: false });
    driver.exec(
      "CREATE TABLE IF NOT EXISTS installed_bibles (id TEXT PRIMARY KEY, name TEXT NOT NULL, installed_at INTEGER NOT NULL, version_code INTEGER NOT NULL DEFAULT 1)",
    );
    return driver;
  }

  async list(): Promise<InstalledBible[]> {
    const rows = this.driver
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id")
      .all() as Array<{ id: string; name: string; installed_at: number; version_code: number }>;
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      installedAt: Number(r.installed_at),
      versionCode: Number(r.version_code),
    }));
  }

  async get(id: string): Promise<InstalledBible | null> {
    const row = this.driver
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?")
      .get(id) as { id: string; name: string; installed_at: number; version_code: number } | undefined;
    if (!row) return null;
    return {
      id: String(row.id),
      name: String(row.name),
      installedAt: Number(row.installed_at),
      versionCode: Number(row.version_code),
    };
  }

  async set(bible: InstalledBible): Promise<void> {
    this.driver
      .prepare(
        "INSERT INTO installed_bibles (id, name, installed_at, version_code) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, installed_at=excluded.installed_at, version_code=excluded.version_code",
      )
      .run(bible.id, bible.name, bible.installedAt, bible.versionCode);
  }

  async remove(id: string): Promise<void> {
    this.driver.prepare("DELETE FROM installed_bibles WHERE id = ?").run(id);
  }

  // Synchronous accessors used by crash reconciliation during adapter open.
  listSync(): InstalledBible[] {
    const rows = this.driver
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles ORDER BY id")
      .all() as Array<{ id: string; name: string; installed_at: number; version_code: number }>;
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      installedAt: Number(r.installed_at),
      versionCode: Number(r.version_code),
    }));
  }

  setSync(bible: InstalledBible): void {
    this.driver
      .prepare(
        "INSERT INTO installed_bibles (id, name, installed_at, version_code) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, installed_at=excluded.installed_at, version_code=excluded.version_code",
      )
      .run(bible.id, bible.name, bible.installedAt, bible.versionCode);
  }

  getSync(id: string): InstalledBible | null {
    const row = this.driver
      .prepare("SELECT id, name, installed_at, version_code FROM installed_bibles WHERE id = ?")
      .get(id) as { id: string; name: string; installed_at: number; version_code: number } | undefined;
    if (!row) return null;
    return {
      id: String(row.id),
      name: String(row.name),
      installedAt: Number(row.installed_at),
      versionCode: Number(row.version_code),
    };
  }

  removeSync(id: string): void {
    this.driver.prepare("DELETE FROM installed_bibles WHERE id = ?").run(id);
  }

  close(): void {
    this.driver.close();
  }
}
