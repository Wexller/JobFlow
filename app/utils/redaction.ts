const REDACTED = '[redacted]'

const SENSITIVE_KEY_PATTERNS = [
  /authorization/i,
  /client[_-]?secret/i,
  /company/i,
  /contact/i,
  /email/i,
  /employer/i,
  /note/i,
  /private/i,
  /raw/i,
  /refresh[_-]?token/i,
  /row/i,
  /salary/i,
  /secret/i,
  /spreadsheet[_-]?value/i,
  /token/i,
]

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

export function redactValue(key: string, value: unknown): unknown {
  return isSensitiveKey(key) ? REDACTED : value
}

export function redactRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, redactValue(key, value)]),
  )
}

export function redactLogMessage(message: string): string {
  return /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)+$/.test(message) ? message : REDACTED
}

export { REDACTED }
