import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, getRequestHeader, setResponseHeader } from 'h3'
import { logger } from '../../app/utils/logger'
import { createAppError, type AppError, type Result } from '../../app/utils/result'

function isResult<T>(value: unknown): value is Result<T> {
  return typeof value === 'object' && value !== null && 'ok' in value
}

function toAppError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return error as AppError
  }

  if (typeof error === 'object' && error !== null && 'statusMessage' in error) {
    const data = 'data' in error && typeof error.data === 'object' && error.data !== null ? error.data as Record<string, unknown> : {}

    if (typeof data.code === 'string' && typeof data.message === 'string') {
      return createAppError(data.code as AppError['code'], data.message)
    }
  }

  return createAppError('unknown', 'Internal server error')
}

function appErrorStatusCode(error: AppError) {
  switch (error.code) {
    case 'validation':
      return 400
    case 'unauthorized':
      return 401
    case 'forbidden':
      return 403
    case 'not_found':
      return 404
    case 'conflict':
      return 409
    case 'network':
    case 'google_sheets':
      return 502
    default:
      return 500
  }
}

function publicMessageForError(error: AppError) {
  return appErrorStatusCode(error) >= 500 ? 'Internal server error' : error.message
}

export async function runApiHandler<T>(
  event: H3Event,
  action: string,
  handler: (requestId: string) => Promise<Result<T> | T>,
) {
  const startedAt = Date.now()
  const requestId = getRequestHeader(event, 'x-request-id') ?? randomUUID()
  setResponseHeader(event, 'x-request-id', requestId)

  logger.info('api.request.started', {
    action,
    entityType: 'api_request',
    requestId,
    status: 'started',
  })

  try {
    const result = await handler(requestId)
    const value = isResult<T>(result)
      ? result.ok
        ? result.value
        : (() => {
            throw result.error
          })()
      : result

    logger.info('api.request.completed', {
      action,
      durationMs: Date.now() - startedAt,
      entityType: 'api_request',
      requestId,
      status: 'success',
    })

    return value
  }
  catch (error) {
    const appError = toAppError(error)
    const publicMessage = publicMessageForError(appError)

    logger.error('api.request.failed', {
      action,
      durationMs: Date.now() - startedAt,
      entityType: 'api_request',
      errorKind: appError.code,
      requestId,
      status: 'failure',
    })

    throw createError({
      data: {
        code: appError.code,
        message: publicMessage,
        requestId,
      },
      statusCode: appErrorStatusCode(appError),
      statusMessage: publicMessage,
    })
  }
}
