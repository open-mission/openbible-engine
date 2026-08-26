import { EngineError } from "./errors.js";
import { normalizeVersionId, normalizeBookId } from "./normalize.js";

const KEBAB_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function containsTraversal(s: string): boolean {
  if (s.includes("/") || s.includes("\\") || s.includes("..")) return true;
  const lower = s.toLowerCase();
  if (lower.includes("%2f") || lower.includes("%5c") || lower.includes("%2e")) return true;
  return false;
}

export function validateVersionId(id: string): void {
  // validate by attempting to normalize; will throw appropriate EngineError
  normalizeVersionId(id);
}

export function validateBookId(id: string): void {
  normalizeBookId(id);
}

export function isValidVersionId(id: string): boolean {
  try {
    validateVersionId(id);
    return true;
  } catch {
    return false;
  }
}

export function isValidBookId(id: string): boolean {
  try {
    validateBookId(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Additional helpers for direct regex check without normalization side-effects.
 * These are used for strict validation where caller already normalized.
 */
export function isKebabId(value: string): boolean {
  return KEBAB_REGEX.test(value);
}

export function assertValidVersionId(id: string): string {
  normalizeVersionId(id);
  return id;
}

export function assertValidBookId(id: string): string {
  normalizeBookId(id);
  return id;
}

export function validateIdNoTraversal(id: string): void {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new EngineError("invalid_package", "Invalid id: empty");
  }
  if (containsTraversal(id) || containsTraversal(id.trim())) {
    throw new EngineError("invalid_package", `Invalid id: path traversal detected: ${id}`);
  }
}
