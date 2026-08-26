import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { Buffer } from "node:buffer";
import { EngineError, BOOKS } from "@openbible/engine-core";
import type { BibleBook, Verse, SearchResult, InstalledBible, InstallationStage } from "@openbible/engine-core";
import type { BibleLibrary, InstalledBibleRegistry, BibleInstaller, InstallPackageInput, InstallationObserver } from "@openbible/engine";
import type { DriverFactory } from "./driver.js";

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
export const SQLITE_HEADER = Buffer.from(SQLITE_HEADER_TEXT, "utf8");

function canonicalOrder(): Map<string, number> {
  const m = new Map<string, number>();
  BOOKS.forEach((b, idx) => m.set(b.id, idx));
  return m;
}
const ORDER = canonicalOrder();

function isSqliteHeader(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) {
    if (bytes[i] !== SQLITE_HEADER[i]) return false;
  }
  return true;
}

interface ValidateResult {
  versionId: string;
  name: string;
  books: BibleBook[];
  verses: Verse[];
}

/** Validates a materialized SQLite bible file: header, schema, identity, sanity. */
function validateMaterializedBibleFile(
  driverFactory: DriverFactory,
  filename: string,
  expectedVersionId: string,
): ValidateResult {
  const driver = driverFactory(filename, { readOnly: true });
  try {
    const tables = (
      driver.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>
    ).map((r) => String(r.name));
    for (const t of ["metadata", "book", "verse"]) {
      if (!tables.includes(t)) {
        throw new EngineError("unsupported_schema", `Unsupported schema: missing table '${t}'`);
      }
    }

    const versionId = readMetadata(driver, "versionId") ?? readMetadata(driver, "id");
    if (!versionId) throw new EngineError("invalid_package", "Invalid package: metadata versionId missing");
    if (versionId !== expectedVersionId) {
      throw new EngineError(
        "invalid_package",
        `Invalid package: versionId mismatch expected ${expectedVersionId} got ${versionId}`,
      );
    }

    const bookCount = Number((driver.prepare("SELECT COUNT(*) AS c FROM book").get() as { c: number }).c);
    const verseCount = Number((driver.prepare("SELECT COUNT(*) AS c FROM verse").get() as { c: number }).c);
    if (bookCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty book table");
    if (verseCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty verse table");

    const name = readMetadata(driver, "name") ?? versionId;
    return { versionId, name, books: loadBooks(driver), verses: loadVerses(driver) };
  } finally {
    driver.close();
  }
}

function readMetadata(driver: ReturnType<DriverFactory>, key: string): string | null {
  const row = driver.prepare("SELECT value FROM metadata WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? String(row.value) : null;
}

function loadBooks(driver: ReturnType<DriverFactory>): BibleBook[] {
  const rows = driver.prepare("SELECT book_id, MAX(chapter) AS chapters FROM verse GROUP BY book_id").all() as Array<{
    book_id: string;
    chapters: number;
  }>;
  const nameById = new Map<string, string>();
  for (const b of driver.prepare("SELECT id, name FROM book").all() as Array<{ id: string; name: string }>) {
    nameById.set(String(b.id), String(b.name));
  }
  const byId = new Map<string, BibleBook>();
  for (const row of rows) {
    const id = String(row.book_id);
    const meta = BOOKS.find((b) => b.id === id);
    const book: BibleBook = meta
      ? { ...meta, chapters: Number(row.chapters) }
      : {
          id,
          name: nameById.get(id) ?? id,
          abbreviation: id,
          testament: "old",
          chapters: Number(row.chapters),
        };
    byId.set(id, book);
  }
  return [...byId.values()];
}

function loadVerses(driver: ReturnType<DriverFactory>): Verse[] {
  const rows = driver.prepare("SELECT book_id, chapter, verse, text FROM verse").all() as Array<{
    book_id: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  return rows.map((r) => ({
    id: `${r.book_id}-${r.chapter}-${r.verse}`,
    bookId: String(r.book_id),
    chapter: Number(r.chapter),
    verse: Number(r.verse),
    text: String(r.text),
  }));
}

// ---------------------------------------------------------------------------
// Read-only library over real SQLite files.
// ---------------------------------------------------------------------------

export class NativeBibleLibrary implements BibleLibrary {
  private open = new Map<string, ReturnType<DriverFactory>>();

  constructor(
    private readonly dataDir: string,
    private readonly driverFactory: DriverFactory,
  ) {}

  private path(versionId: string): string {
    return join(this.dataDir, `${versionId}.db`);
  }

  private openReadonly(versionId: string): ReturnType<DriverFactory> {
    const cached = this.open.get(versionId);
    if (cached) return cached;
    const driver = this.driverFactory(this.path(versionId), { readOnly: true });
    this.open.set(versionId, driver);
    return driver;
  }

  private require(versionId: string): ReturnType<DriverFactory> {
    const driver = this.openReadonly(versionId);
    driver.prepare("SELECT COUNT(*) AS c FROM metadata").get();
    return driver;
  }

  async getBooks(versionId: string): Promise<BibleBook[]> {
    const driver = this.require(versionId);
    const books = loadBooks(driver);
    return books.sort((a, b) => {
      const ao = ORDER.get(a.id);
      const bo = ORDER.get(b.id);
      return (ao ?? Number.MAX_SAFE_INTEGER) - (bo ?? Number.MAX_SAFE_INTEGER);
    });
  }

  async getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> {
    const driver = this.require(versionId);
    const rows = driver
      .prepare("SELECT book_id, chapter, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse")
      .all(bookId, chapter) as Array<{ book_id: string; chapter: number; verse: number; text: string }>;
    return rows.map((r) => ({
      id: `${r.book_id}-${r.chapter}-${r.verse}`,
      bookId: String(r.book_id),
      chapter: Number(r.chapter),
      verse: Number(r.verse),
      text: String(r.text),
    }));
  }

  async search(versionId: string, query: string, limit: number): Promise<SearchResult> {
    const driver = this.require(versionId);
    if (!query || query.trim().length === 0) return { versionId, query, results: [], total: 0 };
    const rows = driver
      .prepare(
        "SELECT book_id, chapter, verse, text FROM verse WHERE text LIKE ? COLLATE NOCASE ORDER BY book_id, chapter, verse LIMIT ?",
      )
      .all(`%${query}%`, limit) as Array<{ book_id: string; chapter: number; verse: number; text: string }>;
    const results = rows.map((r) => ({
      id: `${r.book_id}-${r.chapter}-${r.verse}`,
      bookId: String(r.book_id),
      chapter: Number(r.chapter),
      verse: Number(r.verse),
      text: String(r.text),
    }));
    return { versionId, query, results, total: results.length };
  }

  async getVersionName(versionId: string): Promise<string | null> {
    const driver = this.require(versionId);
    return readMetadata(driver, "name");
  }
}

// ---------------------------------------------------------------------------
// Transactional installer (owns validate → commit → rollback/cleanup).
// ---------------------------------------------------------------------------

async function exists(path: string): Promise<boolean> {
  try {
    await import("node:fs/promises").then((fs) => fs.access(path));
    return true;
  } catch {
    return false;
  }
}

export class NativeBibleInstaller implements BibleInstaller {
  constructor(
    private readonly dataDir: string,
    private readonly registry: InstalledBibleRegistry,
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
    if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: token.reason });

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

    try {
      emit("validating_header");
      if (!isSqliteHeader(bytes)) throw new EngineError("invalid_package", "Invalid package: not a SQLite database");
      await writeFile(tmp, bytes);

      emit("validating_schema");
      const validated = validateMaterializedBibleFile(this.driverFactory, tmp, versionId);
      emit("validating_identity");
      emit("sanity_check");

      emit("promoting");
      const hadPrevious = await exists(final);
      if (hadPrevious) {
        await rm(bak, { force: true });
        await rename(final, bak);
      }
      await rename(tmp, final);

      emit("registering");
      let registered = false;
      try {
        await this.registry.set({
          id: versionId,
          name: input.name ?? validated.name ?? versionId,
          installedAt: input.installedAt,
          versionCode: input.versionCode,
        });
        registered = true;
      } catch (e) {
        await rm(final, { force: true });
        if (hadPrevious) await rename(bak, final);
        throw new EngineError("storage_unavailable", "Failed to register installed bible", { cause: e });
      }

      if (hadPrevious && registered) await rm(bak, { force: true });
      return {
        id: versionId,
        name: input.name ?? validated.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      };
    } catch (e) {
      await rm(tmp, { force: true });
      if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: e });
      if (e instanceof EngineError) throw e;
      throw new EngineError("storage_unavailable", "Installation failed", { cause: e });
    }
  }

  async uninstall(versionId: string): Promise<void> {
    const final = this.path(versionId);
    const trash = this.trashPath(versionId);
    const hasStorage = await exists(final);
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    if (!hasStorage && !hasRegistry) {
      throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    }
    // Atomic removal with compensation: move storage to trash (reversible), then
    // drop the registry record; restore storage if registry removal fails.
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
    const hasStorage = await exists(this.path(versionId));
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    return hasStorage && hasRegistry;
  }
}

export { validateMaterializedBibleFile };
export type { ValidateResult };
