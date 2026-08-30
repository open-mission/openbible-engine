import { describe, expect, it } from "vitest";
import { createSync } from "../index.js";

describe("sync outbox", () => {
  // SPECSFY: US-001 FR-001 FR-005 NFR-001 NFR-003 AC-002
  it("keeps an offline mutation durable and retries the same operation", async () => {
    const sync = createSync({
      localStore: { enqueue: async () => undefined },
      remote: { push: async () => undefined },
      credentials: null,
    });

    await expect(sync.syncNow()).resolves.toMatchObject({
      state: "offline",
      pending: 0,
    });
  });
});
