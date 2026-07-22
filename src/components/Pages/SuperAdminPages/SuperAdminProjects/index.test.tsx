import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminProjects } from './index'

afterEach(() => cleanup())

describe('SuperAdminProjects', () => {
  it('renders the header, subtitle, and stats cards', () => {
    render(<SuperAdminProjects />)

    expect(screen.getByRole('heading', { name: 'All Projects' })).toBeDefined()
    expect(screen.getByText('View and manage all projects across the platform')).toBeDefined()

    expect(screen.getByText('Total Projects')).toBeDefined()
    expect(screen.getByText('256')).toBeDefined()
    expect(screen.getByText('Active Projects')).toBeDefined()
    expect(screen.getByText('187')).toBeDefined()
    expect(screen.getByText('Total Challenges')).toBeDefined()
    expect(screen.getByText('1,892')).toBeDefined()
    expect(screen.getByText('Avg. Completion')).toBeDefined()
    expect(screen.getByText('64%')).toBeDefined()
  })

  it('renders all mock projects with their owner, challenge count, and completion rate', () => {
    render(<SuperAdminProjects />)

    expect(screen.getByText('Highway Mapping Project')).toBeDefined()
    expect(screen.getByText('Building Footprint Validation')).toBeDefined()
    expect(screen.getByText('Parks Mapping')).toBeDefined()

    expect(screen.getByText('Owner: John Doe')).toBeDefined()
    expect(screen.getByText('45')).toBeDefined()
    expect(screen.getByText('67%')).toBeDefined()
  })

  it('shows enabled projects as discoverable and disabled ones as not discoverable', () => {
    render(<SuperAdminProjects />)

    // Highway Mapping & Building Footprints are enabled; Parks and Recreation is not
    expect(screen.getAllByTitle('Discoverable')).toHaveLength(2)
    expect(screen.getAllByTitle('Not discoverable')).toHaveLength(1)
  })

  it('filters projects by name as the user types in the search bar', async () => {
    const user = userEvent.setup()
    render(<SuperAdminProjects />)

    await user.type(screen.getByPlaceholderText('Search projects...'), 'Building')

    expect(screen.getByText('Building Footprint Validation')).toBeDefined()
    expect(screen.queryByText('Highway Mapping Project')).toBeNull()
    expect(screen.queryByText('Parks Mapping')).toBeNull()
  })

  it('filters projects by description', async () => {
    const user = userEvent.setup()
    render(<SuperAdminProjects />)

    await user.type(screen.getByPlaceholderText('Search projects...'), 'playgrounds')

    expect(screen.getByText('Parks Mapping')).toBeDefined()
    expect(screen.queryByText('Highway Mapping Project')).toBeNull()
  })

  it('shows an empty state when no projects match the search query', async () => {
    const user = userEvent.setup()
    render(<SuperAdminProjects />)

    await user.type(screen.getByPlaceholderText('Search projects...'), 'no-such-project')

    expect(screen.getByText('No projects found')).toBeDefined()
    expect(screen.getByText('Try adjusting your search query.')).toBeDefined()
  })

  it('restores the full list when the search query is cleared', async () => {
    const user = userEvent.setup()
    render(<SuperAdminProjects />)

    const searchInput = screen.getByPlaceholderText('Search projects...')
    await user.type(searchInput, 'Building')
    expect(screen.queryByText('Highway Mapping Project')).toBeNull()

    await user.clear(searchInput)

    expect(screen.getByText('Highway Mapping Project')).toBeDefined()
    expect(screen.getByText('Building Footprint Validation')).toBeDefined()
    expect(screen.getByText('Parks Mapping')).toBeDefined()
  })
})
