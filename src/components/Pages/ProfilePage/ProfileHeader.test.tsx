import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ProfileHeader } from './ProfileHeader'

vi.mock('@/components/shared/PointsTicker', () => ({
  PointsTicker: () => <div data-testid="points-ticker" />,
}))

afterEach(() => cleanup())

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    created: new Date('2021-03-15').getTime(),
    modified: new Date('2021-03-15').getTime(),
    osmProfile: {
      id: 100,
      displayName: 'Jane Mapper',
      description: '',
      avatarURL: 'https://example.com/avatar.png',
      homeLocation: { type: 'Point', coordinates: [0, 0] },
      created: new Date('2021-03-15').getTime(),
      requestToken: '',
    },
    grants: [],
    guest: false,
    settings: {},
    score: 250,
    achievements: [],
    ...overrides,
  }) as unknown as User

describe('ProfileHeader', () => {
  it('renders the display name and formatted "user since" date', () => {
    const user = makeUser()
    render(<ProfileHeader user={user} showLivePoints={false} />)

    expect(screen.getByText('Jane Mapper')).toBeDefined()
    expect(screen.getByText('User since: March 2021')).toBeDefined()
  })

  it('omits the "user since" line when the user has no created date', () => {
    const user = makeUser({ created: 0 })
    render(<ProfileHeader user={user} showLivePoints={false} />)

    expect(screen.queryByText(/User since/)).toBeNull()
  })

  it('links to the OSM profile and OSMCha pages with the display name URL-encoded', () => {
    const user = makeUser({
      osmProfile: {
        ...makeUser().osmProfile,
        displayName: 'Jane & Mapper/Explorer',
      },
    })
    render(<ProfileHeader user={user} showLivePoints={false} />)

    const osmLink = screen.getByRole('link', { name: /OSM Profile/ })
    const osmChaLink = screen.getByRole('link', { name: /OSMCha/ })

    expect(osmLink.getAttribute('href')).toBe(
      'https://www.openstreetmap.org/user/Jane%20%26%20Mapper%2FExplorer'
    )
    expect(osmChaLink.getAttribute('href')).toBe(
      'https://osmcha.org/users/Jane%20%26%20Mapper%2FExplorer'
    )
    expect(osmLink.getAttribute('target')).toBe('_blank')
    expect(osmChaLink.getAttribute('target')).toBe('_blank')
  })

  it('shows the live points ticker when showLivePoints is true', () => {
    const user = makeUser()
    render(<ProfileHeader user={user} showLivePoints={true} />)

    expect(screen.getByTestId('points-ticker')).toBeDefined()
  })

  it('hides the live points ticker when showLivePoints is false (e.g. viewing another user)', () => {
    const user = makeUser()
    render(<ProfileHeader user={user} showLivePoints={false} />)

    expect(screen.queryByTestId('points-ticker')).toBeNull()
  })

  it('renders initials in the avatar fallback derived from the display name', () => {
    const user = makeUser({
      osmProfile: { ...makeUser().osmProfile, displayName: 'Alice Bob', avatarURL: '' },
    })
    render(<ProfileHeader user={user} showLivePoints={false} />)

    expect(screen.getByText('AB')).toBeDefined()
  })
})
