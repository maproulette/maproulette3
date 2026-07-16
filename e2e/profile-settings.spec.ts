import { expect, test } from './fixtures'

const BACKEND_URL = 'http://localhost:9000'
const SUPER_KEY = 'super-secret-key'

interface WhoamiUser {
  id: number
  settings: {
    defaultBasemapId?: string | null
    [key: string]: unknown
  }
}

// Note: this test does NOT reload the page to verify the setting survived a
// fresh fetch. The test harness authenticates as a synthetic backend user
// (id -999, via the MR_SUPER_KEY apiKey header) that isn't a real persisted
// DB row — every GET /whoami synthesizes a fresh default user from scratch,
// so a reload always reports defaults regardless of any PUT that came before,
// for any field. That's an inherent limitation of this synthetic identity,
// not something a real logged-in user would hit. What IS genuinely provable
// here: submitting the form calls the real update mutation (confirmed via the
// success toast, which only fires in the mutation's resolved `.then`), and
// the query cache it seeds keeps the saved value showing in the UI
// immediately afterward, without a reload.
test('a user can update their custom basemap URL setting', async ({ page, request }) => {
  const whoamiResponse = await request.get(`${BACKEND_URL}/api/v2/user/whoami`, {
    headers: { apiKey: SUPER_KEY },
  })
  expect(whoamiResponse.ok()).toBeTruthy()
  const originalUser = (await whoamiResponse.json()) as WhoamiUser

  const newBasemapUrl = `https://example.com/tiles/${Date.now()}/{z}/{x}/{y}.png`

  await page.goto('/settings')

  const basemapUrlField = page.getByLabel('Custom Basemap URL')
  await expect(basemapUrlField).toBeVisible({ timeout: 15_000 })

  await basemapUrlField.fill(newBasemapUrl)

  const submit = page.getByRole('button', { name: 'Submit' })
  await submit.click()

  await expect(page.getByText('User settings updated')).toBeVisible({ timeout: 15_000 })
  await expect(basemapUrlField).toHaveValue(newBasemapUrl)

  // Restoring the synthetic user's settings on the real backend is a no-op
  // (see note above), but this stays as a formality in case the harness ever
  // points at a real persisted account.
  await request.put(`${BACKEND_URL}/api/v2/user/${originalUser.id}`, {
    headers: { apiKey: SUPER_KEY, 'Content-Type': 'application/json' },
    data: originalUser.settings,
  })
})
