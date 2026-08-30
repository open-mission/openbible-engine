export type SyncAccountId = string;
export type SyncDeviceId = string;
export type SyncNoteId = string;
export type SyncOperationId = string;
export type SyncRevisionId = string;
export type SyncConflictId = string;
export type SyncCursor = string;
export type SyncTimestamp = number;

export type SyncDeviceState = "pending" | "active" | "revoked";
export type SyncNoteState = "active" | "deleted" | "conflicted";
export type SyncOperationAction = "create" | "update" | "delete" | "import";
export type SyncOperationState =
  | "queued"
  | "sending"
  | "acked"
  | "pending"
  | "paused_auth"
  | "conflict";
export type SyncRevisionState = "conflict" | "resolved";
export type SyncConflictState = "open" | "resolved";
export type BibleVersionPreferenceState = "available" | "pending";

/** Encrypted content and its cryptographic context, never plaintext note data. */
export interface EncryptedNoteEnvelope {
  algorithm: string;
  ciphertext: string;
  nonce: string;
  keyVersion: number;
  associatedData?: string;
}

export interface SyncAccountBinding {
  accountId: SyncAccountId;
  userId: string;
}

export interface SyncDevice {
  deviceId: SyncDeviceId;
  accountId: SyncAccountId;
  label: string;
  publicKey: string;
  fingerprint: string;
  authorizedAt: SyncTimestamp;
  lastSyncAt?: SyncTimestamp;
  state: SyncDeviceState;
  keyVersion: number;
}

export interface SyncRevision {
  revisionId: SyncRevisionId;
  noteId: SyncNoteId;
  deviceId: SyncDeviceId;
  envelope: EncryptedNoteEnvelope;
  createdAt: SyncTimestamp;
  state: SyncRevisionState;
  finalRevisionId?: SyncRevisionId;
}

export interface EncryptedNoteRecord {
  accountId: SyncAccountId;
  noteId: SyncNoteId;
  currentRevisionId: SyncRevisionId;
  envelope: EncryptedNoteEnvelope;
  sourceDeviceId: SyncDeviceId;
  state: SyncNoteState;
  createdAt: SyncTimestamp;
  updatedAt: SyncTimestamp;
}

export interface SyncConflict {
  conflictId: SyncConflictId;
  noteId: SyncNoteId;
  localRevisionId: SyncRevisionId;
  remoteRevisionId: SyncRevisionId;
  state: SyncConflictState;
  createdAt: SyncTimestamp;
  resolvedRevisionId?: SyncRevisionId;
  resolvedAt?: SyncTimestamp;
}

export interface SyncTombstone {
  accountId: SyncAccountId;
  noteId: SyncNoteId;
  deletionRevisionId: SyncRevisionId;
  sourceDeviceId: SyncDeviceId;
  createdAt: SyncTimestamp;
  expiresAt: SyncTimestamp;
}

export interface SyncOperation {
  operationId: SyncOperationId;
  accountId: SyncAccountId;
  deviceId: SyncDeviceId;
  noteId: SyncNoteId;
  action: SyncOperationAction;
  revisionId: SyncRevisionId;
  sequence: number;
  attempts: number;
  state: SyncOperationState;
  lastError?: string;
  nextRetryAt?: SyncTimestamp;
  payload?: EncryptedNoteEnvelope;
}

export interface DeviceKeyEnvelope {
  targetDeviceId: SyncDeviceId;
  keyVersion: number;
  sourceDeviceId: SyncDeviceId;
  envelope: string;
  createdAt: SyncTimestamp;
}

export interface BibleVersionPreference {
  accountId: SyncAccountId;
  versionId: string;
  name: string;
  versionCode: string;
  installedAt?: SyncTimestamp;
  source: string;
  state: BibleVersionPreferenceState;
}
