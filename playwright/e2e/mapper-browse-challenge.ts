import { expect, test } from '@playwright/test'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'
const TEST_CHALLENGE_NAME = 'Playwright Test Challenge'
const TEST_PROJECT_DISPLAY_NAME = 'Playwright Test Project'

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

export const registerMapperBrowseChallengeTests = () => {
  let challengeId: number

  test.beforeAll(async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/v2/challenges/find?q=${encodeURIComponent(TEST_CHALLENGE_NAME)}&limit=10&onlyEnabled=false`,
      { headers: { apiKey: SUPER_KEY } }
    )
    const challenges = (await response.json()) as Array<{ id: number; name: string }>
    const match = challenges.find((c) => c.name === TEST_CHALLENGE_NAME)
    if (!match) {
      throw new Error(
        `Cannot run mapper browse tests: challenge "${TEST_CHALLENGE_NAME}" not found. Ensure challenge-creation tests ran first.`
      )
    }
    challengeId = match.id
  })

  test.beforeEach(async ({ page }) => {
    await installApiMocks(page)
  })

  test('should load the browsed challenge page and show the challenge name', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: TEST_CHALLENGE_NAME }).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('should display the project name as a link in the header', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    const projectLink = page.getByRole('link', { name: TEST_PROJECT_DISPLAY_NAME }).first()
    await expect(projectLink).toBeVisible({ timeout: 15000 })
    await expect(projectLink).toHaveAttribute('href', /\/project\/\d+/)
  })

  test('should render the challenge description and instructions content', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    await expect(
      page.getByText('This is an automated test challenge created by Playwright').first()
    ).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('A test challenge created by Playwright').first()).toBeVisible()
  })

  test('should show the Start Challenge call-to-action in the footer', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('button', { name: /Start Challenge/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('should show a toast when Start Challenge is clicked but no tasks are available', async ({
    page,
  }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    const startButton = page.getByRole('button', { name: /Start Challenge/i })
    await expect(startButton).toBeVisible({ timeout: 15000 })
    await startButton.click()

    await expect(page.getByText(/No tasks available for this challenge/i)).toBeVisible({
      timeout: 10000,
    })

    await expect(page).toHaveURL(/\/challenge\/\d+/)
  })

  test('should display Like, Comments, Save, and Share buttons in the header', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('button', { name: /^Like$/i }).first()).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByRole('button', { name: /^Comments$/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^Save$/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^Share$/i }).first()).toBeVisible()
  })

  test('should open the actions dropdown menu when the ellipsis button is clicked', async ({
    page,
  }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    const actionsButton = page.getByRole('button', { name: 'Challenge actions' }).first()
    await expect(actionsButton).toBeVisible({ timeout: 15000 })
    await actionsButton.click()

    await expect(page.getByRole('menuitem', { name: /Overpass Query/i })).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByRole('menuitem', { name: /Manage Challenge/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Clone Challenge/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Report Challenge/i })).toBeVisible()
  })

  test('should open the comments modal when the Comments button is clicked', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`)
    await page.waitForLoadState('domcontentloaded')

    await page
      .getByRole('button', { name: /^Comments$/i })
      .first()
      .click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('heading', { name: 'Challenge Comments' })).toBeVisible()
  })

  test('should auto-open the comments modal when ?comments=1 is present', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}?comments=1`)
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Challenge Comments' })).toBeVisible({
      timeout: 15000,
    })
  })
}
