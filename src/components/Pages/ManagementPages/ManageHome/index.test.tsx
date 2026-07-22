import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ManageHome } from './index'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      ...props
    }: { children?: React.ReactNode; to?: string } & Record<string, unknown>) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const regularUser = { grants: [] } as unknown as User
const superUser = { grants: [{ role: -1 }] } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ManageHome', () => {
  it('renders Projects and Challenges cards for a regular user', () => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageHome />)

    expect(screen.getByText('Projects')).toBeDefined()
    expect(screen.getByText('Challenges')).toBeDefined()
  })

  it('does not render the Tasks card for a regular (non-super) user', () => {
    useAuthContextMock.mockReturnValue({
      user: regularUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageHome />)

    expect(screen.queryByText('Tasks')).toBeNull()
  })

  it('does not render the Tasks card when there is no logged-in user', () => {
    useAuthContextMock.mockReturnValue({
      user: undefined,
      isAuthenticated: false,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageHome />)

    expect(screen.queryByText('Tasks')).toBeNull()
  })

  it('renders the Tasks card for a super user', () => {
    useAuthContextMock.mockReturnValue({
      user: superUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageHome />)

    expect(screen.getByText('Tasks')).toBeDefined()
  })

  it('links each card to the correct destination', () => {
    useAuthContextMock.mockReturnValue({
      user: superUser,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageHome />)

    expect(screen.getByRole('link', { name: /projects/i }).getAttribute('href')).toBe(
      '/manage/projects'
    )
    expect(screen.getByRole('link', { name: /challenges/i }).getAttribute('href')).toBe(
      '/manage/challenges'
    )
    expect(screen.getByRole('link', { name: /tasks/i }).getAttribute('href')).toBe('/manage/tasks')
  })
})
