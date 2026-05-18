import { redactLogMessage, redactRecord } from './redaction'

export type LogLevel = 'info' | 'warn' | 'error' | 'audit'

export type LogStatus = 'started' | 'success' | 'failure' | 'denied' | 'skipped'

export interface LogContext {
  readonly action?: string
  readonly entityType?: string
  readonly entityId?: string
  readonly requestId?: string
  readonly status?: LogStatus
  readonly durationMs?: number
  readonly httpStatus?: number
  readonly retryCount?: number
  readonly errorKind?: string
}

type ConsoleMethod = 'info' | 'warn' | 'error'

export interface LoggerSink {
  readonly info: (message?: unknown, ...optionalParams: unknown[]) => void
  readonly warn: (message?: unknown, ...optionalParams: unknown[]) => void
  readonly error: (message?: unknown, ...optionalParams: unknown[]) => void
}

export interface LogEntry {
  readonly level: LogLevel
  readonly message: string
  readonly context: LogContext
}

const LOG_METHODS: Record<LogLevel, ConsoleMethod> = {
  audit: 'info',
  error: 'error',
  info: 'info',
  warn: 'warn',
}

function sanitizeContext(context: LogContext): LogContext {
  return redactRecord({ ...context }) as LogContext
}

export function createLogger(sink: LoggerSink = console) {
  function write(level: LogLevel, message: string, context: LogContext = {}) {
    const entry: LogEntry = {
      level,
      message: redactLogMessage(message),
      context: sanitizeContext(context),
    }

    sink[LOG_METHODS[level]](entry)
    return entry
  }

  return {
    info: (message: string, context?: LogContext) => write('info', message, context),
    warn: (message: string, context?: LogContext) => write('warn', message, context),
    error: (message: string, context?: LogContext) => write('error', message, context),
    audit: (message: string, context?: LogContext) => write('audit', message, context),
  }
}

export const logger = createLogger()
