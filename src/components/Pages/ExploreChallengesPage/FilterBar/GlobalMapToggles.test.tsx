import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { GlobalToggle } from './GlobalMapToggles'

describe('GlobalToggle', () => {
  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
  })

  afterEach(() => cleanup())

  it('renders unchecked when global is undefined', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ global: undefined, setGlobal: vi.fn() })

    render(<GlobalToggle />)

    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })

  it('renders unchecked when global is false', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ global: false, setGlobal: vi.fn() })

    render(<GlobalToggle />)

    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })

  it('renders checked when global is true', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({ global: true, setGlobal: vi.fn() })

    render(<GlobalToggle />)

    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('calls setGlobal with the new checked state when clicked', async () => {
    const user = userEvent.setup()
    const setGlobal = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ global: false, setGlobal })

    render(<GlobalToggle />)
    await user.click(screen.getByRole('switch'))

    expect(setGlobal).toHaveBeenCalledWith(true)
  })

  it('is associated with its label for accessible clicking', async () => {
    const user = userEvent.setup()
    const setGlobal = vi.fn()
    useExploreChallengesSearchContextMock.mockReturnValue({ global: false, setGlobal })

    render(<GlobalToggle />)
    await user.click(screen.getByText('Global'))

    expect(setGlobal).toHaveBeenCalledWith(true)
  })
})
