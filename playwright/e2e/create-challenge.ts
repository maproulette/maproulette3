import { expect, test } from '@playwright/test'
import { cleanupTestChallenge } from '../utils/database.js'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'
const TEST_CHALLENGE_NAME = 'Playwright Test Challenge'

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
    await page.route(`${API_BASE}/**`, (route) =>
      route.continue({ headers: { ...route.request().headers(), apiKey: SUPER_KEY } })
    )

    await page.route(`${API_BASE}/api/v2/user/whoami`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      })
    )

    await page.goto('/manage/challenges')
    await page.waitForLoadState('domcontentloaded')

    await page.goto('/manage/challenge/new')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Create New Challenge' })).toBeVisible({
      timeout: 15000,
    })

    const projectSelect = page.locator('button').filter({ hasText: 'Select a project' })
    await projectSelect.click()
    await page.getByRole('option', { name: /Playwright Test Project/ }).click()

    await page.getByPlaceholder('My Challenge').fill(TEST_CHALLENGE_NAME)

    await page.getByPlaceholder('A brief summary...').fill('A test challenge created by Playwright')

    await page
      .getByPlaceholder('Describe what this challenge is about...')
      .fill('This is an automated test challenge created by Playwright E2E tests.')

    await page
      .getByPlaceholder('Instructions for completing tasks...')
      .fill('Follow the task instructions to complete each task.')

    await page
      .getByPlaceholder('[out:xml][timeout:25];(way[highway=primary];);out meta;')
      .fill(
        '[out:xml][timeout:25];(way["highway"="residential"](40.0,-105.3,40.1,-105.2));out meta;'
      )

    await page.getByRole('button', { name: 'Create Challenge' }).click()

    await expect(page).toHaveURL(/\/manage\/challenge\/\d+$/, { timeout: 30000 })

    await expect(page.getByRole('heading', { name: 'Create New Challenge' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Challenge' })).not.toBeVisible()
  })
}
