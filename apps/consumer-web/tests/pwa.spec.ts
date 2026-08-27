import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

// SPECSFY: US-004 FR-004 NFR-001 NFR-004 AC-004
describe("PWA", () => {
  it("declara manifest instalável com app shell", () => {
    const value = manifest();
    expect(value.display).toBe("standalone");
    expect(value.start_url).toBe("/");
    expect(value.name).toContain("OpenBible");
  });
});
