import { PersonalStudyError } from "./errors.js";
import type { StudyReference } from "./types.js";

const BOOK_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_MARKDOWN_LENGTH = 10_000;

export function validateStudyReference(reference: unknown): asserts reference is StudyReference {
  if (!isRecord(reference)) {
    throw new PersonalStudyError("invalid_reference", "Study reference must be an object");
  }
  if (typeof reference.bookId !== "string" || !BOOK_ID_PATTERN.test(reference.bookId)) {
    throw new PersonalStudyError("invalid_reference", "Study reference has an invalid book id");
  }
  if (!isPositiveInteger(reference.chapter)) {
    throw new PersonalStudyError("invalid_reference", "Study reference has an invalid chapter");
  }
  if (!isPositiveInteger(reference.verseStart)) {
    throw new PersonalStudyError("invalid_reference", "Study reference has an invalid starting verse");
  }
  if (reference.verseEnd !== undefined && (!isPositiveInteger(reference.verseEnd) || reference.verseEnd < reference.verseStart)) {
    throw new PersonalStudyError("invalid_reference", "Study reference has an invalid ending verse");
  }
}

export function validateNoteContent(markdown: unknown): asserts markdown is string {
  if (typeof markdown !== "string" || markdown.trim().length === 0 || markdown.length > MAX_MARKDOWN_LENGTH) {
    throw new PersonalStudyError("invalid_note_content", "Note Markdown must contain 1 to 10000 characters");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
