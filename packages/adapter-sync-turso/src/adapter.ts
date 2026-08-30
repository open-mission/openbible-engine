import { createClient, type Client } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely, type Selectable } from "kysely";
import {
  SyncError,
  validateSyncIdentifier,
  type DeviceKeyEnvelope,
  type EncryptedNoteEnvelope,
  type SyncDevice,
  type SyncOperation,
} from "@openbible/sync-core";
import type {
  SyncCredentials,
  SyncPullResult,
  SyncPushResult,
  SyncReconcileResult,
  SyncRemote,
} from "@openbible/sync";
import { applySyncMigrations, type SyncDatabase } from "./schema.js";

export interface TursoSyncAdapterOptions {
  url?: string;
  authToken?: string;
  client?: Client;
  now?: () => number;
}

export interface TursoSyncAdapter extends SyncRemote {
  migrate(): Promise<void>;
  close(): Promise<void>;
}

const RETENTION_TOMBSTONE_MS = 90 * 24 * 60 * 60 * 1_000;
const ACCOUNT_DELETE_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

export async function createTursoSyncAdapter(
  options: TursoSyncAdapterOptions,
): Promise<TursoSyncAdapter> {
  const client = options.client ?? createClient({ url: required(options.url, "url"), authToken: options.authToken });
  const database = new Kysely<SyncDatabase>({ dialect: new LibsqlDialect({ client }) });
  const now = options.now ?? (() => 0);

  const migrate = async (): Promise<void> => applySyncMigrations(database, now());
  await migrate();

  const account = (credentials: SyncCredentials): string => {
    validateSyncIdentifier(credentials.accountId, "accountId");
    return credentials.accountId;
  };

  const toEnvelope = (payload: string | null): EncryptedNoteEnvelope | undefined => {
    if (payload === null) return undefined;
    try {
      return JSON.parse(payload) as EncryptedNoteEnvelope;
    } catch (error) {
      throw new SyncError("invalid_envelope", "Remote payload is not valid JSON", { cause: error });
    }
  };

  const operationFromRow = (row: Selectable<SyncDatabase["sync_operations"]>): SyncOperation => ({
    operationId: row.operation_id,
    accountId: row.account_id,
    deviceId: row.device_id,
    noteId: row.note_id,
    action: row.action as SyncOperation["action"],
    revisionId: row.revision_id,
    sequence: row.sequence,
    attempts: row.attempts,
    state: row.state as SyncOperation["state"],
    lastError: row.last_error ?? undefined,
    nextRetryAt: row.next_retry_at ?? undefined,
    payload: toEnvelope(row.payload),
  });

  const push = async (
    operations: readonly SyncOperation[],
    credentials: SyncCredentials,
  ): Promise<SyncPushResult> => {
    const accountId = account(credentials);
    const acknowledged: string[] = [];
    let lastCursor: number | undefined;
    await database.transaction().execute(async (transaction) => {
      for (const operation of operations) {
        if (operation.accountId !== accountId) {
          throw new SyncError("invalid_identity", "Operation account does not match credentials");
        }
        const existing = await transaction
          .selectFrom("sync_operations")
          .select(["cursor"])
          .where("account_id", "=", accountId)
          .where("operation_id", "=", operation.operationId)
          .executeTakeFirst();
        if (existing) {
          acknowledged.push(operation.operationId);
          lastCursor = existing.cursor;
          continue;
        }

        const inserted = await transaction
          .insertInto("sync_operations")
          .values({
            operation_id: operation.operationId,
            account_id: accountId,
            device_id: operation.deviceId,
            note_id: operation.noteId,
            action: operation.action,
            revision_id: operation.revisionId,
            sequence: operation.sequence,
            attempts: operation.attempts,
            state: "acked",
            last_error: null,
            next_retry_at: null,
            payload: operation.payload ? JSON.stringify(operation.payload) : null,
            created_at: now(),
          })
          .returning("cursor")
          .executeTakeFirstOrThrow();
        acknowledged.push(operation.operationId);
        lastCursor = inserted.cursor;

        if (operation.payload) {
          const envelope = JSON.stringify(operation.payload);
          await transaction
            .insertInto("sync_revisions")
            .values({
              revision_id: operation.revisionId,
              account_id: accountId,
              note_id: operation.noteId,
              device_id: operation.deviceId,
              envelope,
              created_at: now(),
              state: "resolved",
              final_revision_id: null,
            })
            .onConflict((conflict) => conflict.column("revision_id").doNothing())
            .execute();
          await transaction
            .insertInto("sync_notes")
            .values({
              account_id: accountId,
              note_id: operation.noteId,
              current_revision_id: operation.revisionId,
              envelope,
              source_device_id: operation.deviceId,
              state: operation.action === "delete" ? "deleted" : "active",
              created_at: now(),
              updated_at: now(),
            })
            .onConflict((conflict) =>
              conflict.columns(["account_id", "note_id"]).doUpdateSet({
                current_revision_id: operation.revisionId,
                envelope,
                source_device_id: operation.deviceId,
                state: operation.action === "delete" ? "deleted" : "active",
                updated_at: now(),
              }),
            )
            .execute();
        }
        if (operation.action === "delete") {
          await transaction
            .insertInto("sync_tombstones")
            .values({
              account_id: accountId,
              note_id: operation.noteId,
              deletion_revision_id: operation.revisionId,
              source_device_id: operation.deviceId,
              created_at: now(),
              expires_at: now() + RETENTION_TOMBSTONE_MS,
            })
            .onConflict((conflict) =>
              conflict.columns(["account_id", "note_id"]).doUpdateSet({
                deletion_revision_id: operation.revisionId,
                source_device_id: operation.deviceId,
                created_at: now(),
                expires_at: now() + RETENTION_TOMBSTONE_MS,
              }),
            )
            .execute();
        }
      }
    });
    return { acknowledged, cursor: lastCursor === undefined ? undefined : String(lastCursor) };
  };

  const pull = async (
    cursor: string | undefined,
    credentials: SyncCredentials,
  ): Promise<SyncPullResult> => {
    const accountId = account(credentials);
    const numericCursor = parseCursor(cursor);
    const rows = await database
      .selectFrom("sync_operations")
      .selectAll()
      .where("account_id", "=", accountId)
      .$if(numericCursor !== undefined, (query) => query.where("cursor", ">", numericCursor as number))
      .orderBy("cursor", "asc")
      .execute();
    const changes = rows.map(operationFromRow);
    const nextCursor = rows.at(-1)?.cursor ?? numericCursor ?? 0;
    return { changes, cursor: String(nextCursor) };
  };

  const reconcile = async (credentials: SyncCredentials): Promise<SyncReconcileResult> =>
    pull(undefined, credentials);

  const listDevices = async (credentials: SyncCredentials): Promise<readonly SyncDevice[]> => {
    const accountId = account(credentials);
    const rows = await database
      .selectFrom("sync_devices")
      .selectAll()
      .where("account_id", "=", accountId)
      .orderBy("device_id", "asc")
      .execute();
    return rows.map((row) => ({
      deviceId: row.device_id,
      accountId: row.account_id,
      label: row.label,
      publicKey: row.public_key,
      fingerprint: row.fingerprint,
      authorizedAt: row.authorized_at,
      lastSyncAt: row.last_sync_at ?? undefined,
      state: row.state as SyncDevice["state"],
      keyVersion: row.key_version,
    }));
  };

  const approveDevice = async (
    envelope: DeviceKeyEnvelope,
    credentials: SyncCredentials,
  ): Promise<SyncDevice> => {
    const accountId = account(credentials);
    const timestamp = now();
    const device: SyncDevice = {
      deviceId: envelope.targetDeviceId,
      accountId,
      label: envelope.targetDeviceId,
      publicKey: "",
      fingerprint: envelope.sourceDeviceId,
      authorizedAt: timestamp,
      state: "active",
      keyVersion: envelope.keyVersion,
    };
    await database
      .insertInto("sync_devices")
      .values({
        account_id: accountId,
        device_id: device.deviceId,
        label: device.label,
        public_key: device.publicKey,
        fingerprint: device.fingerprint,
        authorized_at: device.authorizedAt,
        last_sync_at: null,
        state: device.state,
        key_version: device.keyVersion,
      })
      .onConflict((conflict) =>
        conflict.columns(["account_id", "device_id"]).doUpdateSet({
          state: "active",
          key_version: device.keyVersion,
        }),
      )
      .execute();
    return device;
  };

  const revokeDevice = async (deviceId: string, credentials: SyncCredentials): Promise<void> => {
    const accountId = account(credentials);
    await database
      .updateTable("sync_devices")
      .set({ state: "revoked" })
      .where("account_id", "=", accountId)
      .where("device_id", "=", deviceId)
      .execute();
  };

  const deleteAccountData = async (
    credentials: SyncCredentials,
  ): Promise<{ jobId: string }> => {
    const accountId = account(credentials);
    const jobId = `account-delete-${accountId}`;
    const requestedAt = now();
    await database
      .insertInto("sync_account_deletion_jobs")
      .values({
        job_id: jobId,
        account_id: accountId,
        requested_at: requestedAt,
        delete_after: requestedAt + ACCOUNT_DELETE_RETENTION_MS,
        state: "scheduled",
      })
      .onConflict((conflict) => conflict.column("account_id").doNothing())
      .execute();
    return { jobId };
  };

  return {
    push,
    pull,
    reconcile,
    listDevices,
    approveDevice,
    revokeDevice,
    deleteAccountData,
    migrate,
    close: async () => database.destroy(),
  };
}

function required(value: string | undefined, field: string): string {
  if (!value) throw new SyncError("remote_unavailable", `Turso ${field} is required`);
  return value;
}

function parseCursor(cursor: string | undefined): number | undefined {
  if (cursor === undefined) return undefined;
  if (!/^\d+$/.test(cursor)) throw new SyncError("invalid_cursor", "Sync cursor is invalid");
  const value = Number(cursor);
  if (!Number.isSafeInteger(value)) throw new SyncError("invalid_cursor", "Sync cursor is invalid");
  return value;
}
