import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, renderHookWithClient } from '@/test/queryClient'
import type {
    Challenge,
    ChallengeActivityEntry,
    ChallengeGetResponse,
    ChallengeStatsResponse,
    ChallengeTaskMarkersResponse,
} from '@/types/Challenge'
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

import { challengeSingle, invalidateChallengeAggregates, patchChallengeTaskMarker } from './single'

function makeMarkers(): ChallengeTaskMarkersResponse {
  return {
    markers: [
      { id: 1, status: 0, priority: 0 },
      { id: 2, status: 0, priority: 0 },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as ChallengeTaskMarkersResponse
}

describe('patchChallengeTaskMarker', () => {
  it('does nothing when challengeId is falsy', () => {
    const queryClient = createTestQueryClient()
    const setSpy = vi.spyOn(queryClient, 'setQueryData')

    patchChallengeTaskMarker(queryClient, 0, 1, { status: 2 })

    expect(setSpy).not.toHaveBeenCalled()
  })

  it('merges the patch into the matching marker and leaves others untouched', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['challenge', 'taskMarkers', 42], makeMarkers())

    patchChallengeTaskMarker(queryClient, 42, 1, { status: 2, lockedBy: 7 })

    const updated = queryClient.getQueryData<ChallengeTaskMarkersResponse>([
      'challenge',
      'taskMarkers',
      42,
    ])
    const markers = updated?.markers
    expect(markers?.[0]).toEqual({ id: 1, status: 2, priority: 0, lockedBy: 7 })
    expect(markers?.[1]).toEqual({ id: 2, status: 0, priority: 0 })
  })

  it('is a no-op when no marker in the list matches the task id', () => {
    const queryClient = createTestQueryClient()
    const original = makeMarkers()
    queryClient.setQueryData(['challenge', 'taskMarkers', 42], original)

    patchChallengeTaskMarker(queryClient, 42, 999, { status: 2 })

    const updated = queryClient.getQueryData(['challenge', 'taskMarkers', 42])
    expect(updated).toEqual(original)
  })

  it('is a no-op when the marker list is not cached', () => {
    const queryClient = createTestQueryClient()

    patchChallengeTaskMarker(queryClient, 42, 1, { status: 2 })

    expect(queryClient.getQueryData(['challenge', 'taskMarkers', 42])).toBeUndefined()
  })
})

describe('invalidateChallengeAggregates', () => {
  it('does nothing when challengeId is falsy', () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateChallengeAggregates(queryClient, 0)

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('invalidates the challenge, stats, and activity caches', () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateChallengeAggregates(queryClient, 42)

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'activity', 42] })
  })
})

describe('challengeSingle', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
    apiRequestMock.put.mockReset()
    apiRequestMock.delete.mockReset()
  })

  it('getChallenge GETs the challenge by id', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ id: 42 }) })

    const { result } = renderHookWithClient(() => challengeSingle.getChallenge(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42')
    expect(result.current.data).toEqual({ id: 42 })
  })

  it('getChallenge is disabled for a falsy challengeId', () => {
    const { result } = renderHookWithClient(() => challengeSingle.getChallenge(0))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('getChallengeOptions builds a queryOptions object with the right key and queryFn', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ id: 7 }) })

    const options = challengeSingle.getChallengeOptions(7)
    expect(options.queryKey).toEqual(['challenge', 7])

    const queryFn = options.queryFn as () => Promise<ChallengeGetResponse>
    const data = await queryFn()

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/7')
    expect(data).toEqual({ id: 7 })
  })

  it('getChallengeTags GETs the tags endpoint keyed by challengeId', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([{ id: 1, name: 'foo' }]) })

    const { result } = renderHookWithClient(() => challengeSingle.getChallengeTags(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/tags')
    expect(result.current.data).toEqual([{ id: 1, name: 'foo' }])
  })

  it('getChallengeStats GETs the data endpoint keyed by challengeId', async () => {
    const stats = { total: 10 } as ChallengeStatsResponse
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(stats) })

    const { result } = renderHookWithClient(() => challengeSingle.getChallengeStats(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/data/challenge/42')
    expect(result.current.data).toEqual(stats)
  })

  it('getChallengeActivity GETs the activity endpoint with an abort signal', async () => {
    const activity = [
      { date: '2024-01-01', status: 1, statusName: 'Fixed', count: 3 },
    ] as ChallengeActivityEntry[]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(activity) })

    const { result } = renderHookWithClient(() => challengeSingle.getChallengeActivity(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith(
      'api/v2/data/challenge/42/activity',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(result.current.data).toEqual(activity)
  })

  it('getChallengeTaskMarkersOptions builds a queryOptions object for the taskMarkers endpoint', async () => {
    const markers = makeMarkers()
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(markers) })

    const options = challengeSingle.getChallengeTaskMarkersOptions(42)
    expect(options.queryKey).toEqual(['challenge', 'taskMarkers', 42])
    expect(options.enabled).toBe(true)

    const queryFn = options.queryFn as () => Promise<ChallengeTaskMarkersResponse>
    const data = await queryFn()

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/taskMarkers')
    expect(data).toEqual(markers)
  })

  it('getChallengeTaskMarkers uses the same options as getChallengeTaskMarkersOptions', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(makeMarkers()) })

    const { result } = renderHookWithClient(() => challengeSingle.getChallengeTaskMarkers(42))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/taskMarkers')
  })

  it('getRandomTask GETs a single random task and caches it', async () => {
    const tasks = [{ id: 99 }] as Task[]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(tasks) })
    const queryClient = createTestQueryClient()

    const result = await challengeSingle.getRandomTask(42, queryClient)

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/tasks/random', {
      searchParams: { limit: 1 },
    })
    expect(result).toEqual(tasks)
    expect(queryClient.getQueryData(['task', 99])).toEqual({ id: 99 })
  })

  it('fetchTasksNearby GETs the tasksNearby endpoint with default limit', async () => {
    const tasks = [{ id: 1 }] as Task[]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(tasks) })

    const result = await challengeSingle.fetchTasksNearby(42, 5)

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/tasksNearby/5', {
      searchParams: { excludeSelfLocked: 'true', limit: '5' },
    })
    expect(result).toEqual(tasks)
  })

  it('fetchTasksNearby honors a custom limit', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    await challengeSingle.fetchTasksNearby(42, 5, 20)

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/tasksNearby/5', {
      searchParams: { excludeSelfLocked: 'true', limit: '20' },
    })
  })

  it('getTasksNearby GETs the tasksNearby endpoint and caches each task by id', async () => {
    const tasks = [{ id: 11 }, { id: 12 }] as Task[]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(tasks) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeSingle.getTasksNearby(42, 5, 3)
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/challenge/42/tasksNearby/5', {
      searchParams: { excludeSelfLocked: 'true', limit: '3' },
    })
    expect(queryClient.getQueryData(['task', 11])).toEqual({ id: 11 })
    expect(queryClient.getQueryData(['task', 12])).toEqual({ id: 12 })
  })

  it('getTasksNearby is disabled when challengeId or taskId is falsy', () => {
    const { result } = renderHookWithClient(() => challengeSingle.getTasksNearby(0, 5))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useCloneChallenge PUTs to the clone endpoint with an encoded name and invalidates listings', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({ id: 100 }) })

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useCloneChallenge())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, newName: 'a/b c' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/challenge/42/clone/a%2Fb%20c')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'managed'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
  })

  it('useCreateChallenge POSTs a normalized body, applying defaults and omitting id', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve({ id: 55 }) })

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useCreateChallenge())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({
      projectId: 3,
      challengeData: { id: 999, name: 'My Challenge' } as Partial<Challenge>,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge', {
      json: {
        parent: 3,
        name: 'My Challenge',
        description: '',
        instruction: '',
        difficulty: 2,
        enabled: true,
        featured: false,
        overpassQL: '',
        overpassTargetType: '',
      },
    })
    expect(queryClient.getQueryData(['challenge', 55])).toEqual({ id: 55 })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges', 3] })
  })

  it('useCreateChallenge forwards localGeoJSON and dataOriginDate only when provided', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve({ id: 56 }) })

    const { result } = renderHookWithClient(() => challengeSingle.useCreateChallenge())

    result.current.mutate({
      projectId: 3,
      challengeData: {
        name: 'x',
        localGeoJSON: '{"type":"FeatureCollection"}',
        dataOriginDate: '2024-01-01',
      } as Partial<Challenge>,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith(
      'api/v2/challenge',
      expect.objectContaining({
        json: expect.objectContaining({
          localGeoJSON: '{"type":"FeatureCollection"}',
          dataOriginDate: '2024-01-01',
        }),
      })
    )
  })

  it('useUpdateChallenge PUTs the updates with id and invalidates related caches', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({ id: 42, name: 'new' }) })

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useUpdateChallenge())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, updates: { name: 'new' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/challenge/42', {
      json: { id: 42, name: 'new' },
    })
    expect(queryClient.getQueryData(['challenge', 42])).toEqual({ id: 42, name: 'new' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'explore'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'exploreInfinite'] })
  })

  it('useSaveOrUpdateChallenge POSTs the challenge and invalidates related caches', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve({ id: 42 }) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeSingle.useSaveOrUpdateChallenge()
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 42 } as Partial<Challenge>)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/saveOrUpdate', {
      json: { id: 42 },
    })
    expect(queryClient.getQueryData(['challenge', 42])).toEqual({ id: 42 })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'explore'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'exploreInfinite'] })
  })

  it('useUpdatePriorities PUTs the priorities and invalidates taskMarkers and task caches', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({ id: 42 }) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeSingle.useUpdatePriorities()
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const priorities = {
      defaultPriority: 0,
      highPriorityRule: '',
      highPriorityBounds: '',
      mediumPriorityRule: '',
      mediumPriorityBounds: '',
      lowPriorityRule: '',
      lowPriorityBounds: '',
    }
    result.current.mutate({ challengeId: 42, priorities })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/challenge/42/priorities', {
      json: priorities,
    })
    expect(queryClient.getQueryData(['challenge', 42])).toEqual({ id: 42 })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['challenge', 'taskMarkers', 42],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task'] })
  })

  it('usePreviewPriorities POSTs a preview request keyed by challengeId and draft', async () => {
    const preview = { priorities: {}, counts: { high: 0, medium: 0, low: 0 } }
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(preview) })

    const draft = {
      defaultPriority: 0,
      highPriorityRule: '',
      highPriorityBounds: '',
      mediumPriorityRule: '',
      mediumPriorityBounds: '',
      lowPriorityRule: '',
      lowPriorityBounds: '',
    }
    const { result } = renderHookWithClient(() => challengeSingle.usePreviewPriorities(42, draft))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/42/priorities/preview', {
      json: draft,
    })
    expect(result.current.data).toEqual(preview)
  })

  it('usePreviewPriorities is disabled when draft is null or challengeId is not positive', () => {
    const { result } = renderHookWithClient(() => challengeSingle.usePreviewPriorities(42, null))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.post).not.toHaveBeenCalled()

    const { result: result2 } = renderHookWithClient(() =>
      challengeSingle.usePreviewPriorities(0, {
        defaultPriority: 0,
        highPriorityRule: '',
        highPriorityBounds: '',
        mediumPriorityRule: '',
        mediumPriorityBounds: '',
        lowPriorityRule: '',
        lowPriorityBounds: '',
      })
    )

    expect(result2.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.post).not.toHaveBeenCalled()
  })

  it('useUploadGeoJSON PUTs FormData with computed search params and invalidates markers/stats', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useUploadGeoJSON())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const file = new File(['{}'], 'tasks.json', { type: 'application/json' })
    result.current.mutate({
      challengeId: 42,
      geoJSONFile: file,
      options: { lineByLine: true, dataOriginDate: '2024-01-01' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledTimes(1)
    const [url, requestOptions] = apiRequestMock.put.mock.calls[0]
    expect(url).toBe('api/v2/challenge/42/addFileTasks')
    expect(requestOptions.searchParams).toEqual({
      lineByLine: 'true',
      removeUnmatched: 'false',
      skipSnapshot: 'true',
      dataOriginDate: '2024-01-01',
    })
    expect(requestOptions.body).toBeInstanceOf(FormData)
    expect(requestOptions.body.get('json')).toBe(file)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['challenge', 'taskMarkers', 42],
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 42] })
  })

  it('useUploadGeoJSON omits dataOriginDate from search params when not provided', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result } = renderHookWithClient(() => challengeSingle.useUploadGeoJSON())

    const file = new File(['{}'], 'tasks.json')
    result.current.mutate({ challengeId: 42, geoJSONFile: file })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [, requestOptions] = apiRequestMock.put.mock.calls[0]
    expect(requestOptions.searchParams).toEqual({
      lineByLine: 'false',
      removeUnmatched: 'false',
      skipSnapshot: 'true',
    })
  })

  it('refreshChallenge invalidates challenge, taskMarkers, stats, and activity caches', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await challengeSingle.refreshChallenge(42, queryClient)

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'taskMarkers', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'activity', 42] })
  })

  it('useMoveChallenge POSTs to the project move endpoint and invalidates caches', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useMoveChallenge())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, toProjectId: 9 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/42/project/9')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
  })

  it('useDeleteChallenge DELETEs the challenge, removes it from cache, and invalidates lists', async () => {
    apiRequestMock.delete.mockReturnValue(Promise.resolve(undefined))

    const { result, queryClient } = renderHookWithClient(() => challengeSingle.useDeleteChallenge())
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(42)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.delete).toHaveBeenCalledWith('api/v2/challenge/42')
    expect(result.current.data).toEqual({ challengeId: 42 })
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'listing'] })
  })

  it('useArchiveChallenge POSTs the archive flag and invalidates caches', async () => {
    apiRequestMock.post.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeSingle.useArchiveChallenge()
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, isArchived: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.post).toHaveBeenCalledWith('api/v2/challenge/42/archive', {
      json: { isArchived: true },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'listing'] })
  })

  it('useRebuildChallenge PUTs with only the provided boolean search params set', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result, queryClient } = renderHookWithClient(() =>
      challengeSingle.useRebuildChallenge()
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ challengeId: 42, removeUnmatched: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/challenge/42/rebuild', {
      searchParams: { removeUnmatched: 'true' },
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 42] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['project', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 42] })
  })

  it('useRebuildChallenge omits search params that are not provided', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve(undefined) })

    const { result } = renderHookWithClient(() => challengeSingle.useRebuildChallenge())

    result.current.mutate({ challengeId: 42 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/challenge/42/rebuild', {
      searchParams: {},
    })
  })
})
