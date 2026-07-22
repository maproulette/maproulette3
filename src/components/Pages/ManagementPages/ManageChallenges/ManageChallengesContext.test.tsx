import { act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook } from '@/test/testUtils'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'
import { ManageChallengesProvider, useManageChallengesContext } from './ManageChallengesContext'

const {
  listingMock,
  getManagedProjectsMock,
  useUpdateUserSettingsMock,
  useDeleteChallengeMock,
  useArchiveChallengeMock,
  useRebuildChallengeMock,
  useUpdateChallengeMock,
  useAuthContextMock,
  updateSettingsMutate,
  deleteChallengeMutate,
  archiveChallengeMutate,
  rebuildChallengeMutate,
  updateChallengeMutate,
} = vi.hoisted(() => ({
  listingMock: vi.fn(),
  getManagedProjectsMock: vi.fn(),
  useUpdateUserSettingsMock: vi.fn(),
  useDeleteChallengeMock: vi.fn(),
  useArchiveChallengeMock: vi.fn(),
  useRebuildChallengeMock: vi.fn(),
  useUpdateChallengeMock: vi.fn(),
  useAuthContextMock: vi.fn(),
  updateSettingsMutate: vi.fn(),
  deleteChallengeMutate: vi.fn(),
  archiveChallengeMutate: vi.fn(),
  rebuildChallengeMutate: vi.fn(),
  updateChallengeMutate: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        listing: listingMock,
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
    ...overrides,
  }) as unknown as Challenge

const makeUser = (pinnedChallengeIds: number[] = []): User =>
  ({
    id: 99,
    settings: {},
    properties: {
      mr4: {
        settings: {
          pinned: {
            challenges: pinnedChallengeIds,
          },
        },
      },
    },
  }) as unknown as User

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  getManagedProjectsMock.mockReturnValue({
    data: [{ id: 10 }, { id: 20 }],
    isLoading: false,
  })
  useAuthContextMock.mockReturnValue({
    user: makeUser(),
    isAuthenticated: true,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  useUpdateUserSettingsMock.mockReturnValue({ mutate: updateSettingsMutate, isPending: false })
  useDeleteChallengeMock.mockReturnValue({ mutate: deleteChallengeMutate, isPending: false })
  useArchiveChallengeMock.mockReturnValue({ mutate: archiveChallengeMutate, isPending: false })
  useRebuildChallengeMock.mockReturnValue({ mutate: rebuildChallengeMutate, isPending: false })
  useUpdateChallengeMock.mockReturnValue({ mutate: updateChallengeMutate, isPending: false })
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <ManageChallengesProvider>{children}</ManageChallengesProvider>
)

describe('ManageChallengesContext', () => {
  it('exposes all challenges unfiltered by default', () => {
    const challenges = [
      makeChallenge({ id: 1, name: 'Fix sidewalks' }),
      makeChallenge({ id: 2, name: 'Repair benches' }),
    ]
    listingMock.mockReturnValue({ data: challenges, isLoading: false })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    expect(result.current.challenges).toHaveLength(2)
    expect(result.current.filteredChallenges).toHaveLength(2)
    expect(result.current.isLoading).toBe(false)
  })

  it('is loading when either the projects or challenges query is loading', () => {
    listingMock.mockReturnValue({ data: undefined, isLoading: true })
    getManagedProjectsMock.mockReturnValue({ data: [], isLoading: false })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('filters challenges by a case-insensitive search query', () => {
    listingMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, name: 'Fix Sidewalks' }),
        makeChallenge({ id: 2, name: 'Repair benches' }),
      ],
      isLoading: false,
    })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.setSearchQuery('sidewalk'))

    expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([1])
  })

  it('filters to only discoverable (enabled) challenges', () => {
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1, enabled: true }), makeChallenge({ id: 2, enabled: false })],
      isLoading: false,
    })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.setOnlyDiscoverable(true))

    expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([1])
  })

  it('filters to only archived challenges', () => {
    listingMock.mockReturnValue({
      data: [
        makeChallenge({ id: 1, isArchived: true }),
        makeChallenge({ id: 2, isArchived: false }),
      ],
      isLoading: false,
    })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.setOnlyArchived(true))

    expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([1])
  })

  it('filters to only pinned challenges using the pinned ids from user settings', () => {
    useAuthContextMock.mockReturnValue({
      user: makeUser([2]),
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    listingMock.mockReturnValue({
      data: [makeChallenge({ id: 1 }), makeChallenge({ id: 2 })],
      isLoading: false,
    })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    expect(result.current.pinnedChallengeIds).toEqual([2])

    act(() => result.current.setOnlyPinned(true))

    expect(result.current.filteredChallenges.map((c) => c.id)).toEqual([2])
  })

  it('toggleChallengePin adds an unpinned challenge to the pinned list', () => {
    useAuthContextMock.mockReturnValue({
      user: makeUser([]),
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    listingMock.mockReturnValue({ data: [makeChallenge({ id: 5 })], isLoading: false })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.toggleChallengePin(5))

    expect(updateSettingsMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 99,
        properties: expect.objectContaining({
          mr4: expect.objectContaining({
            settings: expect.objectContaining({
              pinned: expect.objectContaining({ challenges: [5] }),
            }),
          }),
        }),
      })
    )
  })

  it('toggleChallengePin removes an already-pinned challenge', () => {
    useAuthContextMock.mockReturnValue({
      user: makeUser([5, 6]),
      isAuthenticated: true,
      authLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
    listingMock.mockReturnValue({ data: [makeChallenge({ id: 5 })], isLoading: false })

    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.toggleChallengePin(5))

    expect(updateSettingsMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          mr4: expect.objectContaining({
            settings: expect.objectContaining({
              pinned: expect.objectContaining({ challenges: [6] }),
            }),
          }),
        }),
      })
    )
  })

  it('confirmDeleteChallenge does nothing when no challenge is staged for deletion', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })
    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.confirmDeleteChallenge())

    expect(deleteChallengeMutate).not.toHaveBeenCalled()
  })

  it('confirmDeleteChallenge deletes the staged challenge and clears it on settle', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })
    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.setDeleteChallengeId(7))
    expect(result.current.deleteChallengeId).toBe(7)

    act(() => result.current.confirmDeleteChallenge())

    expect(deleteChallengeMutate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        onSettled: expect.any(Function),
      })
    )

    const { onSettled } = deleteChallengeMutate.mock.calls[0][1]
    act(() => onSettled())

    expect(result.current.deleteChallengeId).toBeNull()
  })

  it('toggleChallengeEnabled flips the enabled flag via the update mutation', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })
    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.toggleChallengeEnabled(makeChallenge({ id: 3, enabled: false })))

    expect(updateChallengeMutate).toHaveBeenCalledWith({
      challengeId: 3,
      updates: { enabled: true },
    })
  })

  it('archiveChallenge flips the isArchived flag via the archive mutation', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })
    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.archiveChallenge(makeChallenge({ id: 3, isArchived: false })))

    expect(archiveChallengeMutate).toHaveBeenCalledWith({
      challengeId: 3,
      isArchived: true,
    })
  })

  it('rebuildChallenge triggers the rebuild mutation with the challenge id', () => {
    listingMock.mockReturnValue({ data: [], isLoading: false })
    const { result } = renderHook(() => useManageChallengesContext(), { wrapper })

    act(() => result.current.rebuildChallenge(11))

    expect(rebuildChallengeMutate).toHaveBeenCalledWith({ challengeId: 11 })
  })

  it('throws when used outside of a ManageChallengesProvider', () => {
    // Reason: verifies the guard clause in useManageChallengesContext.
    expect(() => renderHook(() => useManageChallengesContext())).toThrow(
      'useManageChallengesContext must be used within a ManageChallengesProvider'
    )
  })
})
