import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { WorkOnFilter } from './WorkOnFilter'

describe('WorkOnFilter', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('shows the current workOn value', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ workOn: 'Water', setWorkOn: vi.fn() })

    render(<WorkOnFilter />)

    expect(screen.getByRole('combobox').textContent).toContain('Water')
  })

  it('calls setWorkOn with the newly selected category', async () => {
    const user = userEvent.setup()
    const setWorkOn = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ workOn: 'Anything', setWorkOn })

    render(<WorkOnFilter />)
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Buildings' }))

    expect(setWorkOn).toHaveBeenCalledWith('Buildings')
  })

  it('offers all seven work-on categories', async () => {
    const user = userEvent.setup()
    useExploreChallengesSearchContextMock.mockReturnValue({ workOn: 'Anything', setWorkOn: vi.fn() })

    render(<WorkOnFilter />)
    await user.click(screen.getByRole('combobox'))

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(7)
  })
})
