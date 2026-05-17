export type AppErrorCode =
  | 'unknown'
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'network'
  | 'google_sheets'
  | 'conflict'

export interface AppError {
  readonly code: AppErrorCode
  readonly message: string
  readonly cause?: unknown
  readonly details?: Record<string, unknown>
}

export type Result<T, E = AppError> =
  | { readonly ok: true, readonly value: T }
  | { readonly ok: false, readonly error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error }
}

export function createAppError(
  code: AppErrorCode,
  message: string,
  options: Pick<AppError, 'cause' | 'details'> = {},
): AppError {
  return {
    code,
    message,
    ...options,
  }
}

export function mapResult<T, U, E>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(mapper(result.value))
  }

  return { ok: false, error: result.error }
}
