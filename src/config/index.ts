/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 * to ensure type safety and provide defaults
 */

/**
 * API Configuration
 */
export const api = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000',
  oauthUrl: import.meta.env.VITE_SERVER_OAUTH_URL || 'http://127.0.0.1:9001/auth/authenticate',
  timeout: 10_000, // 10 seconds
  retries: 3,
  serverApiKey: import.meta.env.VITE_SERVER_API_KEY,
} as const

/**
 * WebSocket Configuration
 */
export const websocket = {
  url: import.meta.env.VITE_MAP_ROULETTE_SERVER_WEBSOCKET_URL || null,
  reconnectAttempts: 10,
  maxReconnectDelay: 30_000, // 30 seconds
} as const

/**
 * Feature Flags
 */
export const features = {
  devTools: import.meta.env.VITE_DISABLE_DEVTOOLS !== 'true',
  plugins: import.meta.env.VITE_ENABLE_PLUGINS !== 'false',
  webSocket: websocket.url !== null,
  testLogs: import.meta.env.VITE_ENABLE_TEST_LOGS === 'true',
} as const

/**
 * OAuth Configuration
 */
export const oauth = {
  clientId: import.meta.env.VITE_OSM_CLIENT_ID,
  redirectUri: import.meta.env.VITE_OSM_REDIRECT_URI,
} as const

/**
 * GitHub Integration
 */
export const github = {
  apiToken: import.meta.env.VITE_GITHUB_ISSUES_API_TOKEN,
  owner: import.meta.env.VITE_GITHUB_ISSUES_API_OWNER,
  repo: import.meta.env.VITE_GITHUB_ISSUES_API_REPO,
} as const

/**
 * Application Metadata
 */
export const app = {
  name: import.meta.env.VITE_APP_NAME || 'MapRoulette',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Micro-tasking for OpenStreetMap',
  version: import.meta.env.VITE_APP_VERSION || '4.0.0',
  environment: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
} as const

/**
 * Complete configuration object
 */
const config = {
  api,
  websocket,
  features,
  oauth,
  github,
  app,
} as const

export default config

/**
 * Type-safe environment variable access
 * Use this when you need to access a variable that's not in the config
 *
 * @example
 * ```ts
 * const customVar = getEnv('VITE_CUSTOM_VAR', 'default-value')
 * ```
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return import.meta.env[key] ?? defaultValue
}

/**
 * Validate required environment variables
 * Call this on app startup to ensure all required variables are set
 *
 * @throws Error if required variables are missing
 */
export function validateEnv() {
  const required = {
    VITE_API_BASE_URL: api.baseUrl,
  }

  const missing: string[] = []

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
