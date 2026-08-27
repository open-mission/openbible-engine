/**
 * Portable SQLite pool abstraction for the Web adapter.
 *
 * This module contains only types. It describes the narrow surface the worker
 * needs to manage virtual databases: a set of named logical files backed by an
 * OPFS SAHPool (in the browser) or by the real `node:sqlite` (in unit tests).
 *
 * No DOM, Node or SQLite-WASM import lives here. Implementations are provided
 * by `src/worker/sqlite.ts` (browser) and the test fakes (Node).
 */

export type Bindable = string | number | bigint | null | Uint8Array | ArrayBuffer | Float64Array;

export interface SqlStatement {
  run(...params: Bindable[]): unknown;
  get(...params: Bindable[]): Record<string, unknown> | undefined;
  all(...params: Bindable[]): Record<string, unknown>[];
}

export interface DbHandle {
  exec(sql: string): void;
  prepare(sql: string): SqlStatement;
  close(): void;
}

export interface OpenOptions {
  readOnly?: boolean;
  create?: boolean;
}

export interface PoolLike {
  /** The VFS name under which the pool is registered (e.g. "opfs-sahpool"). */
  readonly vfsName: string;

  /** Open a logical database file (absolute name, e.g. "/ara.db"). */
  open(name: string, opts?: OpenOptions): DbHandle;

  /** Import bytes under an absolute logical name, overwriting the entry. */
  importDb(name: string, bytes: Uint8Array): Promise<number>;

  /** Read the bytes of a logical file back out. */
  exportFile(name: string): Promise<Uint8Array>;

  /** Disassociate a logical file from the pool. Returns true if it existed. */
  unlink(name: string): boolean;

  /** Names of the logical files currently known to the pool. */
  fileNames(): string[];

  /** Ensure the pool can hold at least `min` logical files. */
  reserveMinimumCapacity(min: number): Promise<number>;
}
