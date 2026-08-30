import {
  SyncError,
  validateEncryptedNoteEnvelope,
  validateSyncIdentifier,
  type EncryptedNoteEnvelope,
  type DeviceKeyEnvelope,
} from "@openbible/sync-core";

const CURVE = "P-256";
const WRAPPING_ALGORITHM = "ECDH-P256-AES-GCM";

export interface DeviceIdentity {
  deviceId: string;
  publicKey: string;
  fingerprint: string;
  keyVersion: number;
  createdAt: number;
}

export interface DeviceKeyManager {
  readonly identity: DeviceIdentity;
  encrypt(value: unknown, deviceId: string): Promise<EncryptedNoteEnvelope>;
  decrypt(envelope: EncryptedNoteEnvelope): Promise<unknown>;
  generateAccountKey(): Promise<CryptoKey>;
  rotateAccountKey(): Promise<CryptoKey>;
  createKeyEnvelope(target: {
    targetDeviceId: string;
    targetPublicKey: string;
  }): Promise<DeviceKeyEnvelope>;
  decryptKeyEnvelope(envelope: DeviceKeyEnvelope): Promise<CryptoKey>;
  revoke(): void;
  isRevoked(): boolean;
  hasLocalKey(): boolean;
}

export async function createDeviceKeyManager(options: {
  deviceId: string;
  keyVersion?: number;
  now?: () => number;
}): Promise<DeviceKeyManager> {
  validateSyncIdentifier(options.deviceId, "deviceId");
  let keyVersion = options.keyVersion ?? 1;
  if (!Number.isInteger(keyVersion) || keyVersion < 1) {
    throw new SyncError("invalid_identity", "keyVersion must be a positive integer");
  }

  const keyPair = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: CURVE },
    true,
    ["deriveKey"],
  )) as CryptoKeyPair;
  const publicKeyBytes = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
  const identity: DeviceIdentity = {
    deviceId: options.deviceId,
    publicKey: encode(publicKeyBytes),
    fingerprint: encode(new Uint8Array(await crypto.subtle.digest("SHA-256", publicKeyBytes))),
    keyVersion,
    createdAt: (options.now ?? (() => Date.now()))(),
  };

  let accountKey: CryptoKey | undefined;
  const accountKeys = new Map<number, CryptoKey>();
  let revoked = false;

  const assertUsable = (): void => {
    if (revoked) throw new SyncError("device_revoked", "Device key access has been revoked");
  };

  const generateAccountKey = async (): Promise<CryptoKey> => {
    assertUsable();
    accountKey ??= (await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    )) as CryptoKey;
    accountKeys.set(keyVersion, accountKey);
    return accountKey;
  };

  const rotateAccountKey = async (): Promise<CryptoKey> => {
    assertUsable();
    keyVersion += 1;
    identity.keyVersion = keyVersion;
    accountKey = (await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    )) as CryptoKey;
    accountKeys.set(keyVersion, accountKey);
    return accountKey;
  };

  const createKeyEnvelope = async (target: {
    targetDeviceId: string;
    targetPublicKey: string;
  }): Promise<DeviceKeyEnvelope> => {
    assertUsable();
    validateSyncIdentifier(target.targetDeviceId, "targetDeviceId");
    const targetKey = await importPublicKey(target.targetPublicKey);
    const key = accountKey ?? await generateAccountKey();
    const wrappingKey = await deriveWrappingKey(keyPair.privateKey, targetKey, "encrypt");
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(nonce) },
      wrappingKey,
      toArrayBuffer(plaintext),
    ));

    return {
      targetDeviceId: target.targetDeviceId,
      keyVersion,
      sourceDeviceId: identity.deviceId,
      createdAt: identity.createdAt,
      envelope: JSON.stringify({
        algorithm: WRAPPING_ALGORITHM,
        sourcePublicKey: identity.publicKey,
        nonce: encode(nonce),
        ciphertext: encode(ciphertext),
      }),
    };
  };

  const decryptKeyEnvelope = async (envelope: DeviceKeyEnvelope): Promise<CryptoKey> => {
    assertUsable();
    validateSyncIdentifier(envelope.targetDeviceId, "targetDeviceId");
    validateSyncIdentifier(envelope.sourceDeviceId, "sourceDeviceId");
    if (envelope.targetDeviceId !== identity.deviceId || envelope.keyVersion < keyVersion) {
      throw new SyncError("key_unavailable", "Device key envelope does not match this device");
    }

    const parsed = parseEnvelope(envelope.envelope);
    const sourceKey = await importPublicKey(parsed.sourcePublicKey);
    const wrappingKey = await deriveWrappingKey(keyPair.privateKey, sourceKey, "decrypt");
    let rawKey: ArrayBuffer;
    try {
      rawKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: toArrayBuffer(decode(parsed.nonce)) },
        wrappingKey,
        toArrayBuffer(decode(parsed.ciphertext)),
      );
    } catch (cause) {
      throw new SyncError("key_unavailable", "Device key envelope cannot be decrypted", { cause });
    }
    accountKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    accountKeys.set(envelope.keyVersion, accountKey);
    keyVersion = envelope.keyVersion;
    identity.keyVersion = keyVersion;
    return accountKey;
  };

  const encrypt = async (value: unknown, deviceId: string): Promise<EncryptedNoteEnvelope> => {
    assertUsable();
    validateSyncIdentifier(deviceId, "deviceId");
    const key = await generateAccountKey();
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new SyncError("invalid_envelope", "Value cannot be serialized");
    const textEncoder = new TextEncoder();
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(nonce),
        additionalData: toArrayBuffer(textEncoder.encode(deviceId)),
      },
      key,
      toArrayBuffer(textEncoder.encode(serialized)),
    );
    return {
      algorithm: "AES-GCM-256",
      ciphertext: encode(new Uint8Array(ciphertext)),
      nonce: encode(nonce),
      keyVersion,
      associatedData: deviceId,
    };
  };

  const decrypt = async (envelope: EncryptedNoteEnvelope): Promise<unknown> => {
    assertUsable();
    validateEncryptedNoteEnvelope(envelope);
    if (envelope.algorithm !== "AES-GCM-256") {
      throw new SyncError("key_unavailable", "Encrypted note uses an unsupported algorithm");
    }
    const key = accountKeys.get(envelope.keyVersion);
    if (!key) throw new SyncError("key_unavailable", "Encrypted note key version is unavailable");
    const associatedData = envelope.associatedData ?? "";
    const textEncoder = new TextEncoder();
    let plaintext: ArrayBuffer;
    try {
      plaintext = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(decode(envelope.nonce)),
          additionalData: toArrayBuffer(textEncoder.encode(associatedData)),
        },
        key,
        toArrayBuffer(decode(envelope.ciphertext)),
      );
    } catch (cause) {
      throw new SyncError("key_unavailable", "Encrypted note cannot be decrypted", { cause });
    }
    try {
      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (cause) {
      throw new SyncError("invalid_envelope", "Encrypted note plaintext is invalid JSON", { cause });
    }
  };

  return {
    identity,
    encrypt,
    decrypt,
    generateAccountKey,
    rotateAccountKey,
    createKeyEnvelope,
    decryptKeyEnvelope,
    revoke: () => { revoked = true; },
    isRevoked: () => revoked,
    hasLocalKey: () => accountKeys.size > 0,
  };
}

async function importPublicKey(value: string): Promise<CryptoKey> {
  try {
    return await crypto.subtle.importKey(
      "spki",
      toArrayBuffer(decode(value)),
      { name: "ECDH", namedCurve: CURVE },
      false,
      [],
    );
  } catch (cause) {
    throw new SyncError("invalid_envelope", "Device public key is invalid", { cause });
  }
}

async function deriveWrappingKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  usage: "encrypt" | "decrypt",
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    [usage],
  );
}

function parseEnvelope(value: string): {
  algorithm: string;
  sourcePublicKey: string;
  nonce: string;
  ciphertext: string;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (cause) {
    throw new SyncError("invalid_envelope", "Device key envelope is not valid JSON", { cause });
  }
  if (
    !isRecord(parsed)
    || parsed.algorithm !== WRAPPING_ALGORITHM
    || typeof parsed.sourcePublicKey !== "string"
    || typeof parsed.nonce !== "string"
    || typeof parsed.ciphertext !== "string"
  ) {
    throw new SyncError("invalid_envelope", "Device key envelope has invalid fields");
  }
  return parsed as {
    algorithm: string;
    sourcePublicKey: string;
    nonce: string;
    ciphertext: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function encode(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decode(value: string): Uint8Array {
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch (cause) {
    throw new SyncError("invalid_envelope", "Device key envelope contains invalid base64", { cause });
  }
}

function toArrayBuffer(value: Uint8Array<ArrayBufferLike>): ArrayBuffer {
  const copy = new Uint8Array(value.byteLength);
  for (let index = 0; index < value.byteLength; index += 1) copy[index] = value[index] ?? 0;
  return copy.buffer;
}
