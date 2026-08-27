import type { InstalledBible } from "@openbible/engine-core";
import type { PoolLike } from "../pool.js";
import { finalPath, backupPath, trashPath, REGISTRY_DB } from "./paths.js";

export interface ReconcileStats {
  removedTmp: number;
  restored: number;
  removedStaleRegistry: number;
  removedOrphans: number;
  removedTrash: number;
}

/** Sync subset of the registry used during startup reconciliation. */
export interface RegistryReconcile {
  listSync(): InstalledBible[];
  getSync(id: string): InstalledBible | null;
  removeSync(id: string): void;
}

async function copy(pool: PoolLike, from: string, to: string): Promise<void> {
  const bytes = await pool.exportFile(from);
  await pool.importDb(to, bytes);
}

async function restore(pool: PoolLike, from: string, to: string): Promise<void> {
  if (pool.fileNames().includes(to)) await pool.unlink(to);
  await copy(pool, from, to);
  await pool.unlink(from);
}

/**
 * BEST-EFFORT startup reconciliation (no journal, never crash-safe).
 *
 * Heuristics (FR-007), run on a closed pool before any read handle is opened:
 *  - remove abandoned temporary files;
 *  - restore the previous version when a backup exists;
 *  - restore transient trash when the registry still references the version,
 *    else discard it;
 *  - remove an orphan final with no registry entry;
 *  - remove a stale registry entry with no final file;
 *  - never treat the registry database (`store.db`) as an orphan.
 */
export async function reconcilePool(
  pool: PoolLike,
  registry: RegistryReconcile,
): Promise<ReconcileStats> {
  const stats: ReconcileStats = {
    removedTmp: 0,
    restored: 0,
    removedStaleRegistry: 0,
    removedOrphans: 0,
    removedTrash: 0,
  };

  const names = pool.fileNames();

  // 1) Abandoned temporaries are never a valid installed artifact.
  for (const name of names) {
    if (name.includes(".db.tmp-")) {
      pool.unlink(name);
      stats.removedTmp++;
    }
  }

  // 2) Candidate versions = registry entries ∪ on-disk logical files, excluding
  //    the registry database itself.
  const ids = new Set<string>();
  for (const entry of registry.listSync()) ids.add(entry.id);
  for (const name of pool.fileNames()) {
    if (name === REGISTRY_DB) continue;
    const m = name.match(/^\/(.+)\.db(\.bak|\.trash(\.db)?|\.tmp-[^\/]*)?$/);
    if (m) ids.add(m[1]);
  }

  const present = (p: string) => pool.fileNames().includes(p);

  for (const id of ids) {
    const final = finalPath(id);
    const bak = backupPath(id);
    const trash = trashPath(id);
    const hasRegistry = registry.getSync(id) !== null;

    // Backup handling: restore the previous version if no final is present,
    // or deterministically roll back an ambiguous final + backup pair.
    if (present(bak)) {
      if (!present(final)) {
        await restore(pool, bak, final);
        stats.restored++;
      } else {
        await restore(pool, bak, final);
        stats.restored++;
      }
    }

    // Trash handling: keep the version when the registry still references it.
    if (present(trash)) {
      if (!present(final)) {
        if (hasRegistry) {
          await restore(pool, trash, final);
          stats.restored++;
        } else {
          pool.unlink(trash);
          stats.removedTrash++;
        }
      } else {
        pool.unlink(trash);
      }
    }

    // A final with no registry entry is an orphan (e.g. first install
    // interrupted after promote and before registry) => discard it.
    if (!hasRegistry && present(final)) {
      pool.unlink(final);
      stats.removedOrphans++;
    }

    // A registry entry with no final file is stale.
    if (hasRegistry && !present(final)) {
      registry.removeSync(id);
      stats.removedStaleRegistry++;
    }
  }

  return stats;
}
