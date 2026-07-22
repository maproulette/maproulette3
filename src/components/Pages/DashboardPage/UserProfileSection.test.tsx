import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { daysSince, formatDate } from '@/lib/date'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { UserProfileSection } from './UserProfileSection'

afterEach(() => cleanup())

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    created: new Date('2020-01-01T00:00:00Z').getTime(),
    modified: new Date('2020-01-01T00:00:00Z').getTime(),
    osmProfile: {
      id: 1,
      displayName: 'Jane Mapper',
      avatarURL: '',
    },
    grants: [],
    guest: false,
    score: 300,
    ...overrides,
  }) as unknown as User

describe('UserProfileSection', () => {
  it('renders the display name and avatar fallback initials', () => {
    render(
      <UserProfileSection
        user={makeUser({ osmProfile: { displayName: 'Jane Mapper' } as User['osmProfile'] })}
      />
    )

    expect(screen.getByText('Jane Mapper')).toBeDefined()
    expect(screen.getByText('JM')).toBeDefined()
  })

  it('shows a Verified badge for a non-guest user', () => {
    render(<UserProfileSection user={makeUser({ guest: false })} />)

    expect(screen.getByText('Verified')).toBeDefined()
    expect(screen.queryByText('Guest')).toBeNull()
  })

  it('shows a Guest badge for a guest user', () => {
    render(<UserProfileSection user={makeUser({ guest: true })} />)

    expect(screen.getByText('Guest')).toBeDefined()
    expect(screen.queryByText('Verified')).toBeNull()
  })

  it('computes and displays the level, title, points, and progress from the score', () => {
    render(<UserProfileSection user={makeUser({ score: 300 })} />)

    // calculateLevel(300) = floor(sqrt(30)) = 5; getLevelInfo(5) = Apprentice Mapper
    expect(screen.getByText('5')).toBeDefined() // level badge over avatar
    expect(screen.getByText('Level 5')).toBeDefined()
    expect(screen.getByText('300 pts')).toBeDefined()
    expect(screen.getByText('🔰 Apprentice Mapper')).toBeDefined()
    // pointsIntoLevel = 300 - 250 = 50, pointsNeededForLevel = 360 - 250 = 110
    expect(screen.getByText('50 / 110 to next level')).toBeDefined()
  })

  it('treats a missing score as 0', () => {
    render(<UserProfileSection user={makeUser({ score: undefined })} />)

    expect(screen.getByText('Level 1')).toBeDefined()
    expect(screen.getByText('0 pts')).toBeDefined()
  })

  it('renders the joined date and account age from the created timestamp', () => {
    const created = new Date('2020-01-01T00:00:00Z')
    render(<UserProfileSection user={makeUser({ created: created.getTime() })} />)

    expect(screen.getByText(formatDate(created))).toBeDefined()
    expect(screen.getByText(`${daysSince(created)} days`)).toBeDefined()
  })

  it('renders placeholders when created is falsy', () => {
    render(<UserProfileSection user={makeUser({ created: 0 })} />)

    const placeholders = screen.getAllByText('—')
    expect(placeholders.length).toBe(2)
  })

  it('opens the LevelModal when the level title button is clicked, and closes it via the close button', async () => {
    const user = userEvent.setup()
    render(<UserProfileSection user={makeUser({ score: 300 })} />)

    expect(screen.queryByText('Mapper Level System')).toBeNull()

    await user.click(screen.getByRole('button', { name: '🔰 Apprentice Mapper' }))

    expect(screen.getByText('Mapper Level System')).toBeDefined()

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(screen.queryByText('Mapper Level System')).toBeNull()
  })

  it('opens the LevelModal when the progress bar area is clicked', async () => {
    const user = userEvent.setup()
    render(<UserProfileSection user={makeUser({ score: 300 })} />)

    await user.click(screen.getByText('50 / 110 to next level'))

    expect(screen.getByText('Mapper Level System')).toBeDefined()
  })
})
