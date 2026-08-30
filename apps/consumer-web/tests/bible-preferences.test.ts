import type { BibleInstaller, BiblePackageSource, InstalledBibleRegistry } from "@openbible/engine";
import { EngineError } from "@openbible/engine";
import type { BibleVersionPreference } from "@openbible/sync-core";
import { describe, expect, it, vi } from "vitest";
import { applyBibleVersionPreference, type BiblePreferenceSyncDependencies } from "@/engine/bible-preferences";
import type { InstalledBible } from "@openbible/engine-core";

const preference: BibleVersionPreference = {
  accountId: "account-1",
  versionId: "ara",
  name: "Almeida Revista e Atualizada",
  versionCode: "ara-v1",
  source: "official-r2",
  state: "available",
};

function makeDependencies(options: {
  installed?: InstalledBible;
  fetchPackage?: BiblePackageSource["fetchPackage"];
} = {}) {
  const fetchPackage = vi.fn(options.fetchPackage ?? (async () => new Uint8Array([1, 2, 3])));
  const install = vi.fn(async (input: Parameters<BibleInstaller["install"]>[0]): Promise<InstalledBible> => ({
    id: input.versionId,
    name: input.name ?? "ARA",
    installedAt: input.installedAt,
    versionCode: input.versionCode,
  }));
  const registry: InstalledBibleRegistry = {
    list: async () => options.installed ? [options.installed] : [],
    get: async () => options.installed ?? null,
    set: async () => undefined,
    remove: async () => undefined,
  };

  return {
    registry,
    installer: { install, uninstall: async () => undefined, isInstalled: async () => false },
    packageSource: { listAvailable: async () => [], fetchPackage },
    fetchPackage,
    install,
  } satisfies BiblePreferenceSyncDependencies & { fetchPackage: typeof fetchPackage; install: typeof install };
}

describe("Bible version preferences", () => {
  // SPECSFY: US-004 FR-002 FR-006 NFR-001 NFR-003 AC-018 AC-023
  it("redownloads missing metadata through the official source and installs locally", async () => {
    const dependencies = makeDependencies();

    const result = await applyBibleVersionPreference(preference, {
      ...dependencies,
      now: () => 1_700_000_000_000,
    });

    expect(result).toMatchObject({
      outcome: "installed",
      preference: { versionId: "ara", state: "available", installedAt: 1_700_000_000_000 },
    });
    expect(dependencies.fetchPackage).toHaveBeenCalledWith("ara");
    expect(dependencies.install).toHaveBeenCalledWith(expect.objectContaining({
      versionId: "ara",
      name: preference.name,
      installedAt: 1_700_000_000_000,
    }));
    expect(result).not.toHaveProperty("bytes");
  });

  it("keeps metadata pending when the official source is unavailable", async () => {
    const dependencies = makeDependencies({
      fetchPackage: async () => { throw new EngineError("network_unavailable", "Source unavailable"); },
    });

    await expect(applyBibleVersionPreference(preference, dependencies)).resolves.toEqual({
      outcome: "pending",
      errorCode: "network_unavailable",
      preference: { ...preference, state: "pending" },
    });
    expect(dependencies.install).not.toHaveBeenCalled();
  });

  it("does not redownload an already installed version", async () => {
    const installed = { id: "ara", name: preference.name, installedAt: 1_600_000_000_000, versionCode: 1 };
    const dependencies = makeDependencies({ installed });

    await expect(applyBibleVersionPreference(preference, dependencies)).resolves.toMatchObject({
      outcome: "already_installed",
      preference: { installedAt: installed.installedAt, state: "available" },
    });
    expect(dependencies.fetchPackage).not.toHaveBeenCalled();
    expect(dependencies.install).not.toHaveBeenCalled();
  });
});
