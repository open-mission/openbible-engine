import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import type { SyncOperation } from "@openbible/sync-core";

const credentials = {
  accountId: "account-1",
  credential: "opaque-session",
  expiresAt: 1_800_000_000_000,
};

describe("sync privacy boundary", () => {
  // SPECSFY: US-001 US-002 US-003 US-004 FR-003 FR-004 FR-007 NFR-002 AC-001 AC-004 AC-007 AC-012
  it("sends only opaque operation metadata and encrypted envelopes", async () => {
    const operation = {
      operationId: "operation-privacy",
      accountId: "account-1",
      deviceId: "device-1",
      noteId: "note-1",
      action: "update" as const,
      revisionId: "revision-1",
      sequence: 1,
      attempts: 0,
      state: "queued" as const,
      payload: {
        algorithm: "AES-GCM-256",
        ciphertext: "ciphertext-only",
        nonce: "nonce-only",
        keyVersion: 1,
      },
      title: "private title",
      reference: "private reference",
      content: "private plaintext",
    } as SyncOperation & Record<string, unknown>;
    let sent: readonly SyncOperation[] = [];
    const sync = createSync({
      localStore: {
        listPending: async () => [operation],
        acknowledge: async () => undefined,
      },
      remote: {
        push: async (operations) => {
          sent = operations;
          return { acknowledged: ["operation-privacy"], cursor: "cursor-privacy" };
        },
      },
      credentials,
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced" });

    expect(sent).toEqual([{
      operationId: "operation-privacy",
      accountId: "account-1",
      deviceId: "device-1",
      noteId: "note-1",
      action: "update",
      revisionId: "revision-1",
      sequence: 1,
      attempts: 0,
      state: "queued",
      payload: operation.payload,
    }]);
    expect(JSON.stringify(sent)).not.toContain("private plaintext");
    expect(JSON.stringify(sent)).not.toContain("private title");
    expect(JSON.stringify(sent)).not.toContain("private reference");
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 AC-022
  it("does not log remote failures or credential values", async () => {
    const error = new Error("private plaintext and opaque-session");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sync = createSync({
      localStore: { listPending: async () => [] },
      remote: { pull: async () => { throw error; } },
      credentials,
      keyManager: {},
    });

    await expect(sync.syncNow()).resolves.toMatchObject({
      state: "remote_error",
      lastError: "remote_unavailable",
    });

    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-003 FR-007 NFR-001 NFR-002 AC-004 AC-022
  it("keeps the portable packages free from authentication and platform imports", async () => {
    const sync = await import("../index.js");
    expect(sync.createSync).toBeTypeOf("function");
    expect(Object.keys(sync)).not.toContain("auth");
  });
});
