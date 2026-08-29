import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Native SDK capability matrix", () => {
  it("records the unsupported-host outcome explicitly", () => {
    // SPECSFY: US-001 FR-001 NFR-003 AC-003
    const file = "apps/consumer-native/native-sdk-matrix.json";
    expect(existsSync(file)).toBe(true);
    const matrix = JSON.parse(readFileSync(file, "utf8")) as {
      hosts: Array<{ name: string; status: string }>;
    };

    expect(matrix.hosts).toContainEqual({
      name: "linux",
      status: "unverified",
      reason: expect.any(String),
    });
    expect((matrix as { environment: { nativeDoctorStrict: string; nodeSqliteService: string } }).environment.nativeDoctorStrict).toContain("failed");
    expect((matrix as { environment: { nativeDoctorStrict: string; nodeSqliteService: string } }).environment.nodeSqliteService).toBe("rejected: NS1066");
  });
});
