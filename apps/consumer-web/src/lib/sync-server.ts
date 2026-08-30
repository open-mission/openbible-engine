import { createTursoSyncAdapter } from "@openbible/adapter-sync-turso";
import type { SyncRemote } from "@openbible/sync";

let remotePromise: ReturnType<typeof createTursoSyncAdapter> | undefined;

export function getSyncRemote(): ReturnType<typeof createTursoSyncAdapter> {
  remotePromise ??= createTursoSyncAdapter({
    url: required("DATABASE_URL"),
    authToken: required("DATABASE_TURSO_TOKEN"),
  });
  return remotePromise;
}

export type SyncRemoteFactory = () => Promise<SyncRemote>;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required Sync configuration: ${name}`);
  return value;
}
