/**
 * EngineError with discriminated code union.
 * Zero dependencies, sync, no platform imports.
 */

export type EngineErrorCode =
  | "version_not_installed"
  | "invalid_reference"
  | "invalid_package"
  | "unsupported_schema"
  | "storage_unavailable"
  | "storage_full"
  | "database_locked"
  | "network_unavailable"
  | "cancelled"
  | "invalid_book"
  | "invalid_chapter";

export interface EngineErrorOptions {
  details?: unknown;
  cause?: unknown;
}

export class EngineError extends Error {
  override readonly name = "EngineError";
  readonly code: EngineErrorCode;
  override readonly cause?: unknown;
  readonly details?: unknown;

  constructor(code: EngineErrorCode, message: string, options?: EngineErrorOptions) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.code = code;
    this.details = options?.details;
    // cause already handled via super; also assign for environments without cause support
    if (options?.cause !== undefined && this.cause === undefined) {
      (this as { cause: unknown }).cause = options.cause;
    }
    // Ensure proper prototype
    Object.setPrototypeOf(this, EngineError.prototype);
  }
}

export function createEngineError(
  code: EngineErrorCode,
  message: string,
  details?: unknown,
  cause?: unknown,
): EngineError {
  return new EngineError(code, message, { details, cause });
}

export function isEngineError(value: unknown): value is EngineError {
  return value instanceof EngineError;
}

/**
 * Helper to throw with code quickly.
 */
export function throwEngineError(
  code: EngineErrorCode,
  message: string,
  details?: unknown,
  cause?: unknown,
): never {
  throw new EngineError(code, message, { details, cause });
}
