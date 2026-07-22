import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ManageTaskNew } from './index'

const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

afterEach(() => cleanup())

describe('ManageTaskNew', () => {
  it('renders the placeholder title, description, and body copy for an authenticated user', () => {
    useAuthContextMock.mockReturnValue({
      user: { grants: [] } as unknown as User,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageTaskNew />)

    expect(screen.getByText('New Task')).toBeDefined()
    expect(screen.getByText('Task management functionality is under development')).toBeDefined()
    expect(screen.getByText(/Tasks are typically created in bulk through challenges/)).toBeDefined()
  })

  it('renders the sign-in prompt instead of the form for an unauthenticated user', () => {
    useAuthContextMock.mockReturnValue({
      user: undefined,
      isAuthenticated: false,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageTaskNew />)

    expect(screen.queryByText('New Task')).toBeNull()
  })
})
