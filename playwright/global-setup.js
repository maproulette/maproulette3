import { chromium, expect } from '@playwright/test';

async function globalSetup(config) {
  const { storageState } = config.projects[0].use;
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  try {
    // Navigate and sign in
    await page.goto(process.env.REACT_APP_PLAYWRIGHT_URL);
    await page.locator('a').filter({ hasText: 'Sign in' }).click();
    
    // Handle OSM login
    await page.locator('#username').fill(process.env.REACT_APP_PLAYWRIGHT_USERNAME);
    await page.locator('#password').fill(process.env.REACT_APP_PLAYWRIGHT_PASSWORD);
    await page.locator('input[type="submit"][value="Log in"]').click();
    
    // Handle OAuth if needed
    try {
      const authorizeButton = await page.waitForSelector('input[type="submit"][value="Authorize"]', { timeout: 5000 });
      if (authorizeButton) {
        await authorizeButton.click();
      }
    } catch (e) {} // Ignore if no authorization needed
    
    await context.storageState({ path: storageState });
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;