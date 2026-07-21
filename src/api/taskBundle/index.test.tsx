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

import { taskBundle } from './index'
import type { TaskBundleResponse } from './queries'
import { taskBundleQueries } from './queries'

describe('taskBundle', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('re-exports every function from taskBundleQueries', () => {
    expect(Object.keys(taskBundle).sort()).toEqual(Object.keys(taskBundleQueries).sort())
    expect(taskBundle.getTaskBundle).toBe(taskBundleQueries.getTaskBundle)
    expect(taskBundle.useCreateTaskBundle).toBe(taskBundleQueries.useCreateTaskBundle)
    expect(taskBundle.useUpdateTaskBundle).toBe(taskBundleQueries.useUpdateTaskBundle)
    expect(taskBundle.useDeleteTaskBundle).toBe(taskBundleQueries.useDeleteTaskBundle)
    expect(taskBundle.useUpdateTaskBundleStatus).toBe(taskBundleQueries.useUpdateTaskBundleStatus)
  })

  it('getTaskBundle fetches the bundle via the wired-through function', async () => {
    const bundle: TaskBundleResponse = { bundleId: 5, ownerId: 1, taskIds: [1, 2] }
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

    const { result } = renderHookWithClient(() => taskBundle.getTaskBundle(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle/5', {
      searchParams: { lockTasks: 'false' },
    })
    expect(result.current.data).toEqual(bundle)
  })

  it('useCreateTaskBundle creates a bundle via the wired-through function', async () => {
    const bundle: TaskBundleResponse = { bundleId: 9, ownerId: 1, taskIds: [7] }
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(bundle) })

    const { result } = renderHookWithClient(() => taskBundle.useCreateTaskBundle())

    result.current.mutate({ name: 'my bundle', taskIds: [7] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/taskBundle', {
      json: { name: 'my bundle', taskIds: [7] },
    })
    expect(result.current.data).toEqual(bundle)
  })
})
