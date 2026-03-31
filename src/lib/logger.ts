type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMetadata {
  [key: string]: unknown
}

interface Logger {
  debug: (message: string, metadata?: LogMetadata) => void
  info: (message: string, metadata?: LogMetadata) => void
  warn: (message: string, metadata?: LogMetadata) => void
  error: (message: string, metadata?: LogMetadata) => void
  scope: (scopeName: string) => Omit<Logger, 'scope'>
}

const isDev = import.meta.env.DEV
const isTest = import.meta.env.MODE === 'test'

const log = (level: LogLevel, message: string, metadata?: LogMetadata) => {
  if (isTest && !import.meta.env.VITE_ENABLE_TEST_LOGS) {
    return
  }

  if (!isDev && level === 'debug') {
    return
  }

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  const formattedMessage = metadata
    ? `${prefix} ${message} ${JSON.stringify(metadata, null, 2)}`
    : `${prefix} ${message}`

  switch (level) {
    case 'debug':
      console.debug(formattedMessage)
      break
    case 'info':
      console.info(formattedMessage)
      break
    case 'warn':
      console.warn(formattedMessage)
      break
    case 'error':
      console.error(formattedMessage)
      break
  }
}

const createScope = (scopeName: string): Omit<Logger, 'scope'> => ({
  debug: (message: string, metadata?: LogMetadata) =>
    log('debug', `[${scopeName}] ${message}`, metadata),
  info: (message: string, metadata?: LogMetadata) =>
    log('info', `[${scopeName}] ${message}`, metadata),
  warn: (message: string, metadata?: LogMetadata) =>
    log('warn', `[${scopeName}] ${message}`, metadata),
  error: (message: string, metadata?: LogMetadata) =>
    log('error', `[${scopeName}] ${message}`, metadata),
})

export const logger: Logger = {
  debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata),
  info: (message: string, metadata?: LogMetadata) => log('info', message, metadata),
  warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata),
  error: (message: string, metadata?: LogMetadata) => log('error', message, metadata),
  scope: createScope,
}

// Create pre-configured scoped loggers for common use cases
export const apiLogger = createScope('API')
export const authLogger = createScope('Auth')
export const wsLogger = createScope('WebSocket')
export const pluginLogger = createScope('Plugin')
