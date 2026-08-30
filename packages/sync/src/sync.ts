import {
  SyncError,
  isSyncError,
  validateSyncOperation,
  type BibleVersionPreference,
  type SyncConflict,
  type SyncCursor,
  type SyncDevice,
  type SyncOperation,
  type SyncRevision,
  type SyncTombstone,
} from "@openbible/sync-core";
import type {
  SyncCredentials,
  SyncOptions,
  SyncPullResult,
  SyncQuotaOptions,
  SyncReconcileResult,
  SyncRetryOptions,
  SyncRemote,
} from "./ports.js";

export type SyncRunState = "synced" | "offline" | "paused_auth" | "remote_error";

export interface SyncStatus {
  state: SyncRunState;
  pending: number;
  cursor?: SyncCursor;
  lastError?: string;
  conflicts?: readonly SyncConflict[];
}

export interface SyncCoordinator {
  syncNow(): Promise<SyncStatus>;
  getPending(): Promise<readonly SyncOperation[]>;
  pull(cursor?: SyncCursor): Promise<SyncPullResult>;
  reconcile(): Promise<SyncReconcileResult>;
  importNotes(operations: readonly SyncOperation[]): Promise<SyncStatus>;
  resolveConflict(conflictId: string, revisionId: string): Promise<void>;
  listDevices(): Promise<readonly SyncDevice[]>;
  approveDevice(envelope: Parameters<NonNullable<SyncRemote["approveDevice"]>>[0]): Promise<SyncDevice>;
  revokeDevice(deviceId: string): Promise<void>;
  deleteAccountData(): Promise<{ jobId: string }>;
  listBiblePreferences(): Promise<readonly BibleVersionPreference[]>;
}

export function createSync(options: SyncOptions): SyncCoordinator {
  const clock = options.clock ?? { now: () => 0 };

  async function getPending(): Promise<readonly SyncOperation[]> {
    if (options.localStore.listPending) return options.localStore.listPending();
    if (options.localStore.getPending) return options.localStore.getPending();
    return [];
  }

  function credentials(): SyncCredentials {
    const value = options.credentials;
    if (!value) throw new SyncError("auth_required", "Sync credentials are required");
    if (value.expiresAt <= clock.now()) {
      throw new SyncError("credential_expired", "Sync credentials have expired");
    }
    return value;
  }

  async function applyChanges(changes: readonly unknown[], cursor?: SyncCursor): Promise<void> {
    if (options.localStore.applyRemote) {
      for (const change of changes) await options.localStore.applyRemote(change);
    }
    if (cursor !== undefined && options.localStore.setCursor) {
      await options.localStore.setCursor(cursor);
    }
  }

  function remoteError(error: unknown): SyncError {
    if (isSyncError(error)) return error;
    return new SyncError("remote_unavailable", "Sync remote is unavailable", { cause: error });
  }

  async function syncNow(): Promise<SyncStatus> {
    const pending = await getPending();
    if (!options.credentials) return { state: "offline", pending: pending.length };

    let auth: SyncCredentials;
    try {
      auth = credentials();
    } catch (error) {
      const normalized = remoteError(error);
      return {
        state: normalized.code === "credential_expired" || normalized.code === "credential_revoked"
          ? "paused_auth"
          : "remote_error",
        pending: pending.length,
        lastError: normalized.code,
      };
    }
    let cursor = options.localStore.getCursor ? await options.localStore.getCursor() : undefined;
    let conflicts: readonly SyncConflict[] = [];
    try {
      let preflightCompleted = false;
      if (cursor !== undefined && options.remote.pull) {
        try {
          const preflight = await options.remote.pull(cursor, auth);
          const safeChanges = filterTombstonedChanges(preflight.changes);
          const detectedConflicts = detectConflicts(safeChanges, clock.now());
          conflicts = [...conflicts, ...detectedConflicts];
          await applyChanges(safeChanges, preflight.cursor);
          await applyChanges(detectedConflicts);
          cursor = preflight.cursor;
          preflightCompleted = true;
        } catch (error) {
          if (!isSyncError(error) || error.code !== "invalid_cursor" || !options.remote.reconcile) throw error;
          const snapshot = await options.remote.reconcile(auth);
          const safeChanges = filterTombstonedChanges(snapshot.changes);
          const snapshotConflicts = detectConflicts(safeChanges, clock.now());
          await applyChanges(safeChanges, snapshot.cursor);
          await applyChanges(snapshotConflicts);
          return {
            state: "synced",
            pending: pending.length,
            cursor: snapshot.cursor,
            ...(snapshotConflicts.length ? { conflicts: snapshotConflicts } : {}),
          };
        }
      }

      if (pending.length && options.remote.push) {
        const operations = prepareOperations(pending, auth.accountId);
        const quotaError = await checkQuota(operations, options.localStore, options.quota);
        if (quotaError) {
          return { state: "remote_error", pending: pending.length, cursor, lastError: quotaError };
        }
        const pushed = await pushWithRetry(operations, auth, options.remote.push, options.retry);
        conflicts = [...conflicts, ...(pushed.conflicts ?? [])];
        await applyChanges(conflicts);
        if (options.localStore.acknowledge) {
          for (const operationId of pushed.acknowledged) {
            await options.localStore.acknowledge(operationId, pushed.cursor);
          }
        }
        cursor = pushed.cursor ?? cursor;
      }

      if (options.remote.pull && (!preflightCompleted || pending.length > 0)) {
        const pulled = await options.remote.pull(cursor, auth);
        const safeChanges = filterTombstonedChanges(pulled.changes);
        const detectedConflicts = detectConflicts(safeChanges, clock.now());
        conflicts = [...conflicts, ...detectedConflicts];
        await applyChanges(safeChanges, pulled.cursor);
        await applyChanges(detectedConflicts);
        cursor = pulled.cursor;
      }

      return {
        state: "synced",
        pending: Math.max(0, pending.length - (options.remote.push ? pending.length : 0)),
        cursor,
        ...(conflicts.length ? { conflicts } : {}),
      };
    } catch (error) {
      const normalized = remoteError(error);
      return {
        state: normalized.code === "credential_expired" || normalized.code === "credential_revoked"
          ? "paused_auth"
          : "remote_error",
        pending: pending.length,
        cursor,
        lastError: normalized.code,
      };
    }
  }

  async function pull(cursor?: SyncCursor): Promise<SyncPullResult> {
    const remotePull = options.remote.pull;
    if (!remotePull) throw new SyncError("remote_unavailable", "Sync remote does not support pull");
    const result = await remotePull(
      cursor ?? (options.localStore.getCursor ? await options.localStore.getCursor() : undefined),
      credentials(),
    );
    await applyChanges(filterTombstonedChanges(result.changes), result.cursor);
    return result;
  }

  async function reconcile(): Promise<SyncReconcileResult> {
    if (!options.remote.reconcile) {
      throw new SyncError("remote_unavailable", "Sync remote does not support reconciliation");
    }
    const result = await options.remote.reconcile(credentials());
    await applyChanges(filterTombstonedChanges(result.changes), result.cursor);
    return result;
  }

  async function importNotes(operations: readonly SyncOperation[]): Promise<SyncStatus> {
    if (options.localStore.enqueue) {
      for (const operation of operations) await options.localStore.enqueue(operation);
    }
    return syncNow();
  }

  async function resolveConflict(conflictId: string, revisionId: string): Promise<void> {
    if (!options.localStore.resolveConflict) {
      throw new SyncError("local_storage_unavailable", "Local store does not support conflict resolution");
    }
    await options.localStore.resolveConflict(conflictId, revisionId);
  }

  async function listDevices(): Promise<readonly SyncDevice[]> {
    if (options.remote.listDevices) return options.remote.listDevices(credentials());
    if (options.localStore.listDevices) return options.localStore.listDevices();
    return [];
  }

  async function approveDevice(
    envelope: Parameters<NonNullable<SyncRemote["approveDevice"]>>[0],
  ): Promise<SyncDevice> {
    if (!options.remote.approveDevice) {
      throw new SyncError("remote_unavailable", "Sync remote does not support device approval");
    }
    return options.remote.approveDevice(envelope, credentials());
  }

  async function revokeDevice(deviceId: string): Promise<void> {
    if (!options.remote.revokeDevice) {
      throw new SyncError("remote_unavailable", "Sync remote does not support device revocation");
    }
    await options.remote.revokeDevice(deviceId, credentials());
  }

  async function deleteAccountData(): Promise<{ jobId: string }> {
    if (!options.remote.deleteAccountData) {
      throw new SyncError("remote_unavailable", "Sync remote does not support account deletion");
    }
    return options.remote.deleteAccountData(credentials());
  }

  async function listBiblePreferences(): Promise<readonly BibleVersionPreference[]> {
    if (options.localStore.listBiblePreferences) return options.localStore.listBiblePreferences();
    return [];
  }

  return {
    syncNow,
    getPending,
    pull,
    reconcile,
    importNotes,
    resolveConflict,
    listDevices,
    approveDevice,
    revokeDevice,
    deleteAccountData,
    listBiblePreferences,
  };
}

function detectConflicts(changes: readonly unknown[], createdAt: number): SyncConflict[] {
  const revisions = changes.filter(isSyncRevision);
  const byNote = new Map<string, SyncRevision[]>();
  for (const revision of revisions) {
    const noteRevisions = byNote.get(revision.noteId) ?? [];
    noteRevisions.push(revision);
    byNote.set(revision.noteId, noteRevisions);
  }

  return [...byNote.entries()]
    .filter(([, noteRevisions]) => noteRevisions.length > 1)
    .map(([noteId, noteRevisions]) => {
      const [local, remote] = noteRevisions;
      return {
        conflictId: `conflict-${noteId}`,
        noteId,
        localRevisionId: local?.revisionId ?? "",
        remoteRevisionId: remote?.revisionId ?? "",
        state: "open" as const,
        createdAt,
      };
    });
}

function isSyncRevision(value: unknown): value is SyncRevision {
  if (!isRecord(value)) return false;
  return typeof value.revisionId === "string"
    && typeof value.noteId === "string"
    && typeof value.deviceId === "string"
    && isRecord(value.envelope);
}

function filterTombstonedChanges(changes: readonly unknown[]): readonly unknown[] {
  const tombstones = changes.filter(isSyncTombstone);
  if (!tombstones.length) return changes;

  return changes.filter((change) => {
    if (isSyncTombstone(change)) return true;
    if (!isRecord(change) || typeof change.noteId !== "string") return true;
    const tombstone = tombstones.find((item) => item.noteId === change.noteId);
    if (!tombstone || change.revisionId === tombstone.deletionRevisionId) return true;
    return typeof change.createdAt !== "number" || change.createdAt > tombstone.createdAt;
  });
}

function isSyncTombstone(value: unknown): value is SyncTombstone {
  if (!isRecord(value)) return false;
  return typeof value.accountId === "string"
    && typeof value.noteId === "string"
    && typeof value.deletionRevisionId === "string"
    && typeof value.sourceDeviceId === "string"
    && typeof value.createdAt === "number"
    && typeof value.expiresAt === "number";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function prepareOperations(
  operations: readonly SyncOperation[],
  accountId: string,
): SyncOperation[] {
  return operations.map((operation) => {
    const prepared: SyncOperation = {
      operationId: operation.operationId,
      accountId: operation.accountId,
      deviceId: operation.deviceId,
      noteId: operation.noteId,
      action: operation.action,
      revisionId: operation.revisionId,
      sequence: operation.sequence,
      attempts: operation.attempts,
      state: operation.state,
      ...(operation.lastError === undefined ? {} : { lastError: operation.lastError }),
      ...(operation.nextRetryAt === undefined ? {} : { nextRetryAt: operation.nextRetryAt }),
      ...(operation.payload === undefined ? {} : { payload: operation.payload }),
    };
    validateSyncOperation(prepared);
    if (prepared.accountId !== accountId) {
      throw new SyncError("invalid_identity", "Operation account does not match credentials");
    }
    return prepared;
  });
}

async function pushWithRetry(
  operations: readonly SyncOperation[],
  credentials: SyncCredentials,
  push: NonNullable<SyncRemote["push"]>,
  options: SyncRetryOptions = {},
): Promise<Awaited<ReturnType<NonNullable<SyncRemote["push"]>>>> {
  const maxAttempts = Math.min(5, Math.max(1, options.maxAttempts ?? 5));
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 1000);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 300_000);
  const jitterMs = Math.max(0, options.jitterMs ?? 250);
  const wait = options.wait ?? (async () => undefined);
  const random = options.random ?? Math.random;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await push(operations, credentials);
    } catch (error) {
      if (attempt >= maxAttempts) throw error;
      const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      await wait(exponentialDelay + Math.floor(Math.max(0, Math.min(1, random())) * jitterMs));
    }
  }

  throw new SyncError("remote_unavailable", "Sync push exhausted its retry budget");
}

async function checkQuota(
  operations: readonly SyncOperation[],
  localStore: SyncOptions["localStore"],
  options: SyncQuotaOptions = {},
): Promise<"quota_exceeded" | undefined> {
  const maxNotes = options.maxNotes ?? 1_000;
  const maxBytes = options.maxBytes ?? 20 * 1024 * 1024;
  if (localStore.countNotes && (await localStore.countNotes()) >= maxNotes) return "quota_exceeded";
  const measure = options.measurePendingBytes ?? ((items) => items.reduce((total, item) => {
    return total + JSON.stringify(item.payload ?? {}).length;
  }, 0));
  if (measure(operations) > maxBytes) return "quota_exceeded";
  return undefined;
}
