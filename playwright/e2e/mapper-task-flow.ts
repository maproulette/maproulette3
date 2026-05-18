import { type APIRequestContext, expect, type Page, test } from '@playwright/test'
import { cleanupChallengeAndActivity } from '../utils/database.js'

const SUPER_KEY = process.env.MR_SUPER_KEY || 'test-super-key'
const API_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:9001'

const TEST_PROJECT_NAME = 'playwright-test-project'
const TEST_CHALLENGE_NAME = 'Mapper Flow Test Challenge'

// Each task gets a distinct point so the backend can compute a location.
const TASK_POINTS: Array<{ name: string; lng: number; lat: number }> = [
  { name: 'mapper-flow-task-fixed', lng: -105.25, lat: 40.01 },
  { name: 'mapper-flow-task-not-an-issue', lng: -105.26, lat: 40.02 },
  { name: 'mapper-flow-task-cant-complete', lng: -105.27, lat: 40.03 },
  { name: 'mapper-flow-task-already-fixed', lng: -105.28, lat: 40.04 },
  { name: 'mapper-flow-task-skip', lng: -105.29, lat: 40.05 },
  { name: 'mapper-flow-task-comment', lng: -105.295, lat: 40.055 },
  { name: 'mapper-flow-task-cancel', lng: -105.298, lat: 40.058 },
  { name: 'mapper-flow-task-bundle-primary', lng: -105.3, lat: 40.06 },
  { name: 'mapper-flow-task-bundle-secondary', lng: -105.31, lat: 40.07 },
]

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

const installApiMocks = async (page: Page) => {
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

const findProjectId = async (request: APIRequestContext): Promise<number> => {
  const res = await request.get(
    `${API_BASE}/api/v2/projects/find?q=${encodeURIComponent(TEST_PROJECT_NAME)}&limit=10&onlyEnabled=false`,
    { headers: { apiKey: SUPER_KEY } }
  )
  if (!res.ok()) {
    throw new Error(`Failed to find project ${TEST_PROJECT_NAME}: HTTP ${res.status()}`)
  }
  const projects = (await res.json()) as Array<{ id: number; name: string }>
  const match = projects.find((p) => p.name.toLowerCase() === TEST_PROJECT_NAME.toLowerCase())
  if (!match) {
    throw new Error(
      `Cannot run mapper task flow tests: project "${TEST_PROJECT_NAME}" not found. ` +
        `Ensure project-creation tests ran first.`
    )
  }
  return match.id
}

const createChallenge = async (request: APIRequestContext, projectId: number): Promise<number> => {
  const res = await request.post(`${API_BASE}/api/v2/challenge`, {
    headers: { apiKey: SUPER_KEY, 'content-type': 'application/json' },
    data: {
      name: TEST_CHALLENGE_NAME,
      parent: projectId,
      description: 'Auto-created challenge for mapper task-flow tests',
      blurb: 'Mapper flow E2E challenge',
      instruction: 'Complete each task with the requested status.',
      enabled: true,
      difficulty: 1,
      defaultPriority: 0,
    },
  })
  if (!res.ok()) {
    throw new Error(`Failed to create challenge: HTTP ${res.status()} - ${await res.text()}`)
  }
  const created = (await res.json()) as { id: number }
  return created.id
}

const buildGeometry = (lng: number, lat: number) => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { source: 'mapper-flow-test' },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    },
  ],
})

const createTasks = async (
  request: APIRequestContext,
  challengeId: number
): Promise<Record<string, number>> => {
  const ids: Record<string, number> = {}
  for (const point of TASK_POINTS) {
    const res = await request.post(`${API_BASE}/api/v2/task`, {
      headers: { apiKey: SUPER_KEY, 'content-type': 'application/json' },
      data: {
        name: point.name,
        parent: challengeId,
        status: 0,
        priority: 0,
        geometries: JSON.stringify(buildGeometry(point.lng, point.lat)),
      },
    })
    if (!res.ok()) {
      throw new Error(
        `Failed to create task ${point.name}: HTTP ${res.status()} - ${await res.text()}`
      )
    }
    const created = (await res.json()) as { id: number }
    ids[point.name] = created.id
  }
  return ids
}

const createBundle = async (
  request: APIRequestContext,
  primaryId: number,
  taskIds: number[]
): Promise<number> => {
  const res = await request.post(`${API_BASE}/api/v2/taskBundle`, {
    headers: { apiKey: SUPER_KEY, 'content-type': 'application/json' },
    data: { name: 'Mapper Flow Bundle', primaryId, taskIds },
  })
  if (!res.ok()) {
    throw new Error(`Failed to create bundle: HTTP ${res.status()} - ${await res.text()}`)
  }
  const bundle = (await res.json()) as { bundleId: number }
  return bundle.bundleId
}

const fetchTaskStatus = async (request: APIRequestContext, taskId: number): Promise<number> => {
  const res = await request.get(`${API_BASE}/api/v2/task/${taskId}`, {
    headers: { apiKey: SUPER_KEY },
  })
  if (!res.ok()) {
    throw new Error(`Failed to read task ${taskId}: HTTP ${res.status()}`)
  }
  const task = (await res.json()) as { status?: number }
  return task.status ?? 0
}

const openTaskPage = async (page: Page, taskId: number) => {
  await page.goto(`/tasks/${taskId}`)
  await page.waitForLoadState('domcontentloaded')
  // Auto-lock happens on mount; wait until the completion buttons appear.
  await expect(page.getByRole('button', { name: /^Fixed$/ })).toBeVisible({ timeout: 20000 })
}

/**
 * Selects a destination status from the modal's Status Change select, then
 * picks "Random High Priority Task" (default) and clicks Complete & Continue.
 * The next-task navigation may fail because the random pool is exhausted —
 * tests only care about the persisted task status, so we don't assert on it.
 */
const submitTaskCompletionModal = async (page: Page, statusLabel: string) => {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10000 })

  // Status change select sits next to the current-status badge. Open it and
  // pick the requested label.
  const statusSelect = dialog.getByRole('combobox').first()
  await statusSelect.click()
  await page.getByRole('option', { name: statusLabel, exact: true }).click()

  // Submit. The button label flips to "Submitting..." while the request runs.
  await dialog.getByRole('button', { name: /Complete & Continue/i }).click()

  // Toast confirmation
  await expect(page.getByText(new RegExp(`Task marked as ${statusLabel}`, 'i'))).toBeVisible({
    timeout: 15000,
  })
}

export const registerMapperTaskFlowTests = () => {
  let challengeId: number
  let taskIds: Record<string, number> = {}
  let bundleId: number

  test.beforeAll(async ({ request }) => {
    // Defensive: clear any stale rows from a prior failed run.
    cleanupChallengeAndActivity(TEST_CHALLENGE_NAME)

    const projectId = await findProjectId(request)
    challengeId = await createChallenge(request, projectId)
    taskIds = await createTasks(request, challengeId)
    bundleId = await createBundle(request, taskIds['mapper-flow-task-bundle-primary'], [
      taskIds['mapper-flow-task-bundle-primary'],
      taskIds['mapper-flow-task-bundle-secondary'],
    ])
  })

  test.afterAll(() => {
    // Wipe everything we created so the snapshot test sees a clean baseline.
    cleanupChallengeAndActivity(TEST_CHALLENGE_NAME)
  })

  test.beforeEach(async ({ page }) => {
    await installApiMocks(page)
  })

  test('completion buttons appear after the task auto-locks', async ({ page }) => {
    await openTaskPage(page, taskIds['mapper-flow-task-fixed'])

    await expect(page.getByRole('button', { name: /^Fixed$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Already Fixed$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Not an Issue$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Can't Complete$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Skip this task/i })).toBeVisible()
  })

  test('marks a task as Fixed', async ({ page, request }) => {
    const taskId = taskIds['mapper-flow-task-fixed']
    await openTaskPage(page, taskId)
    await page.getByRole('button', { name: /^Fixed$/ }).click()
    await submitTaskCompletionModal(page, 'Fixed')

    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(1)
  })

  test('marks a task as Not an Issue (False Positive)', async ({ page, request }) => {
    const taskId = taskIds['mapper-flow-task-not-an-issue']
    await openTaskPage(page, taskId)
    await page.getByRole('button', { name: /^Not an Issue$/ }).click()
    await submitTaskCompletionModal(page, 'False Positive')

    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(2)
  })

  test("marks a task as Can't Complete (Too Hard)", async ({ page, request }) => {
    const taskId = taskIds['mapper-flow-task-cant-complete']
    await openTaskPage(page, taskId)
    await page.getByRole('button', { name: /^Can't Complete$/ }).click()
    await submitTaskCompletionModal(page, 'Too Hard')

    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(6)
  })

  test('marks a task as Already Fixed', async ({ page, request }) => {
    const taskId = taskIds['mapper-flow-task-already-fixed']
    await openTaskPage(page, taskId)
    await page.getByRole('button', { name: /^Already Fixed$/ }).click()
    await submitTaskCompletionModal(page, 'Already Fixed')

    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(5)
  })

  test('skip button moves a task to Skipped status', async ({ page, request }) => {
    const taskId = taskIds['mapper-flow-task-skip']
    await openTaskPage(page, taskId)

    await page.getByRole('button', { name: /Skip this task/i }).click()

    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(3)
  })

  test('persists comment and tags when submitting the completion modal', async ({
    page,
    request,
  }) => {
    const taskId = taskIds['mapper-flow-task-comment']
    await openTaskPage(page, taskId)

    await page.getByRole('button', { name: /^Fixed$/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    await dialog.getByPlaceholder(/Add any notes or comments/i).fill('Mapper flow comment')
    await dialog.getByPlaceholder(/Enter tags separated by commas/i).fill('Geometry, Tagging')

    await dialog.getByRole('button', { name: /Complete & Continue/i }).click()

    await expect(page.getByText(/Task marked as Fixed/i)).toBeVisible({ timeout: 15000 })
    await expect.poll(() => fetchTaskStatus(request, taskId), { timeout: 15000 }).toBe(1)

    // Verify the comment landed.
    const commentRes = await request.get(`${API_BASE}/api/v2/task/${taskId}/comments`, {
      headers: { apiKey: SUPER_KEY },
    })
    expect(commentRes.ok()).toBeTruthy()
    const comments = (await commentRes.json()) as Array<{ comment?: string }>
    expect(comments.some((c) => (c.comment ?? '').includes('Mapper flow comment'))).toBe(true)
  })

  test('cancel button on the completion modal leaves the task unchanged', async ({
    page,
    request,
  }) => {
    const taskId = taskIds['mapper-flow-task-cancel']
    const statusBefore = await fetchTaskStatus(request, taskId)

    await openTaskPage(page, taskId)
    await page.getByRole('button', { name: /^Fixed$/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    expect(await fetchTaskStatus(request, taskId)).toBe(statusBefore)
  })

  test('submitting the primary bundle task applies the status to every task in the bundle', async ({
    page,
    request,
  }) => {
    expect(bundleId).toBeGreaterThan(0)
    const primaryId = taskIds['mapper-flow-task-bundle-primary']
    const secondaryId = taskIds['mapper-flow-task-bundle-secondary']

    await openTaskPage(page, primaryId)
    await page.getByRole('button', { name: /^Fixed$/ }).click()
    await submitTaskCompletionModal(page, 'Fixed')

    await expect.poll(() => fetchTaskStatus(request, primaryId), { timeout: 20000 }).toBe(1)
    await expect.poll(() => fetchTaskStatus(request, secondaryId), { timeout: 20000 }).toBe(1)
  })
}
