import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { DifficultyFilter } from './DifficultyFilter'

describe('DifficultyFilter', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('shows the current difficulty value', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({
      difficulty: 'Expert',
      setDifficulty: vi.fn(),
    })

    render(<DifficultyFilter />)

    expect(screen.getByRole('combobox').textContent).toContain('Expert')
  })

  it('calls setDifficulty with the newly selected option', async () => {
    const user = userEvent.setup()
    const setDifficulty = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ difficulty: 'Any', setDifficulty })

    render(<DifficultyFilter />)
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Normal' }))

    expect(setDifficulty).toHaveBeenCalledWith('Normal')
  })

  it('offers all four difficulty options', async () => {
    const user = userEvent.setup()
    useExploreChallengesSearchContextMock.mockReturnValue({
      difficulty: 'Any',
      setDifficulty: vi.fn(),
    })

    render(<DifficultyFilter />)
    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByRole('option', { name: 'Any' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Easy' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Normal' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Expert' })).toBeTruthy()
  })
})
