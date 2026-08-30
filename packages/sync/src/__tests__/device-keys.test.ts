import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import type { SyncCredentials } from "../ports.js";
import type {
  DeviceKeyEnvelope,
  EncryptedNoteEnvelope,
  SyncDevice,
} from "@openbible/sync-core";

const credentials: SyncCredentials = {
  accountId: "account-1",
  credential: "session",
  expiresAt: 1_800_000_000_000,
};

const envelope: DeviceKeyEnvelope = {
  targetDeviceId: "device-target",
  sourceDeviceId: "device-source",
  keyVersion: 1,
  createdAt: 1_700_000_000_000,
  envelope: JSON.stringify({
    algorithm: "ECDH-P256-AES-GCM",
    ciphertext: "encrypted-account-key",
  }),
};

const approvedDevice: SyncDevice = {
  deviceId: "device-target",
  accountId: "account-1",
  label: "target",
  publicKey: "public-key",
  fingerprint: "fingerprint",
  authorizedAt: 1_700_000_000_000,
  state: "active",
  keyVersion: 1,
};

describe("trusted device keys", () => {
  // SPECSFY: US-003 FR-003 FR-007 NFR-002 NFR-003 AC-012
  it("approves a device with an encrypted key transfer and no private key", async () => {
    const approveDevice = vi.fn(async () => approvedDevice);
    const sync = createSync({
      localStore: { listPending: async () => [] },
      remote: { approveDevice },
      keyManager: {},
      credentials,
    });

    await expect(sync.approveDevice(envelope)).resolves.toEqual(approvedDevice);

    expect(approveDevice).toHaveBeenCalledWith(envelope, credentials);
    expect(JSON.stringify(envelope)).not.toContain("privateKey");
    expect(JSON.stringify(envelope)).not.toContain("private-key");
  });

  // SPECSFY: US-003 FR-002 FR-003 FR-005 FR-007 NFR-001 NFR-002 NFR-003 AC-013
  it("revokes a device through the remote while leaving local storage untouched", async () => {
    const revokeDevice = vi.fn(async () => undefined);
    const appliedChanges: unknown[] = [];
    const sync = createSync({
      localStore: { applyRemote: async (change) => { appliedChanges.push(change); } },
      remote: { revokeDevice },
      keyManager: {},
      credentials,
    });

    await expect(sync.revokeDevice("device-target")).resolves.toBeUndefined();

    expect(revokeDevice).toHaveBeenCalledWith("device-target", credentials);
    expect(appliedChanges).toEqual([]);
  });

  // SPECSFY: US-003 FR-003 FR-007 NFR-002 NFR-003 AC-014
  it("keeps encrypted content opaque when the local key is unavailable", async () => {
    const encryptedEnvelope: EncryptedNoteEnvelope = {
      algorithm: "AES-GCM-256",
      ciphertext: "ciphertext-only",
      nonce: "nonce-only",
      keyVersion: 7,
    };
    const appliedChanges: unknown[] = [];
    const decrypt = vi.fn(async () => { throw new Error("key unavailable"); });
    const sync = createSync({
      localStore: {
        applyRemote: async (change) => { appliedChanges.push(change); },
      },
      remote: {
        pull: async () => ({
          changes: [{ noteId: "note-1", envelope: encryptedEnvelope }],
          cursor: "cursor-key",
        }),
      },
      keyManager: { decrypt },
      credentials,
    });

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced", cursor: "cursor-key" });

    expect(decrypt).not.toHaveBeenCalled();
    expect(appliedChanges).toEqual([{ noteId: "note-1", envelope: encryptedEnvelope }]);
    expect(appliedChanges[0]).not.toHaveProperty("content");
  });
});
