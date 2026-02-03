import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TasksInBoundsParams,
  TasksInBoundsResponse,
} from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from '../'

export const taskMultiple = {
  getTasks: (taskIds: number[]) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['tasks', taskIds.sort((a, b) => a - b)],
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
        queryKey: ['taskMarkers', params],
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

  getTasksInBounds: (params: TasksInBoundsParams) =>
    useQuery(
      queryOptions({
        queryKey: ['tasksInBounds', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get('api/v2/tasks/bounds', {
              searchParams: convertParamsToSearchParams({ ...params }),
              signal,
            })
            .json<TasksInBoundsResponse>(),
        placeholderData: keepPreviousData,
      })
    ),
}
