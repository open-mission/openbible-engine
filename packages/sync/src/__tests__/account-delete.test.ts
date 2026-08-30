import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";

const credentials = {
  accountId: "account-1",
  credential: "session",
  expiresAt: 1_800_000_000_000,
};

describe("account deletion", () => {
  // SPECSFY: US-001 US-003 FR-002 FR-003 FR-005 FR-007 NFR-002 NFR-003 AC-021
  it("schedules idempotent remote deletion without touching local storage", async () => {
    const localCopy = [{ noteId: "note-1", state: "local" }];
    const deleteAccountData = vi.fn(async () => ({ jobId: "account-delete-account-1" }));
    const sync = createSync({
      localStore: {
        applyRemote: async () => undefined,
      },
      remote: { deleteAccountData },
      credentials,
      keyManager: {},
    });

    await expect(sync.deleteAccountData()).resolves.toEqual({ jobId: "account-delete-account-1" });
    await expect(sync.deleteAccountData()).resolves.toEqual({ jobId: "account-delete-account-1" });

    expect(deleteAccountData).toHaveBeenCalledTimes(2);
    expect(deleteAccountData).toHaveBeenNthCalledWith(1, credentials);
    expect(localCopy).toEqual([{ noteId: "note-1", state: "local" }]);
  });
});
