import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TasksInBoundsParams,
  TasksInBoundsResponse,
} from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from '../'

export const taskMultiple = {
  getTasks: (taskIds: number[]) =>
    useQuery(
      queryOptions({
        queryKey: ['tasks', taskIds.sort((a, b) => a - b)],
        queryFn: () =>
          apiRequest
            .get('api/v2/tasks', {
              searchParams: {
                taskIds: taskIds.join(','),
                mapillary: 'false',
              },
            })
            .json<TaskGetResponse[]>(),
        enabled: taskIds.length > 0,
      })
    ),

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
