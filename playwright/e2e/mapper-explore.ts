import { expect, test } from '@playwright/test'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'

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

const installApiMocks = async (page: import('@playwright/test').Page) => {
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
}

export const registerMapperExploreTests = () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page)
  })

  test('should render the explore challenges page with the filter bar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByPlaceholder('Search location...')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Difficulty', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /CLEAR FILTERS/i })).toBeVisible()
  })

  test('should change view mode to list and reflect it in the URL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('radio', { name: 'List view' }).click()

    await expect(page).toHaveURL(/viewMode=list/, { timeout: 5000 })
  })

  test('should change view mode to grid and reflect it in the URL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('radio', { name: 'Grid view' }).click()

    await expect(page).toHaveURL(/viewMode=grid(?!-)/, { timeout: 5000 })
  })

  test('should filter by Easy difficulty and reflect it in the URL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const difficultyTrigger = page.locator('button').filter({ hasText: /^Any$/ }).first()
    await difficultyTrigger.click()
    await page.getByRole('option', { name: 'Easy' }).click()

    await expect(page).toHaveURL(/difficulty=Easy/, { timeout: 5000 })
  })

  test('should enable clear filters button once a filter is active and clear it on click', async ({
    page,
  }) => {
    await page.goto('/?difficulty=Easy')
    await page.waitForLoadState('domcontentloaded')

    const clearButton = page.getByRole('button', { name: /CLEAR FILTERS/i })
    await expect(clearButton).toBeEnabled({ timeout: 5000 })

    await clearButton.click()

    await expect(page).not.toHaveURL(/difficulty=/, { timeout: 5000 })
    await expect(clearButton).toBeDisabled()
  })

  test('should navigate to the browse challenge page when a challenge card is clicked', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const challengeLink = page
      .getByRole('link')
      .filter({ hasText: /Playwright Test Challenge/i })
      .first()

    await expect(challengeLink).toBeVisible({ timeout: 15000 })
    await challengeLink.click()

    await expect(page).toHaveURL(/\/challenge\/\d+/, { timeout: 10000 })
    await expect(
      page.getByRole('heading', { name: /Playwright Test Challenge/i }).first()
    ).toBeVisible({ timeout: 10000 })
  })
}
