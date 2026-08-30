import {
  SyncError,
  isSyncError,
  validateSyncIdentifier,
  validateSyncOperation,
  type DeviceKeyEnvelope,
  type SyncOperation,
} from "@openbible/sync-core";
import type { SyncCredentials, SyncRemote } from "@openbible/sync";
import type { ServerSyncCredentials } from "@/lib/auth";

export interface SyncApiDependencies {
  authenticate(request: Request): Promise<ServerSyncCredentials | null>;
  getRemote(): Promise<SyncRemote>;
}

export function createSyncApiHandlers(dependencies: SyncApiDependencies) {
  const withAuth = async (
    request: Request,
    action: (credentials: SyncCredentials) => Promise<unknown>,
  ): Promise<Response> => {
    try {
      const credentials = await dependencies.authenticate(request);
      if (!credentials) return errorResponse(new SyncError("auth_required", "Authentication is required"));
      return json(await action(credentials));
    } catch (error) {
      return errorResponse(error);
    }
  };

  return {
    push: (request: Request) => withAuth(request, async (credentials) => {
      const body = await readObject(request);
      if (typeof body.idempotencyKey !== "string" || body.idempotencyKey.length === 0) {
        throw new SyncError("invalid_operation", "idempotencyKey is required");
      }
      if (!Array.isArray(body.operations)) {
        throw new SyncError("invalid_operation", "operations must be an array");
      }
      const operations = body.operations.map((value) => sanitizeOperation(value, credentials.accountId));
      const remote = await dependencies.getRemote();
      if (!remote.push) throw new SyncError("remote_unavailable", "Sync remote does not support push");
      return remote.push(operations, credentials);
    }),

    pull: (request: Request) => withAuth(request, async (credentials) => {
      const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
      const remote = await dependencies.getRemote();
      if (!remote.pull) throw new SyncError("remote_unavailable", "Sync remote does not support pull");
      return remote.pull(cursor, credentials);
    }),

    reconcile: (request: Request) => withAuth(request, async (credentials) => {
      const remote = await dependencies.getRemote();
      if (!remote.reconcile) throw new SyncError("remote_unavailable", "Sync remote does not support reconciliation");
      return remote.reconcile(credentials);
    }),

    listDevices: (request: Request) => withAuth(request, async (credentials) => {
      const remote = await dependencies.getRemote();
      if (!remote.listDevices) throw new SyncError("remote_unavailable", "Sync remote does not support device listing");
      return remote.listDevices(credentials);
    }),

    approveDevice: (request: Request) => withAuth(request, async (credentials) => {
      const body = await readObject(request);
      const envelope = parseDeviceKeyEnvelope(body.envelope);
      const remote = await dependencies.getRemote();
      if (!remote.approveDevice) throw new SyncError("remote_unavailable", "Sync remote does not support device approval");
      return remote.approveDevice(envelope, credentials);
    }),

    revokeDevice: (request: Request) => withAuth(request, async (credentials) => {
      const body = await readObject(request);
      if (typeof body.deviceId !== "string") throw new SyncError("invalid_identity", "deviceId is required");
      validateSyncIdentifier(body.deviceId, "deviceId");
      const remote = await dependencies.getRemote();
      if (!remote.revokeDevice) throw new SyncError("remote_unavailable", "Sync remote does not support device revocation");
      await remote.revokeDevice(body.deviceId, credentials);
      return { status: "revoked" };
    }),

    accountDelete: (request: Request) => withAuth(request, async (credentials) => {
      const remote = await dependencies.getRemote();
      if (!remote.deleteAccountData) throw new SyncError("remote_unavailable", "Sync remote does not support account deletion");
      return remote.deleteAccountData(credentials);
    }),
  };
}

function sanitizeOperation(value: unknown, accountId: string): SyncOperation {
  if (!isRecord(value)) throw new SyncError("invalid_operation", "Sync operation must be an object");
  const operation: Record<string, unknown> = {
    operationId: value.operationId,
    accountId: value.accountId,
    deviceId: value.deviceId,
    noteId: value.noteId,
    action: value.action,
    revisionId: value.revisionId,
    sequence: value.sequence,
    attempts: value.attempts,
    state: value.state,
  };
  if (value.lastError !== undefined) operation.lastError = value.lastError;
  if (value.nextRetryAt !== undefined) operation.nextRetryAt = value.nextRetryAt;
  if (value.payload !== undefined) operation.payload = value.payload;
  validateSyncOperation(operation);
  if (operation.accountId !== accountId) {
    throw new SyncError("invalid_identity", "Operation account does not match the authenticated session");
  }
  return operation;
}

function parseDeviceKeyEnvelope(value: unknown): DeviceKeyEnvelope {
  if (!isRecord(value)) throw new SyncError("invalid_envelope", "Device key envelope is required");
  if (
    typeof value.targetDeviceId !== "string"
    || typeof value.sourceDeviceId !== "string"
    || typeof value.envelope !== "string"
    || typeof value.keyVersion !== "number"
    || !Number.isInteger(value.keyVersion)
    || Number(value.keyVersion) < 1
    || typeof value.createdAt !== "number"
    || !Number.isFinite(value.createdAt)
  ) {
    throw new SyncError("invalid_envelope", "Device key envelope has invalid fields");
  }
  validateSyncIdentifier(value.targetDeviceId, "targetDeviceId");
  validateSyncIdentifier(value.sourceDeviceId, "sourceDeviceId");
  return {
    targetDeviceId: value.targetDeviceId,
    sourceDeviceId: value.sourceDeviceId,
    envelope: value.envelope,
    keyVersion: value.keyVersion,
    createdAt: value.createdAt,
  };
}

async function readObject(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (cause) {
    throw new SyncError("invalid_operation", "Request body must be valid JSON", { cause });
  }
  if (!isRecord(body)) throw new SyncError("invalid_operation", "Request body must be an object");
  return body;
}

function errorResponse(error: unknown): Response {
  const normalized = isSyncError(error)
    ? error
    : new SyncError("remote_unavailable", "Sync service is unavailable");
  return json({ error: { code: normalized.code, message: normalized.message } }, statusFor(normalized.code));
}

function statusFor(code: SyncError["code"]): number {
  if (["auth_required", "credential_expired", "credential_revoked", "device_revoked"].includes(code)) return 401;
  if (["conflict_detected", "identity_collision", "quota_exceeded"].includes(code)) return 409;
  if (["network_unavailable", "remote_unavailable", "local_storage_unavailable"].includes(code)) return 503;
  return 400;
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
