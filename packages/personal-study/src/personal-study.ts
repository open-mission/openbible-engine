import {
  PersonalStudyError,
  validateNoteContent,
  validateStudyReference,
} from "@openbible/personal-study-core";
import type { StudyNote } from "@openbible/personal-study-core";
import type {
  ListedStudyNote,
  PersonalStudy,
  PersonalStudyOptions,
  StudyNoteInput,
} from "./ports.js";

export function createPersonalStudy(options: PersonalStudyOptions): PersonalStudy {
  const { store, referenceAvailability, clock, noteIdFactory } = options;

  return {
    createNote(input) {
      validateInput(input);
      const timestamp = clock.now();
      const note: StudyNote = {
        id: noteIdFactory.create(),
        title: input.title,
        markdown: input.markdown,
        reference: input.reference,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      runStorage(() => store.save(note));
      return note;
    },

    listNotes() {
      return runStorage(() => store.list()).map((note) => withAvailability(note));
    },

    getNote(id) {
      const note = runStorage(() => store.get(id));
      if (!note) throw new PersonalStudyError("note_not_found", `Note not found: ${id}`);
      return withAvailability(note);
    },

    updateNote(id, input) {
      validateInput(input);
      const current = runStorage(() => store.get(id));
      if (!current) throw new PersonalStudyError("note_not_found", `Note not found: ${id}`);
      const updated: StudyNote = {
        id: current.id,
        title: input.title,
        markdown: input.markdown,
        reference: input.reference,
        createdAt: current.createdAt,
        updatedAt: clock.now(),
      };
      runStorage(() => store.replace(updated));
      return updated;
    },

    deleteNote(id) {
      const current = runStorage(() => store.get(id));
      if (!current) throw new PersonalStudyError("note_not_found", `Note not found: ${id}`);
      runStorage(() => store.remove(id));
    },
  };

  function withAvailability(note: StudyNote): ListedStudyNote {
    return {
      ...note,
      availability: referenceAvailability.isAvailable(note.reference)
        ? "available"
        : "text_unavailable",
    };
  }
}

function validateInput(input: StudyNoteInput): void {
  validateStudyReference(input.reference);
  validateNoteContent(input.markdown);
}

function runStorage<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof PersonalStudyError && error.code === "note_not_found") throw error;
    if (error instanceof PersonalStudyError && error.code === "storage_unavailable") throw error;
    throw new PersonalStudyError("storage_unavailable", "Local study storage is unavailable");
  }
}
