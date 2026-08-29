export type PersonalStudyErrorCode =
  | "invalid_reference"
  | "invalid_note_content"
  | "note_not_found"
  | "storage_unavailable";

export class PersonalStudyError extends Error {
  override readonly name = "PersonalStudyError";
  readonly code: PersonalStudyErrorCode;

  constructor(code: PersonalStudyErrorCode, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, PersonalStudyError.prototype);
  }
}

export function isPersonalStudyError(value: unknown): value is PersonalStudyError {
  return value instanceof PersonalStudyError;
}
