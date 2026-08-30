export type SyncErrorCode =
  | "auth_required"
  | "credential_expired"
  | "credential_revoked"
  | "network_unavailable"
  | "remote_unavailable"
  | "conflict_detected"
  | "identity_collision"
  | "key_unavailable"
  | "device_revoked"
  | "reconciliation_required"
  | "version_source_unavailable"
  | "quota_exceeded"
  | "local_storage_unavailable"
  | "operation_duplicate"
  | "invalid_cursor"
  | "invalid_envelope"
  | "invalid_operation"
  | "invalid_identity";

export interface SyncErrorOptions {
  details?: unknown;
  cause?: unknown;
}

export class SyncError extends Error {
  override readonly name = "SyncError";
  readonly code: SyncErrorCode;
  readonly details?: unknown;
  override readonly cause?: unknown;

  constructor(code: SyncErrorCode, message: string, options?: SyncErrorOptions) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    this.details = options?.details;
    if (options?.cause !== undefined && this.cause === undefined) {
      (this as { cause: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, SyncError.prototype);
  }
}

export function createSyncError(
  code: SyncErrorCode,
  message: string,
  details?: unknown,
  cause?: unknown,
): SyncError {
  return new SyncError(code, message, { details, cause });
}

export function isSyncError(value: unknown): value is SyncError {
  return value instanceof SyncError;
}

export function throwSyncError(
  code: SyncErrorCode,
  message: string,
  details?: unknown,
  cause?: unknown,
): never {
  throw new SyncError(code, message, { details, cause });
}
