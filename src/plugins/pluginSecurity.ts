import { pluginLogger } from '@/lib/logger'

/**
 * Allowed plugin hosts for security
 * Only plugins from these hosts can be loaded dynamically
 */
const ALLOWED_PLUGIN_HOSTS = [
  'maproulette.org',
  'www.maproulette.org',
  'cdn.maproulette.org',
  'github.com',
  'raw.githubusercontent.com',
  'gist.githubusercontent.com',
  'unpkg.com', // NPM CDN
  'cdn.jsdelivr.net', // NPM CDN
  // Development
  ...(import.meta.env.DEV ? ['localhost', '127.0.0.1'] : []),
]

/**
 * Validates a plugin URL against the security allowlist
 *
 * @param url - The URL to validate
 * @returns true if the URL is allowed, false otherwise
 *
 * @example
 * ```ts
 * validatePluginUrl('https://cdn.maproulette.org/plugins/editor.js') // true
 * validatePluginUrl('https://evil.com/malware.js') // false
 * ```
 */
export const validatePluginUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined)

    const isSameOrigin = typeof window !== 'undefined' && parsed.origin === window.location.origin

    // Same-origin bundles (e.g. /plugins/... served as static files) are always allowed.
    if (isSameOrigin) {
      pluginLogger.debug('Plugin URL validated (same-origin)', { url })
      return true
    }

    // Only allow HTTPS (or HTTP in development for localhost)
    if (parsed.protocol !== 'https:') {
      if (import.meta.env.DEV && parsed.protocol === 'http:') {
        // Allow HTTP for localhost in development
        if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
          pluginLogger.error('Plugin URL must use HTTPS', { url })
          return false
        }
      } else {
        pluginLogger.error('Plugin URL must use HTTPS', { url })
        return false
      }
    }

    // Check if hostname is in allowlist
    const isAllowed = ALLOWED_PLUGIN_HOSTS.some((allowedHost) => {
      // Exact match
      if (parsed.hostname === allowedHost) {
        return true
      }
      // Subdomain match (e.g., plugins.maproulette.org matches maproulette.org)
      if (parsed.hostname.endsWith(`.${allowedHost}`)) {
        return true
      }
      return false
    })

    if (!isAllowed) {
      pluginLogger.error('Plugin URL host not in allowlist', {
        url,
        hostname: parsed.hostname,
        allowedHosts: ALLOWED_PLUGIN_HOSTS,
      })
      return false
    }

    pluginLogger.debug('Plugin URL validated', { url, hostname: parsed.hostname })
    return true
  } catch (error) {
    pluginLogger.error('Invalid plugin URL', { url, error })
    return false
  }
}

/**
 * Validates multiple plugin URLs
 *
 * @param urls - Array of URLs to validate
 * @returns Object with valid and invalid URLs
 */
export const validatePluginUrls = (
  urls: string[]
): {
  valid: string[]
  invalid: string[]
} => {
  const valid: string[] = []
  const invalid: string[] = []

  for (const url of urls) {
    if (validatePluginUrl(url)) {
      valid.push(url)
    } else {
      invalid.push(url)
    }
  }

  if (invalid.length > 0) {
    pluginLogger.warn('Some plugin URLs failed validation', {
      invalidCount: invalid.length,
      invalidUrls: invalid,
    })
  }

  return { valid, invalid }
}

/**
 * Get the list of allowed plugin hosts
 * Useful for displaying to users
 */
export const getAllowedPluginHosts = (): readonly string[] => {
  return ALLOWED_PLUGIN_HOSTS
}
