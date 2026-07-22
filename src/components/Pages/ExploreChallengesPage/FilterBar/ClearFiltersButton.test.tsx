import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { ClearFiltersButton } from './ClearFiltersButton'

const baseContext = () => ({
  difficulty: 'Any',
  workOn: 'Anything',
  selectedCategories: [] as string[],
  global: undefined as boolean | undefined,
  locationOsmType: undefined as string | undefined,
  locationOsmId: undefined as number | undefined,
  keywords: undefined as string | undefined,
  handleClearFilters: vi.fn(),
})

const getButton = () => screen.getByRole('button', { name: /clear filters/i }) as HTMLButtonElement

describe('ClearFiltersButton', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('is disabled when no filters are active', () => {
    useExploreChallengesSearchContextMock.mockReturnValue(baseContext())

    render(<ClearFiltersButton />)

    expect(getButton().disabled).toBe(true)
  })

  it.each([
    ['difficulty', { difficulty: 'Expert' }],
    ['workOn', { workOn: 'Water' }],
    ['selectedCategories', { selectedCategories: ['tag'] }],
    ['global', { global: true }],
    ['keywords', { keywords: 'water' }],
  ])('is enabled when %s is active', (_name, overrides) => {
    useExploreChallengesSearchContextMock.mockReturnValue({ ...baseContext(), ...overrides })

    render(<ClearFiltersButton />)

    expect(getButton().disabled).toBe(false)
  })

  it('is disabled unless both locationOsmType and locationOsmId are set', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({
      ...baseContext(),
      locationOsmType: 'R',
      locationOsmId: undefined,
    })
    render(<ClearFiltersButton />)
    expect(getButton().disabled).toBe(true)
  })

  it('calls handleClearFilters when clicked', async () => {
    const user = userEvent.setup()
    const handleClearFilters = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({
      ...baseContext(),
      difficulty: 'Expert',
      handleClearFilters,
    })

    render(<ClearFiltersButton />)
    await user.click(getButton())

    expect(handleClearFilters).toHaveBeenCalledTimes(1)
  })
})
