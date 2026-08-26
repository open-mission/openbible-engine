/**
 * SqliteDriver abstraction for native adapter.
 * For this milestone, InMemoryDriver parses synthetic bytes JSON.
 * BetterSqliteDriver wrapper optionally uses better-sqlite3 if available for real SQLite.
 * Keep engine-core not importing better-sqlite3 - only this driver may.
 */

export interface SqliteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
}

export interface SqliteDriver {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
  // For synthetic in-memory usage
  load?(bytes: Uint8Array, versionId: string): Promise<void> | void;
  readonly isInMemory?: boolean;
}

// ---------------------------------------------------------------------------
// InMemoryDriver - parses synthetic payload and exposes no-op SQL
// ---------------------------------------------------------------------------

export class InMemoryDriver implements SqliteDriver {
  readonly isInMemory = true;
  // Internal map versionId -> parsed payload
  private stores = new Map<string, { payload: unknown; bytes: Uint8Array }>();

  exec(_sql: string): void {
    // no-op for in-memory
  }

  prepare(_sql: string): SqliteStatement {
    return {
      get: () => undefined,
      all: () => [],
      run: () => ({ changes: 0, lastInsertRowid: 0 }),
    };
  }

  close(): void {
    this.stores.clear();
  }

  load(bytes: Uint8Array, versionId: string): void {
    this.stores.set(versionId, { payload: bytes, bytes: new Uint8Array(bytes) });
  }

  getStore(versionId: string): Uint8Array | undefined {
    return this.stores.get(versionId)?.bytes;
  }

  has(versionId: string): boolean {
    return this.stores.has(versionId);
  }

  delete(versionId: string): void {
    this.stores.delete(versionId);
  }
}

// ---------------------------------------------------------------------------
// BetterSqliteDriver - wrapper around better-sqlite3 if available
// ---------------------------------------------------------------------------

export interface BetterSqliteDriverOptions {
  filename?: string;
  readonly?: boolean;
}

export class BetterSqliteDriver implements SqliteDriver {
  private db: unknown | null = null;
  private driverPromise: Promise<unknown> | null = null;
  readonly isInMemory = false;

  constructor(private options: BetterSqliteDriverOptions = {}) {}

  // Lazily initialize better-sqlite3 via dynamic import to avoid hard dependency at build time
  private async getDb(): Promise<unknown> {
    if (this.db) return this.db;
    if (this.driverPromise) return this.driverPromise;
    this.driverPromise = (async () => {
      try {
        // Dynamic import so that environments without native binding don't crash at import time
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod: any = await import("better-sqlite3");
        const Database = mod.default ?? mod;
        const filename = this.options.filename ?? ":memory:";
        const instance = new Database(filename, { readonly: this.options.readonly ?? false });
        this.db = instance;
        return instance;
      } catch (err) {
        throw new Error(`better-sqlite3 not available: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
    return this.driverPromise;
  }

  exec(sql: string): void {
    if (!this.db) {
      // best effort sync if not initialized; for now no-op until async init
      // In real usage caller should await init; we throw if called before ready
      throw new Error("BetterSqliteDriver not initialized. Call getDb() first. exec: " + sql.slice(0, 50));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.db as any).exec(sql);
  }

  prepare(sql: string): SqliteStatement {
    if (!this.db) throw new Error("BetterSqliteDriver not initialized. Call getDb() first.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stmt = (this.db as any).prepare(sql);
    return {
      get: (...p: unknown[]) => stmt.get(...p),
      all: (...p: unknown[]) => stmt.all(...p),
      run: (...p: unknown[]) => stmt.run(...p),
    };
  }

  close(): void {
    if (this.db && typeof (this.db as { close?: () => void }).close === "function") {
      (this.db as { close: () => void }).close();
    }
    this.db = null;
    this.driverPromise = null;
  }

  async init(): Promise<void> {
    await this.getDb();
  }

  load(_bytes: Uint8Array, _versionId: string): void {
    // For better-sqlite3, loading would mean writing bytes to file then opening;
    // Not implemented for milestone - fallback to InMemory path
    throw new Error("BetterSqliteDriver.load not implemented for synthetic bytes. Use InMemoryDriver for tests.");
  }
}

// Factory helper
export async function createDriver(preferNative = false, filename?: string): Promise<SqliteDriver> {
  if (preferNative) {
    const driver = new BetterSqliteDriver({ filename });
    try {
      await driver.init();
      return driver;
    } catch {
      // fallback to in-memory if native fails to load (e.g., missing binding)
      return new InMemoryDriver();
    }
  }
  return new InMemoryDriver();
}
