import { describe, it, expect, afterEach } from "vitest";
import type { InstalledBible } from "@openbible/engine-core";
import { reconcilePool } from "../../src/worker/reconciliation.js";
import { FakePool } from "./helpers/fake-pool.js";
import { FakeRegistry } from "./helpers/fake-registry.js";
import { LEGACY_FIXTURE } from "./helpers/fixture.js";

const pools: FakePool[] = [];
function pool(): FakePool {
  const p = new FakePool();
  pools.push(p);
  return p;
}
afterEach(() => {
  for (const p of pools.splice(0)) p.cleanup();
});

function installed(): InstalledBible {
  return { id: "ara", name: "ARA", installedAt: 1, versionCode: 1 };
}

describe("web reconciliation", () => {
  it("removes abandoned temporary files", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-004 NFR-005 AC-007
    const p = pool();
    await p.importDb("/ara.db.tmp-abc", LEGACY_FIXTURE);
    const registry = new FakeRegistry();
    const stats = await reconcilePool(p, registry);
    expect(stats.removedTmp).toBe(1);
    expect(p.fileNames().some((n) => n.includes(".tmp"))).toBe(false);
  });

  it("restores the previous version from backup when final is missing", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-004 NFR-005 AC-007
    const p = pool();
    await p.importDb("/ara.db.bak", LEGACY_FIXTURE);
    const registry = new FakeRegistry();
    registry.setSync(installed());
    const stats = await reconcilePool(p, registry);
    expect(stats.restored).toBe(1);
    expect(p.fileNames()).toContain("/ara.db");
    expect(p.fileNames()).not.toContain("/ara.db.bak");
  });

  it("removes an orphan final that has no registry entry", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-004 NFR-005 AC-007
    const p = pool();
    await p.importDb("/ara.db", LEGACY_FIXTURE);
    const registry = new FakeRegistry();
    const stats = await reconcilePool(p, registry);
    expect(stats.removedOrphans).toBe(1);
    expect(p.fileNames()).not.toContain("/ara.db");
  });

  it("discards trash with no registry and restores trash that still has a registry entry", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-004 NFR-005 AC-007
    const p = pool();
    const registry = new FakeRegistry();
    await p.importDb("/ara.db.trash", LEGACY_FIXTURE);
    registry.setSync(installed());
    const stats = await reconcilePool(p, registry);
    expect(stats.restored).toBe(1);
    expect(p.fileNames()).toContain("/ara.db");

    const p2 = pool();
    const empty = new FakeRegistry();
    await p2.importDb("/ara.db.trash", LEGACY_FIXTURE);
    const stats2 = await reconcilePool(p2, empty);
    expect(stats2.removedTrash).toBe(1);
    expect(p2.fileNames()).not.toContain("/ara.db");
  });

  it("excludes the registry database file from orphan treatment", async () => {
    // SPECSFY: US-003 FR-007 FR-009 NFR-004 NFR-005 AC-007
    const p = pool();
    await p.importDb("/store.db", LEGACY_FIXTURE);
    const registry = new FakeRegistry();
    const stats = await reconcilePool(p, registry);
    expect(stats.removedOrphans).toBe(0);
    expect(p.fileNames()).toContain("/store.db");
  });
});
