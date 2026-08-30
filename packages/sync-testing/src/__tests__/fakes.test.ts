import { describe, expect, it } from "vitest";
import { FakeSyncLocalStore, FakeSyncRemote, ControlledClock } from "../index.js";

describe("sync testing fakes", () => {
  it("exposes deterministic clock, outbox, ack, cursor and remote calls", async () => {
    const clock = new ControlledClock(100);
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
    const local = new FakeSyncLocalStore([operation]);
    const remote = new FakeSyncRemote({
      pushResult: { acknowledged: ["operation-1"], cursor: "cursor-1" },
      pullResult: { changes: [{ noteId: "note-2" }], cursor: "cursor-2" },
    });

    const pushed = await remote.push([operation], {
      accountId: "account-1",
      credential: "session",
      expiresAt: 1_000,
    });
    await local.acknowledge(pushed.acknowledged[0], pushed.cursor);
    clock.advance(50);

    expect(local.pending).toEqual([]);
    expect(local.acknowledged).toEqual([{ operationId: "operation-1", cursor: "cursor-1" }]);
    expect(remote.pushed).toHaveLength(1);
    expect(clock.now()).toBe(150);
  });
});
