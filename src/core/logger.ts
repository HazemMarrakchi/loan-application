type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const minLevel: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined) ??
  (import.meta.env.DEV ? 'debug' : 'warn')

function emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return
  const entry = { ts: new Date().toISOString(), level, message, ...context }
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn(`[${entry.ts}] ${level.toUpperCase()} ${message}`, context ?? '')
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emit('error', message, context),
}
