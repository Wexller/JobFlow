import { describe, expect, it, vi } from 'vitest'
import { createLogger, type LoggerSink } from '../../app/utils/logger'

function createSink(): LoggerSink {
  return {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }
}

describe('logger utility', () => {
  it('writes structured info entries', () => {
    const sink = createSink()
    const logger = createLogger(sink)

    const entry = logger.info('dashboard.metrics.loaded', {
      action: 'dashboard.load',
      durationMs: 24,
      status: 'success',
    })

    expect(sink.info).toHaveBeenCalledWith(entry)
    expect(entry).toEqual({
      level: 'info',
      message: 'dashboard.metrics.loaded',
      context: {
        action: 'dashboard.load',
        durationMs: 24,
        status: 'success',
      },
    })
  })

  it('routes audit events through the info sink', () => {
    const sink = createSink()
    const logger = createLogger(sink)

    logger.audit('Created vacancy', {
      action: 'vacancy.create',
      entityId: 'vacancy-1',
      entityType: 'vacancy',
      status: 'success',
    })

    expect(sink.info).toHaveBeenCalledTimes(1)
    expect(sink.warn).not.toHaveBeenCalled()
    expect(sink.error).not.toHaveBeenCalled()
  })

  it('redacts unsafe message text and sensitive context fields', () => {
    const sink = createSink()
    const logger = createLogger(sink)

    const unsafeContext = {
      action: 'vacancy.create',
      entityId: 'vacancy-1',
      status: 'success',
      companyName: 'Acme',
    } as unknown as Parameters<typeof logger.info>[1]

    const entry = logger.info('Created vacancy for Acme', unsafeContext)

    expect(entry.message).toBe('[redacted]')
    expect(entry.context).toEqual({
      action: 'vacancy.create',
      entityId: 'vacancy-1',
      status: 'success',
      companyName: '[redacted]',
    })
  })
})
