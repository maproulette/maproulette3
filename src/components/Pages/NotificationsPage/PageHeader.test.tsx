import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { PageHeader } from './PageHeader'

afterEach(() => cleanup())

describe('PageHeader', () => {
  it('renders the title and description', () => {
    render(<PageHeader title="Notifications" description="View and manage your notifications" />)

    expect(screen.getByText('Notifications')).toBeDefined()
    expect(screen.getByText('View and manage your notifications')).toBeDefined()
  })

  it('renders without a description when none is provided', () => {
    render(<PageHeader title="Notifications" />)

    expect(screen.getByText('Notifications')).toBeDefined()
    expect(screen.queryByText('View and manage your notifications')).toBeNull()
  })

  it('shows skeletons instead of the title/description while loading', () => {
    render(
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
        isLoading
      />
    )

    expect(screen.queryByText('Notifications')).toBeNull()
    expect(screen.queryByText('View and manage your notifications')).toBeNull()
  })

  it('renders actions only when not loading', () => {
    const { rerender } = render(
      <PageHeader title="Notifications" actions={<button type="button">Do thing</button>} />
    )
    expect(screen.getByRole('button', { name: 'Do thing' })).toBeDefined()

    rerender(
      <PageHeader
        title="Notifications"
        actions={<button type="button">Do thing</button>}
        isLoading
      />
    )
    expect(screen.queryByRole('button', { name: 'Do thing' })).toBeNull()
  })
})
