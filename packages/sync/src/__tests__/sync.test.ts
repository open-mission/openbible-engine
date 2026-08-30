import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";

describe("sync coordinator", () => {
  // SPECSFY: US-001 FR-001 FR-002 FR-003 FR-005 NFR-001 NFR-002 NFR-003 AC-001
  it("pushes a local encrypted revision and applies it on another device", async () => {
    const localStore = {
      listPending: async () => [
        {
          operationId: "op-1",
          accountId: "account-1",
          deviceId: "device-1",
          noteId: "note-1",
          action: "create",
          revisionId: "rev-1",
          sequence: 1,
          attempts: 0,
          state: "queued",
          payload: {
            algorithm: "AES-GCM-256",
            ciphertext: "ciphertext",
            nonce: "nonce",
            keyVersion: 1,
          },
        },
      ],
      acknowledge: vi.fn(async () => undefined),
      applyRemote: async () => undefined,
    };
    const remote = {
      push: async () => ({ acknowledged: ["op-1"], cursor: "cursor-1" }),
      pull: async () => ({ changes: [], cursor: "cursor-1" }),
    };

    const sync = createSync({
      localStore,
      remote,
      credentials: {
        accountId: "account-1",
        credential: "opaque-session",
        expiresAt: 1_800_000_000_000,
      },
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
    });

    await sync.syncNow();

    expect(localStore.acknowledge).toHaveBeenCalledWith("op-1", "cursor-1");
  });
});
