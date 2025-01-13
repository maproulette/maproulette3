import { chromium } from '@playwright/test';

async function globalSetup(config) {
  const { storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(process.env.REACT_APP_PLAYWRIGHT_URL);
    await page.waitForLoadState('networkidle');
    
    await page.locator('a').filter({ hasText: 'Sign in' }).click();
    await page.waitForLoadState('networkidle');
    
    await page.getByLabel('Email Address or Username').fill(process.env.REACT_APP_PLAYWRIGHT_USERNAME);
    await page.getByLabel('Password').fill(process.env.REACT_APP_PLAYWRIGHT_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    
    // Save the authenticated state
    await context.storageState({ path: storageState });
    console.log('Successfully saved authentication state');
    
  } catch (error) {
    console.error('Failed to setup authentication:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;