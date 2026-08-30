import { throwSyncError } from "./errors.js";
import type {
  EncryptedNoteEnvelope,
  SyncOperation,
} from "./types.js";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSyncIdentifier(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    throwSyncError("invalid_identity", `${field} must be a normalized identifier`);
  }
}

export function validateEncryptedNoteEnvelope(
  value: unknown,
): asserts value is EncryptedNoteEnvelope {
  if (!isRecord(value)) {
    throwSyncError("invalid_envelope", "Encrypted note envelope must be an object");
  }
  if (typeof value.algorithm !== "string" || value.algorithm.length === 0) {
    throwSyncError("invalid_envelope", "Encrypted note envelope has no algorithm");
  }
  if (typeof value.ciphertext !== "string" || value.ciphertext.length === 0) {
    throwSyncError("invalid_envelope", "Encrypted note envelope has no ciphertext");
  }
  if (typeof value.nonce !== "string" || value.nonce.length === 0) {
    throwSyncError("invalid_envelope", "Encrypted note envelope has no nonce");
  }
  if (!isPositiveInteger(value.keyVersion)) {
    throwSyncError("invalid_envelope", "Encrypted note envelope has an invalid key version");
  }
  if (value.associatedData !== undefined && typeof value.associatedData !== "string") {
    throwSyncError("invalid_envelope", "Encrypted note envelope has invalid associated data");
  }
}

export function validateSyncOperation(value: unknown): asserts value is SyncOperation {
  if (!isRecord(value)) {
    throwSyncError("invalid_operation", "Sync operation must be an object");
  }
  validateSyncIdentifier(value.operationId, "operationId");
  validateSyncIdentifier(value.accountId, "accountId");
  validateSyncIdentifier(value.deviceId, "deviceId");
  validateSyncIdentifier(value.noteId, "noteId");
  validateSyncIdentifier(value.revisionId, "revisionId");
  if (!["create", "update", "delete", "import"].includes(String(value.action))) {
    throwSyncError("invalid_operation", "Sync operation has an invalid action");
  }
  if (!isNonNegativeInteger(value.sequence) || !isNonNegativeInteger(value.attempts)) {
    throwSyncError("invalid_operation", "Sync operation has invalid counters");
  }
  if (!["queued", "sending", "acked", "pending", "paused_auth", "conflict"].includes(String(value.state))) {
    throwSyncError("invalid_operation", "Sync operation has an invalid state");
  }
  if (value.lastError !== undefined && typeof value.lastError !== "string") {
    throwSyncError("invalid_operation", "Sync operation has an invalid error code");
  }
  if (value.nextRetryAt !== undefined && !Number.isFinite(value.nextRetryAt)) {
    throwSyncError("invalid_operation", "Sync operation has an invalid retry timestamp");
  }
  if (value.payload !== undefined) validateEncryptedNoteEnvelope(value.payload);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
