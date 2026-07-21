import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'

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

import { challengeFavorites } from './favorites'

describe('challengeFavorites', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('isChallengeFavorited GETs the favorite endpoint for the challenge', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ isFavorited: true }) })

    const { result } = renderHookWithClient(() => challengeFavorites.isChallengeFavorited(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/5/favorite')
    expect(result.current.data).toEqual({ isFavorited: true })
  })

  it('isChallengeFavorited is disabled for a falsy challengeId', () => {
    const { result } = renderHookWithClient(() => challengeFavorites.isChallengeFavorited(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useFavoriteChallenge POSTs to the favorite endpoint and sets isFavorited true in cache', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeFavorites.useFavoriteChallenge()
    )

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/5/favorite')
    expect(queryClient.getQueryData(['challenge', 5, 'isFavorited'])).toEqual({
      isFavorited: true,
    })
  })

  it('useUnfavoriteChallenge DELETEs the favorite endpoint and sets isFavorited false in cache', async () => {
    apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeFavorites.useUnfavoriteChallenge()
    )

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/challenge/5/favorite')
    expect(queryClient.getQueryData(['challenge', 5, 'isFavorited'])).toEqual({
      isFavorited: false,
    })
  })
})
