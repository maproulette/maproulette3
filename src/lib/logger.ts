type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMetadata {
  [key: string]: unknown
}

/**
 * Centralized logging utility with environment-aware behavior.
 *
 * Features:
 * - Automatic timestamp prefixing
 * - Log level filtering (debug logs only in development)
 * - Structured metadata support
 * - Color-coded console output
 *
 * @example
 * ```ts
 * logger.debug('User action', { userId: 123, action: 'click' })
 * logger.info('API request completed')
 * logger.warn('Deprecated feature used')
 * logger.error('Authentication failed', { error })
 * ```
 */
class Logger {
  private isDev = import.meta.env.DEV
  private isTest = import.meta.env.MODE === 'test'

  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    // Suppress all logs in test environment unless explicitly enabled
    if (this.isTest && !import.meta.env.VITE_ENABLE_TEST_LOGS) {
      return
    }

    // Filter debug logs in production
    if (!this.isDev && level === 'debug') {
      return
    }

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    // Format metadata if present
    const formattedMessage = metadata
      ? `${prefix} ${message} ${JSON.stringify(metadata, null, 2)}`
      : `${prefix} ${message}`

    // Use appropriate console method
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

  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   */
  debug(message: string, metadata?: LogMetadata) {
    this.log('debug', message, metadata)
  }

  /**
   * Info-level logging
   * Use for general informational messages
   */
  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata)
  }

  /**
   * Warning-level logging
   * Use for potentially problematic situations
   */
  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata)
  }

  /**
   * Error-level logging
   * Use for error conditions
   */
  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata)
  }

  /**
   * Create a scoped logger with a prefix
   * Useful for namespacing logs from different modules
   *
   * @example
   * ```ts
   * const apiLogger = logger.scope('API')
   * apiLogger.info('Request started') // [timestamp] [INFO] [API] Request started
   * ```
   */
  scope(scopeName: string) {
    return {
      debug: (message: string, metadata?: LogMetadata) =>
        this.debug(`[${scopeName}] ${message}`, metadata),
      info: (message: string, metadata?: LogMetadata) =>
        this.info(`[${scopeName}] ${message}`, metadata),
      warn: (message: string, metadata?: LogMetadata) =>
        this.warn(`[${scopeName}] ${message}`, metadata),
      error: (message: string, metadata?: LogMetadata) =>
        this.error(`[${scopeName}] ${message}`, metadata),
    }
  }
}

export const logger = new Logger()

// Create pre-configured scoped loggers for common use cases
export const apiLogger = logger.scope('API')
export const authLogger = logger.scope('Auth')
export const wsLogger = logger.scope('WebSocket')
export const pluginLogger = logger.scope('Plugin')
