import { expect, test } from './fixtures'

test('a user can find a challenge by name using the header search bar', async ({
  page,
  challenge,
}) => {
  await page.goto('/')

  const searchInput = page.getByRole('searchbox', {
    name: /search for challenges, tasks or projects/i,
  })
  await searchInput.click()
  await searchInput.fill(challenge.name)

  await expect(page.getByRole('heading', { name: challenge.name })).toBeVisible({
    timeout: 15_000,
  })
})
