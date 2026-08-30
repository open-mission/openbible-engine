import { describe, it, expect, afterEach } from "vitest";
import type { CancellationToken, InstalledBible } from "@openbible/engine-core";
import { EngineError } from "@openbible/engine-core";
import type { InstallPackageInput, InstallationObserver } from "@openbible/engine";
import { WebInstaller, isSqliteHeader } from "../../src/worker/installer.js";
import { FakePool } from "./helpers/fake-pool.js";
import { FakeRegistry } from "./helpers/fake-registry.js";
import { LEGACY_FIXTURE, INVALID_BYTES } from "./helpers/fixture.js";

const pools: FakePool[] = [];
function pool(): FakePool {
  const p = new FakePool();
  pools.push(p);
  return p;
}
afterEach(() => {
  for (const p of pools.splice(0)) p.cleanup();
});

function input(patch: Partial<InstallPackageInput> = {}): InstallPackageInput {
  return {
    versionId: "ara",
    bytes: LEGACY_FIXTURE,
    installedAt: 1234,
    versionCode: 1,
    ...patch,
  };
}

function cancelledToken(): CancellationToken {
  const t = { aborted: false, reason: undefined } as { aborted: boolean; reason?: unknown };
  return t as CancellationToken;
}

describe("web installer", () => {
  it("installs a valid legacy package, sets the registry and leaves no intermediates", async () => {
    // SPECSFY: US-002 FR-004 FR-005 FR-006 NFR-003 NFR-004 NFR-005 AC-004
    const p = pool();
    const registry = new FakeRegistry();
    const installer = new WebInstaller(p, registry);
    const installed = await installer.install(input());
    expect(installed.id).toBe("ara");
    expect(await registry.get("ara")).not.toBeNull();
    expect(await installer.isInstalled("ara")).toBe(true);
    expect(await p.exportFile("/ara.db")).toBeTruthy();
    const names = p.fileNames();
    expect(names.some((n) => n.includes(".tmp"))).toBe(false);
    expect(names.some((n) => n.includes(".bak"))).toBe(false);
  });

  it("rejects a non-SQLite package with invalid_package and leaves storage clean", async () => {
    // SPECSFY: US-001 US-003 FR-001 FR-003 FR-004 FR-005 FR-006 NFR-001 NFR-003 NFR-004 NFR-005 AC-003 AC-006
    const p = pool();
    const registry = new FakeRegistry();
    const installer = new WebInstaller(p, registry);
    await expect(installer.install(input({ bytes: INVALID_BYTES }))).rejects.toMatchObject({
      code: "invalid_package",
    });
    expect(await registry.get("ara")).toBeNull();
    expect(await p.exportFile("/ara.db").catch(() => null)).toBeNull();
  });

  it("maps a cancellation to cancelled without leaving partial data", async () => {
    // SPECSFY: US-001 US-003 FR-001 FR-003 FR-004 FR-005 FR-006 NFR-001 NFR-003 NFR-004 NFR-005 AC-003 AC-006
    const p = pool();
    const registry = new FakeRegistry();
    const installer = new WebInstaller(p, registry);
    const token = { aborted: true, reason: "user" };
    await expect(installer.install(input({ token }))).rejects.toMatchObject({ code: "cancelled" });
    expect(await registry.get("ara")).toBeNull();
    expect(p.fileNames().some((n) => n.includes(".tmp"))).toBe(false);
  });

  it("preserves the previous version when a reinstall fails", async () => {
    // SPECSFY: US-001 US-003 FR-001 FR-003 FR-004 FR-005 FR-006 NFR-001 NFR-003 NFR-004 NFR-005 AC-003 AC-007
    const p = pool();
    const registry = new FakeRegistry();
    const installer = new WebInstaller(p, registry);
    await installer.install(input());
    // Reinstall with invalid bytes must not destroy the installed "ara".
    await expect(
      installer.install(input({ bytes: INVALID_BYTES })),
    ).rejects.toMatchObject({ code: "invalid_package" });
    expect(await registry.get("ara")).not.toBeNull();
    expect(await installer.isInstalled("ara")).toBe(true);
  });

  it("identifies the SQLite header", () => {
    // SPECSFY: US-002 FR-005 NFR-003 AC-004
    expect(isSqliteHeader(LEGACY_FIXTURE)).toBe(true);
    expect(isSqliteHeader(INVALID_BYTES)).toBe(false);
    expect(isSqliteHeader(new Uint8Array(0))).toBe(false);
  });
});
