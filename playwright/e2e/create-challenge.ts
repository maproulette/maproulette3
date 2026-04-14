import { expect, test } from '@playwright/test'
import { cleanupTestChallenge } from '../utils/database.js'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'
const TEST_CHALLENGE_NAME = 'Playwright Test Challenge'

// Mock user for the frontend whoami check (so AuthGuard shows the form)
const mockUser = {
  id: -999,
  created: '2024-01-01T00:00:00.000Z',
  modified: '2024-01-01T00:00:00.000Z',
  osmProfile: {
    id: -999,
    displayName: 'SuperUser',
    avatarURL: '',
    requestToken: '',
  },
  grants: [],
  score: 0,
  settings: { defaultEditor: -1, locale: 'en' },
}

export const registerCreateChallengeTests = () => {
  test.beforeAll(() => {
    cleanupTestChallenge(TEST_CHALLENGE_NAME)
  })

  test('should navigate to manage view and create a challenge', async ({ page }) => {
    // Add superKey header to all backend requests
    await page.route(`${API_BASE}/**`, (route) =>
      route.continue({ headers: { ...route.request().headers(), apiKey: SUPER_KEY } })
    )

    // Mock whoami so the frontend thinks we're logged in
    await page.route(`${API_BASE}/api/v2/user/whoami`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      })
    )

    // Navigate to manage challenges to find the project created by the create-project test
    await page.goto('/manage/challenges')
    await page.waitForLoadState('domcontentloaded')

    // Navigate to the create challenge page
    await page.goto('/manage/challenge/new')
    await page.waitForLoadState('domcontentloaded')

    // Wait for the form to appear (inside AuthGuard — requires authenticated user)
    await expect(page.getByRole('heading', { name: 'Create New Challenge' })).toBeVisible({
      timeout: 15000,
    })

    // Select the project created by the create-project test
    const projectSelect = page.locator('button').filter({ hasText: 'Select a project' })
    await projectSelect.click()
    await page.getByRole('option', { name: /Playwright Test Project/ }).click()

    // Fill in the challenge name
    await page.getByPlaceholder('My Challenge').fill(TEST_CHALLENGE_NAME)

    // Fill in the blurb
    await page.getByPlaceholder('A brief summary...').fill('A test challenge created by Playwright')

    // Fill in the description
    await page
      .getByPlaceholder('Describe what this challenge is about...')
      .fill('This is an automated test challenge created by Playwright E2E tests.')

    // Fill in the instructions
    await page
      .getByPlaceholder('Instructions for completing tasks...')
      .fill('Follow the task instructions to complete each task.')

    // The default data source is Overpass — fill in a simple query
    await page
      .getByPlaceholder('[out:xml][timeout:25];(way[highway=primary];);out meta;')
      .fill(
        '[out:xml][timeout:25];(way["highway"="residential"](40.0,-105.3,40.1,-105.2));out meta;'
      )

    // Submit the form
    await page.getByRole('button', { name: 'Create Challenge' }).click()

    // Verify we navigated to the challenge detail page
    await expect(page).toHaveURL(/\/manage\/challenge\/\d+$/, { timeout: 30000 })

    // Verify the create form is no longer visible
    await expect(page.getByRole('heading', { name: 'Create New Challenge' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Challenge' })).not.toBeVisible()
  })
}
