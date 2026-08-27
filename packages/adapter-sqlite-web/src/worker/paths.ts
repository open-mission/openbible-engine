/**
 * Logical pool path derivation for the Web worker.
 *
 * All SAHPool names must be absolute and are derived solely from an already
 * normalized version id (no user-controlled separators), so a hostile id can
 * never escape the pool namespace.
 */

export const REGISTRY_DB = "/store.db";

export function finalPath(versionId: string): string {
  return `/${versionId}.db`;
}

export function backupPath(versionId: string): string {
  return `/${versionId}.db.bak`;
}

export function trashPath(versionId: string): string {
  return `/${versionId}.db.trash`;
}

export function temporaryPath(versionId: string, nonce: string): string {
  return `/${versionId}.db.tmp-${nonce}`;
}
