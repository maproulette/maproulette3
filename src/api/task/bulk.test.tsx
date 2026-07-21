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

import type { BulkDeleteResult, BulkReassignResult } from './bulk'
import { taskBulk } from './bulk'

describe('taskBulk', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('useBulkUpdateStatus PUTs each task id to the status endpoint and invalidates task/challenge', async () => {
    apiRequestMock.put.mockReturnValue({ text: () => Promise.resolve('') })
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkUpdateStatus())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskIds: [1, 2, 3], status: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/1/2')
    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/2/2')
    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/task/3/2')
    expect(apiRequestMock.put).toHaveBeenCalledTimes(3)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
  })

  it('useBulkAddTags joins tags and GETs the tags/update endpoint for each task id', async () => {
    apiRequestMock.get.mockReturnValue(Promise.resolve(undefined))
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkAddTags())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskIds: [4, 5], tags: ['foo', 'bar'] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/4/tags/update', {
      searchParams: { tags: 'foo,bar' },
    })
    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/5/tags/update', {
      searchParams: { tags: 'foo,bar' },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
  })

  it('useBulkDelete DELETEs with the taskIds body and invalidates task/challenge', async () => {
    const response: BulkDeleteResult = { requested: 2, deleted: 2, denied: [] }
    apiRequestMock.delete.mockReturnValue({ json: () => Promise.resolve(response) })
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkDelete())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate([10, 11])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/tasks', {
      json: { taskIds: [10, 11] },
    })
    expect(result.current.data).toEqual(response)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
  })

  it('useBulkArchive PUTs taskIds and archived flag and invalidates task/challenge', async () => {
    apiRequestMock.put.mockReturnValue({ text: () => Promise.resolve('') })
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkArchive())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskIds: [7], archived: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/tasks/archive', {
      json: { taskIds: [7], archived: true },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
  })

  it('useBulkReassign PUTs taskIds and userId, returns the parsed result, and invalidates only task', async () => {
    const response: BulkReassignResult = { requested: 1, updated: 1 }
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(response) })
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkReassign())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ taskIds: [8], userId: 99 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/tasks/reassign', {
      json: { taskIds: [8], userId: 99 },
    })
    expect(result.current.data).toEqual(response)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['challenge'] })
  })

  it('useBulkClearLock POSTs the taskIds array and invalidates task/challenge', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })
    const { result, queryClient } = renderHookWithClient(() => taskBulk.useBulkClearLock())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate([12, 13])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/task/bundle/unlock', {
      json: [12, 13],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
  })
})
