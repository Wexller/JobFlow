import { describe, expect, it } from 'vitest'
import { createAppError, err, mapResult, ok } from '../../app/utils/result'

describe('result utility', () => {
  it('wraps successful values', () => {
    expect(ok({ id: 'vacancy-1' })).toEqual({
      ok: true,
      value: { id: 'vacancy-1' },
    })
  })

  it('wraps typed application errors', () => {
    const error = createAppError('validation', 'Invalid vacancy payload')

    expect(err(error)).toEqual({
      ok: false,
      error,
    })
  })

  it('maps only successful results', () => {
    expect(mapResult(ok(2), (value) => value * 2)).toEqual(ok(4))

    const failed = err(createAppError('network', 'Request failed'))
    expect(mapResult(failed, (value) => value)).toEqual(failed)
  })
})
