import type {
  NoteAvailability,
  StudyNote,
  StudyReference,
} from "@openbible/personal-study-core";

export interface PersonalStudyStore {
  save(note: StudyNote): void;
  list(): StudyNote[];
  get(id: string): StudyNote | undefined;
  replace(note: StudyNote): void;
  remove(id: string): void;
}

export interface ReferenceAvailability {
  isAvailable(reference: StudyReference): boolean;
}

export interface Clock {
  now(): number;
}

export interface NoteIdFactory {
  create(): string;
}

export interface StudyNoteInput {
  title?: string;
  markdown: string;
  reference: StudyReference;
}

export type ListedStudyNote = StudyNote & {
  availability: NoteAvailability;
};

export interface PersonalStudyOptions {
  store: PersonalStudyStore;
  referenceAvailability: ReferenceAvailability;
  clock: Clock;
  noteIdFactory: NoteIdFactory;
}

export interface PersonalStudy {
  createNote(input: StudyNoteInput): StudyNote;
  listNotes(): ListedStudyNote[];
  getNote(id: string): ListedStudyNote;
  updateNote(id: string, input: StudyNoteInput): StudyNote;
  deleteNote(id: string): void;
}
