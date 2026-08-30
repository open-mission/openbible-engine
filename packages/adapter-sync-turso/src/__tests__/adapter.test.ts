import { createClient } from "@libsql/client";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTursoSyncAdapter } from "../index.js";

const credentials = {
  accountId: "account-1",
  credential: "session",
  expiresAt: 1_800_000_000_000,
};

const operation = (accountId = "account-1") => ({
  operationId: "operation-1",
  accountId,
  deviceId: "device-1",
  noteId: "note-1",
  action: "update" as const,
  revisionId: "revision-1",
  sequence: 1,
  attempts: 0,
  state: "queued" as const,
  payload: {
    algorithm: "xchacha20-poly1305",
    ciphertext: "ciphertext",
    nonce: "nonce",
    keyVersion: 1,
  },
});

function createLocalClient() {
  const directory = mkdtempSync(join("/tmp/opencode", "openbible-sync-"));
  const client = createClient({ url: `file:${join(directory, "sync.db")}` });

  return {
    client,
    cleanup: () => {
      client.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

describe("Turso Sync adapter", () => {
  it("runs idempotent migrations and isolates push/pull by account", async () => {
    const local = createLocalClient();
    const { client } = local;
    const adapter = await createTursoSyncAdapter({
      client,
      now: () => 1_700_000_000_000,
    });

    try {
      await expect(adapter.migrate()).resolves.toBeUndefined();
      const first = await adapter.push!([operation()], credentials);
      const duplicate = await adapter.push!([operation()], credentials);
      const pulled = await adapter.pull!(undefined, credentials);
      const otherAccount = await adapter.pull!(undefined, {
        ...credentials,
        accountId: "account-2",
      });

      expect(first.acknowledged).toEqual(["operation-1"]);
      expect(duplicate.acknowledged).toEqual(["operation-1"]);
      expect(pulled.changes).toHaveLength(1);
      expect(pulled.changes[0]).toMatchObject({
        operationId: "operation-1",
        accountId: "account-1",
        payload: { ciphertext: "ciphertext" },
      });
      expect(otherAccount.changes).toEqual([]);
    } finally {
      await adapter.close();
      local.cleanup();
    }
  });

  it("rolls back the whole push when one operation violates account ownership", async () => {
    const local = createLocalClient();
    const { client } = local;
    const adapter = await createTursoSyncAdapter({
      client,
      now: () => 1_700_000_000_000,
    });

    try {
      await expect(
        adapter.push!([operation(), operation("account-2")], credentials),
      ).rejects.toMatchObject({ code: "invalid_identity" });
      const pulled = await adapter.pull!(undefined, credentials);

      expect(pulled.changes).toEqual([]);
    } finally {
      await adapter.close();
      local.cleanup();
    }
  });

  it("stores a tombstone with the configured ninety-day retention", async () => {
    const local = createLocalClient();
    const { client } = local;
    const adapter = await createTursoSyncAdapter({
      client,
      now: () => 1_700_000_000_000,
    });
    const deletion = {
      ...operation(),
      operationId: "operation-delete-1",
      revisionId: "revision-delete-1",
      action: "delete" as const,
    };

    try {
      await adapter.push!([deletion], credentials);
      const result = await client.execute({
        sql: "SELECT expires_at FROM sync_tombstones WHERE account_id = ? AND note_id = ?",
        args: [credentials.accountId, deletion.noteId],
      });

      expect(result.rows).toHaveLength(1);
      expect(Number(result.rows[0].expires_at) - 1_700_000_000_000).toBe(
        90 * 24 * 60 * 60 * 1_000,
      );
    } finally {
      await adapter.close();
      local.cleanup();
    }
  });
});
