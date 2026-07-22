import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminPlugins } from './index'

afterEach(() => cleanup())

describe('SuperAdminPlugins', () => {
  it('renders the header, subtitle, and stats cards', () => {
    render(<SuperAdminPlugins />)

    expect(screen.getByRole('heading', { name: 'Plugin Management' })).toBeDefined()
    expect(screen.getByText('Manage plugins and integrations for the platform')).toBeDefined()

    expect(screen.getByText('Total Plugins')).toBeDefined()
    expect(screen.getByText('24')).toBeDefined()
    expect(screen.getByText('Active Plugins')).toBeDefined()
    expect(screen.getByText('18')).toBeDefined()
    expect(screen.getByText('Total Downloads')).toBeDefined()
    expect(screen.getByText('12.5K')).toBeDefined()
    expect(screen.getByText('Pending Updates')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('renders all mock plugins with version, author, downloads, and status', () => {
    render(<SuperAdminPlugins />)

    expect(screen.getByText('Analytics Plugin')).toBeDefined()
    expect(screen.getByText('Rapid Editor Integration')).toBeDefined()
    expect(screen.getByText('Export Manager')).toBeDefined()
    expect(screen.getByText('Custom Validators')).toBeDefined()

    expect(screen.getByText('v1.2.3 • by MapRoulette Team')).toBeDefined()
    expect(screen.getByText('1,234 downloads')).toBeDefined()

    expect(screen.getAllByText('active')).toHaveLength(2)
    expect(screen.getByText('inactive')).toBeDefined()
    expect(screen.getByText('beta')).toBeDefined()
  })

  it('filters plugins by name', async () => {
    const user = userEvent.setup()
    render(<SuperAdminPlugins />)

    await user.type(screen.getByPlaceholderText('Search plugins...'), 'Rapid')

    expect(screen.getByText('Rapid Editor Integration')).toBeDefined()
    expect(screen.queryByText('Analytics Plugin')).toBeNull()
    expect(screen.queryByText('Export Manager')).toBeNull()
    expect(screen.queryByText('Custom Validators')).toBeNull()
  })

  it('filters plugins by author', async () => {
    const user = userEvent.setup()
    render(<SuperAdminPlugins />)

    await user.type(screen.getByPlaceholderText('Search plugins...'), 'Community')

    expect(screen.getByText('Export Manager')).toBeDefined()
    expect(screen.getByText('Custom Validators')).toBeDefined()
    expect(screen.queryByText('Analytics Plugin')).toBeNull()
    expect(screen.queryByText('Rapid Editor Integration')).toBeNull()
  })

  it('shows an empty state when no plugins match the search query', async () => {
    const user = userEvent.setup()
    render(<SuperAdminPlugins />)

    await user.type(screen.getByPlaceholderText('Search plugins...'), 'no-such-plugin')

    expect(screen.getByText('No plugins found')).toBeDefined()
    expect(screen.getByText('Try adjusting your search query.')).toBeDefined()
  })

  it('restores the full list when the search query is cleared', async () => {
    const user = userEvent.setup()
    render(<SuperAdminPlugins />)

    const searchInput = screen.getByPlaceholderText('Search plugins...')
    await user.type(searchInput, 'Rapid')
    expect(screen.queryByText('Analytics Plugin')).toBeNull()

    await user.clear(searchInput)

    expect(screen.getByText('Analytics Plugin')).toBeDefined()
    expect(screen.getByText('Rapid Editor Integration')).toBeDefined()
    expect(screen.getByText('Export Manager')).toBeDefined()
    expect(screen.getByText('Custom Validators')).toBeDefined()
  })
})
