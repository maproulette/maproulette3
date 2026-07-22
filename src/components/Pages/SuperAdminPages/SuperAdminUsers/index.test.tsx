import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'

const { getAllUsersMock, getSuperUsersMock } = vi.hoisted(() => ({
  getAllUsersMock: vi.fn(),
  getSuperUsersMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      user: {
        ...actual.api.user,
        getAllUsers: getAllUsersMock,
        getSuperUsers: getSuperUsersMock,
      },
    },
  }
})

import { SuperAdminUsers } from './index'

const makeUser = (overrides: Partial<User>): User =>
  ({
    id: 1,
    created: new Date('2024-01-15').getTime(),
    modified: new Date('2024-01-15').getTime(),
    osmProfile: {
      id: 1001,
      displayName: 'TestUser',
      description: '',
      avatarURL: 'https://example.com/avatar.png',
      homeLocation: { latitude: 0, longitude: 0 },
      created: 0,
      requestToken: '',
    },
    grants: [],
    guest: false,
    settings: {},
    score: 0,
    ...overrides,
  }) as unknown as User

const superAdminUser = makeUser({
  id: 1,
  osmProfile: {
    id: 1001,
    displayName: 'AdminAlice',
    description: '',
    avatarURL: 'https://example.com/alice.png',
    homeLocation: { latitude: 0, longitude: 0 },
    created: 0,
    requestToken: '',
  },
  grants: [
    { id: 1, name: 'super', grantee: {}, role: -1, target: {} },
  ] as unknown as User['grants'],
  settings: { email: 'alice@example.com' } as unknown as User['settings'],
  score: 500,
})

const adminUser = makeUser({
  id: 2,
  osmProfile: {
    id: 1002,
    displayName: 'AdminBob',
    description: '',
    avatarURL: 'https://example.com/bob.png',
    homeLocation: { latitude: 0, longitude: 0 },
    created: 0,
    requestToken: '',
  },
  grants: [{ id: 2, name: 'admin', grantee: {}, role: 1, target: {} }] as unknown as User['grants'],
  settings: { email: 'bob@example.com' } as unknown as User['settings'],
  score: 250,
})

const regularUser = makeUser({
  id: 3,
  osmProfile: {
    id: 1003,
    displayName: 'RegularCarol',
    description: '',
    avatarURL: 'https://example.com/carol.png',
    homeLocation: { latitude: 0, longitude: 0 },
    created: 0,
    requestToken: '',
  },
  grants: [],
  settings: {} as unknown as User['settings'],
  score: null as unknown as number,
})

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  getSuperUsersMock.mockReturnValue({ data: [1], isLoading: false })
})

describe('SuperAdminUsers', () => {
  it('shows a loading message while users are being fetched', () => {
    getAllUsersMock.mockReturnValue({ data: undefined, isLoading: true })

    render(<SuperAdminUsers />)

    expect(screen.getByText('Loading users...')).toBeDefined()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('renders a table row for each user with role, email, score, and join date', () => {
    getAllUsersMock.mockReturnValue({
      data: [superAdminUser, adminUser, regularUser],
      isLoading: false,
    })

    render(<SuperAdminUsers />)

    expect(screen.getByText('AdminAlice')).toBeDefined()
    expect(screen.getByText('AdminBob')).toBeDefined()
    expect(screen.getByText('RegularCarol')).toBeDefined()

    expect(screen.getByText('alice@example.com')).toBeDefined()
    expect(screen.getByText('bob@example.com')).toBeDefined()
    // regularUser has no email set, so it falls back to N/A
    expect(screen.getByText('N/A')).toBeDefined()

    expect(screen.getByText('super admin')).toBeDefined()
    expect(screen.getByText('admin')).toBeDefined()
    expect(screen.getByText('user')).toBeDefined()

    // score fallback: regularUser's null score renders as 0
    expect(screen.getByText('500')).toBeDefined()
    expect(screen.getByText('250')).toBeDefined()
    expect(screen.getByText('0')).toBeDefined()
  })

  it('renders stats cards for users on page, filtered results, and super admins', () => {
    getAllUsersMock.mockReturnValue({
      data: [superAdminUser, adminUser, regularUser],
      isLoading: false,
    })
    getSuperUsersMock.mockReturnValue({ data: [1, 5], isLoading: false })

    render(<SuperAdminUsers />)

    expect(screen.getByText('Users on Page')).toBeDefined()
    expect(screen.getByText('Filtered Results')).toBeDefined()
    expect(screen.getByText('Super Admins')).toBeDefined()

    // 3 users on page, 3 filtered (no search query), 2 super admins
    const threes = screen.getAllByText('3')
    expect(threes.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('2')).toBeDefined()
  })

  it('filters the user list by display name as the user types', async () => {
    getAllUsersMock.mockReturnValue({
      data: [superAdminUser, adminUser, regularUser],
      isLoading: false,
    })

    const user = userEvent.setup()
    render(<SuperAdminUsers />)

    await user.type(screen.getByPlaceholderText('Search users by name or email...'), 'AdminBob')

    expect(screen.getByText('AdminBob')).toBeDefined()
    expect(screen.queryByText('AdminAlice')).toBeNull()
    expect(screen.queryByText('RegularCarol')).toBeNull()
  })

  it('filters the user list by email as the user types', async () => {
    getAllUsersMock.mockReturnValue({
      data: [superAdminUser, adminUser, regularUser],
      isLoading: false,
    })

    const user = userEvent.setup()
    render(<SuperAdminUsers />)

    await user.type(
      screen.getByPlaceholderText('Search users by name or email...'),
      'alice@example.com'
    )

    expect(screen.getByText('AdminAlice')).toBeDefined()
    expect(screen.queryByText('AdminBob')).toBeNull()
  })

  it('shows an empty state when no users match the search query', async () => {
    getAllUsersMock.mockReturnValue({
      data: [superAdminUser, adminUser, regularUser],
      isLoading: false,
    })

    const user = userEvent.setup()
    render(<SuperAdminUsers />)

    await user.type(screen.getByPlaceholderText('Search users by name or email...'), 'no-such-user')

    expect(screen.getByText('No users found')).toBeDefined()
    expect(screen.getByText('Try adjusting your search query.')).toBeDefined()
  })

  it('disables the Previous button on the first page and requests the next page when Next is clicked', async () => {
    // A full page (50 users) so the Next button becomes enabled.
    const fullPage = Array.from({ length: 50 }, (_, i) =>
      makeUser({
        id: i + 1,
        osmProfile: {
          id: 2000 + i,
          displayName: `User${i}`,
          description: '',
          avatarURL: '',
          homeLocation: { latitude: 0, longitude: 0 },
          created: 0,
          requestToken: '',
        },
      })
    )
    getAllUsersMock.mockReturnValue({ data: fullPage, isLoading: false })

    const user = userEvent.setup()
    render(<SuperAdminUsers />)

    const previousButton = screen.getByRole('button', { name: /Previous/ })
    const nextButton = screen.getByRole('button', { name: /Next/ })

    expect(previousButton.hasAttribute('disabled')).toBe(true)
    expect(nextButton.hasAttribute('disabled')).toBe(false)

    await user.click(nextButton)

    expect(getAllUsersMock).toHaveBeenLastCalledWith({ limit: 50, page: 1 })
  })

  it('disables the Next button when the returned page is not full', () => {
    getAllUsersMock.mockReturnValue({ data: [superAdminUser], isLoading: false })

    render(<SuperAdminUsers />)

    expect(screen.getByRole('button', { name: /Next/ }).hasAttribute('disabled')).toBe(true)
  })
})
