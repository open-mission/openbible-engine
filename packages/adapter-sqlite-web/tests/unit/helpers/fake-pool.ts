/**
 * Fake SAHPool for Node unit tests. Backed by real `node:sqlite` over a
 * temporary directory, mirroring the OPFS SAHPool semantics the worker uses:
 * import / export / unlink of named logical database files.
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { PoolLike, DbHandle, OpenOptions, SqlStatement } from "../../../src/pool.js";

class Handle implements DbHandle {
  #db: DatabaseSync;
  constructor(db: DatabaseSync) {
    this.#db = db;
  }
  exec(sql: string): void {
    this.#db.exec(sql);
  }
  prepare(sql: string): SqlStatement {
    const stmt = this.#db.prepare(sql);
    return {
      run: (...p) => stmt.run(...(p as never[])),
      get: (...p) => (stmt.get(...(p as never[])) as Record<string, unknown> | undefined) ?? undefined,
      all: (...p) => stmt.all(...(p as never[])) as Record<string, unknown>[],
    };
  }
  close(): void {
    try {
      this.#db.close();
    } catch {
      /* already closed */
    }
  }
}

export class FakePool implements PoolLike {
  readonly vfsName = "opfs-sahpool";
  readonly dir: string;
  private min: number;

  constructor(opts?: { minCapacity?: number }) {
    this.dir = mkdtempSync(join(tmpdir(), "openbible-fakepool-"));
    this.min = opts?.minCapacity ?? 8;
  }

  private path(name: string): string {
    return join(this.dir, name.replace(/^\/+/, ""));
  }

  open(name: string, opts?: OpenOptions): DbHandle {
    const p = this.path(name);
    const db = new DatabaseSync(p, { readOnly: opts?.readOnly ?? false });
    return new Handle(db);
  }

  async importDb(name: string, bytes: Uint8Array): Promise<number> {
    const p = this.path(name);
    writeFileSync(p, Buffer.from(bytes));
    return bytes.length;
  }

  async exportFile(name: string): Promise<Uint8Array> {
    const p = this.path(name);
    if (!existsSync(p)) throw new Error(`no such database: ${name}`);
    return new Uint8Array(readFileSync(p));
  }

  unlink(name: string): boolean {
    const p = this.path(name);
    if (!existsSync(p)) return false;
    rmSync(p, { force: true });
    return true;
  }

  fileNames(): string[] {
    return readdirSync(this.dir).map((f) => "/" + f);
  }

  async reserveMinimumCapacity(min: number): Promise<number> {
    this.min = Math.max(this.min, min);
    return this.min;
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}
