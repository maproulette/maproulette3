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

import { challengeComments } from './comments'

describe('challengeComments', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
  })

  it('searchChallengeComments GETs the search endpoint with q and limit', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1 }]) })

    const { result } = renderHookWithClient(() =>
      challengeComments.searchChallengeComments({ q: 'foo', limit: 5 })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challengeComments/search', {
      searchParams: { q: 'foo', limit: 5 },
    })
    expect(result.current.data).toEqual([{ id: 1 }])
  })

  it('searchChallengeComments defaults limit to 10 and is enabled by default', () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    renderHookWithClient(() => challengeComments.searchChallengeComments({ q: 'bar' }))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challengeComments/search', {
      searchParams: { q: 'bar', limit: 10 },
    })
  })

  it('searchChallengeComments does not fetch when enabled is false', () => {
    const { result } = renderHookWithClient(() =>
      challengeComments.searchChallengeComments({ q: 'bar', enabled: false })
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getChallengeComments GETs the challenge comments endpoint keyed by challengeId', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 2 }]) })

    const { result } = renderHookWithClient(() => challengeComments.getChallengeComments(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/challengeComments')
    expect(result.current.data).toEqual([{ id: 2 }])
  })

  it('getChallengeComments is disabled for a falsy challengeId', () => {
    const { result } = renderHookWithClient(() => challengeComments.getChallengeComments(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getTaskComments GETs the task comments endpoint and defaults to an empty object', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(null) })

    const { result } = renderHookWithClient(() => challengeComments.getTaskComments(7))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/7/comments')
    expect(result.current.data).toEqual({})
  })

  it('getTaskComments returns the response as-is when present', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ '1': [{ id: 9 }] }) })

    const { result } = renderHookWithClient(() => challengeComments.getTaskComments(7))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({ '1': [{ id: 9 }] })
  })

  it('useAddChallengeComment POSTs the comment and invalidates the comment caches', async () => {
    apiRequestMock.post.mockReturnValue({
      json: () => Promise.resolve({ id: 3, comment: 'hi', created: 1 }),
    })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeComments.useAddChallengeComment()
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, comment: 'hi' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/42/comment', {
      json: { comment: 'hi' },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'comments', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'taskComments', 42] })
  })
})
