import { describe, expect, it } from 'vitest'
import { REDACTED, isSensitiveKey, redactLogMessage, redactRecord } from '../../app/utils/redaction'

describe('redaction utility', () => {
  it('detects fields that must not be logged', () => {
    expect(isSensitiveKey('accessToken')).toBe(true)
    expect(isSensitiveKey('client_secret')).toBe(true)
    expect(isSensitiveKey('companyName')).toBe(true)
    expect(isSensitiveKey('employer')).toBe(true)
    expect(isSensitiveKey('salaryRange')).toBe(true)
    expect(isSensitiveKey('entityType')).toBe(false)
  })

  it('redacts sensitive record values while preserving allowed context', () => {
    expect(redactRecord({
      action: 'vacancy.create',
      entityId: 'vacancy-1',
      accessToken: 'secret-token',
      companyName: 'Acme',
      privateNote: 'Call after 6 PM',
    })).toEqual({
      action: 'vacancy.create',
      entityId: 'vacancy-1',
      accessToken: REDACTED,
      companyName: REDACTED,
      privateNote: REDACTED,
    })
  })

  it('allows stable event messages and redacts free-form log text', () => {
    expect(redactLogMessage('vacancy.create')).toBe('vacancy.create')
    expect(redactLogMessage('Created vacancy for Acme')).toBe(REDACTED)
  })
})
