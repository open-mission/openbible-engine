import { describe, it, expect } from "vitest";
import { NativeBibleLibrary } from "../sqlite-native.js";
import { runContractSuite } from "@openbible/engine-testing";
import { createAraFixture } from "@openbible/engine-testing";

describe("NativeBibleLibrary contract", () => {
  it("passes contract suite with ARA fixture", async () => {
    const lib = new NativeBibleLibrary();
    const fixture = createAraFixture();
    await lib.installPackage(fixture.versionId, fixture.bytes);
    await runContractSuite(lib, fixture.versionId, { expectedBookIds: ["gen", "exo"] });
    expect(true).toBe(true);
  });
});
