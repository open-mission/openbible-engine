import { describe, expect, it } from "vitest";
import {
  SyncError,
  validateEncryptedNoteEnvelope,
  validateSyncOperation,
} from "../index.js";

describe("sync-core validation", () => {
  it("accepts an encrypted note envelope", () => {
    expect(() =>
      validateEncryptedNoteEnvelope({
        algorithm: "xchacha20-poly1305",
        ciphertext: "ciphertext",
        nonce: "nonce",
        keyVersion: 1,
      }),
    ).not.toThrow();
  });

  it("rejects an envelope without ciphertext", () => {
    expect(() =>
      validateEncryptedNoteEnvelope({
        algorithm: "xchacha20-poly1305",
        ciphertext: "",
        nonce: "nonce",
        keyVersion: 1,
      }),
    ).toThrowError(expect.objectContaining({ code: "invalid_envelope" }));
  });

  it("rejects an operation with an invalid state", () => {
    expect(() =>
      validateSyncOperation({
        operationId: "operation-1",
        accountId: "account-1",
        deviceId: "device-1",
        noteId: "note-1",
        action: "update",
        revisionId: "revision-1",
        sequence: 0,
        attempts: 0,
        state: "unknown",
      }),
    ).toThrowError(SyncError);
  });
});
