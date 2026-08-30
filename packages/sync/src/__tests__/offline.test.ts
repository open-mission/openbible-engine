import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import type { SyncOperation } from "@openbible/sync-core";

const operation: SyncOperation = {
  operationId: "anonymous-operation-1",
  accountId: "local-account",
  deviceId: "device-1",
  noteId: "note-1",
  action: "update",
  revisionId: "revision-1",
  sequence: 1,
  attempts: 0,
  state: "queued",
};

describe("anonymous local sync", () => {
  // SPECSFY: US-001 US-002 FR-001 FR-002 FR-004 NFR-001 NFR-002 NFR-003 AC-004
  it("keeps an anonymous local mutation in the outbox without contacting remote", async () => {
    const pending: SyncOperation[] = [];
    const remotePush = vi.fn();
    const sync = createSync({
      localStore: {
        listPending: async () => pending,
        enqueue: async (value) => { pending.push(value); },
      },
      remote: { push: remotePush },
      keyManager: {},
    });

    await expect(sync.importNotes([operation])).resolves.toEqual({
      state: "offline",
      pending: 1,
    });
    expect(pending).toEqual([operation]);
    expect(remotePush).not.toHaveBeenCalled();
  });
});
