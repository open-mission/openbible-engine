import type { SyncRemote } from "@openbible/sync";
import { describe, expect, it, vi } from "vitest";
import { createSyncApiHandlers } from "@/lib/sync-api";

const credentials = {
  accountId: "account-1",
  credential: "synthetic-session",
  expiresAt: 1_800_000_000_000,
};

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

function request(path: string, init: RequestInit = {}): Request {
  return new Request(`http://localhost${path}`, {
    ...init,
    headers: { "content-type": "application/json", "x-test-auth": "valid", ...init.headers },
  });
}

function makeHandlers() {
  const remote: SyncRemote = {
    push: vi.fn(async () => ({ acknowledged: ["operation-1"], cursor: "1" })),
    pull: vi.fn(async (cursor) => ({ changes: [], cursor: cursor ?? "0" })),
    reconcile: vi.fn(async () => ({ changes: [], cursor: "0" })),
    listDevices: vi.fn(async () => []),
    approveDevice: vi.fn(async (envelope) => ({
      deviceId: envelope.targetDeviceId,
      accountId: credentials.accountId,
      label: "device-target",
      publicKey: "public-key",
      fingerprint: "fingerprint",
      authorizedAt: 100,
      state: "active" as const,
      keyVersion: envelope.keyVersion,
    })),
    revokeDevice: vi.fn(async () => undefined),
    deleteAccountData: vi.fn(async () => ({ jobId: "job-1" })),
  };
  const getRemote = vi.fn(async () => remote);
  const handlers = createSyncApiHandlers({
    authenticate: async (incoming) => incoming.headers.get("x-test-auth") === "valid" ? credentials : null,
    getRemote,
  });
  return { handlers, remote, getRemote };
}

describe("Sync HTTP contract", () => {
  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-003 FR-005 FR-006 FR-007 NFR-002 NFR-003 AC-001 AC-005 AC-008 AC-022
  it("requires authentication and refuses a client-owned account identity", async () => {
    const { handlers, remote, getRemote } = makeHandlers();
    const unauthenticated = await handlers.push(request("/api/sync/v1/push", {
      method: "POST",
      headers: { "x-test-auth": "missing" },
      body: JSON.stringify({ idempotencyKey: "request-1", operations: [operation] }),
    }));

    expect(unauthenticated.status).toBe(401);
    expect((await unauthenticated.json()).error.code).toBe("auth_required");
    expect(getRemote).not.toHaveBeenCalled();

    const mismatch = await handlers.push(request("/api/sync/v1/push", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: "request-1",
        operations: [{ ...operation, accountId: "account-2" }],
      }),
    }));

    expect(mismatch.status).toBe(400);
    expect((await mismatch.json()).error.code).toBe("invalid_identity");
    expect(remote.push).not.toHaveBeenCalled();
  });

  it("routes encrypted operations and returns stable cursor responses", async () => {
    const { handlers, remote } = makeHandlers();
    const pushed = await handlers.push(request("/api/sync/v1/push", {
      method: "POST",
      body: JSON.stringify({ idempotencyKey: "request-1", operations: [operation] }),
    }));
    const pulled = await handlers.pull(request("/api/sync/v1/pull?cursor=1", { method: "GET" }));
    const reconciled = await handlers.reconcile(request("/api/sync/v1/reconcile", { method: "POST" }));
    const devices = await handlers.listDevices(request("/api/sync/v1/devices", { method: "GET" }));

    expect(pushed.status).toBe(200);
    expect(await pushed.json()).toEqual({ acknowledged: ["operation-1"], cursor: "1" });
    expect(await pulled.json()).toEqual({ changes: [], cursor: "1" });
    expect(await reconciled.json()).toEqual({ changes: [], cursor: "0" });
    expect(await devices.json()).toEqual([]);
    expect(remote.push).toHaveBeenCalledWith([operation], credentials);
    expect(remote.pull).toHaveBeenCalledWith("1", credentials);
    expect(remote.reconcile).toHaveBeenCalledWith(credentials);
    expect(remote.listDevices).toHaveBeenCalledWith(credentials);
  });

  it("exposes explicit device and account lifecycle operations", async () => {
    const { handlers, remote } = makeHandlers();
    const envelope = {
      targetDeviceId: "device-target",
      sourceDeviceId: "device-1",
      keyVersion: 1,
      createdAt: 100,
      envelope: JSON.stringify({ algorithm: "ECDH-P256-AES-GCM", ciphertext: "encrypted" }),
    };

    const approved = await handlers.approveDevice(request("/api/sync/v1/devices/approve", {
      method: "POST",
      body: JSON.stringify({ envelope }),
    }));
    const revoked = await handlers.revokeDevice(request("/api/sync/v1/devices/revoke", {
      method: "POST",
      body: JSON.stringify({ deviceId: "device-target" }),
    }));
    const deleted = await handlers.accountDelete(request("/api/sync/v1/account-delete", { method: "POST" }));

    expect(approved.status).toBe(200);
    expect((await approved.json()).deviceId).toBe("device-target");
    expect(await revoked.json()).toEqual({ status: "revoked" });
    expect(await deleted.json()).toEqual({ jobId: "job-1" });
    expect(remote.approveDevice).toHaveBeenCalledWith(envelope, credentials);
    expect(remote.revokeDevice).toHaveBeenCalledWith("device-target", credentials);
    expect(remote.deleteAccountData).toHaveBeenCalledWith(credentials);
  });
});
