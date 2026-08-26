import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Buffer } from "node:buffer";
import { EngineError } from "@openbible/engine-core";
import type { BibleBook, Verse, SearchResult, InstalledBible, InstallationStage } from "@openbible/engine-core";
import type { BibleLibrary, InstalledBibleRegistry, BibleInstaller, InstallPackageInput, InstallationObserver } from "@openbible/engine";
import type { DriverFactory } from "./driver.js";
import { intToBook, bookIdToInt, intToCanonicalId } from "./legacy-book-map.js";

const SQLITE_HEADER = Buffer.from("SQLite format 3\0", "utf8");

function isSqliteHeader(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) {
    if (bytes[i] !== SQLITE_HEADER[i]) return false;
  }
  return true;
}

function readMetadata(driver: ReturnType<DriverFactory>, key: string): string | null {
  const row = driver.prepare("SELECT value FROM metadata WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? String(row.value) : null;
}

interface ValidateResult {
  name: string;
  versionId?: string;
}

/**
 * Validates a materialized legacy SQLite bible file (header, schema, optional
 * identity, sanity). `metadata.versionId` is optional: legacy databases expose
 * only `name`, and must not be rejected for lacking a versionId.
 */
function validateMaterializedBibleFile(
  driverFactory: DriverFactory,
  filename: string,
  expectedVersionId: string,
): ValidateResult {
  if (!existsSync(filename)) throw new EngineError("invalid_package", "Invalid package: file missing");
  const driver = driverFactory(filename, { readOnly: true });
  try {
    const tables = (
      driver.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>
    ).map((r) => String(r.name));
    for (const t of ["metadata", "book", "verse"]) {
      if (!tables.includes(t)) throw new EngineError("unsupported_schema", `Unsupported schema: missing table '${t}'`);
    }

    // Identity: optional in the legacy schema.
    const storedVersionId = readMetadata(driver, "versionId") ?? readMetadata(driver, "id");
    if (storedVersionId !== null && storedVersionId !== expectedVersionId) {
      throw new EngineError(
        "invalid_package",
        `Invalid package: versionId mismatch expected ${expectedVersionId} got ${storedVersionId}`,
      );
    }

    const bookCount = Number((driver.prepare("SELECT COUNT(*) AS c FROM book").get() as { c: number }).c);
    const verseCount = Number((driver.prepare("SELECT COUNT(*) AS c FROM verse").get() as { c: number }).c);
    if (bookCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty book table");
    if (verseCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty verse table");

    const name = readMetadata(driver, "name") ?? expectedVersionId;
    return { name, versionId: storedVersionId ?? undefined };
  } finally {
    driver.close();
  }
}

function loadBooks(driver: ReturnType<DriverFactory>): BibleBook[] {
  const rows = driver
    .prepare("SELECT b.id, MAX(v.chapter) AS chapters FROM book b JOIN verse v ON v.book_id = b.id GROUP BY b.id ORDER BY b.id")
    .all() as Array<{ id: number; chapters: number }>;
  const books: BibleBook[] = [];
  for (const row of rows) {
    const book = intToBook(Number(row.id));
    if (!book) continue; // unknown int id => skip (legacy behavior)
    books.push({ ...book, chapters: Number(row.chapters) });
  }
  return books;
}

interface RawVerse {
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

function toVerse(raw: RawVerse): Verse | null {
  const canonical = intToCanonicalId(Number(raw.book_id));
  if (!canonical) return null;
  return {
    id: `${canonical}-${Number(raw.chapter)}-${Number(raw.verse)}`,
    bookId: canonical,
    chapter: Number(raw.chapter),
    verse: Number(raw.verse),
    text: String(raw.text),
  };
}

// ---------------------------------------------------------------------------
// Read-only library over real legacy SQLite files (with connection lifecycle).
// ---------------------------------------------------------------------------

export class NodeBibleLibrary implements BibleLibrary {
  private open = new Map<string, ReturnType<DriverFactory>>();
  private closed = false;

  constructor(
    private readonly dataDir: string,
    private readonly driverFactory: DriverFactory,
  ) {}

  private path(versionId: string): string {
    return join(this.dataDir, `${versionId}.db`);
  }

  /** Close the read-only connection for a version (call before replace/remove). */
  closeVersion(versionId: string): void {
    const d = this.open.get(versionId);
    if (d) {
      d.close();
      this.open.delete(versionId);
    }
  }

  /** Close all open connections; no further reads are possible. */
  close(): void {
    for (const d of this.open.values()) {
      try {
        d.close();
      } catch {
        // ignore
      }
    }
    this.open.clear();
    this.closed = true;
  }

  private require(versionId: string): ReturnType<DriverFactory> {
    if (this.closed) throw new EngineError("storage_unavailable", "Bible library is closed");
    let driver = this.open.get(versionId);
    if (!driver) {
      driver = this.driverFactory(this.path(versionId), { readOnly: true });
      this.open.set(versionId, driver);
    }
    driver.prepare("SELECT COUNT(*) AS c FROM metadata").get();
    return driver;
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    return loadBooks(this.require(versionId));
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    const intId = bookIdToInt(bookId);
    if (intId === undefined) return [];
    const rows = this.require(versionId)
      .prepare("SELECT book_id, chapter, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse")
      .all(intId, chapter) as unknown as RawVerse[];
    const verses: Verse[] = [];
    for (const r of rows) {
      const v = toVerse(r);
      if (v) verses.push(v);
    }
    return verses;
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const driver = this.require(versionId);
    if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
    const pattern = `%${query}%`;

    // Total matches BEFORE the LIMIT (COUNT(*) over the same filter).
    const total = Number(
      (driver.prepare("SELECT COUNT(*) AS c FROM verse WHERE text LIKE ? COLLATE NOCASE").get(pattern) as { c: number }).c,
    );

    // Results ordered by the legacy integer book_id (canonical biblical order),
    // then chapter, then verse.
    const rows = driver
      .prepare(
        "SELECT book_id, chapter, verse, text FROM verse WHERE text LIKE ? COLLATE NOCASE ORDER BY book_id, chapter, verse LIMIT ?",
      )
      .all(pattern, limit) as unknown as RawVerse[];
    const results: Verse[] = [];
    for (const r of rows) {
      const v = toVerse(r);
      if (v) results.push(v);
    }
    return { versionId, query, results, total };
  }

  async getVersionName(versionId: string): Promise<string | null> {
    return readMetadata(this.require(versionId), "name");
  }
}

// ---------------------------------------------------------------------------
// Transactional + exception-safe installer (stage → validate → commit →
// rollback/cleanup) with cancellation checkpoints.
// ---------------------------------------------------------------------------

function throwIfAborted(token?: { aborted: boolean; reason?: unknown }): void {
  if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled", { cause: token.reason });
}

export class NodeBibleInstaller implements BibleInstaller {
  constructor(
    private readonly dataDir: string,
    private readonly registry: InstalledBibleRegistry,
    private readonly library: NodeBibleLibrary,
    private readonly driverFactory: DriverFactory,
  ) {}

  private path(versionId: string): string {
    return join(this.dataDir, `${versionId}.db`);
  }
  private tmpPath(versionId: string, suffix: string): string {
    return join(this.dataDir, `${versionId}.db.tmp-${suffix}`);
  }
  private bakPath(versionId: string): string {
    return join(this.dataDir, `${versionId}.db.bak`);
  }
  private trashPath(versionId: string): string {
    return join(this.dataDir, `${versionId}.db.trash`);
  }

  async install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible> {
    const { versionId, bytes, token } = input;
    await mkdir(this.dataDir, { recursive: true });
    throwIfAborted(token);

    const tmp = this.tmpPath(versionId, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const final = this.path(versionId);
    const bak = this.bakPath(versionId);

    const emit = (stage: InstallationStage) => {
      if (!observer) return;
      try {
        observer.onProgress({ versionId, stage, receivedBytes: bytes.length, totalBytes: bytes.length });
      } catch {
        // ignore observer errors
      }
    };

    let hadPrevious = false;
    let promoted = false;
    try {
      emit("validating_header");
      if (!isSqliteHeader(bytes)) throw new EngineError("invalid_package", "Invalid package: not a SQLite database");
      await writeFile(tmp, bytes);
      throwIfAborted(token); // after write

      emit("validating_schema");
      const validated = validateMaterializedBibleFile(this.driverFactory, tmp, versionId);
      throwIfAborted(token); // after validation
      emit("validating_identity");
      emit("sanity_check");

      emit("promoting");
      throwIfAborted(token); // before moving previous
      // Close any open read handle so the file can be replaced atomically.
      this.library.closeVersion(versionId);
      hadPrevious = existsSync(final);
      if (hadPrevious) {
        await rm(bak, { force: true });
        await rename(final, bak);
      }
      throwIfAborted(token); // before promote
      await rename(tmp, final);
      promoted = true;

      emit("registering");
      throwIfAborted(token); // before register
      await this.registry.set({
        id: versionId,
        name: input.name ?? validated.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      });

      if (hadPrevious) await rm(bak, { force: true });
      // Ensure the next read opens the new file, not a stale cached handle.
      this.library.closeVersion(versionId);
      return {
        id: versionId,
        name: input.name ?? validated.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      };
    } catch (e) {
      // Unified compensation: restore consistency on any failure after promote.
      if (promoted) {
        await rm(final, { force: true });
        if (hadPrevious && existsSync(bak)) await rename(bak, final);
      } else if (hadPrevious && existsSync(bak)) {
        // moved previous to bak but never promoted => restore it
        await rename(bak, final);
      }
      await rm(tmp, { force: true });
      if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: e });
      if (e instanceof EngineError) throw e;
      throw new EngineError("storage_unavailable", "Installation failed", { cause: e });
    }
  }

  async uninstall(versionId: string): Promise<void> {
    const final = this.path(versionId);
    const trash = this.trashPath(versionId);
    const hasStorage = existsSync(final);
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    if (!hasStorage && !hasRegistry) {
      throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    }
    this.library.closeVersion(versionId);
    if (hasStorage) await rename(final, trash);
    try {
      if (hasRegistry) await this.registry.remove(versionId);
    } catch (e) {
      if (hasStorage) await rename(trash, final);
      throw new EngineError("storage_unavailable", "Failed to remove installed bible", { cause: e });
    }
    if (hasStorage) await rm(trash, { force: true });
  }

  async isInstalled(versionId: string): Promise<boolean> {
    const hasStorage = existsSync(this.path(versionId));
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    return hasStorage && hasRegistry;
  }
}

// ---------------------------------------------------------------------------
// Crash recovery / reconciliation run when an adapter is opened.
// ---------------------------------------------------------------------------

export interface ReconcileStats {
  removedTmp: number;
  restored: number;
  removedStaleRegistry: number;
}

/**
 * Synchronous crash recovery, run when an adapter is opened. It reconciles
 * intermediate `.tmp`/`.bak`/`.trash` states so the store returns to a
 * consistent state after an interrupted install/uninstall. This makes the
 * install/uninstall crash-safe (in addition to exception-safe).
 */
export function reconcileNodeDataDir(
  dataDir: string,
  registry: InstalledBibleRegistry & { listSync(): InstalledBible[]; getSync(id: string): InstalledBible | null; removeSync(id: string): void },
  library: NodeBibleLibrary,
): ReconcileStats {
  const stats: ReconcileStats = { removedTmp: 0, restored: 0, removedStaleRegistry: 0 };
  if (!existsSync(dataDir)) return stats;

  // Remove abandoned temporary files (never a valid installed artifact).
  for (const name of readdirSync(dataDir)) {
    if (name.includes(".db.tmp-")) {
      rmSync(join(dataDir, name), { force: true });
      stats.removedTmp++;
    }
  }

  // Candidate versions = known registry entries ∪ files on disk (`.db`/`.bak`/`.trash`).
  const ids = new Set<string>();
  for (const entry of registry.listSync()) ids.add(entry.id);
  for (const name of readdirSync(dataDir)) {
    const m = name.match(/^(.+)\.db(\.bak|\.trash)?$/) ?? name.match(/^(.+)\.db\.tmp-/);
    if (m) ids.add(m[1]);
  }

  for (const id of ids) {
    const final = join(dataDir, `${id}.db`);
    const bak = join(dataDir, `${id}.db.bak`);
    const trash = join(dataDir, `${id}.db.trash`);
    const hasDb = existsSync(final);
    const hasBak = existsSync(bak);
    const hasTrash = existsSync(trash);
    const hasRegistry = registry.getSync(id) !== null;

    if (hasBak) {
      if (!hasDb) {
        // install interrupted between backup and promote => restore previous
        renameSync(bak, final);
        stats.restored++;
      } else {
        // ambiguous `.db`+`.bak`: roll back to the previous version
        rmSync(final, { force: true });
        renameSync(bak, final);
        stats.restored++;
      }
    }
    if (hasTrash) {
      if (!existsSync(final)) {
        if (hasRegistry) {
          // uninstall interrupted before registry removal => restore
          renameSync(trash, final);
          stats.restored++;
        } else {
          // orphan trash (uninstall completed) => discard
          rmSync(trash, { force: true });
        }
      } else {
        rmSync(trash, { force: true });
      }
    }

    // Registry entry with no on-disk bible file is stale.
    if (hasRegistry && !existsSync(final)) {
      registry.removeSync(id);
      stats.removedStaleRegistry++;
    }
    library.closeVersion(id);
  }

  return stats;
}


