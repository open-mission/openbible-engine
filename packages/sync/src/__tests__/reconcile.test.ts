import { describe, expect, it } from "vitest";
import { createSync } from "../index.js";
import { SyncError, type SyncOperation, type SyncTombstone } from "@openbible/sync-core";
import type { SyncPullResult } from "../ports.js";

const credentials = {
  accountId: "account-1",
  credential: "session",
  expiresAt: 1_800_000_000_000,
};

const tombstone: SyncTombstone = {
  accountId: "account-1",
  noteId: "note-1",
  deletionRevisionId: "delete-revision-1",
  sourceDeviceId: "device-1",
  createdAt: 1_700_000_000_000,
  expiresAt: 1_707_776_000_000,
};

const staleChange = {
  accountId: "account-1",
  noteId: "note-1",
  revisionId: "stale-revision-1",
  createdAt: 1_699_999_999_999,
  envelope: { algorithm: "AES-GCM-256", ciphertext: "old", nonce: "nonce", keyVersion: 1 },
};

describe("sync reconciliation", () => {
  // SPECSFY: US-001 US-003 FR-001 FR-005 FR-007 NFR-001 NFR-002 NFR-003 AC-015
  it("applies a retained tombstone without recreating the deleted note", async () => {
    const appliedChanges: unknown[] = [];
    const sync = createSync({
      localStore: { applyRemote: async (change) => { appliedChanges.push(change); } },
      remote: {
        pull: async () => ({
          changes: [tombstone, staleChange],
          cursor: "cursor-tombstone",
        }),
      },
      keyManager: {},
      credentials,
      clock: { now: () => 1_700_000_000_001 },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced", cursor: "cursor-tombstone" });

    expect(appliedChanges).toEqual([tombstone]);
    expect(appliedChanges).not.toContain(staleChange);
  });

  // SPECSFY: US-001 US-003 FR-001 FR-005 FR-007 NFR-001 NFR-003 AC-016
  it("reconciles an expired cursor before sending a stale device mutation", async () => {
    const pending: SyncOperation[] = [{
      operationId: "operation-stale",
      accountId: "account-1",
      deviceId: "device-1",
      noteId: "note-2",
      action: "update",
      revisionId: "revision-stale",
      sequence: 1,
      attempts: 0,
      state: "queued",
    }];
    const appliedChanges: unknown[] = [];
    let pushCalled = false;
    const snapshot: SyncPullResult = {
      changes: [{
        accountId: "account-1",
        noteId: "note-2",
        revisionId: "revision-remote",
        createdAt: 1_700_000_000_010,
        envelope: { algorithm: "AES-GCM-256", ciphertext: "remote", nonce: "nonce", keyVersion: 1 },
      }],
      cursor: "cursor-reconciled",
    };
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        getCursor: async () => "expired-cursor",
        applyRemote: async (change) => { appliedChanges.push(change); },
      },
      remote: {
        pull: async () => { throw new SyncError("invalid_cursor", "Cursor expired"); },
        reconcile: async () => snapshot,
        push: async () => {
          pushCalled = true;
          return { acknowledged: ["operation-stale"], cursor: "cursor-pushed" };
        },
      },
      keyManager: {},
      credentials,
      clock: { now: () => 1_700_000_000_001 },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({
      state: "synced",
      pending: 1,
      cursor: "cursor-reconciled",
    });

    expect(pushCalled).toBe(false);
    expect(appliedChanges).toEqual(snapshot.changes);
  });
});
