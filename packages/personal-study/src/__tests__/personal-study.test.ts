import { describe, expect, it } from "vitest";

type PersonalStudyFactory = (options: unknown) => {
  createNote(input: unknown): Note;
  listNotes(): ListedNote[];
  updateNote(id: string, input: unknown): Note;
  deleteNote(id: string): void;
};

type Note = {
  id: string;
  title?: string;
  markdown: string;
  reference: {
    bookId: string;
    chapter: number;
    verseStart: number;
    verseEnd?: number;
  };
  createdAt: number;
  updatedAt: number;
};

type ListedNote = Note & {
  availability?: "available" | "text_unavailable";
};

function createStore() {
  const notes: Note[] = [];
  return {
    save(note: Note) {
      notes.push(note);
    },
    list() {
      return [...notes];
    },
    get(id: string) {
      return notes.find((note) => note.id === id);
    },
    replace(note: Note) {
      const index = notes.findIndex((current) => current.id === note.id);
      notes[index] = note;
    },
    remove(id: string) {
      const index = notes.findIndex((note) => note.id === id);
      notes.splice(index, 1);
    },
  };
}

describe("personal study notes", () => {
  // SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 NFR-003 AC-001
  it("creates and lists a note with its original content and reference", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const store = createStore();
    const study = implementation.createPersonalStudy({
      store,
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    });

    const created = study.createNote({
      title: "Grace",
      markdown: "**Grace** changes everything.",
      reference: {
        bookId: "rom",
        chapter: 5,
        verseStart: 1,
      },
    });

    expect(created).toMatchObject({
      id: "note-001",
      title: "Grace",
      markdown: "**Grace** changes everything.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    });
    expect(study.listNotes()).toEqual([
      expect.objectContaining({
        ...created,
        availability: "available",
      }),
    ]);
  });

  // SPECSFY: US-001 FR-001 FR-003 NFR-001 NFR-003 AC-002
  it("updates a note while preserving identity and creation time", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const store = createStore();
    let currentTime = 1_700_000_000_000;
    const study = implementation.createPersonalStudy({
      store,
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => currentTime },
      noteIdFactory: { create: () => "note-001" },
    });
    const created = study.createNote({
      markdown: "Initial note.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    currentTime = 1_700_000_000_001;
    const updated = study.updateNote("note-001", {
      title: "Updated",
      markdown: "Updated note.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    expect(updated).toMatchObject({
      id: created.id,
      createdAt: created.createdAt,
      updatedAt: 1_700_000_000_001,
      title: "Updated",
      markdown: "Updated note.",
    });
  });

  // SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-003
  it("deletes a note permanently", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const study = implementation.createPersonalStudy({
      store: createStore(),
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    });
    study.createNote({
      markdown: "Note to delete.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    study.deleteNote("note-001");

    expect(study.listNotes()).toEqual([]);
  });

  // SPECSFY: US-001 FR-002 FR-004 NFR-001 AC-006
  it("keeps a note and exposes unavailable text when no Bible resolves it", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const study = implementation.createPersonalStudy({
      store: createStore(),
      referenceAvailability: { isAvailable: () => false },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    });
    study.createNote({
      markdown: "Reference without installed Bible.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    expect(study.listNotes()).toEqual([
      expect.objectContaining({ availability: "text_unavailable" }),
    ]);
  });

  // SPECSFY: US-001 FR-003 NFR-002 NFR-003 AC-008
  it("preserves Markdown as inert original content", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const markdown = "<script>alert('x')</script>\n\n**Safe text**";
    const study = implementation.createPersonalStudy({
      store: createStore(),
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    });

    const note = study.createNote({
      markdown,
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    expect(note.markdown).toBe(markdown);
    expect(note).not.toHaveProperty("renderedHtml");
  });

  // SPECSFY: US-001 FR-004 NFR-001 NFR-003 AC-009
  it("reports storage failure without confirming an in-memory note", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const storageError = Object.assign(new Error("Storage unavailable"), {
      code: "storage_unavailable",
    });
    const store = {
      ...createStore(),
      save: (_note: Note) => {
        throw storageError;
      },
    };
    const study = implementation.createPersonalStudy({
      store,
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    });

    expect(() =>
      study.createNote({
        markdown: "Not persisted.",
        reference: { bookId: "rom", chapter: 5, verseStart: 1 },
      }),
    ).toThrowError(expect.objectContaining({ code: "storage_unavailable" }));
    expect(study.listNotes()).toEqual([]);
  });

  // SPECSFY: US-001 FR-001 FR-004 NFR-001 NFR-003 AC-010
  it("reads persisted notes after reopening without a network port", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { createPersonalStudy?: PersonalStudyFactory }
      | undefined;
    expect(implementation?.createPersonalStudy).toBeTypeOf("function");
    if (!implementation?.createPersonalStudy) return;

    const store = createStore();
    const options = {
      store,
      referenceAvailability: { isAvailable: () => true },
      clock: { now: () => 1_700_000_000_000 },
      noteIdFactory: { create: () => "note-001" },
    };
    const firstSession = implementation.createPersonalStudy(options);
    firstSession.createNote({
      markdown: "Available offline.",
      reference: { bookId: "rom", chapter: 5, verseStart: 1 },
    });

    const reopenedSession = implementation.createPersonalStudy(options);

    expect(reopenedSession.listNotes()).toEqual([
      expect.objectContaining({ markdown: "Available offline." }),
    ]);
  });
});
