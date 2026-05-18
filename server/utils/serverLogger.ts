import pino from 'pino'
import { createLogger } from '../../app/utils/logger'

const serverSink = pino({
  level: process.env.JOBFLOW_LOG_LEVEL ?? 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
})

export const serverLogger = createLogger(serverSink)
