import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TeamUser } from '@/api/user/profile'
import { cleanup, render, screen } from '@/test/testUtils'
import { TeamsSection } from './TeamsSection'

const { teamMembershipsMock } = vi.hoisted(() => ({
  teamMembershipsMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        teamMemberships: teamMembershipsMock,
      },
    },
  }
})

const makeMembership = (overrides: Partial<TeamUser> = {}): TeamUser =>
  ({
    id: 1,
    userId: 1,
    osmId: 1,
    name: 'The A Team',
    teamId: 10,
    teamGrants: [],
    status: 1,
    ...overrides,
  }) as TeamUser

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TeamsSection', () => {
  it('shows a loader while memberships are loading', () => {
    teamMembershipsMock.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows an error message when the request fails', () => {
    teamMembershipsMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error() })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText('Failed to load')).toBeDefined()
  })

  it('shows an empty state when the user has no teams', () => {
    teamMembershipsMock.mockReturnValue({ data: [], isLoading: false, error: null })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText('No teams')).toBeDefined()
    expect(screen.getByText('Join a team to collaborate')).toBeDefined()
  })

  it('renders team name, initials, and count badge', () => {
    teamMembershipsMock.mockReturnValue({
      data: [makeMembership({ name: 'Mappers United', status: 1 })],
      isLoading: false,
      error: null,
    })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText('1')).toBeDefined() // count badge
    expect(screen.getByText('Mappers United')).toBeDefined()
    expect(screen.getByText('MU')).toBeDefined() // initials
  })

  it('falls back to a generated team name when name is missing', () => {
    teamMembershipsMock.mockReturnValue({
      data: [makeMembership({ name: '', teamId: 77 })],
      isLoading: false,
      error: null,
    })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText('Team #77')).toBeDefined()
  })

  it.each([
    [0, 'Invited'],
    [1, 'Member'],
    [2, 'Admin'],
    [99, 'Unknown'],
  ])('renders the %s status as "%s"', (status, label) => {
    teamMembershipsMock.mockReturnValue({
      data: [makeMembership({ status })],
      isLoading: false,
      error: null,
    })

    render(<TeamsSection userId={1} />)

    expect(screen.getByText(label)).toBeDefined()
  })
})
