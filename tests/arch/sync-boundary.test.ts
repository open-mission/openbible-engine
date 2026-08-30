import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("sync package boundaries", () => {
  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 NFR-001 NFR-002 AC-004 AC-022
  it("provides a portable sync-core package before consumers are composed", () => {
    const packagePath = fileURLToPath(
      new URL("../../packages/sync-core/package.json", import.meta.url),
    );

    expect(existsSync(packagePath)).toBe(true);
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 AC-004 AC-022
  it("keeps sync-core dependency-free and isolated from platform/authentication SDKs", () => {
    const packagePath = fileURLToPath(new URL("../../packages/sync-core/package.json", import.meta.url));
    const sourcePath = fileURLToPath(new URL("../../packages/sync-core/src/index.ts", import.meta.url));
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { dependencies?: Record<string, string> };
    const source = readFileSync(sourcePath, "utf8");

    expect(pkg.dependencies ?? {}).toEqual({});
    expect(source).not.toMatch(/better-auth|next|react|node:/i);
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 AC-022
  it("keeps Better Auth and runtime credentials behind the consumer server boundary", () => {
    const syncSource = fileURLToPath(new URL("../../packages/sync/src/sync.ts", import.meta.url));
    const authSource = fileURLToPath(new URL("../../apps/consumer-web/src/lib/auth.ts", import.meta.url));

    expect(readFileSync(syncSource, "utf8")).not.toMatch(/better-auth|process\.env|DATABASE_/i);
    expect(readFileSync(authSource, "utf8")).toContain("better-auth");
  });
});
