import { EngineError, normalizeVersionId } from "@openbible/engine-core";
import type { InstalledBible, InstallationStage } from "@openbible/engine-core";
import type { BibleInstaller, InstallPackageInput, InstallationObserver, InstalledBibleRegistry } from "@openbible/engine";
import { inspectLegacySqlite, type NativeParseError } from "./legacy-sqlite.js";
import { NativeBibleLibrary } from "./native-library.js";
import { NativeRegistry } from "./native-registry.js";
import type { NativeStorage } from "./storage.js";

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function idFromFile(path: string, suffix: string): string | null {
  const name = basename(path);
  if (!name.endsWith(suffix)) return null;
  const id = name.slice(0, -suffix.length);
  try {
    return normalizeVersionId(id);
  } catch {
    return null;
  }
}

function emit(observer: InstallationObserver | undefined, versionId: string, stage: InstallationStage, size: number): void {
  if (!observer) return;
  try {
    observer.onProgress({ versionId, stage, receivedBytes: size, totalBytes: size });
  } catch {
    // Observer failures never change storage state.
  }
}

export class NativeInstaller implements BibleInstaller {
  constructor(
    private readonly storage: NativeStorage,
    private readonly registry: NativeRegistry,
    private readonly library: NativeBibleLibrary,
  ) {}

  installSync(input: InstallPackageInput, observer?: InstallationObserver): InstalledBible {
    const versionId = normalizeVersionId(input.versionId);
    const final = `bibles/${versionId}.db`;
    const temporary = `bibles/${versionId}.db.tmp`;
    const backup = `bibles/${versionId}.db.bak`;
    const hadPrevious = this.storage.exists(final);
    const previous = this.registry.getSync(versionId);
    let promoted = false;
    let registered = false;

    try {
      emit(observer, versionId, "validating_header", input.bytes.length);
      this.storage.writeFile(temporary, input.bytes);
      if (input.token?.aborted) throw new EngineError("cancelled", "Installation cancelled");

      emit(observer, versionId, "validating_schema", input.bytes.length);
      const validated = inspectLegacySqlite(this.storage.readFile(temporary), versionId);
      emit(observer, versionId, "validating_identity", input.bytes.length);
      emit(observer, versionId, "sanity_check", input.bytes.length);

      emit(observer, versionId, "promoting", input.bytes.length);
      this.library.closeVersion(versionId);
      if (hadPrevious) {
        this.storage.remove(backup);
        this.storage.rename(final, backup);
      }
      this.storage.rename(temporary, final);
      promoted = true;

      emit(observer, versionId, "registering", input.bytes.length);
      const installed = {
        id: versionId,
        name: input.name ?? validated.name,
        installedAt: input.installedAt,
        versionCode: input.versionCode,
      };
      this.registry.setSync(installed);
      registered = true;
      if (hadPrevious) this.storage.remove(backup);
      return installed;
    } catch (error) {
      this.storage.remove(temporary);
      if (promoted) {
        this.storage.remove(final);
        if (hadPrevious && this.storage.exists(backup)) this.storage.rename(backup, final);
      } else if (hadPrevious && this.storage.exists(backup) && !this.storage.exists(final)) {
        this.storage.rename(backup, final);
      }
      try {
        if (registered) {
          if (previous) this.registry.setSync(previous);
          else this.registry.removeSync(versionId);
        }
      } catch {
        // Registry writes are atomic; preserve the original failure for callers.
      }
      if (error instanceof EngineError) throw error;
      if (error && typeof error === "object" && "code" in error && "message" in error) {
        const parseError = error as NativeParseError;
        throw new EngineError(parseError.code, parseError.message);
      }
      throw new EngineError("storage_unavailable", "Native installation failed", { cause: error });
    }
  }

  async install(input: InstallPackageInput, observer?: InstallationObserver): Promise<InstalledBible> {
    return this.installSync(input, observer);
  }

  uninstallSync(versionId: string): void {
    const id = normalizeVersionId(versionId);
    const final = `bibles/${id}.db`;
    const trash = `bibles/${id}.db.trash`;
    const hasStorage = this.storage.exists(final);
    const previous = this.registry.getSync(id);
    if (!hasStorage && !previous) throw new EngineError("version_not_installed", `Version not installed: ${id}`);
    this.library.closeVersion(id);
    if (hasStorage) {
      this.storage.remove(trash);
      this.storage.rename(final, trash);
    }
    try {
      if (previous) this.registry.removeSync(id);
      if (hasStorage) this.storage.remove(trash);
    } catch (error) {
      if (hasStorage && this.storage.exists(trash)) this.storage.rename(trash, final);
      if (previous) {
        try { this.registry.setSync(previous); } catch { /* keep original failure */ }
      }
      throw new EngineError("storage_unavailable", "Failed to remove installed bible", { cause: error });
    }
  }

  async uninstall(versionId: string): Promise<void> {
    this.uninstallSync(versionId);
  }

  isInstalledSync(versionId: string): boolean {
    const id = normalizeVersionId(versionId);
    return this.storage.exists(`bibles/${id}.db`) && this.registry.getSync(id) !== null;
  }

  async isInstalled(versionId: string): Promise<boolean> {
    return this.isInstalledSync(versionId);
  }
}

export interface NativeReconcileStats {
  readonly removedTmp: number;
  readonly restored: number;
  readonly removedStaleRegistry: number;
  readonly removedOrphans: number;
}

export function reconcileNativeStorage(storage: NativeStorage, registry: NativeRegistry): NativeReconcileStats {
  let removedTmp = 0;
  let restored = 0;
  let removedStaleRegistry = 0;
  let removedOrphans = 0;
  const files = storage.list("bibles");

  for (const file of files) {
    if (file.endsWith(".db.tmp")) {
      storage.remove(file);
      removedTmp += 1;
      continue;
    }
    const backupId = idFromFile(file, ".db.bak");
    if (backupId) {
      const final = `bibles/${backupId}.db`;
      if (storage.exists(final)) storage.remove(file);
      else {
        storage.rename(file, final);
        restored += 1;
      }
      continue;
    }
    const trashId = idFromFile(file, ".db.trash");
    if (trashId) {
      const final = `bibles/${trashId}.db`;
      if (registry.getSync(trashId) && !storage.exists(final)) {
        storage.rename(file, final);
        restored += 1;
      } else storage.remove(file);
    }
  }

  for (const entry of registry.listSync()) {
    if (!storage.exists(`bibles/${entry.id}.db`)) {
      registry.removeSync(entry.id);
      removedStaleRegistry += 1;
    }
  }
  for (const file of storage.list("bibles")) {
    const id = idFromFile(file, ".db");
    if (id && !registry.getSync(id)) {
      storage.remove(file);
      removedOrphans += 1;
    }
  }
  return { removedTmp, restored, removedStaleRegistry, removedOrphans };
}
