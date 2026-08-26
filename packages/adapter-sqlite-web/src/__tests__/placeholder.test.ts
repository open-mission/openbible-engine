import { describe, it, expect } from "vitest";
import { InMemoryWebLibrary } from "../in-memory.js";
import { SqliteWebLibrary } from "../sqlite-web.js";
import { runContractSuite } from "@openbible/engine-testing";
import { createAraFixture } from "@openbible/engine-testing";

describe("InMemoryWebLibrary contract", () => {
  it("passes contract suite", async () => {
    const lib = new InMemoryWebLibrary();
    const fixture = createAraFixture();
    await lib.installPackage(fixture.versionId, fixture.bytes);
    await runContractSuite(lib, fixture.versionId);
    expect(true).toBe(true);
  });
});

describe("SqliteWebLibrary contract", () => {
  it("passes contract suite via wrapper", async () => {
    const lib = new SqliteWebLibrary();
    const fixture = createAraFixture();
    await lib.installPackage(fixture.versionId, fixture.bytes);
    await runContractSuite(lib, fixture.versionId);
    expect(true).toBe(true);
  });
});
