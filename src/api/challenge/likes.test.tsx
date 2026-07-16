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

import { challengeLikes } from './likes'

describe('challengeLikes', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('isChallengeLiked GETs the like endpoint for the challenge', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ isLiked: true }) })

    const { result } = renderHookWithClient(() => challengeLikes.isChallengeLiked(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/5/like')
    expect(result.current.data).toEqual({ isLiked: true })
  })

  it('isChallengeLiked is disabled for a falsy challengeId', () => {
    const { result } = renderHookWithClient(() => challengeLikes.isChallengeLiked(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getChallengeLikeCount GETs the likeCount endpoint for the challenge', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ likeCount: 3 }) })

    const { result } = renderHookWithClient(() => challengeLikes.getChallengeLikeCount(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/5/likeCount')
    expect(result.current.data).toEqual({ likeCount: 3 })
  })

  it('getChallengeLikeCount is disabled for a falsy challengeId', () => {
    const { result } = renderHookWithClient(() => challengeLikes.getChallengeLikeCount(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useLikeChallenge POSTs to the like endpoint, sets isLiked true, and increments likeCount', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeLikes.useLikeChallenge())
    queryClient.setQueryData(['challenge', 5, 'likeCount'], { likeCount: 4 })

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/5/like')
    expect(queryClient.getQueryData(['challenge', 5, 'isLiked'])).toEqual({ isLiked: true })
    expect(queryClient.getQueryData(['challenge', 5, 'likeCount'])).toEqual({ likeCount: 5 })
  })

  it('useLikeChallenge treats a missing likeCount cache entry as 0 before incrementing', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeLikes.useLikeChallenge())

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['challenge', 5, 'likeCount'])).toEqual({ likeCount: 1 })
  })

  it('useUnlikeChallenge DELETEs the like endpoint, sets isLiked false, and decrements likeCount', async () => {
    apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeLikes.useUnlikeChallenge())
    queryClient.setQueryData(['challenge', 5, 'likeCount'], { likeCount: 4 })

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/challenge/5/like')
    expect(queryClient.getQueryData(['challenge', 5, 'isLiked'])).toEqual({ isLiked: false })
    expect(queryClient.getQueryData(['challenge', 5, 'likeCount'])).toEqual({ likeCount: 3 })
  })

  it('useUnlikeChallenge never decrements likeCount below 0', async () => {
    apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeLikes.useUnlikeChallenge())
    queryClient.setQueryData(['challenge', 5, 'likeCount'], { likeCount: 0 })

    result.current.mutate(5)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['challenge', 5, 'likeCount'])).toEqual({ likeCount: 0 })
  })
})
