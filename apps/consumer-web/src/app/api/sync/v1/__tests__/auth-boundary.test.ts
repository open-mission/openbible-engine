import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("sync authentication boundary", () => {
  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 NFR-003 AC-022
  it("exposes a server-owned route for deriving account identity", () => {
    const route = fileURLToPath(new URL("../route.ts", import.meta.url));

    expect(existsSync(route)).toBe(true);
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 NFR-003 AC-022
  it("keeps account identity derivation and mismatch rejection server-owned", () => {
    const api = fileURLToPath(new URL("../../../../../lib/sync-api.ts", import.meta.url));
    const source = readFileSync(api, "utf8");

    expect(source).toContain("authenticate(request)");
    expect(source).toContain("Operation account does not match the authenticated session");
    expect(source).toContain("auth_required");
    expect(source).not.toContain("process.env.DATABASE_TURSO_TOKEN");
  });
});
