import { describe, it, expect } from "vitest";
import { FakeClock, FakeRegistry, FakeLibrary, FakePackageSource } from "../fakes.js";
import { createAraFixture, createSyntheticBibleBytes } from "../fixtures.js";
import { runContractSuite } from "../contract-suite.js";
import { BibleVersionBuilder, BibleBookBuilder, VerseBuilder } from "../builders.js";

describe("engine-testing fakes", () => {
  it("FakeClock tick", () => {
    const c = new FakeClock(1000);
    expect(c.now()).toBe(1000);
    c.tick(500);
    expect(c.now()).toBe(1500);
  });

  it("FakeRegistry", async () => {
    const r = new FakeRegistry();
    await r.set({ id: "ara", name: "ARA", installedAt: 123, versionCode: 1 });
    expect(await r.get("ara")).toEqual(expect.objectContaining({ id: "ara" }));
    expect(await r.list()).toHaveLength(1);
    await r.remove("ara");
    expect(await r.get("ara")).toBeNull();
  });

  it("FakeLibrary contract", async () => {
    const lib = new FakeLibrary();
    const fixture = createAraFixture();
    await lib.installPackage(fixture.versionId, fixture.bytes);
    await runContractSuite(lib, fixture.versionId);
  });

  it("FakeLibrary search ordering and builders", async () => {
    const lib = new FakeLibrary();
    const books = [new BibleBookBuilder().withId("gen").withChapters(50).build(), new BibleBookBuilder().withId("exo").withChapters(40).build()];
    const verses = [
      new VerseBuilder().withBookId("gen").withChapter(1).withVerse(2).withText("Zzz Deus").build(),
      new VerseBuilder().withBookId("gen").withChapter(1).withVerse(1).withText("Aaa Deus").build(),
    ];
    const bytes = createSyntheticBibleBytes("tst", books, verses, "TST");
    await lib.installPackage("tst", bytes);
    const chap = await lib.getChapter("tst", "gen", 1);
    expect(chap[0].verse).toBe(1);
    expect(chap[1].verse).toBe(2);
    const search = await lib.search("tst", "deus", 10);
    expect(search.total).toBe(2);
  });

  it("FakePackageSource", async () => {
    const src = new FakePackageSource();
    const list = await src.listAvailable();
    expect(list.length).toBeGreaterThan(0);
    const bytes = await src.fetchPackage("ara");
    expect(bytes.length).toBeGreaterThan(16);
  });

  it("Builder fluency", () => {
    const v = new BibleVersionBuilder().withId("nvi").withName("NVI").build();
    expect(v.id).toBe("nvi");
    const b = new BibleBookBuilder().withId("psa").build();
    expect(b.id).toBe("psa");
    const vs = new VerseBuilder().withText("hello").build();
    expect(vs.text).toBe("hello");
  });
});
