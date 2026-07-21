import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, renderHookWithClient } from '@/test/queryClient'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TasksBoundingBoxQuery,
  TasksInBoundsParams,
} from '@/types/Task'

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

import { taskMultiple } from './multiple'

function makeTask(props: Partial<TaskGetResponse> = {}): TaskGetResponse {
  return { id: 1, parent: 10, status: 0, ...props } as TaskGetResponse
}

describe('taskMultiple', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.put.mockReset()
  })

  describe('getTasks', () => {
    it('fetches only the ids missing from the cache and merges them with cached tasks', async () => {
      const cachedTask = makeTask({ id: 1 })
      const fetchedTask = makeTask({ id: 2 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([fetchedTask]) })

      const client = createTestQueryClient()
      client.setQueryData(['task', 1], cachedTask)
      const { result } = renderHookWithClient(() => taskMultiple.getTasks([1, 2]), { client })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/tasks', {
        searchParams: { taskIds: '2', mapillary: 'false' },
      })
      expect(result.current.data).toEqual([cachedTask, fetchedTask])
    })

    it('does not call the API when every requested id is already cached', async () => {
      const cachedTask = makeTask({ id: 3 })

      const client = createTestQueryClient()
      client.setQueryData(['task', 3], cachedTask)
      const { result } = renderHookWithClient(() => taskMultiple.getTasks([3]), { client })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).not.toHaveBeenCalled()
      expect(result.current.data).toEqual([cachedTask])
    })

    it('caches each newly-fetched task under its own task/id query key', async () => {
      const fetchedTask = makeTask({ id: 4 })
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([fetchedTask]) })

      const { result, queryClient } = renderHookWithClient(() => taskMultiple.getTasks([4]))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(queryClient.getQueryData(['task', 4])).toEqual(fetchedTask)
    })

    it('sorts the ids for the query key regardless of the order passed in', () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })
      const { queryClient } = renderHookWithClient(() => taskMultiple.getTasks([3, 1, 2]))

      expect(
        queryClient.getQueryCache().findAll({ queryKey: ['task', 'batch', [1, 2, 3]] })
      ).toHaveLength(1)
    })

    it('does not fetch when given an empty id list', () => {
      const { result } = renderHookWithClient(() => taskMultiple.getTasks([]))

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })
  })

  describe('getTaskMarkers', () => {
    it('fetches task markers with the converted search params', async () => {
      const response = { markers: [] }
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(response) })
      const params = { cid: 7 } as TaskMarkersParams

      const { result } = renderHookWithClient(() => taskMultiple.getTaskMarkers(params))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/taskMarkers', {
        searchParams: { cid: 7 },
        signal: expect.any(AbortSignal),
      })
      expect(result.current.data).toEqual(response)
    })

    it('passes undefined search params when params is falsy', async () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ markers: [] }) })

      const { result } = renderHookWithClient(() => taskMultiple.getTaskMarkers(undefined))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/taskMarkers', {
        searchParams: undefined,
        signal: expect.any(AbortSignal),
      })
    })
  })

  describe('getTasksInBounds', () => {
    it('fetches tasks in bounds with converted search params', async () => {
      const response = { tasks: [], total: 0 }
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(response) })
      const params = { left: 1, bottom: 2, right: 3, top: 4 } as TasksInBoundsParams

      const { result } = renderHookWithClient(() => taskMultiple.getTasksInBounds(params))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/tasks/bounds', {
        searchParams: { left: 1, bottom: 2, right: 3, top: 4 },
        signal: expect.any(AbortSignal),
      })
      expect(result.current.data).toEqual(response)
    })

    it('is disabled when options.enabled is false', () => {
      const params = { left: 1, bottom: 2, right: 3, top: 4 } as TasksInBoundsParams

      const { result } = renderHookWithClient(() =>
        taskMultiple.getTasksInBounds(params, { enabled: false })
      )

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.get).not.toHaveBeenCalled()
    })

    it('defaults enabled to true when options are omitted', async () => {
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ tasks: [], total: 0 }) })
      const params = { left: 1, bottom: 2, right: 3, top: 4 } as TasksInBoundsParams

      const { result } = renderHookWithClient(() => taskMultiple.getTasksInBounds(params))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(apiRequestMock.get).toHaveBeenCalled()
    })
  })

  describe('getTasksInBoundingBox', () => {
    it('PUTs the box coordinates in the path and builds filter search params from the query', async () => {
      const response = { tasks: [], total: 0 }
      apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(response) })

      const query: TasksBoundingBoxQuery = {
        left: 1,
        bottom: 2,
        right: 3,
        top: 4,
        challengeId: 55,
        limit: 25,
        page: 0,
        sort: 'name',
        order: 'ASC',
        taskStatuses: [0, 1],
        priorities: [0],
        reviewStatuses: [-1],
        metaReviewStatuses: [],
      }

      const { result } = renderHookWithClient(() => taskMultiple.getTasksInBoundingBox(query))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/tasks/box/1/2/3/4', {
        searchParams: {
          limit: 25,
          page: 0,
          sort: 'name',
          order: 'ASC',
          includeTotal: true,
          excludeLocked: true,
          includeGeometries: false,
          includeTags: false,
          cid: 55,
          ca: true,
          tStatus: '0,1',
          priorities: '0',
          trStatus: '-1',
          // reviewStatuses includes -1, so metaReviewStatusesForApi adds -1 too
          mrStatus: '-1',
        },
        json: {},
        signal: expect.any(AbortSignal),
      })
      expect(result.current.data).toEqual(response)
    })

    it('is disabled when options.enabled is false', () => {
      const query: TasksBoundingBoxQuery = {
        left: 1,
        bottom: 2,
        right: 3,
        top: 4,
        challengeId: 55,
        limit: 25,
        page: 0,
        sort: 'name',
        order: 'ASC',
        taskStatuses: [],
        priorities: [],
        reviewStatuses: [],
        metaReviewStatuses: [],
      }

      const { result } = renderHookWithClient(() =>
        taskMultiple.getTasksInBoundingBox(query, { enabled: false })
      )

      expect(result.current.fetchStatus).toBe('idle')
      expect(apiRequestMock.put).not.toHaveBeenCalled()
    })
  })
})
