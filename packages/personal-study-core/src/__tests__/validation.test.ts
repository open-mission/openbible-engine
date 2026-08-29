import { describe, expect, it } from "vitest";

type ReferenceValidator = (reference: unknown) => unknown;
type ContentValidator = (markdown: string) => unknown;

describe("personal study reference validation", () => {
  // SPECSFY: US-001 FR-002 NFR-001 NFR-003 AC-004
  it("accepts an individual verse and a contiguous range", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { validateStudyReference?: ReferenceValidator }
      | undefined;
    expect(implementation?.validateStudyReference).toBeTypeOf("function");
    if (!implementation?.validateStudyReference) return;

    expect(() =>
      implementation.validateStudyReference({
        bookId: "rom",
        chapter: 5,
        verseStart: 1,
      }),
    ).not.toThrow();
    expect(() =>
      implementation.validateStudyReference({
        bookId: "rom",
        chapter: 5,
        verseStart: 1,
        verseEnd: 5,
      }),
    ).not.toThrow();
  });

  // SPECSFY: US-001 FR-002 FR-004 NFR-002 AC-005
  it("rejects an invalid reference with a stable error code", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { validateStudyReference?: ReferenceValidator }
      | undefined;
    expect(implementation?.validateStudyReference).toBeTypeOf("function");
    if (!implementation?.validateStudyReference) return;

    expect(() =>
      implementation.validateStudyReference({
        bookId: "rom",
        chapter: 5,
        verseStart: 5,
        verseEnd: 1,
      }),
    ).toThrowError(expect.objectContaining({ code: "invalid_reference" }));
  });

  // SPECSFY: US-001 FR-003 FR-004 NFR-002 NFR-003 AC-007
  it("rejects empty, whitespace-only, and oversized Markdown", async () => {
    const implementation = (await import("../index.js").catch(() => undefined)) as
      | { validateNoteContent?: ContentValidator }
      | undefined;
    expect(implementation?.validateNoteContent).toBeTypeOf("function");
    if (!implementation?.validateNoteContent) return;

    for (const markdown of ["", "   ", "x".repeat(10_001)]) {
      expect(() => implementation.validateNoteContent(markdown)).toThrowError(
        expect.objectContaining({ code: "invalid_note_content" }),
      );
    }
  });
});
