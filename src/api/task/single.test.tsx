import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { TaskGetResponse } from '@/types/Task'
import type { UserWhoamiResponse } from '@/types/User'

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

import { taskSingle } from './single'

function makeTask(props: Partial<TaskGetResponse> = {}): TaskGetResponse {
  return { id: 1, parent: 10, status: 0, priority: 1, ...props } as TaskGetResponse
}

function jsonResponse<T>(data: T) {
  return {
    json: () => Promise.resolve(data),
    headers: { get: () => 'application/json' },
  }
}

describe('taskSingle', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  describe('searchTasks', () => {
    it('fetches with q/limit search params, defaulting limit to 25', async () => {
      const results = [{ id: 1, name: 'a', status: 0, parent: 2, challengeName: 'c' }]
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(results) })

      const { result } = renderHookWithClient(() => taskSingle.searchTasks({ q: 'foo' }))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/tasks/search', {
        searchParams: { q: 'foo', limit: 25 },
      })
      expect(result.current.data).toEqual(results)
    })

    it('does not fetch when q is empty', () => {
      const { result } = renderHookWithClient(() => taskSingle.searchTasks({ q: '' }))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('startTask', () => {
    it('fetches the start endpoint for a task id', async () => {
      const response = makeTask()
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(response) })

      const { result } = renderHookWithClient(() => taskSingle.startTask(1))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/1/start')
      expect(result.current.data).toEqual(response)
    })

    it('does not fetch when taskId is falsy', () => {
      const { result } = renderHookWithClient(() => taskSingle.startTask(0))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('getTask / getTaskOptions', () => {
    it('fetches the task with mapillary=false', async () => {
      const response = makeTask()
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(response) })

      const { result } = renderHookWithClient(() => taskSingle.getTask(1))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/1?mapillary=false')
      expect(result.current.data).toEqual(response)
    })

    it('does not fetch when taskId is falsy', () => {
      const { result } = renderHookWithClient(() => taskSingle.getTask(0))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('useLockTask', () => {
    it('GETs the start endpoint, caches the task, invalidates history, and patches the marker with the current user id', async () => {
      const lockedTask = makeTask({ id: 20, parent: 30 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(lockedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useLockTask())
      queryClient.setQueryData(['user', 'whoami'], { id: 77 } as UserWhoamiResponse)
      queryClient.setQueryData(['challenge', 'taskMarkers', 30], {
        markers: [{ id: 20, status: 0 }],
      })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(20)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/20/start')
      expect(queryClient.getQueryData(['task', 20])).toEqual(lockedTask)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 20] })
      expect(
        queryClient.getQueryData<{ markers: { id: number; lockedBy: number }[] }>([
          'challenge',
          'taskMarkers',
          30,
        ])?.markers[0].lockedBy
      ).toBe(77)
    })

    it('patches the marker with a null lockedBy when there is no cached current user', async () => {
      const lockedTask = makeTask({ id: 21, parent: 31 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(lockedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useLockTask())
      queryClient.setQueryData(['challenge', 'taskMarkers', 31], {
        markers: [{ id: 21, status: 0 }],
      })

      result.current.mutate(21)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(
        queryClient.getQueryData<{ markers: { id: number; lockedBy: number | null }[] }>([
          'challenge',
          'taskMarkers',
          31,
        ])?.markers[0].lockedBy
      ).toBe(null)
    })

    it('does not attempt to patch a marker when the locked task has no parent', async () => {
      const lockedTask = makeTask({ id: 22, parent: 0 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(lockedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useLockTask())

      result.current.mutate(22)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(queryClient.getQueryData(['task', 22])).toEqual(lockedTask)
    })
  })

  describe('useUnlockTask', () => {
    it('GETs the release endpoint, caches the task, invalidates history, and patches the marker lockedBy to null', async () => {
      const unlockedTask = makeTask({ id: 23, parent: 32 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(unlockedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUnlockTask())
      queryClient.setQueryData(['challenge', 'taskMarkers', 32], {
        markers: [{ id: 23, lockedBy: 5 }],
      })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(23)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/23/release')
      expect(queryClient.getQueryData(['task', 23])).toEqual(unlockedTask)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 23] })
      expect(
        queryClient.getQueryData<{ markers: { id: number; lockedBy: number | null }[] }>([
          'challenge',
          'taskMarkers',
          32,
        ])?.markers[0].lockedBy
      ).toBe(null)
    })
  })

  describe('useSkipTask', () => {
    it('POSTs to skip, patches the cached task status to 3, invalidates history, patches the marker, and invalidates aggregates when the status actually changed', async () => {
      apiRequestMock.post.mockReturnValue({ text: () => Promise.resolve('') })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useSkipTask())
      queryClient.setQueryData(['task', 24], makeTask({ id: 24, parent: 33, status: 0 }))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(24)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/task/24/skip')
      expect(queryClient.getQueryData<TaskGetResponse>(['task', 24])).toEqual(
        makeTask({ id: 24, parent: 33, status: 3 })
      )
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 24] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 33] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 33] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'activity', 33] })
    })

    it('does not invalidate challenge aggregates when the task was already skipped', async () => {
      apiRequestMock.post.mockReturnValue({ text: () => Promise.resolve('') })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useSkipTask())
      queryClient.setQueryData(['task', 25], makeTask({ id: 25, parent: 34, status: 3 }))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(25)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['challenge', 34] })
    })

    it('does nothing to the cache when the task was not already cached', async () => {
      apiRequestMock.post.mockReturnValue({ text: () => Promise.resolve('') })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useSkipTask())

      result.current.mutate(26)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(queryClient.getQueryData(['task', 26])).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('PUTs the body to the task endpoint and returns the parsed task', async () => {
      const body = makeTask({ id: 40 })
      const response = makeTask({ id: 40, status: 1 })
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(response) })

      const result = await taskSingle.updateTask(40, body)

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/40', { json: body })
      expect(result).toEqual(response)
    })
  })

  describe('useUpdateTask', () => {
    it('updates the task, caches the result, invalidates history, patches the marker, and invalidates aggregates when status changed', async () => {
      const updatedTask = makeTask({ id: 41, parent: 50, status: 2, priority: 3 })
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updatedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTask())
      queryClient.setQueryData(['task', 41], makeTask({ id: 41, parent: 50, status: 0 }))
      queryClient.setQueryData(['challenge', 'taskMarkers', 50], {
        markers: [{ id: 41, status: 0, priority: 1 }],
      })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 41, body: updatedTask })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/41', { json: updatedTask })
      expect(queryClient.getQueryData(['task', 41])).toEqual(updatedTask)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 41] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 50] })
      expect(
        queryClient.getQueryData<{ markers: { id: number; status: number; priority: number }[] }>([
          'challenge',
          'taskMarkers',
          50,
        ])?.markers[0]
      ).toEqual({ id: 41, status: 2, priority: 3 })
    })

    it('does not invalidate challenge aggregates when the status is unchanged', async () => {
      const updatedTask = makeTask({ id: 42, parent: 51, status: 0 })
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(updatedTask) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTask())
      queryClient.setQueryData(['task', 42], makeTask({ id: 42, parent: 51, status: 0 }))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 42, body: updatedTask })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['challenge', 51] })
    })
  })

  describe('useUpdateTaskStatus', () => {
    it('PUTs to the status endpoint with no query string when no options are given', async () => {
      const response = makeTask({ id: 60, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 60, status: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/60/2')
      expect(queryClient.getQueryData(['task', 60])).toEqual(response)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 60] })
    })

    it('builds a query string with tags and requestReview when provided', async () => {
      const response = makeTask({ id: 61, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))

      const { result } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())

      result.current.mutate({
        taskId: 61,
        status: 2,
        options: { tags: ['a', 'b'], requestReview: true },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith(
        'api/v2/task/61/2?tags=a%2Cb&requestReview=true'
      )
    })

    it('posts a comment separately when options.comment is provided, and invalidates the comments cache', async () => {
      const response = makeTask({ id: 62, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve({ id: 1 }) })

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 62, status: 2, options: { comment: 'looks good' } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/task/62/comment', {
        json: { comment: 'looks good' },
      })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'comments', 62] })
    })

    it('does not invalidate the comments cache when no comment option is given', async () => {
      const response = makeTask({ id: 63, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 63, status: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['task', 'comments', 63] })
    })

    it('re-fetches the task when the PUT response has no JSON content-type (e.g. 204)', async () => {
      const refetched = makeTask({ id: 64, status: 2 })
      apiRequestMock.put.mockReturnValue({
        headers: { get: () => null },
      })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(refetched) })

      const { result } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())

      result.current.mutate({ taskId: 64, status: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/64?mapillary=false')
      expect(result.current.data).toEqual(refetched)
    })

    it('patches the marker status and invalidates aggregates when the cached status differs from the new status', async () => {
      const response = makeTask({ id: 65, parent: 70, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())
      queryClient.setQueryData(['task', 65], makeTask({ id: 65, parent: 70, status: 0 }))
      queryClient.setQueryData(['challenge', 'taskMarkers', 70], {
        markers: [{ id: 65, status: 0 }],
      })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 65, status: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 70] })
      expect(
        queryClient.getQueryData<{ markers: { id: number; status: number }[] }>([
          'challenge',
          'taskMarkers',
          70,
        ])?.markers[0].status
      ).toBe(2)
    })

    it('does not invalidate aggregates when the cached status matches the new status', async () => {
      const response = makeTask({ id: 66, parent: 71, status: 2 })
      apiRequestMock.put.mockReturnValue(jsonResponse(response))

      const { result, queryClient } = renderHookWithClient(() => taskSingle.useUpdateTaskStatus())
      queryClient.setQueryData(['task', 66], makeTask({ id: 66, parent: 71, status: 2 }))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ taskId: 66, status: 2 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['challenge', 71] })
    })
  })
})
