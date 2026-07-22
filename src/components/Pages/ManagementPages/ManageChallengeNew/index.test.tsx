import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { User } from '@/types/User'
import { ManageChallengeNew } from './index.tsx'

const { createChallengeFormProviderMock, useAuthContextMock } = vi.hoisted(() => ({
  createChallengeFormProviderMock: vi.fn(),
  useAuthContextMock: vi.fn(),
}))

// Stub ChallengeForm itself — its behavior is covered by ChallengeForm.test.tsx;
// here we only care about how the index page wires things up around it.
vi.mock('@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm', () => ({
  ChallengeForm: () => <div data-testid="challenge-form-stub" />,
}))

// Stub CreateChallengeFormProvider so we can inspect what projectId it's
// given, without needing a router/query-client context for its real
// mutations/navigation.
vi.mock('@/contexts/ChallengeFormContext', () => ({
  CreateChallengeFormProvider: (props: { projectId?: number; children: React.ReactNode }) => {
    createChallengeFormProviderMock(props.projectId)
    return <>{props.children}</>
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const fakeUser = { osmProfile: { id: 1, displayName: 'TestUser' }, grants: [] } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

describe('ManageChallengeNew (index)', () => {
  it('renders the FormCard title, description and the ChallengeForm', () => {
    render(<ManageChallengeNew />)

    expect(screen.getByText('Create New Challenge')).toBeDefined()
    expect(
      screen.getByText('Fill in the information below to create your new challenge')
    ).toBeDefined()
    expect(screen.getByTestId('challenge-form-stub')).toBeDefined()
  })

  it('passes the given projectId through to CreateChallengeFormProvider', () => {
    render(<ManageChallengeNew projectId={42} />)

    expect(createChallengeFormProviderMock).toHaveBeenCalledWith(42)
  })

  it('passes undefined to CreateChallengeFormProvider when no projectId prop is given', () => {
    render(<ManageChallengeNew />)

    expect(createChallengeFormProviderMock).toHaveBeenCalledWith(undefined)
  })

  it('shows the sign-in screen instead of the form when there is no authenticated user', () => {
    useAuthContextMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<ManageChallengeNew />)

    expect(screen.getByText('Please sign in')).toBeDefined()
    expect(screen.queryByTestId('challenge-form-stub')).toBeNull()
  })
})
