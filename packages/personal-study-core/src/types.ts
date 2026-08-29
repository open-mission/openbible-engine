/** Serializable contracts for the Personal Study bounded context. */

export interface StudyReference {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface StudyNote {
  id: string;
  title?: string;
  markdown: string;
  reference: StudyReference;
  createdAt: number;
  updatedAt: number;
}

export type NoteAvailability = "available" | "text_unavailable";
