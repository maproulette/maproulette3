import path from "path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Simplified environment variable handling
const requiredEnvVars = {
  REACT_APP_USERNAME: process.env.REACT_APP_USERNAME,
  REACT_APP_PASSWORD: process.env.REACT_APP_PASSWORD,
  REACT_APP_URL: process.env.REACT_APP_URL,
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is missing. Please add it to .env.local`
    );
  }
});

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./playwright/tests",
  headless: true, // Run in headless mode for faster execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalSetup: "./playwright/global-setup.js",

  use: {
    baseURL: process.env.REACT_APP_URL || "http://localhost:3000",
    storageState: "./playwright/.auth/state.json",
    trace: "on-first-retry",
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "edge",
      use: {
        ...devices["Desktop Edge"],
      },
    },
  ],

  webServer: {
    command: "yarn run test:e2e:start",
    url: process.env.REACT_APP_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    env: requiredEnvVars,
  },
});
