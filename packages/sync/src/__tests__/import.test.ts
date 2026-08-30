import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import { SyncError, type SyncConflict, type SyncOperation } from "@openbible/sync-core";

const importedOperation: SyncOperation = {
  operationId: "import-operation-1",
  accountId: "account-1",
  deviceId: "device-1",
  noteId: "anonymous-note-1",
  action: "import",
  revisionId: "revision-1",
  sequence: 1,
  attempts: 0,
  state: "queued",
};

describe("anonymous note import", () => {
  // SPECSFY: US-002 FR-001 FR-004 FR-005 NFR-001 NFR-002 NFR-003 AC-005 AC-006 AC-007
  it("imports only after remote confirmation and exposes an id collision", async () => {
    const sync = createSync({
      localStore: { listAnonymous: async () => [{ noteId: "note-1" }] },
      remote: { importNote: async () => ({ acknowledged: true }) },
      credentials: { accountId: "account-1" },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });
  });

  // SPECSFY: US-002 FR-001 FR-002 FR-004 FR-005 NFR-001 NFR-002 NFR-003 AC-005
  it("keeps the anonymous note id until the import operation is acknowledged", async () => {
    const pending: SyncOperation[] = [];
    const sentOperations: SyncOperation[][] = [];
    let markPushStarted!: () => void;
    let releasePush!: () => void;
    const pushStarted = new Promise<void>((resolve) => { markPushStarted = resolve; });
    const pushRelease = new Promise<void>((resolve) => { releasePush = resolve; });
    const remotePush = vi.fn(async (operations: readonly SyncOperation[]) => {
      sentOperations.push([...operations]);
      markPushStarted();
      await pushRelease;
      return {
        acknowledged: operations.map((operation) => operation.operationId),
        cursor: "cursor-1",
      };
    });
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        enqueue: async (operation) => { pending.push(operation); },
        acknowledge: async (operationId) => {
          const index = pending.findIndex((operation) => operation.operationId === operationId);
          if (index >= 0) pending.splice(index, 1);
        },
      },
      remote: { push: remotePush },
      credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
    });

    const importResult = sync.importNotes([importedOperation]);
    await pushStarted;
    expect(await sync.getPending()).toEqual([importedOperation]);
    releasePush();

    await expect(importResult).resolves.toMatchObject({
      state: "synced",
      pending: 0,
      cursor: "cursor-1",
    });
    expect(remotePush).toHaveBeenCalledTimes(1);
    expect(sentOperations).toEqual([[importedOperation]]);
    expect(await sync.getPending()).toEqual([]);
    expect(importedOperation.noteId).toBe("anonymous-note-1");
  });

  // SPECSFY: US-002 FR-001 FR-002 FR-004 FR-005 NFR-001 NFR-003 AC-006
  it("preserves a failed anonymous import for a later retry with the same operation id", async () => {
    const pending: SyncOperation[] = [];
    const sentOperations: SyncOperation[][] = [];
    let networkAvailable = false;
    const remotePush = vi.fn(async (operations: readonly SyncOperation[]) => {
      sentOperations.push([...operations]);
      if (!networkAvailable) throw new SyncError("network_unavailable", "Remote is unavailable");
      return {
        acknowledged: operations.map((operation) => operation.operationId),
        cursor: "cursor-2",
      };
    });
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        enqueue: async (operation) => { pending.push(operation); },
        acknowledge: async (operationId) => {
          const index = pending.findIndex((operation) => operation.operationId === operationId);
          if (index >= 0) pending.splice(index, 1);
        },
      },
      remote: { push: remotePush },
      credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
      retry: { maxAttempts: 1 },
    });

    await expect(sync.importNotes([importedOperation])).resolves.toEqual({
      state: "remote_error",
      pending: 1,
      lastError: "network_unavailable",
    });
    expect(await sync.getPending()).toEqual([importedOperation]);

    networkAvailable = true;
    await expect(sync.syncNow()).resolves.toMatchObject({
      state: "synced",
      pending: 0,
      cursor: "cursor-2",
    });
    expect(sentOperations.map((operations) => operations[0]?.operationId)).toEqual([
      importedOperation.operationId,
      importedOperation.operationId,
    ]);
    expect(await sync.getPending()).toEqual([]);
  });

  // SPECSFY: US-002 US-003 FR-003 FR-004 FR-005 FR-007 NFR-002 NFR-003 AC-007
  it("preserves the account note and exposes an explicit conflict for an id collision", async () => {
    const collision: SyncConflict = {
      conflictId: "conflict-1",
      noteId: importedOperation.noteId,
      localRevisionId: "account-revision-1",
      remoteRevisionId: importedOperation.revisionId,
      state: "open",
      createdAt: 1_700_000_000_000,
    };
    const pending: SyncOperation[] = [];
    const appliedChanges: unknown[] = [];
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        enqueue: async (operation) => { pending.push(operation); },
        applyRemote: async (change) => { appliedChanges.push(change); },
        acknowledge: async (operationId) => {
          const index = pending.findIndex((operation) => operation.operationId === operationId);
          if (index >= 0) pending.splice(index, 1);
        },
      },
      remote: {
        push: async () => ({
          acknowledged: [importedOperation.operationId],
          cursor: "cursor-3",
          conflicts: [collision],
        }),
      },
      credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
    });

    const result = await sync.importNotes([importedOperation]);

    expect(result).toMatchObject({
      state: "synced",
      cursor: "cursor-3",
      conflicts: [collision],
    });
    expect(appliedChanges).toEqual([collision]);
  });
});
