import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Native consumer R2 download", () => {
  it("declares the network capability for explicit installation", () => {
    // SPECSFY: US-001 FR-003 FR-004 NFR-001 NFR-002 NFR-003 AC-013
    const manifest = JSON.parse(readFileSync(join(appRoot, "app.json"), "utf8")) as {
      permissions?: string[];
      capabilities?: string[];
    };

    expect(manifest.permissions).toContain("network");
    expect(manifest.capabilities).toContain("network");
  });

  it("uses the public R2 endpoint and bounded ranged fetches", () => {
    // SPECSFY: US-001 FR-003 NFR-001 NFR-002 NFR-003 AC-013
    const core = readFileSync(join(appRoot, "src/core.ts"), "utf8");

    expect(core).toContain("Cmd.fetch");
    expect(core).toContain("Range");
    expect(core).toContain("r2.dev/bibles");
    expect(core).toContain("204800");
  });

  it("stages each response before the local installer commits it", () => {
    // SPECSFY: US-001 FR-003 FR-004 NFR-001 NFR-002 NFR-003 AC-013
    const core = readFileSync(join(appRoot, "src/core.ts"), "utf8");
    const service = readFileSync(join(appRoot, "src/services/scripture-library.ts"), "utf8");
    const adapter = readFileSync(join(appRoot, "../../packages/adapter-sqlite-native/src/native-service.ts"), "utf8");

    expect(core).toContain("scriptureLibraryStageDownloadChunk");
    expect(core).toContain("scriptureLibraryInstallDownloaded");
    expect(service).toContain("stageNativePackageDownloadChunk");
    expect(service).toContain("installNativePackageDownload");
    expect(service).not.toContain("downloads/");
    expect(adapter).toContain("stageNativePackageDownloadChunk");
    expect(adapter).toContain("installNativePackageDownload");
    expect(adapter).toContain("downloads/");
  });
});
