import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { Dashboard } from './index'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('./DashboardContent', () => ({
  DashboardContent: () => <div>DashboardContentStub</div>,
}))

const fakeUser = { id: 1 } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Dashboard (index)', () => {
  it('shows the sign-in screen instead of dashboard content when there is no user', () => {
    useAuthContextMock.mockReturnValue({ user: undefined, login: vi.fn() })

    render(<Dashboard />)

    expect(screen.getByText('Please sign in')).toBeDefined()
    expect(screen.queryByText('DashboardContentStub')).toBeNull()
  })

  it('renders dashboard content once authenticated', () => {
    useAuthContextMock.mockReturnValue({ user: fakeUser, login: vi.fn() })

    render(<Dashboard />)

    expect(screen.getByText('DashboardContentStub')).toBeDefined()
    expect(screen.queryByText('Please sign in')).toBeNull()
  })
})
