import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { DismissibleBanner } from './DismissibleBanner.tsx'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('DismissibleBanner', () => {
  it('renders its children on first visit', () => {
    render(<DismissibleBanner storageKey="some-banner">Hello</DismissibleBanner>)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('disappears after the dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<DismissibleBanner storageKey="some-banner">Hello</DismissibleBanner>)

    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))

    expect(screen.queryByText('Hello')).toBeNull()
  })

  it('stays dismissed across remounts (persistence by storage key)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <DismissibleBanner storageKey="some-banner">Hello</DismissibleBanner>
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    unmount()

    render(<DismissibleBanner storageKey="some-banner">Hello</DismissibleBanner>)
    expect(screen.queryByText('Hello')).toBeNull()
  })

  it('does not affect a banner with a different storage key', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <DismissibleBanner storageKey="some-banner">Hello</DismissibleBanner>
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss banner' }))
    unmount()

    render(<DismissibleBanner storageKey="another-banner">Hi</DismissibleBanner>)
    expect(screen.getByText('Hi')).toBeDefined()
  })
})
