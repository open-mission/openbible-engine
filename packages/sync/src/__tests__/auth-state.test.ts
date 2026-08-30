import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";

describe("sync authentication state", () => {
  // SPECSFY: US-001 FR-001 FR-002 FR-005 NFR-001 NFR-002 NFR-003 AC-003
  it("pauses expired credentials without sending or clearing the outbox", async () => {
    const operation = {
      operationId: "operation-1",
      accountId: "account-1",
      deviceId: "device-1",
      noteId: "note-1",
      action: "update" as const,
      revisionId: "revision-1",
      sequence: 1,
      attempts: 0,
      state: "queued" as const,
    };
    const pending = [operation];
    const push = vi.fn();
    const sync = createSync({
      localStore: { listPending: async () => pending },
      remote: { push },
      credentials: {
        accountId: "account-1",
        credential: "expired-session",
        expiresAt: 100,
      },
      keyManager: {},
      clock: { now: () => 100 },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({
      state: "paused_auth",
      pending: 1,
      lastError: "credential_expired",
    });
    expect(push).not.toHaveBeenCalled();
    await expect(sync.getPending()).resolves.toEqual(pending);
  });
});
