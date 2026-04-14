import { expect, test } from '@playwright/test'
import { cleanupTestProject } from '../utils/database.js'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'
const TEST_PROJECT_NAME = 'playwright-test-project'

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

export const registerCreateProjectTests = () => {
  test.beforeAll(() => {
    cleanupTestProject(TEST_PROJECT_NAME)
  })

  test('should navigate to manage view and create a project', async ({ page }) => {
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

    await page.goto('/manage/project/new')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible({
      timeout: 15000,
    })

    await page.getByPlaceholder('my-project').fill(TEST_PROJECT_NAME)

    await page.getByPlaceholder('My Project').fill('Playwright Test Project')

    await page
      .getByPlaceholder('Describe what this project is about...')
      .fill('Project created by Playwright E2E tests.')

    await page.getByRole('button', { name: 'Create Project' }).click()

    await expect(page).toHaveURL(/\/manage\/project\/\d+$/, { timeout: 30000 })

    await expect(page.getByRole('heading', { name: 'Create New Project' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Project' })).not.toBeVisible()
  })
}
