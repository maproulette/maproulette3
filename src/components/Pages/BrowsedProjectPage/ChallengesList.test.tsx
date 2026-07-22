import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildPropertiesWithPinnedChallenges } from '@/components/Pages/ManagementPages/ManageProjects/pinnedProjects'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import type { User } from '@/types/User'

interface LinkMockProps {
  to: string
  params?: Record<string, string>
  children?: ReactNode
  className?: string
}

const {
  getProjectChallengesMock,
  getChallengeStatsMock,
  useUpdateUserSettingsMock,
  useAuthContextMock,
  useBrowsedProjectContextMock,
  updateSettingsMutateMock,
} = vi.hoisted(() => ({
  getProjectChallengesMock: vi.fn(),
  getChallengeStatsMock: vi.fn(),
  useUpdateUserSettingsMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  useBrowsedProjectContextMock: vi.fn(),
  updateSettingsMutateMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      project: {
        ...actual.api.project,
        getProjectChallenges: getProjectChallengesMock,
      },
      challenge: {
        ...actual.api.challenge,
        getChallengeStats: getChallengeStatsMock,
      },
      user: {
        ...actual.api.user,
        useUpdateUserSettings: useUpdateUserSettingsMock,
      },
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: useAuthContextMock,
}))

vi.mock('@/components/Pages/BrowsedProjectPage/contexts/BrowsedProjectContext', () => ({
  useBrowsedProjectContext: useBrowsedProjectContextMock,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children, className }: LinkMockProps) => {
    const href = params ? Object.values(params).reduce((p, v) => p.replace(/\$\w+/, v), to) : to
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

import { ChallengesList } from './ChallengesList'

const makeChallenge = (overrides: Partial<Challenge> & { id: number; name: string }): Challenge =>
  ({
    difficulty: 1,
    parent: 1,
    completionPercentage: 0,
    completionMetrics: { tasksRemaining: 0 },
    ...overrides,
  }) as unknown as Challenge

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    settings: {},
    properties: {},
    ...overrides,
  }) as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  getChallengeStatsMock.mockReturnValue({ data: undefined })
  useBrowsedProjectContextMock.mockReturnValue({ project: { id: 5 } as Project })
  useUpdateUserSettingsMock.mockReturnValue({
    mutate: updateSettingsMutateMock,
    isPending: false,
  })
  useAuthContextMock.mockReturnValue({
    user: undefined,
    isAuthenticated: false,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

describe('ChallengesList', () => {
  it('shows the empty state when the project has no challenges', () => {
    getProjectChallengesMock.mockReturnValue({ data: [] })

    render(<ChallengesList />)

    expect(screen.getByText('No challenges found')).toBeDefined()
    expect(screen.getByText('This project has no challenges yet.')).toBeDefined()
  })

  it('renders a card for every challenge returned by the API', () => {
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix the Roads' }),
        makeChallenge({ id: 2, name: 'Fix the Bridges' }),
      ],
    })

    render(<ChallengesList />)

    expect(screen.getByText('Fix the Roads')).toBeDefined()
    expect(screen.getByText('Fix the Bridges')).toBeDefined()
  })

  it('filters the visible challenges by search query', async () => {
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix the Roads' }),
        makeChallenge({ id: 2, name: 'Repair Bridges' }),
      ],
    })

    render(<ChallengesList />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Search challenges…'), 'roads')

    expect(screen.getByText('Fix the Roads')).toBeDefined()
    expect(screen.queryByText('Repair Bridges')).toBeNull()
  })

  it('shows the filtered empty state description when a search matches nothing', async () => {
    getProjectChallengesMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix the Roads' })],
    })

    render(<ChallengesList />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Search challenges…'), 'nonexistent')

    expect(screen.getByText('No challenges found')).toBeDefined()
    expect(screen.getByText('Try clearing the filters to see more results.')).toBeDefined()
  })

  it('hides completed challenges when "Show completed" is toggled off', async () => {
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({
          id: 1,
          name: 'Completed Challenge',
          completionMetrics: { tasksRemaining: 0 } as Challenge['completionMetrics'],
        }),
        makeChallenge({
          id: 2,
          name: 'In Progress Challenge',
          completionMetrics: { tasksRemaining: 3 } as Challenge['completionMetrics'],
        }),
      ],
    })

    render(<ChallengesList />)
    const user = userEvent.setup()

    expect(screen.getByText('Completed Challenge')).toBeDefined()

    await user.click(screen.getByText('Show completed'))

    expect(screen.queryByText('Completed Challenge')).toBeNull()
    expect(screen.getByText('In Progress Challenge')).toBeDefined()
  })

  it('does not show the "Pinned" filter or per-card pin buttons when there is no logged-in user', () => {
    getProjectChallengesMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix the Roads' })],
    })

    render(<ChallengesList />)

    expect(screen.queryByText('Pinned')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Pin challenge' })).toBeNull()
  })

  it('filters to only pinned challenges when the "Pinned" filter is enabled', async () => {
    useAuthContextMock.mockReturnValue({
      user: makeUser({
        properties: { mr4: { settings: { pinned: { challenges: [2] } } } },
      }),
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Unpinned Challenge' }),
        makeChallenge({ id: 2, name: 'Pinned Challenge' }),
      ],
    })

    render(<ChallengesList />)
    const user = userEvent.setup()

    await user.click(screen.getByText('Pinned'))

    expect(screen.queryByText('Unpinned Challenge')).toBeNull()
    expect(screen.getByText('Pinned Challenge')).toBeDefined()
  })

  it('resets all active filters when "Clear filters" is clicked', async () => {
    getProjectChallengesMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix the Roads' }),
        makeChallenge({ id: 2, name: 'Repair Bridges' }),
      ],
    })

    render(<ChallengesList />)
    const user = userEvent.setup()
    const searchInput = screen.getByPlaceholderText('Search challenges…')

    await user.type(searchInput, 'roads')
    expect(screen.queryByText('Repair Bridges')).toBeNull()

    const clearButton = screen.getByRole('button', { name: /clear filters/i }) as HTMLButtonElement
    expect(clearButton.disabled).toBe(false)

    await user.click(clearButton)

    expect((searchInput as HTMLInputElement).value).toBe('')
    expect(screen.getByText('Repair Bridges')).toBeDefined()
    expect(
      (screen.getByRole('button', { name: /clear filters/i }) as HTMLButtonElement).disabled
    ).toBe(true)
  })

  it('calls the update-settings mutation with the pinned challenge added when pinning', async () => {
    const user = makeUser({ id: 1, settings: { locale: 'en-US' } })
    useAuthContextMock.mockReturnValue({
      user,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    getProjectChallengesMock.mockReturnValue({
      data: [makeChallenge({ id: 7, name: 'Fix the Roads' })],
    })

    render(<ChallengesList />)
    const userEventInstance = userEvent.setup()

    await userEventInstance.click(screen.getByRole('button', { name: 'Pin challenge' }))

    expect(updateSettingsMutateMock).toHaveBeenCalledWith({
      userId: 1,
      settings: { locale: 'en-US' },
      properties: buildPropertiesWithPinnedChallenges(user, [7]),
    })
  })

  it('calls the update-settings mutation with the challenge removed when unpinning', async () => {
    const user = makeUser({
      id: 1,
      properties: { mr4: { settings: { pinned: { challenges: [7] } } } },
    })
    useAuthContextMock.mockReturnValue({
      user,
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    getProjectChallengesMock.mockReturnValue({
      data: [makeChallenge({ id: 7, name: 'Fix the Roads' })],
    })

    render(<ChallengesList />)
    const userEventInstance = userEvent.setup()

    await userEventInstance.click(screen.getByRole('button', { name: 'Unpin challenge' }))

    expect(updateSettingsMutateMock).toHaveBeenCalledWith({
      userId: 1,
      settings: {},
      properties: buildPropertiesWithPinnedChallenges(user, []),
    })
  })
})
