import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type HostStatus = "verified" | "unverified" | "unsupported";

interface NativeSdkHost {
  readonly name: "macos" | "linux" | "windows";
  readonly status: HostStatus;
}

interface NativeSdkMatrix {
  readonly sdkRevision: string;
  readonly sdkVersion: string;
  readonly api: {
    readonly core: readonly string[];
    readonly markup: string;
    readonly serviceBoundary: string;
    readonly coreEffects: string;
    readonly commands: readonly string[];
  };
  readonly capabilities: Record<string, string>;
  readonly seam: {
    readonly promisePort: string;
    readonly filesystem: string;
    readonly legacySqlite: string;
    readonly selected: string;
  };
  readonly hosts: readonly NativeSdkHost[];
}

function readMatrix(): NativeSdkMatrix {
  const file = path.resolve("apps/consumer-native/native-sdk-matrix.json");
  if (!existsSync(file)) throw new Error(`Native SDK matrix missing: ${file}`);
  return JSON.parse(readFileSync(file, "utf8")) as NativeSdkMatrix;
}

describe("Native SDK spike", () => {
  it("records the pinned SDK revision and every desktop host", () => {
    // SPECSFY: US-001 FR-001 NFR-003 AC-001
    const matrix = readMatrix();

    expect(matrix.sdkRevision).toMatch(/^[0-9a-f]{40}$/);
    expect(matrix.sdkVersion).toBe("0.10.1");
    expect(matrix.api.core).toEqual(["Model", "Msg", "update"]);
    expect(matrix.api.markup).toBe("src/app.native");
    expect(matrix.api.commands).toEqual([
      "native dev --core",
      "native check",
      "native test",
      "native build",
    ]);
    expect(matrix.capabilities.sqlite).toContain("engine-owned app.db");
    expect(matrix.capabilities.filesystem).toContain("verified");
    expect(matrix.seam.promisePort).toContain("Cmd/Msg");
    expect(matrix.seam.legacySqlite).toContain("pure TypeScript");
    expect(matrix.hosts.map((host) => host.name)).toEqual(["macos", "linux", "windows"]);
    expect(matrix.hosts.every((host) => ["verified", "unverified", "unsupported"].includes(host.status))).toBe(true);
  });
});
