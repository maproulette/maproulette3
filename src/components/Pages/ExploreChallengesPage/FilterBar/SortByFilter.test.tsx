import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { SortByFilter } from './SortByFilter'

describe('SortByFilter', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('defaults to showing "Name" when sortBy is undefined', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ sortBy: undefined, setSortBy: vi.fn() })

    render(<SortByFilter />)

    expect(screen.getByRole('combobox').textContent).toContain('Name')
  })

  it('shows the current sortBy value when set', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ sortBy: 'popularity', setSortBy: vi.fn() })

    render(<SortByFilter />)

    expect(screen.getByRole('combobox').textContent).toContain('Popular')
  })

  it('calls setSortBy with the newly selected option', async () => {
    const user = userEvent.setup()
    const setSortBy = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ sortBy: 'name', setSortBy })

    render(<SortByFilter />)
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Difficulty' }))

    expect(setSortBy).toHaveBeenCalledWith('difficulty')
  })
})
