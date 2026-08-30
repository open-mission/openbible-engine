import type {
  BibleVersionPreference,
  DeviceKeyEnvelope,
  EncryptedNoteEnvelope,
  EncryptedNoteRecord,
  SyncConflict,
  SyncCursor,
  SyncDevice,
  SyncOperation,
  SyncTombstone,
} from "@openbible/sync-core";

export interface SyncCredentials {
  accountId: string;
  credential: string;
  expiresAt: number;
}

export interface SyncClock {
  now(): number;
}

export interface SyncLocalStore {
  listPending?(): Promise<readonly SyncOperation[]>;
  getPending?(): Promise<readonly SyncOperation[]>;
  countNotes?(): Promise<number>;
  acknowledge?(operationId: string, cursor?: SyncCursor): Promise<void>;
  applyRemote?(change: unknown): Promise<void>;
  enqueue?(operation: SyncOperation): Promise<void>;
  getCursor?(): Promise<SyncCursor | undefined>;
  setCursor?(cursor: SyncCursor): Promise<void>;
  listDevices?(): Promise<readonly SyncDevice[]>;
  listBiblePreferences?(): Promise<readonly BibleVersionPreference[]>;
  resolveConflict?(conflictId: string, revisionId: string): Promise<void>;
  markPreferencePending?(versionId: string, errorCode: string): Promise<void>;
}

export interface SyncPushResult {
  acknowledged: readonly string[];
  cursor?: SyncCursor;
  conflicts?: readonly SyncConflict[];
}

export interface SyncPullResult {
  changes: readonly unknown[];
  cursor: SyncCursor;
}

export interface SyncReconcileResult {
  changes: readonly unknown[];
  cursor: SyncCursor;
}

export interface SyncRemote {
  push?(
    operations: readonly SyncOperation[],
    credentials: SyncCredentials,
  ): Promise<SyncPushResult>;
  pull?(
    cursor: SyncCursor | undefined,
    credentials: SyncCredentials,
  ): Promise<SyncPullResult>;
  reconcile?(
    credentials: SyncCredentials,
  ): Promise<SyncReconcileResult>;
  listDevices?(
    credentials: SyncCredentials,
  ): Promise<readonly SyncDevice[]>;
  approveDevice?(
    envelope: DeviceKeyEnvelope,
    credentials: SyncCredentials,
  ): Promise<SyncDevice>;
  revokeDevice?(
    deviceId: string,
    credentials: SyncCredentials,
  ): Promise<void>;
  deleteAccountData?(
    credentials: SyncCredentials,
  ): Promise<{ jobId: string }>;
}

export interface SyncKeyManager {
  encrypt?(value: unknown, deviceId: string): Promise<EncryptedNoteEnvelope>;
  decrypt?(envelope: EncryptedNoteEnvelope): Promise<unknown>;
}

export interface SyncOptions {
  localStore: SyncLocalStore;
  remote: SyncRemote;
  credentials?: SyncCredentials | null;
  keyManager: SyncKeyManager;
  clock?: SyncClock;
  retry?: SyncRetryOptions;
  quota?: SyncQuotaOptions;
}

export interface SyncRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterMs?: number;
  wait?: (delayMs: number) => Promise<void>;
  random?: () => number;
}

export interface SyncQuotaOptions {
  maxNotes?: number;
  maxBytes?: number;
  measurePendingBytes?: (operations: readonly SyncOperation[]) => number;
}

export interface SyncSnapshot {
  records: readonly EncryptedNoteRecord[];
  tombstones: readonly SyncTombstone[];
  conflicts: readonly SyncConflict[];
  cursor: SyncCursor;
}
