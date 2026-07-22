import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { ManageChallenges } from './index'

const { listingMock, getManagedProjectsMock, getChallengeStatsMock, useAuthContextMock } =
  vi.hoisted(() => ({
    listingMock: vi.fn(),
    getManagedProjectsMock: vi.fn(),
    getChallengeStatsMock: vi.fn(),
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

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        listing: listingMock,
        getChallengeStats: getChallengeStatsMock,
        useDeleteChallenge: () => ({ mutate: vi.fn(), isPending: false }),
        useArchiveChallenge: () => ({ mutate: vi.fn(), isPending: false }),
        useRebuildChallenge: () => ({ mutate: vi.fn(), isPending: false }),
        useUpdateChallenge: () => ({ mutate: vi.fn(), isPending: false }),
      },
      project: {
        ...actual.api.project,
        getManagedProjects: getManagedProjectsMock,
      },
      user: {
        ...actual.api.user,
        useUpdateUserSettings: () => ({ mutate: vi.fn(), isPending: false }),
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

const fakeUser = { id: 99, settings: {}, properties: {} } as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  getManagedProjectsMock.mockReturnValue({ data: [{ id: 10 }], isLoading: false })
  getChallengeStatsMock.mockReturnValue({ data: undefined })
  useAuthContextMock.mockReturnValue({
    user: fakeUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

describe('ManageChallenges (index)', () => {
  it('wires the provider and content together, rendering real challenge data', () => {
    listingMock.mockReturnValue({
      data: [{ id: 1, name: 'Fix sidewalks', parent: 10 } as unknown as Challenge],
      isLoading: false,
    })

    render(<ManageChallenges />)

    expect(screen.getByText('Fix sidewalks')).toBeDefined()
  })

  it('renders the empty state when the provider has no challenges', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })

    render(<ManageChallenges />)

    expect(screen.getByText('No challenges found')).toBeDefined()
  })
})
