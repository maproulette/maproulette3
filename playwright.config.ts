import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
const envPath = path.resolve(__dirname, '.env.test')
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  console.warn(`⚠️  Could not load .env.test file: ${envResult.error.message}`)
  console.warn('⚠️  Falling back to default environment variables')
} else {
  console.log(`✓ Loaded environment variables from .env.test`)
}

// Load all environment variables from .env.test for the webServer
// Vite will use VITE_* prefixed variables
const envVars: Record<string, string> = {
  ...process.env,
  // Ensure test mode is set for Vite
  NODE_ENV: process.env.NODE_ENV || 'test',
}

// Environment variables for authentication (optional - tests can run without them)
if (!envVars.REACT_APP_USERNAME || !envVars.REACT_APP_PASSWORD) {
  console.warn(
    '⚠️  REACT_APP_USERNAME and REACT_APP_PASSWORD not set. Authentication tests will be skipped.'
  )
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './playwright/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : '80%',
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  globalSetup: './playwright/global-setup.ts',
  globalTeardown: './playwright/global-teardown.ts',

  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    // Use test mode for Vite to load .env.test
    // Override port to 3005 to match Playwright's baseURL
    command: process.env.CI ? 'npm run test:e2e:start' : 'vite --mode test --port 3005',
    url: 'http://localhost:3005',
    reuseExistingServer: true, // Always reuse if available
    timeout: 120 * 1000,
    env: envVars,
  },
})
