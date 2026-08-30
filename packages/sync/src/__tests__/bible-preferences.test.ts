import { describe, expect, it, vi } from "vitest";
import { createSync } from "../index.js";
import type { BibleVersionPreference } from "@openbible/sync-core";

const preference: BibleVersionPreference = {
  accountId: "account-1",
  versionId: "ara",
  name: "Almeida Revista e Atualizada",
  versionCode: "ara-v1",
  source: "official-r2",
  state: "available",
};

describe("Bible version preferences", () => {
  // SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-018
  it("applies selected version metadata without transporting package bytes", async () => {
    const appliedChanges: unknown[] = [];
    const sync = createSync({
      localStore: {
        listBiblePreferences: async () => [preference],
        applyRemote: async (change) => { appliedChanges.push(change); },
      },
      remote: { pull: async () => ({ changes: [preference], cursor: "cursor-version" }) },
      credentials: { accountId: "account-1", credential: "session", expiresAt: 1_800_000_000_000 },
      keyManager: {},
      clock: { now: () => 1_700_000_000_000 },
    });

    await expect(sync.syncNow()).resolves.toMatchObject({ state: "synced", cursor: "cursor-version" });

    expect(appliedChanges).toEqual([preference]);
    expect(JSON.stringify(appliedChanges)).not.toContain("SQLite");
    expect(JSON.stringify(appliedChanges)).not.toContain("bytes");
  });

  // SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-019
  it("preserves a pending source state as metadata when redownload is unavailable", async () => {
    const pendingPreference = { ...preference, state: "pending" as const };
    const sync = createSync({
      localStore: { listBiblePreferences: async () => [pendingPreference] },
      remote: {},
      keyManager: {},
    });

    await expect(sync.listBiblePreferences()).resolves.toEqual([pendingPreference]);
  });

  // SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-023
  it("keeps an installed version preference idempotent and local", async () => {
    const pull = vi.fn();
    const sync = createSync({
      localStore: {
        listBiblePreferences: async () => [{ ...preference, installedAt: 1_700_000_000_000 }],
      },
      remote: { pull },
      keyManager: {},
    });

    await expect(sync.listBiblePreferences()).resolves.toMatchObject([{ versionId: "ara", installedAt: 1_700_000_000_000 }]);

    expect(pull).not.toHaveBeenCalled();
  });
});
