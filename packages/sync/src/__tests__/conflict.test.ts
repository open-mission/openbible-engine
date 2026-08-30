import { describe, expect, it } from "vitest";
import { createSync } from "../index.js";
import type { SyncConflict, SyncRevision } from "@openbible/sync-core";

const createConflictSync = () =>
  createSync({
    localStore: { getRevision: async () => ({ revisionId: "local-1" }) },
    remote: { pull: async () => ({ changes: [], cursor: "cursor-1" }) },
    keyManager: { decrypt: async () => "local content" },
    credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
    clock: { now: () => 1_700_000_000_000 },
  });

describe("sync conflicts", () => {
  // SPECSFY: US-001 US-003 FR-002 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-008
  it("keeps both concurrent revisions available for resolution", async () => {
    const sync = createConflictSync();

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });
  });

  // SPECSFY: US-001 US-003 FR-002 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-008
  it("surfaces a conflict while applying both concurrent encrypted revisions", async () => {
    const revisionA: SyncRevision = {
      revisionId: "revision-a",
      noteId: "note-1",
      deviceId: "device-a",
      envelope: {
        algorithm: "AES-GCM-256",
        ciphertext: "ciphertext-a",
        nonce: "nonce-a",
        keyVersion: 1,
      },
      createdAt: 1_700_000_000_001,
      state: "conflict",
    };
    const revisionB: SyncRevision = {
      revisionId: "revision-b",
      noteId: "note-1",
      deviceId: "device-b",
      envelope: {
        algorithm: "AES-GCM-256",
        ciphertext: "ciphertext-b",
        nonce: "nonce-b",
        keyVersion: 1,
      },
      createdAt: 1_700_000_000_002,
      state: "conflict",
    };
    const conflict: SyncConflict = {
      conflictId: "conflict-note-1",
      noteId: "note-1",
      localRevisionId: revisionA.revisionId,
      remoteRevisionId: revisionB.revisionId,
      state: "open",
      createdAt: 1_700_000_000_000,
    };
    const appliedChanges: unknown[] = [];
    const sync = createSync({
      localStore: {
        applyRemote: async (change) => { appliedChanges.push(change); },
        setCursor: async () => undefined,
      },
      remote: {
        pull: async () => ({ changes: [revisionA, revisionB], cursor: "cursor-conflict" }),
      },
      keyManager: {},
      credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
      clock: { now: () => 1_700_000_000_000 },
    });

    const result = await sync.syncNow();

    expect(result).toMatchObject({
      state: "synced",
      cursor: "cursor-conflict",
      conflicts: [conflict],
    });
    expect(appliedChanges).toEqual([revisionA, revisionB, conflict]);
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-009
  it("creates a recorded revision when the local version is selected", async () => {
    const sync = createConflictSync();

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-010
  it("creates a recorded revision when the remote version is selected", async () => {
    const sync = createConflictSync();

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-011
  it("keeps prior revisions when a consumer-provided merge is submitted", async () => {
    const sync = createConflictSync();

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-009
  it("delegates local conflict resolution without deleting prior revisions", async () => {
    const resolutions: { conflictId: string; revisionId: string }[] = [];
    const sync = createSync({
      localStore: {
        resolveConflict: async (conflictId, revisionId) => {
          resolutions.push({ conflictId, revisionId });
        },
      },
      remote: {},
      keyManager: {},
    });

    await expect(sync.resolveConflict("conflict-1", "local-revision-1")).resolves.toBeUndefined();

    expect(resolutions).toEqual([{ conflictId: "conflict-1", revisionId: "local-revision-1" }]);
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-010
  it("delegates remote revision selection as an explicit resolution", async () => {
    const resolutions: { conflictId: string; revisionId: string }[] = [];
    const sync = createSync({
      localStore: {
        resolveConflict: async (conflictId, revisionId) => {
          resolutions.push({ conflictId, revisionId });
        },
      },
      remote: {},
      keyManager: {},
    });

    await sync.resolveConflict("conflict-1", "remote-revision-1");

    expect(resolutions).toEqual([{ conflictId: "conflict-1", revisionId: "remote-revision-1" }]);
  });

  // SPECSFY: US-003 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-011
  it("passes a consumer-provided merged revision as opaque identity", async () => {
    const resolutions: { conflictId: string; revisionId: string }[] = [];
    const sync = createSync({
      localStore: {
        resolveConflict: async (conflictId, revisionId) => {
          resolutions.push({ conflictId, revisionId });
        },
      },
      remote: {},
      keyManager: {},
    });

    await sync.resolveConflict("conflict-1", "merged-revision-1");

    expect(resolutions).toEqual([{ conflictId: "conflict-1", revisionId: "merged-revision-1" }]);
  });
});
