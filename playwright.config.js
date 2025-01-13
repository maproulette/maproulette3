import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env.playwright') });

// Validate required environment variables
const requiredEnvVars = ['REACT_APP_PLAYWRIGHT_USERNAME', 'REACT_APP_PLAYWRIGHT_PASSWORD', 'REACT_APP_PLAYWRIGHT_URL'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is missing. Please add it to .env.local`);
  }
});

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './playwright/tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  globalSetup: './playwright/global-setup.js', // Changed to direct path
  use: {
    baseURL: process.env.REACT_APP_PLAYWRIGHT_URL,
    storageState: 'state.json',
    
    // Enable caching
    contextOptions: {
      serviceWorkers: 'allow'
    },

    // Automatically wait for network to be idle
    navigationTimeout: 30000,
    actionTimeout: 15000,

    // Cache storage state
    trace: 'on-first-retry',

    // Add environment variables to be available in tests
    env: {
      REACT_APP_PLAYWRIGHT_USERNAME: process.env.REACT_APP_PLAYWRIGHT_USERNAME,
      REACT_APP_PLAYWRIGHT_PASSWORD: process.env.REACT_APP_PLAYWRIGHT_PASSWORD,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.js/ // Updated extension
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'state.json',
        // Enable persistent browser context
        launchOptions: {
          args: ['--disk-cache-size=104857600'] // 100MB cache
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'state.json',
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'state.json',
      },
    },
  ],
});
