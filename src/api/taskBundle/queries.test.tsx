import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { Task } from '@/types/Task'

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

import type { TaskBundleResponse } from './queries'
import { taskBundleQueries } from './queries'

function makeTask(id: number): Task {
  return { id } as unknown as Task
}

describe('taskBundleQueries', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  describe('getTaskBundle', () => {
    it('posts to the bundle endpoint with lockTasks in the search params', async () => {
      const bundle: TaskBundleResponse = { bundleId: 5, ownerId: 1, taskIds: [1, 2] }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

      const { result } = renderHookWithClient(() => taskBundleQueries.getTaskBundle(5))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle/5', {
        searchParams: { lockTasks: 'false' },
      })
      expect(result.current.data).toEqual(bundle)
    })

    it('passes lockTasks=true through to the search params', async () => {
      const bundle: TaskBundleResponse = { bundleId: 5, ownerId: 1, taskIds: [1, 2] }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

      const { result } = renderHookWithClient(() => taskBundleQueries.getTaskBundle(5, true))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle/5', {
        searchParams: { lockTasks: 'true' },
      })
    })

    it('seeds the cache for each task included in the bundle', async () => {
      const task1 = makeTask(101)
      const task2 = makeTask(102)
      const bundle: TaskBundleResponse = {
        bundleId: 5,
        ownerId: 1,
        taskIds: [101, 102],
        tasks: [task1, task2],
      }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

      const { result, queryClient } = renderHookWithClient(() => taskBundleQueries.getTaskBundle(5))
      const setSpy = vi.spyOn(queryClient, 'setQueryData')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(setSpy).toHaveBeenCalledWith(['task', 101], task1)
      expect(setSpy).toHaveBeenCalledWith(['task', 102], task2)
    })

    it('is disabled when bundleId is falsy', () => {
      const { result } = renderHookWithClient(() => taskBundleQueries.getTaskBundle(0))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.post).not.toHaveBeenCalled()
    })
  })

  describe('useCreateTaskBundle', () => {
    it('posts the bundle payload and seeds the bundle and task caches on success', async () => {
      const task = makeTask(7)
      const bundle: TaskBundleResponse = { bundleId: 9, ownerId: 1, taskIds: [7], tasks: [task] }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

      const { result, queryClient } = renderHookWithClient(() =>
        taskBundleQueries.useCreateTaskBundle()
      )
      const setSpy = vi.spyOn(queryClient, 'setQueryData')
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ name: 'my bundle', taskIds: [7] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle', {
        json: { name: 'my bundle', taskIds: [7] },
      })
      expect(setSpy).toHaveBeenCalledWith(['taskBundle', 9, { lockTasks: false }], bundle)
      expect(setSpy).toHaveBeenCalledWith(['task', 7], task)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'inBounds'] })
    })

    it('does not seed task cache entries when the response has no tasks', async () => {
      const bundle: TaskBundleResponse = { bundleId: 9, ownerId: 1, taskIds: [7] }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

      const { result, queryClient } = renderHookWithClient(() =>
        taskBundleQueries.useCreateTaskBundle()
      )
      const setSpy = vi.spyOn(queryClient, 'setQueryData')

      result.current.mutate({ name: 'my bundle', taskIds: [7] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(setSpy).toHaveBeenCalledWith(['taskBundle', 9, { lockTasks: false }], bundle)
      expect(setSpy).not.toHaveBeenCalledWith(['task', 7], expect.anything())
    })
  })

  describe('useUpdateTaskBundle', () => {
    it('posts the joined taskIds to the update endpoint and refreshes caches', async () => {
      const task = makeTask(3)
      const updatedBundle: TaskBundleResponse = {
        bundleId: 4,
        ownerId: 1,
        taskIds: [3, 8],
        tasks: [task],
      }
      apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(updatedBundle) })

      const { result, queryClient } = renderHookWithClient(() =>
        taskBundleQueries.useUpdateTaskBundle()
      )
      const setSpy = vi.spyOn(queryClient, 'setQueryData')
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ bundleId: 4, taskIds: [3, 8] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle/4/update', {
        searchParams: { taskIds: '3,8' },
      })
      expect(setSpy).toHaveBeenCalledWith(['taskBundle', 4, { lockTasks: false }], updatedBundle)
      expect(setSpy).toHaveBeenCalledWith(['task', 3], task)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'inBounds'] })
    })
  })

  describe('useDeleteTaskBundle', () => {
    it('deletes the bundle and removes/invalidates the relevant caches', async () => {
      apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(undefined) })

      const { result, queryClient } = renderHookWithClient(() =>
        taskBundleQueries.useDeleteTaskBundle()
      )
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate(12)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/taskBundle/12')
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['taskBundle', 12] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'inBounds'] })
    })
  })

  describe('useUpdateTaskBundleStatus', () => {
    it('puts the primaryId as a search param and invalidates related caches', async () => {
      apiRequestMock.put.mockReturnValue(Promise.resolve(undefined))

      const { result, queryClient } = renderHookWithClient(() =>
        taskBundleQueries.useUpdateTaskBundleStatus()
      )
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.mutate({ bundleId: 6, primaryId: 60, status: 1 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/taskBundle/6/1', {
        searchParams: { primaryId: '60' },
      })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['taskBundle', 6] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
    })

    it('includes joined tags in the search params when tags are provided', async () => {
      apiRequestMock.put.mockReturnValue(Promise.resolve(undefined))

      const { result } = renderHookWithClient(() => taskBundleQueries.useUpdateTaskBundleStatus())

      result.current.mutate({ bundleId: 6, primaryId: 60, status: 1, tags: ['foo', 'bar'] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/taskBundle/6/1', {
        searchParams: { primaryId: '60', tags: 'foo,bar' },
      })
    })

    it('omits the tags search param when an empty tags array is provided', async () => {
      apiRequestMock.put.mockReturnValue(Promise.resolve(undefined))

      const { result } = renderHookWithClient(() => taskBundleQueries.useUpdateTaskBundleStatus())

      result.current.mutate({ bundleId: 6, primaryId: 60, status: 1, tags: [] })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/taskBundle/6/1', {
        searchParams: { primaryId: '60' },
      })
    })
  })
})
