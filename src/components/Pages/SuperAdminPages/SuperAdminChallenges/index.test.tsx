import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminChallenges } from './index'

afterEach(() => cleanup())

describe('SuperAdminChallenges', () => {
  it('renders the header, subtitle, and stats cards', () => {
    render(<SuperAdminChallenges />)

    expect(screen.getByRole('heading', { name: 'All Challenges' })).toBeDefined()
    expect(screen.getByText('Browse and manage all challenges across the platform')).toBeDefined()

    expect(screen.getByText('Total Challenges')).toBeDefined()
    expect(screen.getByText('1,892')).toBeDefined()
    expect(screen.getByText('Active Challenges')).toBeDefined()
    expect(screen.getByText('1,345')).toBeDefined()
    expect(screen.getByText('Total Tasks')).toBeDefined()
    expect(screen.getByText('45.2K')).toBeDefined()
    expect(screen.getByText('Avg. Completion')).toBeDefined()
    expect(screen.getByText('58%')).toBeDefined()
  })

  it('renders all mock challenges with their details on initial load', () => {
    render(<SuperAdminChallenges />)

    expect(screen.getByText('Validate Highway Exits')).toBeDefined()
    expect(screen.getByText('Building Heights')).toBeDefined()
    expect(screen.getByText('Park Amenities')).toBeDefined()

    expect(screen.getByText('Project: Highway Mapping')).toBeDefined()
    expect(screen.getByText('Owner: John Doe')).toBeDefined()

    // Difficulty labels derived from getDifficultyLabel
    expect(screen.getByText('Normal')).toBeDefined() // difficulty 2
    expect(screen.getByText('Easy')).toBeDefined() // difficulty 1
    expect(screen.getByText('Expert')).toBeDefined() // difficulty 3

    // tasks remaining counts
    expect(screen.getByText('234')).toBeDefined()
    expect(screen.getByText('512')).toBeDefined()
    expect(screen.getByText('89')).toBeDefined()
  })

  it('shows enabled challenges as discoverable and disabled ones as not discoverable', () => {
    render(<SuperAdminChallenges />)

    // Validate Highway Exits & Building Heights are enabled; Park Amenities is not
    expect(screen.getAllByTitle('Discoverable')).toHaveLength(2)
    expect(screen.getAllByTitle('Not discoverable')).toHaveLength(1)
  })

  it('filters challenges by name as the user types in the search bar', async () => {
    const user = userEvent.setup()
    render(<SuperAdminChallenges />)

    await user.type(screen.getByPlaceholderText('Search challenges...'), 'Building')

    expect(screen.getByText('Building Heights')).toBeDefined()
    expect(screen.queryByText('Validate Highway Exits')).toBeNull()
    expect(screen.queryByText('Park Amenities')).toBeNull()
  })

  it('filters challenges by project name', async () => {
    const user = userEvent.setup()
    render(<SuperAdminChallenges />)

    await user.type(screen.getByPlaceholderText('Search challenges...'), 'Parks and Recreation')

    expect(screen.getByText('Park Amenities')).toBeDefined()
    expect(screen.queryByText('Validate Highway Exits')).toBeNull()
    expect(screen.queryByText('Building Heights')).toBeNull()
  })

  it('shows an empty state when no challenges match the search query', async () => {
    const user = userEvent.setup()
    render(<SuperAdminChallenges />)

    await user.type(screen.getByPlaceholderText('Search challenges...'), 'no-such-challenge')

    expect(screen.getByText('No challenges found')).toBeDefined()
    expect(screen.getByText('Try adjusting your search query.')).toBeDefined()
    expect(screen.queryByText('Validate Highway Exits')).toBeNull()
  })

  it('restores the full list when the search query is cleared', async () => {
    const user = userEvent.setup()
    render(<SuperAdminChallenges />)

    const searchInput = screen.getByPlaceholderText('Search challenges...')
    await user.type(searchInput, 'Building')
    expect(screen.queryByText('Validate Highway Exits')).toBeNull()

    await user.clear(searchInput)

    expect(screen.getByText('Validate Highway Exits')).toBeDefined()
    expect(screen.getByText('Building Heights')).toBeDefined()
    expect(screen.getByText('Park Amenities')).toBeDefined()
  })
})
