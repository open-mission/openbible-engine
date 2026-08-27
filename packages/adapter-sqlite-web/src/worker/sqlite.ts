import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import type { PoolLike, DbHandle, OpenOptions, SqlStatement } from "../pool.js";

type Sqlite3Module = Awaited<ReturnType<typeof sqlite3InitModule>>;
type OO1Db = any;

// The published type declares `init(): Promise<Sqlite3Static>` without options,
// but the runtime accepts a locateFile config. Bridge with a narrow, typed
// overload so consumers get the real config surface without `any`.
type Sqlite3Loader = (config?: { locateFile?: (file: string) => string }) => Promise<Sqlite3Module>;
const loadSqlite3 = sqlite3InitModule as unknown as Sqlite3Loader;

export interface OpfsPoolOptions {
  poolName?: string;
  poolDirectory?: string;
  minCapacity?: number;
  /** Override for the SQLite WASM asset location (relative to the worker URL). */
  wasmUrl?: string;
}

/**
 * Creates the OPFS SAHPool-backed {@link PoolLike} that the worker owns.
 *
 * This module runs ONLY inside a dedicated Worker (OPFS is worker-only, and
 * SAHPool needs no COOP/COEP). It is never imported by the main thread.
 */
export async function createOpfsPool(options: OpfsPoolOptions = {}): Promise<PoolLike> {
  const sqlite3: Sqlite3Module = await loadSqlite3({
    locateFile: (file: string) => {
      if (file === "sqlite3.wasm" && options.wasmUrl) {
        return new URL(options.wasmUrl, import.meta.url).href;
      }
      return new URL(file, import.meta.url).href;
    },
  });

  const pool = await sqlite3.installOpfsSAHPoolVfs({
    ...(options.poolName ? { name: options.poolName } : {}),
    ...(options.poolDirectory ? { directory: options.poolDirectory } : {}),
    initialCapacity: options.minCapacity ?? 8,
  });

  return buildPoolLike(pool, sqlite3);
}

function buildPoolLike(
  pool: {
    vfsName: string;
    OpfsSAHPoolDb: new (name: string) => OO1Db;
    importDb(name: string, bytes: Uint8Array): Promise<number>;
    exportFile(name: string): Promise<Uint8Array>;
    unlink(name: string): boolean;
    getFileNames(): string[];
    reserveMinimumCapacity(min: number): Promise<number>;
  },
  _sqlite3: Sqlite3Module,
): PoolLike {
  return {
    vfsName: pool.vfsName,
    open(name: string, opts?: OpenOptions): DbHandle {
      // OO1 SAHPool only accepts a filename (defaults to create); reads are
      // guarded upstream by the library checking the file is present first.
      const db = new pool.OpfsSAHPoolDb(name);
      return wrapDb(db, opts);
    },
    async importDb(name: string, bytes: Uint8Array): Promise<number> {
      return pool.importDb(name, bytes);
    },
    async exportFile(name: string): Promise<Uint8Array> {
      return pool.exportFile(name);
    },
    unlink(name: string): boolean {
      return pool.unlink(name);
    },
    fileNames(): string[] {
      return pool.getFileNames();
    },
    async reserveMinimumCapacity(min: number): Promise<number> {
      await pool.reserveMinimumCapacity(min);
      return min;
    },
  };
}

function wrapDb(db: OO1Db, opts?: OpenOptions): DbHandle {
  return {
    exec(sql: string): void {
      db.exec(sql);
    },
    prepare(sql: string): SqlStatement {
      return {
        run: (...params) => {
          db.exec(sql, { bind: params });
          return {};
        },
        get: (...params) => {
          const rows = db.selectObjects(sql, params as never) as Array<Record<string, unknown>>;
          return rows[0];
        },
        all: (...params) => {
          return db.selectObjects(sql, params as never) as Array<Record<string, unknown>>;
        },
      };
    },
    close(): void {
      try {
        db.close();
      } catch {
        // already closed
      }
    },
  };
}
