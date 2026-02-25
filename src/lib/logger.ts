type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getMinLevel(): LogLevel {
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const base = { timestamp, level, message, ...context }
  return JSON.stringify(base)
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return

  const formatted = formatMessage(level, message, context)

  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'debug':
      console.debug(formatted)
      break
    default:
      console.info(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}
