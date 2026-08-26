import { FakeLibrary, FakeRegistry, FakeBibleInstaller, FakeClock } from "@openbible/engine-testing";
import { createFixture } from "@openbible/engine-testing";
import type { BiblePackageSource } from "../ports.js";
import { createBibleEngine } from "../engine.js";
import type { FakeInstallerOptions } from "@openbible/engine-testing";

export interface MakeEngineOptions {
  preinstalled?: string[];
  packageSource?: BiblePackageSource;
  installer?: Partial<FakeInstallerOptions>;
}

const FALLBACK_SOURCE: BiblePackageSource = {
  listAvailable: async () => [],
  fetchPackage: async (versionId) => new Uint8Array([1, 2, 3]).slice(0, Math.max(1, versionId.length)),
};

export function makeEngine(options: MakeEngineOptions = {}) {
  const library = new FakeLibrary();
  const registry = new FakeRegistry();
  const clock = new FakeClock();
  const installer = new FakeBibleInstaller({
    registry,
    library,
    onCommit: (versionId, input) => {
      const name = input.name ?? versionId;
      const data = createFixture(versionId, name);
      library.populate(versionId, { books: data.books, verses: data.verses, name });
    },
    ...options.installer,
  });
  const engine = createBibleEngine({
    library,
    registry,
    installer,
    packageSource: options.packageSource ?? FALLBACK_SOURCE,
    clock,
  });
  return { engine, library, registry, installer, clock };
}
