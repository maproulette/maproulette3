import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type {
    ChallengeGetResponse,
    ExploreChallengesParams,
    FeaturedChallengesParams,
    PreferredChallengesParams,
} from '@/types/Challenge'

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest: apiRequestMock }
})

import { challengeExplore } from './explore'

function makeChallenge(id: number): ChallengeGetResponse {
  return { id } as ChallengeGetResponse
}

function makeExploreParams(props: Record<string, unknown>): ExploreChallengesParams {
  return props as ExploreChallengesParams
}

function makeFeaturedParams(props: Record<string, unknown>): FeaturedChallengesParams {
  return props as FeaturedChallengesParams
}

function makePreferredParams(props: Record<string, unknown>): PreferredChallengesParams {
  return props as PreferredChallengesParams
}

describe('challengeExplore', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  it('preferredChallenges GETs the preferred endpoint with the given params', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1 }]) })

    const { result } = renderHookWithClient(() =>
      challengeExplore.preferredChallenges(makePreferredParams({ limit: 5 }))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/preferred', {
      searchParams: { limit: 5 },
    })
  })

  it('featuredChallenges GETs the featured endpoint and caches each challenge by id', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(1), makeChallenge(2)]),
    })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeExplore.featuredChallenges(makeFeaturedParams({}))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/featured', {
      searchParams: {},
    })
    expect(queryClient.getQueryData(['challenge', 1])).toEqual(makeChallenge(1))
    expect(queryClient.getQueryData(['challenge', 2])).toEqual(makeChallenge(2))
  })

  it('exploreChallenges converts params to search params and caches each challenge', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(3)]),
    })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeExplore.exploreChallenges(makeExploreParams({ limit: 10, tags: ['a', 'b'] }))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/exploreChallenges', {
      searchParams: { limit: 10, tags: 'a,b' },
    })
    expect(queryClient.getQueryData(['challenge', 3])).toEqual(makeChallenge(3))
  })

  it('exploreChallenges passes undefined searchParams when params is falsy', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    renderHookWithClient(() =>
      challengeExplore.exploreChallenges(undefined as ExploreChallengesParams)
    )

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/exploreChallenges', {
      searchParams: undefined,
    })
  })

  it('exploreChallengesInfinite requests offset 0 on the first page and caches challenges', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(4)]),
    })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeExplore.exploreChallengesInfinite(makeExploreParams({ limit: 2 }))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/exploreChallenges', {
      searchParams: { limit: 2, offset: 0 },
    })
    expect(queryClient.getQueryData(['challenge', 4])).toEqual(makeChallenge(4))
  })

  it('exploreChallengesInfinite getNextPageParam returns undefined once a page is short of the limit', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(5)]),
    })

    const { result } = renderHookWithClient(() =>
      challengeExplore.exploreChallengesInfinite(makeExploreParams({ limit: 10 }))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('exploreChallengesInfinite getNextPageParam returns the next offset when a page is full', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(6)]),
    })

    const { result } = renderHookWithClient(() =>
      challengeExplore.exploreChallengesInfinite(makeExploreParams({ limit: 1 }))
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(true)
  })

  it('getChallengesListingOptions builds the listing query with defaults', () => {
    const options = challengeExplore.getChallengesListingOptions([1, 2])

    expect(options.queryKey).toEqual([
      'challenge',
      'listing',
      [1, 2],
      { limit: -1, onlyEnabled: false },
    ])
  })

  it('getChallengesListingOptions.queryFn GETs the listing endpoint with joined project ids', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ challenges: [] }) })

    const options = challengeExplore.getChallengesListingOptions([1, 2], {
      limit: 25,
      onlyEnabled: true,
    })

    expect(options.queryKey).toEqual([
      'challenge',
      'listing',
      [1, 2],
      { limit: 25, onlyEnabled: true },
    ])
    const queryFn = options.queryFn as () => Promise<unknown>
    await queryFn()

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/listing', {
      searchParams: { projectIds: '1,2', limit: 25, page: 0, onlyEnabled: true },
    })
  })

  it('listing GETs the listing endpoint and caches each challenge by id', async () => {
    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(7)]),
    })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeExplore.listing([1, 2], 20, 1, true)
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/listing', {
      searchParams: { projectIds: '1,2', limit: 20, page: 1, onlyEnabled: true },
    })
    expect(queryClient.getQueryData(['challenge', 7])).toEqual(makeChallenge(7))
  })

  it('searchChallenges GETs the search endpoint and caches results, disabled for empty search', async () => {
    const { result } = renderHookWithClient(() => challengeExplore.searchChallenges())

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()

    apiRequestMock.get.mockReturnValue({
      json: () => Promise.resolve([makeChallenge(8)]),
    })

    const { result: result2, queryClient } = renderHookWithClient(() =>
      challengeExplore.searchChallenges({ search: 'road' })
    )

    await waitFor(() => expect(result2.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenges/search', {
      searchParams: { search: 'road' },
    })
    expect(queryClient.getQueryData(['challenge', 8])).toEqual(makeChallenge(8))
  })
})
