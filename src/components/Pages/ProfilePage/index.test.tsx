import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ProfilePage } from './index'

const { getUserMock, useAuthContextMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        getUser: getUserMock,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('./ProfileHeader', () => ({
  ProfileHeader: ({ user, showLivePoints }: { user: User; showLivePoints: boolean }) => (
    <div data-testid="profile-header">
      {user.osmProfile.displayName} / live-points:{String(showLivePoints)}
    </div>
  ),
}))

vi.mock('./sections/MetricsSection', () => ({
  MetricsSection: () => <div data-testid="metrics-section" />,
}))

vi.mock('./sections/TopChallengesSection', () => ({
  TopChallengesSection: () => <div data-testid="top-challenges-section" />,
}))

vi.mock('./sections/AchievementsSection', () => ({
  AchievementsSection: ({ earnedIds }: { earnedIds: number[] }) => (
    <div data-testid="achievements-section">{JSON.stringify(earnedIds)}</div>
  ),
}))

afterEach(() => cleanup())

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    created: new Date('2021-01-01').getTime(),
    modified: new Date('2021-01-01').getTime(),
    osmProfile: {
      id: 100,
      displayName: 'AuthedUser',
      description: '',
      avatarURL: '',
      homeLocation: { type: 'Point', coordinates: [0, 0] },
      created: new Date('2021-01-01').getTime(),
      requestToken: '',
    },
    grants: [],
    guest: false,
    settings: {},
    score: 0,
    achievements: [],
    ...overrides,
  }) as unknown as User

describe('ProfilePage (index)', () => {
  it('prompts a logged-out user to log in when no userId is given and there is no authed user', () => {
    useAuthContextMock.mockReturnValue({ user: undefined })
    getUserMock.mockReturnValue({ data: undefined, isLoading: false })

    render(<ProfilePage />)

    expect(screen.getByText('Please log in to view your profile')).toBeDefined()
    expect(screen.queryByTestId('profile-header')).toBeNull()
  })

  it("renders the authed user's own profile with live points enabled when no userId is given", () => {
    const authedUser = makeUser()
    useAuthContextMock.mockReturnValue({ user: authedUser })
    getUserMock.mockReturnValue({ data: undefined, isLoading: false })

    render(<ProfilePage />)

    expect(screen.getByText('AuthedUser / live-points:true')).toBeDefined()
    expect(screen.getByTestId('metrics-section')).toBeDefined()
    expect(screen.getByTestId('top-challenges-section')).toBeDefined()
    expect(screen.getByTestId('achievements-section').textContent).toBe('[]')
  })

  it('treats a userId prop matching the authed user as viewing your own profile (no extra fetch, live points shown)', () => {
    const authedUser = makeUser({ id: 55, achievements: [3, 11] })
    useAuthContextMock.mockReturnValue({ user: authedUser })
    getUserMock.mockReturnValue({ data: undefined, isLoading: false })

    render(<ProfilePage userId={55} />)

    expect(screen.getByText('AuthedUser / live-points:true')).toBeDefined()
    expect(screen.getByTestId('achievements-section').textContent).toBe('[3,11]')
    // Called with 0 because isViewingOther is false, per the component's own logic.
    expect(getUserMock).toHaveBeenLastCalledWith(0)
  })

  it('shows a loader while a different user’s public profile is loading', () => {
    useAuthContextMock.mockReturnValue({ user: makeUser({ id: 1 }) })
    getUserMock.mockReturnValue({ data: undefined, isLoading: true })

    render(<ProfilePage userId={999} />)

    expect(screen.getByText('Loading...')).toBeDefined()
    expect(screen.queryByTestId('profile-header')).toBeNull()
    expect(getUserMock).toHaveBeenLastCalledWith(999)
  })

  it("renders another user's public profile without live points once loaded", () => {
    useAuthContextMock.mockReturnValue({ user: makeUser({ id: 1 }) })
    const otherUser = makeUser({
      id: 999,
      achievements: [5],
      osmProfile: {
        ...makeUser().osmProfile,
        displayName: 'OtherPerson',
      },
    })
    getUserMock.mockReturnValue({ data: otherUser, isLoading: false })

    render(<ProfilePage userId={999} />)

    expect(screen.getByText('OtherPerson / live-points:false')).toBeDefined()
    expect(screen.getByTestId('achievements-section').textContent).toBe('[5]')
  })

  it('shows a load-error message when a public profile fails to load (no data, not loading)', () => {
    useAuthContextMock.mockReturnValue({ user: makeUser({ id: 1 }) })
    getUserMock.mockReturnValue({ data: undefined, isLoading: false })

    render(<ProfilePage userId={999} />)

    expect(screen.getByText("Couldn't load that user's profile.")).toBeDefined()
  })

  it('defaults achievements to an empty array when the user has none', () => {
    useAuthContextMock.mockReturnValue({ user: makeUser({ achievements: undefined }) })
    getUserMock.mockReturnValue({ data: undefined, isLoading: false })

    render(<ProfilePage />)

    expect(screen.getByTestId('achievements-section').textContent).toBe('[]')
  })
})
