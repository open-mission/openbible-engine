import { EngineError } from "@openbible/engine-core";
import type { InstalledBible, InstallationStage, CancellationToken } from "@openbible/engine-core";
import type {
  BibleInstaller,
  InstalledBibleRegistry,
  InstallPackageInput,
  InstallationObserver,
} from "@openbible/engine";
import type { PoolLike, DbHandle } from "../pool.js";
import { finalPath, backupPath, temporaryPath } from "./paths.js";

const SQLITE_HEADER = new TextEncoder().encode("SQLite format 3\0");

export function isSqliteHeader(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) {
    if (bytes[i] !== SQLITE_HEADER[i]) return false;
  }
  return true;
}

function throwIfAborted(token?: CancellationToken): asserts token {
  if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: token.reason });
}

interface ValidateResult {
  name: string;
  versionId?: string;
}

function validateImportedPackage(db: DbHandle, expectedVersionId: string): ValidateResult {
  const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{
    name: string;
  }>).map((r) => String(r.name));
  for (const t of ["metadata", "book", "verse"]) {
    if (!tables.includes(t)) throw new EngineError("unsupported_schema", `Unsupported schema: missing table '${t}'`);
  }
  const row = db.prepare("SELECT value FROM metadata WHERE key = 'versionId'").get() as
    | { value: string }
    | undefined;
  const idRow = db.prepare("SELECT value FROM metadata WHERE key = 'id'").get() as { value: string } | undefined;
  const storedVersionId = row?.value ?? idRow?.value ?? null;
  if (storedVersionId !== null && storedVersionId !== expectedVersionId) {
    throw new EngineError(
      "invalid_package",
      `Invalid package: versionId mismatch expected ${expectedVersionId} got ${storedVersionId}`,
    );
  }
  const bookCount = Number((db.prepare("SELECT COUNT(*) AS c FROM book").get() as { c: number }).c);
  const verseCount = Number((db.prepare("SELECT COUNT(*) AS c FROM verse").get() as { c: number }).c);
  if (bookCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty book table");
  if (verseCount === 0) throw new EngineError("unsupported_schema", "Unsupported schema: empty verse table");
  const nameRow = db.prepare("SELECT value FROM metadata WHERE key = 'name'").get() as { value: string } | undefined;
  return { name: nameRow?.value ?? expectedVersionId, versionId: storedVersionId ?? undefined };
}

/**
 * Exception-safe, best-effort installer for the OPFS SAHPool.
 *
 * Promotion is a copy/import sequence (no public SAHPool rename), so the
 * guarantee is deliberately limited to exception safety and best-effort
 * reconciliation — not atomic rename or crash safety.
 *
 * Flow: import temporary → validate → backup final (via export/import) →
 * promote final (copy temporary) → register → cleanup. On any controlled
 * failure the previous version is restored and intermediates are removed.
 */
export class WebInstaller implements BibleInstaller {
  constructor(
    private readonly pool: PoolLike,
    private readonly registry: InstalledBibleRegistry,
  ) {}

  async install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible> {
    const { versionId, bytes, token } = input;
    throwIfAborted(token);
    await this.pool.reserveMinimumCapacity(8);

    const final = finalPath(versionId);
    const bak = backupPath(versionId);
    const tmp = temporaryPath(versionId, `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    const emit = (stage: InstallationStage) => {
      if (!observer) return;
      try {
        observer.onProgress({ versionId, stage, receivedBytes: bytes.length, totalBytes: bytes.length });
      } catch {
        // observer errors do not abort installation
      }
    };

    // Track whether promotion was reached so compensation can restore the
    // previous version deterministically.
    let promoted = false;
    let hadPrevious = false;
    try {
      emit("validating_header");
      if (!isSqliteHeader(bytes)) {
        throw new EngineError("invalid_package", "Invalid package: not a SQLite database");
      }
      throwIfAborted(token);
      await this.pool.importDb(tmp, bytes);
      throwIfAborted(token);

      emit("validating_schema");
      let validated: ValidateResult;
      {
        const handle = this.pool.open(tmp, { readOnly: true, create: false });
        try {
          validated = validateImportedPackage(handle, versionId);
        } finally {
          handle.close();
        }
      }
      throwIfAborted(token);
      emit("validating_identity");
      emit("sanity_check");

      emit("promoting");
      throwIfAborted(token);
      hadPrevious = this.hasFile(final);
      if (hadPrevious) {
        // close any open handle before replacing (SAHPool import on open = undefined)
        this.closeVersion(versionId);
        const previous = await this.pool.exportFile(final);
        await this.pool.importDb(bak, previous);
      }
      throwIfAborted(token);
      const promotedBytes = await this.pool.exportFile(tmp);
      await this.pool.importDb(final, promotedBytes);
      await this.pool.unlink(tmp);
      promoted = true;

      emit("registering");
      throwIfAborted(token);
      await this.registry.set({
        id: versionId,
        name: input.name ?? validated.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      });

      if (hadPrevious) await this.pool.unlink(bak);
      return {
        id: versionId,
        name: input.name ?? validated.name ?? versionId,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      };
    } catch (e) {
      await this.compensate(final, bak, tmp, hadPrevious, promoted);
      if (token?.aborted) throw new EngineError("cancelled", "Installation cancelled", { cause: e });
      if (e instanceof EngineError) throw e;
      throw new EngineError("storage_unavailable", "Installation failed", { cause: e });
    }
  }

  private async compensate(
    final: string,
    bak: string,
    tmp: string,
    hadPrevious: boolean,
    promoted: boolean,
  ): Promise<void> {
    if (this.hasFile(bak)) {
      const backup = await this.pool.exportFile(bak);
      // Restore the previous version over any partially promoted final.
      if (this.hasFile(final)) await this.pool.unlink(final);
      await this.pool.importDb(final, backup);
      await this.pool.unlink(bak);
    } else if (promoted && this.hasFile(final)) {
      // first install failed after promote => undo the new final
      await this.pool.unlink(final);
    }
    if (this.hasFile(tmp)) await this.pool.unlink(tmp);
  }

  private hasFile(name: string): boolean {
    return this.pool.fileNames().includes(name);
  }

  async uninstall(versionId: string): Promise<void> {
    const final = finalPath(versionId);
    const trashPath = `${final}.trash`;
    const hasStorage = this.hasFile(final);
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    if (!hasStorage && !hasRegistry) {
      throw new EngineError("version_not_installed", `Version not installed: ${versionId}`);
    }
    this.closeVersion(versionId);
    if (hasStorage) {
      const bytes = await this.pool.exportFile(final);
      await this.pool.importDb(trashPath, bytes);
      await this.pool.unlink(final);
    }
    try {
      if (hasRegistry) await this.registry.remove(versionId);
    } catch (e) {
      if (hasStorage && this.hasFile(trashPath)) {
        const bytes = await this.pool.exportFile(trashPath);
        await this.pool.importDb(final, bytes);
        await this.pool.unlink(trashPath);
      }
      throw new EngineError("storage_unavailable", "Failed to remove installed bible", { cause: e });
    }
    if (hasStorage && this.hasFile(trashPath)) await this.pool.unlink(trashPath);
  }

  async isInstalled(versionId: string): Promise<boolean> {
    const hasStorage = this.hasFile(finalPath(versionId));
    const hasRegistry = (await this.registry.get(versionId)) !== null;
    return hasStorage && hasRegistry;
  }

  private closeVersion(versionId: string): void {
    // The worker injects the library close hook so installs close open read
    // handles before replacing the final file (SAHPool import on open db is
    // undefined).
    if (this.closeVersionHook) this.closeVersionHook(versionId);
  }

  /** Hook that the worker sets so installs close open read handles first. */
  closeVersionHook?: (versionId: string) => void;
}
