import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { TaskGetResponse } from '@/types/Task'

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

import type { Comment } from '@/types/Comment'
import { taskComments } from './comments'

function makeComment(props: Partial<Comment> = {}): Comment {
  return { id: 1, comment: 'hello', ...props } as Comment
}

describe('taskComments', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
  })

  it('searchTaskComments fetches with q/limit search params and defaults limit to 10', async () => {
    const comments = [makeComment({ id: 1 })]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(comments) })

    const { result } = renderHookWithClient(() => taskComments.searchTaskComments({ q: 'foo' }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/comments/search', {
      searchParams: { q: 'foo', limit: 10 },
    })
    expect(result.current.data).toEqual(comments)
  })

  it('searchTaskComments does not fetch when enabled is false', () => {
    const { result } = renderHookWithClient(() =>
      taskComments.searchTaskComments({ q: 'foo', enabled: false })
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getTaskComments fetches comments for a task id', async () => {
    const comments = [makeComment({ id: 2 })]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(comments) })

    const { result } = renderHookWithClient(() => taskComments.getTaskComments(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/42/comments')
    expect(result.current.data).toEqual(comments)
  })

  it('getTaskComments does not fetch when taskId is falsy', () => {
    const { result } = renderHookWithClient(() => taskComments.getTaskComments(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getTaskHistory fetches history for a task id', async () => {
    const history = [{ taskId: 42, timestamp: 't', actionType: 1, user: null }]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(history) })

    const { result } = renderHookWithClient(() => taskComments.getTaskHistory(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/42/history')
    expect(result.current.data).toEqual(history)
  })

  it('getTaskHistory does not fetch when taskId is falsy', () => {
    const { result } = renderHookWithClient(() => taskComments.getTaskHistory(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useAddTaskComment POSTs the comment, appends to cached comments, and invalidates history', async () => {
    const newComment = makeComment({ id: 99, comment: 'a new comment' })
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newComment) })

    const { result, queryClient } = renderHookWithClient(() => taskComments.useAddTaskComment())
    queryClient.setQueryData(['task', 'comments', 5], [makeComment({ id: 1 })])
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskId: 5, commentText: 'a new comment' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/task/5/comment', {
      json: { comment: 'a new comment' },
    })
    expect(queryClient.getQueryData(['task', 'comments', 5])).toEqual([
      makeComment({ id: 1 }),
      newComment,
    ])
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 5] })
  })

  it('useAddTaskComment seeds the comments cache from empty when nothing was cached yet', async () => {
    const newComment = makeComment({ id: 100 })
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newComment) })

    const { result, queryClient } = renderHookWithClient(() => taskComments.useAddTaskComment())

    result.current.mutate({ taskId: 6, commentText: 'first comment' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['task', 'comments', 6])).toEqual([newComment])
  })

  it('useAddTaskComment invalidates the parent challenge activity when the task has a parent cached', async () => {
    const newComment = makeComment({ id: 101 })
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newComment) })

    const { result, queryClient } = renderHookWithClient(() => taskComments.useAddTaskComment())
    queryClient.setQueryData(['task', 7], { parent: 55 } as TaskGetResponse)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskId: 7, commentText: 'hi' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'activity', 55] })
  })

  it('useAddTaskComment does not invalidate any challenge activity when the task has no cached parent', async () => {
    const newComment = makeComment({ id: 102 })
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(newComment) })

    const { result, queryClient } = renderHookWithClient(() => taskComments.useAddTaskComment())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskId: 8, commentText: 'hi' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: expect.arrayContaining(['challenge', 'activity']) })
    )
  })
})
