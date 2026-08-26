import { describe, it, expect } from "vitest";
import { EngineError } from "@openbible/engine-core";
import { makeEngine } from "./helpers.js";

describe("openbible install lifecycle (transactional)", () => {
  // SPECSFY: US-001 FR-004 FR-005 NFR-007 AC-004 AC-005
  it("installs, lists and is idempotent", async () => {
    const { engine, registry, installer } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    await engine.installVersion({ versionId: "ara" });
    expect(await registry.list()).toHaveLength(1);
    expect(await installer.isInstalled("ara")).toBe(true);
  });

  // SPECSFY: US-001 FR-005 NFR-007 AC-005
  it("emits installation progress stages", async () => {
    const { engine } = makeEngine();
    const stages: string[] = [];
    await engine.installVersion({ versionId: "ara" }, { onProgress: (p) => stages.push(p.stage) });
    expect(stages).toContain("receiving");
    expect(stages).toContain("registering");
  });

  // SPECSFY: US-003 FR-004 NFR-007 AC-014
  it("a failed install leaves no partial data and nothing registered", async () => {
    const { engine, registry, installer, library } = makeEngine({ installer: { failDuring: "commit" } });
    await expect(engine.installVersion({ versionId: "ara" })).rejects.toMatchObject({ code: "storage_unavailable" });
    expect(await registry.get("ara")).toBeNull();
    expect(installer.hasStorage("ara")).toBe(false);
    expect(library.hasVersion("ara")).toBe(false);
    expect(await installer.isInstalled("ara")).toBe(false);
  });

  // SPECSFY: US-005 FR-005 NFR-004 AC-028
  it("a failed validation throws invalid_package and leaves nothing installed", async () => {
    const { engine, registry, installer } = makeEngine({ installer: { validate: () => false } });
    await expect(engine.installVersion({ versionId: "ara" })).rejects.toMatchObject({ code: "invalid_package" });
    expect(await registry.get("ara")).toBeNull();
    expect(installer.hasStorage("ara")).toBe(false);
  });

  // SPECSFY: US-003 FR-005 NFR-001 AC-015
  it("reinstall failure preserves a previous usable version", async () => {
    const { engine, registry, installer, library } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    expect((await engine.getBooks("ara")).length).toBeGreaterThan(0);
    expect((await registry.get("ara"))?.versionCode).toBe(1);

    installer.setValidate(() => false);
    await expect(engine.installVersion({ versionId: "ara", name: "ARA-v2" })).rejects.toMatchObject({ code: "invalid_package" });
    expect((await engine.getBooks("ara")).length).toBeGreaterThan(0);
    expect((await registry.get("ara"))?.versionCode).toBe(1);
    expect(await installer.isInstalled("ara")).toBe(true);
    expect(library.hasVersion("ara")).toBe(true);
  });

  // SPECSFY: US-001 FR-004 NFR-007 AC-024
  it("uninstall removes both storage and registry atomically", async () => {
    const { engine, registry, installer } = makeEngine();
    await engine.installVersion({ versionId: "ara" });
    expect(await installer.isInstalled("ara")).toBe(true);
    await engine.uninstallVersion("ara");
    expect(await registry.get("ara")).toBeNull();
    expect(installer.hasStorage("ara")).toBe(false);
    expect(await installer.isInstalled("ara")).toBe(false);
  });

  // SPECSFY: US-001 FR-008 NFR-001 AC-008
  it("uninstall of a missing version throws version_not_installed", async () => {
    const { engine } = makeEngine();
    await expect(engine.uninstallVersion("nvi")).rejects.toMatchObject({ code: "version_not_installed" });
  });

  // SPECSFY: US-005 FR-005 NFR-004 AC-025
  it("cancellation maps to cancelled and leaves nothing installed", async () => {
    const { engine, registry, installer } = makeEngine();
    const token = { aborted: true, reason: "user" };
    await expect(engine.installVersion({ versionId: "ara", token })).rejects.toMatchObject({ code: "cancelled" });
    expect(await registry.get("ara")).toBeNull();
    expect(installer.hasStorage("ara")).toBe(false);
  });

  // SPECSFY: US-001 FR-008 NFR-007 AC-028
  it("rejects a package that fails header validation", async () => {
    const { engine } = makeEngine({ installer: { validate: () => false } });
    await expect(engine.installVersion({ versionId: "ara" })).rejects.toMatchObject({ code: "invalid_package" });
  });

  // SPECSFY: US-001 FR-001 NFR-004 AC-001
  it("an invalid version id maps to invalid_package", async () => {
    const { engine } = makeEngine();
    await expect(engine.installVersion({ versionId: "../../x" })).rejects.toMatchObject({ code: "invalid_package" });
  });

  // SPECSFY: US-005 FR-008 NFR-005 AC-008
  it("rethrows typed EngineError codes", async () => {
    const { engine } = makeEngine();
    try {
      await engine.getBooks("nvi");
    } catch (e) {
      expect(e).toBeInstanceOf(EngineError);
      expect((e as EngineError).code).toBe("version_not_installed");
      expect((e as EngineError).message).toBeTruthy();
    }
  });
});
