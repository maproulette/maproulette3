import { chromium } from "@playwright/test";

async function globalSetup(config) {
  const storageState = "./playwright/.auth/state.json";
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and sign in
    await page.goto(process.env.REACT_APP_URL || "http://localhost:3000");
    await page.locator("a").filter({ hasText: "Sign in" }).click();

    // Handle OSM login
    await page.locator("#username").fill(process.env.REACT_APP_USERNAME);
    await page.locator("#password").fill(process.env.REACT_APP_PASSWORD);
    await page.locator('input[type="submit"][value="Log in"]').click();

    // Handle OAuth if needed
    try {
      const authorizeButton = await page.waitForSelector(
        'input[type="submit"][value="Authorize"]',
        { timeout: 5000 }
      );
      if (authorizeButton) {
        await authorizeButton.click();
      }
    } catch (e) {}

    await context.storageState({ path: storageState });
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
