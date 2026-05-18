import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { createEvent } from 'h3'
import { describe, expect, it } from 'vitest'
import { createAppError, err, ok } from '../../app/utils/result'
import { runApiHandler } from '../../server/utils/api'

function createTestEvent(headers: Record<string, string> = {}) {
  const socket = new Socket()
  const request = new IncomingMessage(socket)
  request.headers = headers
  request.method = 'GET'
  request.url = '/api/test'

  return createEvent(request, new ServerResponse(request))
}

describe('api utils', () => {
  it('unwraps successful result objects and preserves request identifiers', async () => {
    const event = createTestEvent({ 'x-request-id': 'request-123' })

    const result = await runApiHandler(event, 'jobflow.snapshot.load', async () =>
      ok({ snapshot: true }))

    expect(result).toEqual({ snapshot: true })
    expect(event.node.res.getHeader('x-request-id')).toBe('request-123')
  })

  it('maps app errors to sanitized HTTP errors', async () => {
    const event = createTestEvent()

    await expect(() => runApiHandler(event, 'vacancy.create', async () =>
      err(createAppError('validation', 'Invalid form payload')))).rejects.toMatchObject({
      data: {
        code: 'validation',
        message: 'Invalid form payload',
      },
      statusCode: 400,
    })
  })

  it('hides unexpected internal exception details from the client', async () => {
    const event = createTestEvent()

    await expect(() => runApiHandler(event, 'vacancy.create', async () => {
      throw new Error('database driver exploded')
    })).rejects.toMatchObject({
      data: {
        code: 'unknown',
        message: 'Internal server error',
        requestId: expect.any(String),
      },
      statusCode: 500,
    })
  })
})
