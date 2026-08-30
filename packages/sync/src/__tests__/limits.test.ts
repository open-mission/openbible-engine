import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import type { SyncOperation } from "@openbible/sync-core";

const credentials = {
  accountId: "account-1",
  credential: "session",
  expiresAt: 1_800_000_000_000,
};

const operation = (noteId: string, operationId: string): SyncOperation => ({
  operationId,
  accountId: "account-1",
  deviceId: "device-1",
  noteId,
  action: "update",
  revisionId: `${operationId}-revision`,
  sequence: 1,
  attempts: 0,
  state: "queued",
  payload: {
    algorithm: "AES-GCM-256",
    ciphertext: "ciphertext",
    nonce: "nonce",
    keyVersion: 1,
  },
});

describe("sync limits", () => {
  // SPECSFY: US-001 FR-001 FR-005 NFR-001 NFR-003 AC-017
  it("limits retries to five attempts with bounded exponential backoff and stable order", async () => {
    const pending = [operation("note-1", "operation-1"), operation("note-2", "operation-2")];
    const sentBatches: SyncOperation[][] = [];
    const delays: number[] = [];
    const remotePush = vi.fn(async (operations: readonly SyncOperation[]) => {
      sentBatches.push([...operations]);
      throw new Error("transient");
    });
    const sync = createSync({
      localStore: { listPending: async () => pending },
      remote: { push: remotePush },
      credentials,
      keyManager: {},
      retry: {
        maxAttempts: 5,
        baseDelayMs: 1_000,
        maxDelayMs: 300_000,
        jitterMs: 0,
        wait: async (delay) => { delays.push(delay); },
      },
      clock: { now: () => 1_700_000_000_000 },
    });

    await expect(sync.syncNow()).resolves.toEqual({
      state: "remote_error",
      pending: 2,
      lastError: "remote_unavailable",
    });

    expect(remotePush).toHaveBeenCalledTimes(5);
    expect(delays).toEqual([1_000, 2_000, 4_000, 8_000]);
    expect(sentBatches.every((batch) => batch.map((item) => item.noteId).join(",") === "note-1,note-2")).toBe(true);
  });

  // SPECSFY: US-001 FR-001 FR-005 NFR-003 AC-020
  it("rejects quota excess without exposing note content in audit data", async () => {
    const pending = [operation("note-1", "operation-quota")];
    const remotePush = vi.fn();
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        countNotes: async () => 1_000,
      },
      remote: { push: remotePush },
      credentials,
      keyManager: {},
      quota: { maxNotes: 1_000, maxBytes: 20 * 1024 * 1024 },
      clock: { now: () => 1_700_000_000_000 },
    });

    const result = await sync.syncNow();

    expect(result).toEqual({
      state: "remote_error",
      pending: 1,
      lastError: "quota_exceeded",
    });
    expect(remotePush).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("ciphertext");
  });
});
