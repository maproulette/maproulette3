import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { DashboardContent } from './DashboardContent'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('./ContributionsSection', () => ({
  ContributionsSection: () => <div>ContributionsStub</div>,
}))

vi.mock('./LockedTasksSection', () => ({
  LockedTasksSection: ({ userId }: { userId: number }) => <div>LockedTasksStub:{userId}</div>,
}))

vi.mock('./SavedChallengesSection', () => ({
  SavedChallengesSection: ({ userId }: { userId: number }) => (
    <div>SavedChallengesStub:{userId}</div>
  ),
}))

vi.mock('./TeamsSection', () => ({
  TeamsSection: ({ userId }: { userId: number }) => <div>TeamsStub:{userId}</div>,
}))

vi.mock('./UserProfileSection', () => ({
  UserProfileSection: ({ user }: { user: { id: number } }) => <div>UserProfileStub:{user.id}</div>,
}))

const fakeUser = { id: 7 } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardContent', () => {
  it('renders nothing when there is no authenticated user', () => {
    useAuthContextMock.mockReturnValue({ user: undefined })

    const { container } = render(<DashboardContent />)

    expect(container.innerHTML).toBe('')
  })

  it('renders every dashboard section, passing the user id down to each', () => {
    useAuthContextMock.mockReturnValue({ user: fakeUser })

    render(<DashboardContent />)

    expect(screen.getByText('ContributionsStub')).toBeDefined()
    expect(screen.getByText('LockedTasksStub:7')).toBeDefined()
    expect(screen.getByText('SavedChallengesStub:7')).toBeDefined()
    expect(screen.getByText('TeamsStub:7')).toBeDefined()
    expect(screen.getByText('UserProfileStub:7')).toBeDefined()
  })
})
