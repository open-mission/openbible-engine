import { describe, expect, it } from "vitest";
import { LEGACY_ARA_FIXTURE } from "@openbible/adapter-sqlite-node";
import { createNativeAdapter, type NativeStorage } from "@openbible/adapter-sqlite-native/async";

class HarnessStorage implements NativeStorage {
  private readonly files = new Map<string, Uint8Array>();

  exists(path: string): boolean {
    return this.files.has(path);
  }

  readFile(path: string): Uint8Array {
    const bytes = this.files.get(path);
    if (!bytes) throw new Error(`missing harness file: ${path}`);
    return new Uint8Array(bytes);
  }

  writeFile(path: string, bytes: Uint8Array): void {
    this.files.set(path, new Uint8Array(bytes));
  }

  rename(from: string, to: string): void {
    const bytes = this.readFile(from);
    this.files.delete(from);
    this.files.set(to, bytes);
  }

  remove(path: string): void {
    this.files.delete(path);
  }

  list(prefix: string): readonly string[] {
    const root = `${prefix}/`;
    return [...this.files.keys()]
      .filter((path) => path.startsWith(root) && !path.slice(root.length).includes("/"))
      .sort();
  }
}

describe("Native consumer journey", () => {
  it("installs, reopens, reads, searches and removes a local fixture without network", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-004 AC-005 AC-006 AC-010 AC-011
    const storage = new HarnessStorage();
    const first = createNativeAdapter({ namespace: "scripture-library", storage });

    const installed = await first.installer.install({
      versionId: "ara",
      bytes: LEGACY_ARA_FIXTURE.bytes,
      installedAt: 100,
      versionCode: 1,
    });
    expect(await first.registry.get("ara")).toEqual(installed);
    expect((await first.library.getChapter("ara", "jhn", 2)).map((verse) => verse.verse)).toEqual([1, 2, 3]);
    expect((await first.library.search("ara", "luz", 5)).total).toBeGreaterThan(0);
    first.close();

    const reopened = createNativeAdapter({ namespace: "scripture-library", storage });
    expect(await reopened.installer.isInstalled("ara")).toBe(true);
    await reopened.installer.uninstall("ara");
    expect(await reopened.registry.list()).toEqual([]);
    expect(storage.list("bibles")).toEqual([]);
  });

  it("keeps the installed version when a replacement fails validation", async () => {
    // SPECSFY: US-001 FR-002 FR-003 NFR-002 AC-007
    const storage = new HarnessStorage();
    const adapter = createNativeAdapter({ namespace: "scripture-library", storage });
    await adapter.installer.install({ versionId: "ara", bytes: LEGACY_ARA_FIXTURE.bytes, installedAt: 100, versionCode: 1 });

    await expect(adapter.installer.install({ versionId: "ara", bytes: new Uint8Array([0]), installedAt: 200, versionCode: 2 })).rejects.toMatchObject({ code: "invalid_package" });
    expect(await adapter.registry.get("ara")).toMatchObject({ installedAt: 100, versionCode: 1 });
    expect(storage.list("bibles")).toEqual(["bibles/ara.db"]);
  });
});
