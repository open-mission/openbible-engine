import { describe, expect, it } from "vitest";
import { SYNC_MIGRATIONS, SYNC_MIGRATION_VERSION } from "../index.js";

describe("Turso Sync schema", () => {
  it("contains versioned technical tables and no authentication tables", () => {
    const schema = SYNC_MIGRATIONS.join(" ");

    expect(SYNC_MIGRATION_VERSION).toBe(1);
    expect(schema).toContain("sync_operations");
    expect(schema).toContain("sync_tombstones");
    expect(schema).toContain("sync_bible_preferences");
    expect(schema).not.toContain("password");
    expect(schema).not.toContain("session_token");
  });
});
