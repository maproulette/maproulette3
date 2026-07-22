import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { ManageChallengesContent } from './ManageChallengesContent'
import { ManageChallengesProvider } from './ManageChallengesContext'

const {
  listingMock,
  getManagedProjectsMock,
  getChallengeStatsMock,
  useUpdateUserSettingsMock,
  useDeleteChallengeMock,
  useArchiveChallengeMock,
  useRebuildChallengeMock,
  useUpdateChallengeMock,
  useAuthContextMock,
  deleteChallengeMutate,
  archiveChallengeMutate,
  rebuildChallengeMutate,
  updateChallengeMutate,
} = vi.hoisted(() => ({
  listingMock: vi.fn(),
  getManagedProjectsMock: vi.fn(),
  getChallengeStatsMock: vi.fn(),
  useUpdateUserSettingsMock: vi.fn(),
  useDeleteChallengeMock: vi.fn(),
  useArchiveChallengeMock: vi.fn(),
  useRebuildChallengeMock: vi.fn(),
  useUpdateChallengeMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  deleteChallengeMutate: vi.fn(),
  archiveChallengeMutate: vi.fn(),
  rebuildChallengeMutate: vi.fn(),
  updateChallengeMutate: vi.fn(),
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
        useDeleteChallenge: useDeleteChallengeMock,
        useArchiveChallenge: useArchiveChallengeMock,
        useRebuildChallenge: useRebuildChallengeMock,
        useUpdateChallenge: useUpdateChallengeMock,
      },
      project: {
        ...actual.api.project,
        getManagedProjects: getManagedProjectsMock,
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

const makeChallenge = (overrides: Partial<Challenge> = {}): Challenge =>
  ({
    id: 1,
    name: 'Fix sidewalks',
    enabled: false,
    isArchived: false,
    parent: 10,
    difficulty: 1,
    completionMetrics: {
      total: 10,
      available: 5,
      fixed: 5,
      falsePositive: 0,
      skipped: 0,
      deleted: 0,
      alreadyFixed: 0,
      tooHard: 0,
      answered: 0,
      validated: 0,
      disabled: 0,
      tasksRemaining: 5,
    },
    ...overrides,
  }) as unknown as Challenge

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
  useUpdateUserSettingsMock.mockReturnValue({ mutate: vi.fn(), isPending: false })
  useDeleteChallengeMock.mockReturnValue({ mutate: deleteChallengeMutate, isPending: false })
  useArchiveChallengeMock.mockReturnValue({ mutate: archiveChallengeMutate, isPending: false })
  useRebuildChallengeMock.mockReturnValue({ mutate: rebuildChallengeMutate, isPending: false })
  useUpdateChallengeMock.mockReturnValue({ mutate: updateChallengeMutate, isPending: false })
})

const renderContent = () =>
  render(
    <ManageChallengesProvider>
      <ManageChallengesContent />
    </ManageChallengesProvider>
  )

describe('ManageChallengesContent', () => {
  it('renders a card for each challenge when populated', () => {
    listingMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix sidewalks' }),
        makeChallenge({ id: 2, name: 'Repair benches' }),
      ],
      isLoading: false,
    })

    renderContent()

    expect(screen.getByText('Fix sidewalks')).toBeDefined()
    expect(screen.getByText('Repair benches')).toBeDefined()
  })

  it('shows the empty state when there are no challenges', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })

    renderContent()

    expect(screen.getByText('No challenges found')).toBeDefined()
  })

  it('renders nothing in the grid area while loading', () => {
    listingMock.mockReturnValue({ data: undefined, isLoading: true })

    renderContent()

    expect(screen.queryByText('No challenges found')).toBeNull()
    expect(screen.queryByText('Fix sidewalks')).toBeNull()
  })

  it('filters the visible challenges as the user types in the search bar', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix sidewalks' }),
        makeChallenge({ id: 2, name: 'Repair benches' }),
      ],
      isLoading: false,
    })

    renderContent()

    await user.type(screen.getByPlaceholderText('Search challenges...'), 'benches')

    expect(screen.queryByText('Fix sidewalks')).toBeNull()
    expect(screen.getByText('Repair benches')).toBeDefined()
  })

  it('filters to only discoverable challenges via the toggle', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Enabled challenge', enabled: true }),
        makeChallenge({ id: 2, name: 'Disabled challenge', enabled: false }),
      ],
      isLoading: false,
    })

    renderContent()

    await user.click(screen.getByText('Discoverable'))

    expect(screen.getByText('Enabled challenge')).toBeDefined()
    expect(screen.queryByText('Disabled challenge')).toBeNull()
  })

  it('opens a delete confirmation dialog and calls the delete mutation on confirm', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix sidewalks' })],
      isLoading: false,
    })

    renderContent()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByText('Delete challenge'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('Delete challenge?')).toBeDefined()

    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(deleteChallengeMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        onSettled: expect.any(Function),
      })
    )
  })

  it('does not call the delete mutation when the confirmation dialog is cancelled', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix sidewalks' })],
      isLoading: false,
    })

    renderContent()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByText('Delete challenge'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(deleteChallengeMutate).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('archives a challenge from the row menu', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix sidewalks', isArchived: false })],
      isLoading: false,
    })

    renderContent()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByText('Archive challenge'))

    expect(archiveChallengeMutate).toHaveBeenCalledWith({ challengeId: 1, isArchived: true })
  })

  it('rebuilds tasks for a challenge from the row menu', async () => {
    const user = userEvent.setup()
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1, name: 'Fix sidewalks' })],
      isLoading: false,
    })

    renderContent()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByText('Rebuild tasks'))

    expect(rebuildChallengeMutate).toHaveBeenCalledWith({ challengeId: 1 })
  })
})
