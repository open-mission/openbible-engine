import { DatabaseSync } from "node:sqlite";

/**
 * Minimal synchronous SQLite driver abstraction for the Node adapter.
 *
 * This adapter is a **Node.js** adapter (uses `node:fs`, `node:path` and
 * `node:sqlite`). It is not claimed to be Bun-compatible without running the
 * tests on Bun. The (future) Native SDK will implement the same interface with
 * a pure-JS or Zig/C binding under the reserved `@openbible/adapter-sqlite-native`
 * name.
 */

export interface SqliteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface SqliteDriver {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
  readonly filename: string;
}

export interface DriverOptions {
  readOnly?: boolean;
}

export type DriverFactory = (filename: string, options?: DriverOptions) => SqliteDriver;

/**
 * Real driver backed by Node's built-in `node:sqlite` (DatabaseSync).
 * No native addon required; works on Node 22+.
 */
export class NodeSqliteDriver implements SqliteDriver {
  readonly filename: string;
  #db: DatabaseSync;

  constructor(filename: string, options?: DriverOptions) {
    this.filename = filename;
    this.#db = new DatabaseSync(filename, { readOnly: options?.readOnly ?? false });
  }

  exec(sql: string): void {
    this.#db.exec(sql);
  }

  prepare(sql: string): SqliteStatement {
    const stmt = this.#db.prepare(sql);
    return {
      get: (...params: unknown[]) => stmt.get(...(params as never[])),
      all: (...params: unknown[]) => stmt.all(...(params as never[])),
      run: (...params: unknown[]) => stmt.run(...(params as never[])),
    };
  }

  close(): void {
    try {
      this.#db.close();
    } catch {
      // already closed
    }
  }
}

export const nodeSqliteDriverFactory: DriverFactory = (filename, options) =>
  new NodeSqliteDriver(filename, options);
