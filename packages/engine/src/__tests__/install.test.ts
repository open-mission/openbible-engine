import { describe, it, expect } from "vitest";
import { createBibleEngine } from "../engine.js";
import { EngineError } from "@openbible/engine-core";
import { FakeLibrary, FakeRegistry, FakeClock, createAraFixture, createInvalidHeaderFixture, createMissingSchemaFixture, createMismatchedIdentityFixture } from "@openbible/engine-testing";

describe("installVersion", () => {
  // SPECSFY: US-001 FR-004 NFR-004 AC-004
  it("idempotent re-install keeps single registry entry", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const first = await reg.list();
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const second = await reg.list();
    expect(second.length).toBe(1);
    expect(second[0].id).toBe(fixture.versionId);
    expect(first.length).toBe(second.length);
  });

  // SPECSFY: US-001 FR-005 NFR-005 AC-005
  it("install with valid header/schema promotes and registers with progress", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    const progress: string[] = [];
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes }, {
      onProgress: (p) => progress.push(p.stage),
    });
    expect(progress).toContain("validating_header");
    expect(progress).toContain("validating_schema");
    expect(progress).toContain("promoting");
    const entry = await reg.get(fixture.versionId);
    expect(entry).not.toBeNull();
  });

  // SPECSFY: US-003 FR-004 NFR-007 AC-014
  it("fails unsupported_schema for missing tables and does not register", async () => {
    const bytes = createMissingSchemaFixture("ara");
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.installVersion({ versionId: "ara", bytes })).rejects.toMatchObject({ code: "unsupported_schema" });
    const entry = await reg.get("ara");
    expect(entry).toBeNull();
  });

  // SPECSFY: US-003 FR-005 NFR-001 AC-015
  it("preserves previous version when new install fails", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const before = await reg.get(fixture.versionId);
    expect(before).not.toBeNull();
    const bad = createInvalidHeaderFixture();
    await expect(engine.installVersion({ versionId: fixture.versionId, bytes: bad })).rejects.toBeDefined();
    const after = await reg.get(fixture.versionId);
    expect(after).not.toBeNull();
    expect(after!.id).toBe(before!.id);
  });

  // SPECSFY: US-005 FR-008 NFR-007 AC-028
  it("fails invalid_package for invalid header", async () => {
    const bad = createInvalidHeaderFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.installVersion({ versionId: "ara", bytes: bad })).rejects.toMatchObject({ code: "invalid_package" });
  });

  // SPECSFY: US-005 FR-008 NFR-007 AC-028
  it("invalid_package when header mismatch", async () => {
    const bytes = new TextEncoder().encode("not sqlite header json {metadata:{},books:[],verses:[]}");
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.installVersion({ versionId: "ara", bytes })).rejects.toMatchObject({ code: "invalid_package" });
  });

  // SPECSFY: US-005 FR-005 NFR-004 AC-025
  it("cancelled when AbortSignal aborted", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    const controller = new AbortController();
    controller.abort();
    await expect(engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes, signal: controller.signal })).rejects.toMatchObject({ code: "cancelled" });
    const entry = await reg.get(fixture.versionId);
    expect(entry).toBeNull();
  });

  // SPECSFY: US-004 FR-004 NFR-003 AC-024
  it("uninstall removes but keeps others", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: "ara", bytes: fixture.bytes });
    const { createSyntheticBibleBytes } = await import("@openbible/engine-testing");
    const bytes2 = createSyntheticBibleBytes("nvi", fixture.books, fixture.verses, "NVI");
    await engine.installVersion({ versionId: "nvi", bytes: bytes2 });
    expect((await reg.list()).length).toBe(2);
    await engine.uninstallVersion("nvi");
    const list = await reg.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("ara");
  });

  // SPECSFY: US-001 FR-004 NFR-004 AC-004
  it("reinstall after uninstall works", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    await engine.uninstallVersion(fixture.versionId);
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const entry = await reg.get(fixture.versionId);
    expect(entry).not.toBeNull();
  });

  // SPECSFY: US-003 FR-005 NFR-001 AC-015
  it("mismatched identity fails invalid_package", async () => {
    const bytes = createMismatchedIdentityFixture("ara", "other-version");
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const engine = createBibleEngine({ library: lib, registry: reg });
    await expect(engine.installVersion({ versionId: "ara", bytes })).rejects.toMatchObject({ code: "invalid_package" });
  });

  // SPECSFY: US-001 FR-005 NFR-005 AC-005
  it("clock used for installedAt", async () => {
    const fixture = createAraFixture();
    const lib = new FakeLibrary();
    const reg = new FakeRegistry();
    const clock = new FakeClock(Date.UTC(2024, 0, 1));
    const engine = createBibleEngine({ library: lib, registry: reg, clock });
    await engine.installVersion({ versionId: fixture.versionId, bytes: fixture.bytes });
    const entry = await reg.get(fixture.versionId);
    expect(entry!.installedAt).toBe(Date.UTC(2024, 0, 1));
  });
});
