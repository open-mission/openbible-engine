import { EngineError } from "./errors.js";

const KEBAB_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Strip accents using NFD and remove combining marks.
 */
export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function containsPathTraversal(raw: string): boolean {
  if (raw.includes("/") || raw.includes("\\") || raw.includes("..")) return true;
  const lower = raw.toLowerCase();
  // Encoded variants
  if (
    lower.includes("%2f") ||
    lower.includes("%5c") ||
    lower.includes("%2e") ||
    lower.includes("%252f") ||
    lower.includes("%255c")
  )
    return true;
  return false;
}

function normalizeKebabRaw(raw: string, errorCode: "invalid_package" | "invalid_book"): string {
  if (typeof raw !== "string") {
    throw new EngineError(errorCode, `Invalid id: expected string, got ${typeof raw}`);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new EngineError(errorCode, "Invalid id: empty string");
  }
  if (containsPathTraversal(trimmed)) {
    throw new EngineError(errorCode, `Invalid id: path traversal detected: ${trimmed}`);
  }

  let normalized = stripAccents(trimmed).toLowerCase().trim();
  // Convert whitespace and underscores to hyphen
  normalized = normalized.replace(/[\s_]+/g, "-");
  // Collapse multiple hyphens
  normalized = normalized.replace(/-+/g, "-");
  // Trim hyphens
  normalized = normalized.replace(/^-+|-+$/g, "");

  if (normalized.length === 0) {
    throw new EngineError(errorCode, `Invalid id: empty after normalization: ${trimmed}`);
  }
  if (containsPathTraversal(normalized)) {
    throw new EngineError(errorCode, `Invalid id: path traversal after normalization: ${normalized}`);
  }
  if (normalized.includes("/") || normalized.includes("\\") || normalized.includes("..")) {
    throw new EngineError(errorCode, `Invalid id: contains path separator: ${normalized}`);
  }
  // Also reject encoded after normalization (lower already)
  if (normalized.includes("%")) {
    // If any % remains, it was encoded traversal attempt
    throw new EngineError(errorCode, `Invalid id: encoded traversal: ${normalized}`);
  }
  if (!KEBAB_REGEX.test(normalized)) {
    throw new EngineError(errorCode, `Invalid id: must match kebab ^[a-z0-9]+(?:-[a-z0-9]+)*$ got "${normalized}"`);
  }
  return normalized;
}

/**
 * Normalize version id: trim, lower, NFD strip accents, kebab, path traversal rejection.
 * Throws EngineError code invalid_package on failure.
 */
export function normalizeVersionId(id: string): string {
  return normalizeKebabRaw(id, "invalid_package");
}

/**
 * Normalize book id: same logic, throws invalid_book for non-traversal validation,
 * but traversal still maps to invalid_package for security parity. To keep contract simple,
 * we throw invalid_package for traversal and invalid_book for pattern mismatch.
 * However spec says similar to version -> invalid_package, so we handle both:
 * traversal -> invalid_package, pattern -> invalid_book OR invalid_package depending.
 * Here we choose invalid_book for pattern to align with error codes list.
 */
export function normalizeBookId(id: string): string {
  // First check traversal with invalid_package to preserve security code
  if (typeof id === "string" && containsPathTraversal(id.trim())) {
    throw new EngineError("invalid_package", `Invalid book id: path traversal detected: ${id.trim()}`);
  }
  try {
    return normalizeKebabRaw(id, "invalid_book");
  } catch (e) {
    if (e instanceof EngineError && e.code === "invalid_book") {
      // Re-throw as invalid_book; if it was traversal already handled above, this is pattern error
      throw e;
    }
    throw e;
  }
}

/**
 * Generic normalizeId helper (alias to version logic)
 */
export function normalizeId(id: string): string {
  return normalizeVersionId(id);
}
