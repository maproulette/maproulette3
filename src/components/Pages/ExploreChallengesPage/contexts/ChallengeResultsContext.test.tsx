import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Challenge } from '@/types/Challenge'

const { exploreChallengesInfiniteMock, useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  exploreChallengesInfiniteMock: vi.fn(),
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      challenge: {
        ...actual.api.challenge,
        exploreChallengesInfinite: exploreChallengesInfiniteMock,
      },
    },
  }
})

vi.mock('./ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import {
  ChallengeResultsContextProvider,
  useChallengeResultsContext,
} from './ChallengeResultsContext'

const makeChallenge = (id: number): Challenge => ({ id }) as unknown as Challenge

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChallengeResultsContextProvider>{children}</ChallengeResultsContextProvider>
)

const setSearchContext = (isLocationLoading = false) => {
  useExploreChallengesSearchContextMock.mockReturnValue({
    extendedFindParams: { bounds: '-180,-85,180,85' },
    isLocationLoading,
  })
}

const setQueryResult = (overrides: Partial<ReturnType<typeof baseQueryResult>>) => {
  exploreChallengesInfiniteMock.mockReturnValue({ ...baseQueryResult(), ...overrides })
}

function baseQueryResult() {
  return {
    data: undefined as { pages: Challenge[][] } | undefined,
    isLoading: false,
    error: null as Error | null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }
}

describe('ChallengeResultsContext', () => {
  beforeEach(() => {
    exploreChallengesInfiniteMock.mockReset()
    useExploreChallengesSearchContextMock.mockReset()
    setSearchContext()
  })

  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useChallengeResultsContext())).toThrow(
      'useChallengeResults must be used within a ChallengeResultsProvider'
    )
  })

  it('flattens paginated challenge data into a single array', () => {
    setQueryResult({
      data: { pages: [[makeChallenge(1), makeChallenge(2)], [makeChallenge(3)]] },
    })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.challenges.map((c) => c.id)).toEqual([1, 2, 3])
  })

  it('defaults challenges to an empty array when there is no data yet', () => {
    setQueryResult({ data: undefined })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.challenges).toEqual([])
  })

  it('shows the full loading state when isLoading is true and no challenges have loaded yet', () => {
    setQueryResult({ isLoading: true, data: undefined })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.isLoadingState).toBe(true)
    expect(result.current.showEmptyState).toBe(false)
  })

  it('does not show the full loading overlay on a background refetch once challenges are present', () => {
    setQueryResult({ isLoading: true, data: { pages: [[makeChallenge(1)]] } })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.isLoadingState).toBe(false)
  })

  it('shows the loading state while the location is still resolving, even with no active query load', () => {
    setSearchContext(true)
    setQueryResult({ isLoading: false, data: undefined })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.isLoadingState).toBe(true)
  })

  it('shows the empty state only once loading has finished, there is no error, and there are no challenges', () => {
    setQueryResult({ isLoading: false, data: { pages: [[]] }, error: null })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.showEmptyState).toBe(true)
    expect(result.current.showErrorState).toBeFalsy()
  })

  it('shows the error state (and not the empty state) when the query has failed', () => {
    const error = new Error('network down')
    setQueryResult({ isLoading: false, data: undefined, error })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.showErrorState).toBe(error)
    expect(result.current.showEmptyState).toBe(false)
    expect(result.current.error).toBe(error)
  })

  it('passes through fetchNextPage, hasNextPage, and isFetchingNextPage from the query', () => {
    const fetchNextPage = vi.fn()
    setQueryResult({ fetchNextPage, hasNextPage: true, isFetchingNextPage: true })

    const { result } = renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.isFetchingNextPage).toBe(true)
    result.current.fetchNextPage()
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('forwards the current extendedFindParams from the search context to the API call', () => {
    useExploreChallengesSearchContextMock.mockReturnValue({
      extendedFindParams: { bounds: '1,2,3,4', difficulty: 2 },
      isLocationLoading: false,
    })
    setQueryResult({})

    renderHook(() => useChallengeResultsContext(), { wrapper })

    expect(exploreChallengesInfiniteMock).toHaveBeenCalledWith({ bounds: '1,2,3,4', difficulty: 2 })
  })
})
