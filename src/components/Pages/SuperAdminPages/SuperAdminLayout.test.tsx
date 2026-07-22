import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet-content">outlet content</div>,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate-mock">{to}</div>,
  Link: ({ to, children }: { to: string; children?: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useMatches: () => [],
  useRouterState: () => '/super-admin',
}))

import { SuperAdminLayout } from './SuperAdminLayout'

const superAdminUser = {
  osmProfile: { id: 1, displayName: 'SuperAdminUser' },
  grants: [{ id: 1, name: 'super', grantee: {}, role: -1, target: {} }],
} as unknown as User

const regularUser = {
  osmProfile: { id: 2, displayName: 'RegularUser' },
  grants: [],
} as unknown as User

const baseAuthValue = {
  isAuthenticated: true,
  authLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
}

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SuperAdminLayout', () => {
  it('renders the section header and outlet content for a super admin user', () => {
    useAuthContextMock.mockReturnValue({ ...baseAuthValue, user: superAdminUser })

    render(<SuperAdminLayout />)

    expect(screen.getByText('Super Admin')).toBeDefined()
    expect(screen.getByTestId('outlet-content')).toBeDefined()
    expect(screen.queryByTestId('navigate-mock')).toBeNull()
    expect(
      screen.queryByText(
        'You do not have permission to access this area. Super admin privileges are required.'
      )
    ).toBeNull()
  })

  it('shows an access-denied message and withholds outlet content for a non-super-admin user', () => {
    useAuthContextMock.mockReturnValue({ ...baseAuthValue, user: regularUser })

    render(<SuperAdminLayout />)

    expect(screen.getByText('Access Denied')).toBeDefined()
    expect(
      screen.getByText(
        'You do not have permission to access this area. Super admin privileges are required.'
      )
    ).toBeDefined()
    expect(screen.queryByTestId('outlet-content')).toBeNull()
    expect(screen.queryByText('Super Admin')).toBeNull()
  })

  it('redirects to the home page when there is no logged-in user', () => {
    useAuthContextMock.mockReturnValue({ ...baseAuthValue, user: undefined })

    render(<SuperAdminLayout />)

    const navigate = screen.getByTestId('navigate-mock')
    expect(navigate.textContent).toBe('/')
    expect(screen.queryByTestId('outlet-content')).toBeNull()
    expect(screen.queryByText('Access Denied')).toBeNull()
  })
})
