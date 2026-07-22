import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('../contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { ViewModeToggle } from './ViewModeToggle'

describe('ViewModeToggle', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('marks the current view mode item as pressed', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ viewMode: 'grid', setViewMode: vi.fn() })

    render(<ViewModeToggle />)

    const gridButton = screen.getByTitle('Grid view')
    expect(gridButton.getAttribute('data-state')).toBe('on')
    expect(screen.getByTitle('List view').getAttribute('data-state')).toBe('off')
    expect(screen.getByTitle('Grid with map view').getAttribute('data-state')).toBe('off')
  })

  it('calls setViewMode when a different mode is clicked', async () => {
    const user = userEvent.setup()
    const setViewMode = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ viewMode: 'grid', setViewMode })

    render(<ViewModeToggle />)
    await user.click(screen.getByTitle('List view'))

    expect(setViewMode).toHaveBeenCalledWith('list')
  })

  it('does not call setViewMode when clicking the already-active mode', async () => {
    const user = userEvent.setup()
    const setViewMode = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ viewMode: 'grid', setViewMode })

    render(<ViewModeToggle />)
    await user.click(screen.getByTitle('Grid view'))

    expect(setViewMode).not.toHaveBeenCalled()
  })
})
