import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { metaReviewStatusesForApi } from '@/lib/challengeTaskTableSearch'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TasksBoundingBoxQuery,
  TasksBoundingBoxResponse,
  TasksInBoundsParams,
  TasksInBoundsResponse,
} from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from '../'

const tasksBoundingBoxSearchParams = (query: TasksBoundingBoxQuery) => {
  const mr = metaReviewStatusesForApi(query.reviewStatuses, query.metaReviewStatuses)
  return convertParamsToSearchParams({
    limit: query.limit,
    page: query.page,
    sort: query.sort,
    order: query.order,
    includeTotal: true,
    excludeLocked: true,
    includeGeometries: false,
    includeTags: false,
    cid: query.challengeId,
    ca: true,
    tStatus: query.taskStatuses.join(','),
    priorities: query.priorities.join(','),
    trStatus: query.reviewStatuses.join(','),
    mrStatus: mr.join(','),
  })
}

export const taskMultiple = {
  getTasks: (taskIds: number[]) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['task', 'batch', [...taskIds].sort((a, b) => a - b)],
        queryFn: async () => {
          const cachedTasks: TaskGetResponse[] = []
          const missingIds: number[] = []

          for (const id of taskIds) {
            const cached = queryClient.getQueryData<TaskGetResponse>(['task', id])
            if (cached) {
              cachedTasks.push(cached)
            } else {
              missingIds.push(id)
            }
          }

          if (missingIds.length === 0) {
            return cachedTasks
          }

          const fetched = await apiRequest
            .get('api/v2/tasks', {
              searchParams: {
                taskIds: missingIds.join(','),
                mapillary: 'false',
              },
            })
            .json<TaskGetResponse[]>()

          for (const task of fetched) {
            queryClient.setQueryData(['task', task.id], task)
          }

          return [...cachedTasks, ...fetched]
        },
        enabled: taskIds.length > 0,
      })
    )
  },

  getTaskMarkers: (params: TaskMarkersParams) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'markers', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get(`api/v2/taskMarkers`, {
              searchParams: convertParamsToSearchParams(params),
              signal,
            })
            .json<TaskMarkersResponse>(),
        placeholderData: keepPreviousData,
      })
    ),

  getTasksInBounds: (params: TasksInBoundsParams, options?: { enabled?: boolean }) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'inBounds', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get('api/v2/tasks/bounds', {
              searchParams: convertParamsToSearchParams({ ...params }),
              signal,
            })
            .json<TasksInBoundsResponse>(),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
      })
    ),

  /** Paginated tasks in a box with the same filter/sort query params as maproulette3 (PUT tasks/box/...). */
  getTasksInBoundingBox: (query: TasksBoundingBoxQuery, options?: { enabled?: boolean }) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'inBoundingBox', query],
        queryFn: ({ signal }) =>
          apiRequest
            .put(`api/v2/tasks/box/${query.left}/${query.bottom}/${query.right}/${query.top}`, {
              searchParams: tasksBoundingBoxSearchParams(query),
              json: {},
              signal,
            })
            .json<TasksBoundingBoxResponse>(),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
      })
    ),
}
