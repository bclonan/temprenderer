// packages/shared/src/services/envelopes.ts
// Purpose:
// - Define the canonical API response contract for the frontend
// - Normalize legacy and modern backend responses into one shape
// - Provide a single unwrap point for success / error handling
//
// This file is INFRASTRUCTURE.
// It should almost never change per screen.

export type ValidationErrors = Record<string, string[]>

export type ApiEnvelope<T> = {
  ok: boolean
  message?: string
  data?: T
  validationErrors?: ValidationErrors
}

/**
 * Legacy API shape (older VB.NET endpoints)
 * Example:
 * {
 *   Success: true,
 *   Result: {...},
 *   Message: ""
 * }
 */
type LegacyEnvelope<T> = {
  Success: boolean
  Result?: T
  Message?: string
  ValidationErrors?: ValidationErrors
}

/* -------------------------
   Type Guards
-------------------------- */

function isApiEnvelope(obj: any): obj is ApiEnvelope<any> {
  return obj && typeof obj.ok === 'boolean'
}

function isLegacyEnvelope(obj: any): obj is LegacyEnvelope<any> {
  return obj && typeof obj.Success === 'boolean'
}

/* -------------------------
   Normalization
-------------------------- */

/**
 * Converts ANY backend response into ApiEnvelope<T>
 * Supports:
 * - ApiEnvelope<T>
 * - LegacyEnvelope<T>
 * - Raw DTO (assumed success)
 */
export function normalizeEnvelope<T>(raw: any): ApiEnvelope<T> {
  // Already standard
  if (isApiEnvelope(raw)) {
    return raw
  }

  // Legacy format
  if (isLegacyEnvelope(raw)) {
    return {
      ok: raw.Success,
      message: raw.Message,
      data: raw.Result as T,
      validationErrors: raw.ValidationErrors,
    }
  }

  // Raw DTO fallback
  return {
    ok: true,
    data: raw as T,
  }
}

/* -------------------------
   Unwrap Helpers
-------------------------- */

/**
 * Returns data if ok === true
 * Throws Error if ok === false
 */
export function unwrap<T>(env: ApiEnvelope<T>): T {
  if (!env.ok) {
    throw new Error(env.message ?? 'Request failed')
  }
  return env.data as T
}

/**
 * Extract validation errors safely
 */
export function getValidationErrors(
  env: ApiEnvelope<any>
): ValidationErrors | null {
  return env.validationErrors ?? null
}
