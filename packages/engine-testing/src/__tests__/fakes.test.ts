import { describe, it, expect } from "vitest";
import { FakeClock, FakeRegistry, FakeLibrary, FakePackageSource, FakeBibleInstaller } from "../fakes.js";
import { createAraFixture } from "../fixtures.js";
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
    expect((await r.get("ara"))?.id).toBe("ara");
    expect(await r.list()).toHaveLength(1);
    await r.remove("ara");
    expect(await r.get("ara")).toBeNull();
  });

  it("FakeLibrary read-only via populate", async () => {
    const lib = new FakeLibrary();
    const fixture = createAraFixture();
    lib.populate(fixture.versionId, { books: fixture.books, verses: fixture.verses, name: fixture.name });
    expect((await lib.getBooks(fixture.versionId)).length).toBeGreaterThan(0);
  });

  it("FakeLibrary sort and search ordering", async () => {
    const lib = new FakeLibrary();
    const books = [
      new BibleBookBuilder().withId("gen").withChapters(50).build(),
      new BibleBookBuilder().withId("exo").withChapters(40).build(),
    ];
    const verses = [
      new VerseBuilder().withBookId("gen").withChapter(1).withVerse(2).withText("Zzz Deus").build(),
      new VerseBuilder().withBookId("gen").withChapter(1).withVerse(1).withText("Aaa Deus").build(),
    ];
    lib.populate("tst", { books, verses, name: "TST" });
    const chap = await lib.getChapter("tst", "gen", 1);
    expect(chap.map((v) => v.verse)).toEqual([1, 2]);
    expect((await lib.search("tst", "deus", 10)).total).toBe(2);
  });

  it("FakeBibleInstaller install + uninstall atomicity", async () => {
    const registry = new FakeRegistry();
    const library = new FakeLibrary();
    const fixture = createAraFixture();
    const installer = new FakeBibleInstaller({
      registry,
      library,
      onCommit: (versionId, input) =>
        library.populate(versionId, { books: fixture.books, verses: fixture.verses, name: input.name ?? versionId }),
    });
    await installer.install({ versionId: "ara", bytes: new Uint8Array([1]), installedAt: 1, versionCode: 1 });
    expect(await installer.isInstalled("ara")).toBe(true);
    await installer.uninstall("ara");
    expect(await installer.isInstalled("ara")).toBe(false);
  });

  it("FakePackageSource", async () => {
    const src = new FakePackageSource();
    expect((await src.listAvailable()).length).toBeGreaterThan(0);
    src.setPackage("x", new Uint8Array([1, 2]));
    expect((await src.fetchPackage("x")).length).toBe(2);
  });

  it("Builder fluency", () => {
    expect(new BibleVersionBuilder().withId("nvi").withName("NVI").build().id).toBe("nvi");
    expect(new BibleBookBuilder().withId("psa").build().id).toBe("psa");
    expect(new VerseBuilder().withText("hello").build().text).toBe("hello");
  });
});
