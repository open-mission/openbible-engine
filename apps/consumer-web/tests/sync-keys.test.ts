import { describe, expect, it } from "vitest";
import { createDeviceKeyManager } from "@/lib/sync-keys";

describe("local Sync key manager", () => {
  // SPECSFY: US-003 FR-003 FR-007 NFR-002 NFR-003 AC-012
  it("transfers an account key through an encrypted device envelope", async () => {
    const source = await createDeviceKeyManager({ deviceId: "device-source", now: () => 100 });
    const target = await createDeviceKeyManager({ deviceId: "device-target", now: () => 200 });
    const accountKey = await source.generateAccountKey();

    const envelope = await source.createKeyEnvelope({
      targetDeviceId: target.identity.deviceId,
      targetPublicKey: target.identity.publicKey,
    });
    const restoredKey = await target.decryptKeyEnvelope(envelope);
    const noteEnvelope = await source.encrypt({ title: "encrypted note" }, source.identity.deviceId);

    expect(envelope.envelope).not.toContain("private");
    expect(envelope.envelope).not.toContain("source-key");
    expect(await crypto.subtle.exportKey("raw", restoredKey)).toEqual(
      await crypto.subtle.exportKey("raw", accountKey),
    );
    expect(noteEnvelope.ciphertext).not.toContain("encrypted note");
    await expect(target.decrypt(noteEnvelope)).resolves.toEqual({ title: "encrypted note" });
    expect(source.identity.fingerprint).not.toBe(source.identity.publicKey);
  });

  it("rotates the account key and rejects an older envelope", async () => {
    const source = await createDeviceKeyManager({ deviceId: "device-source" });
    const target = await createDeviceKeyManager({ deviceId: "device-target" });
    await source.generateAccountKey();
    const firstEnvelope = await source.createKeyEnvelope({
      targetDeviceId: target.identity.deviceId,
      targetPublicKey: target.identity.publicKey,
    });
    await target.decryptKeyEnvelope(firstEnvelope);

    const previousKey = new Uint8Array(await crypto.subtle.exportKey("raw", await target.decryptKeyEnvelope(firstEnvelope)));
    await source.rotateAccountKey();
    const rotatedEnvelope = await source.createKeyEnvelope({
      targetDeviceId: target.identity.deviceId,
      targetPublicKey: target.identity.publicKey,
    });
    const rotatedKey = await target.decryptKeyEnvelope(rotatedEnvelope);

    expect(rotatedEnvelope.keyVersion).toBe(2);
    expect(target.identity.keyVersion).toBe(2);
    expect(new Uint8Array(await crypto.subtle.exportKey("raw", rotatedKey))).not.toEqual(previousKey);
    await expect(target.decryptKeyEnvelope(firstEnvelope)).rejects.toMatchObject({ code: "key_unavailable" });
  });

  // SPECSFY: US-003 FR-003 FR-007 NFR-001 NFR-002 NFR-003 AC-013 AC-014
  it("blocks a revoked device while keeping its local key unavailable only to sync", async () => {
    const source = await createDeviceKeyManager({ deviceId: "device-source" });
    const target = await createDeviceKeyManager({ deviceId: "device-target" });
    await source.generateAccountKey();
    const envelope = await source.createKeyEnvelope({
      targetDeviceId: target.identity.deviceId,
      targetPublicKey: target.identity.publicKey,
    });
    await target.decryptKeyEnvelope(envelope);

    target.revoke();

    expect(target.isRevoked()).toBe(true);
    expect(target.hasLocalKey()).toBe(true);
    await expect(target.createKeyEnvelope({
      targetDeviceId: source.identity.deviceId,
      targetPublicKey: source.identity.publicKey,
    })).rejects.toMatchObject({ code: "device_revoked" });
    await expect(target.decryptKeyEnvelope(envelope)).rejects.toMatchObject({ code: "device_revoked" });
  });
});
