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

import { task } from './index'

const EXPECTED_TASK_KEYS = [
  'searchTasks',
  'startTask',
  'getTaskOptions',
  'getTask',
  'useLockTask',
  'useUnlockTask',
  'useSkipTask',
  'updateTask',
  'useUpdateTask',
  'useUpdateTaskStatus',
  'getTasks',
  'getTaskMarkers',
  'getTasksInBounds',
  'getTasksInBoundingBox',
  'searchTaskComments',
  'getTaskComments',
  'getTaskHistory',
  'useAddTaskComment',
  'getTaskTags',
  'searchKeywords',
  'useUpdateTaskTags',
  'useBulkUpdateStatus',
  'useBulkAddTags',
  'useBulkDelete',
  'useBulkArchive',
  'useBulkReassign',
  'useBulkClearLock',
].sort()

describe('task', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('merges every sub-module member onto a single object, and only those members', () => {
    expect(Object.keys(task).sort()).toEqual(EXPECTED_TASK_KEYS)
    for (const key of EXPECTED_TASK_KEYS) {
      expect(typeof task[key as keyof typeof task]).toBe('function')
    }
  })

  it('wires getTask (from taskSingle) through to the single-task endpoint', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ id: 5 }) })

    const { result } = renderHookWithClient(() => task.getTask(5))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/5?mapillary=false')
  })

  it('wires getTasks (from taskMultiple) through to the batch endpoint', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1 }, { id: 2 }]) })

    const { result } = renderHookWithClient(() => task.getTasks([2, 1]))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/tasks', {
      searchParams: { taskIds: '2,1', mapillary: 'false' },
    })
  })

  it('wires getTaskComments (from taskComments) through to the comments endpoint', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() => task.getTaskComments(5))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/5/comments')
  })

  it('wires getTaskTags (from taskTags) through to the tags endpoint', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() => task.getTaskTags(5))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/task/5/tags')
  })

  it('wires useBulkClearLock (from taskBulk) through to the unlock endpoint', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result } = renderHookWithClient(() => task.useBulkClearLock())
    result.current.mutate([1, 2])
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/task/bundle/unlock', {
      json: [1, 2],
    })
  })
})
