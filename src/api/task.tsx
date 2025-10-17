import { queryOptions } from '@tanstack/react-query'
import { apiRequest } from './'
import type { Task, TaskMarker, TaskMarkersParams } from '@/types/Task'

const queryKey = (taskId: string) => ['task', taskId]

export const task = {
  startTask: (taskId: string) =>
    queryOptions({
      queryKey: queryKey(taskId),
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}/start`).json<Task>(),
      enabled: !!taskId,
    }),

  getTask: (taskId: string) =>
    queryOptions({
      queryKey: queryKey(taskId),
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<Task>(),
      enabled: !!taskId,
    }),

  getTaskMarkers: (params: TaskMarkersParams) =>
    queryOptions({
      queryKey: ['taskMarkers', params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/taskMarkers`, {
            searchParams: new URLSearchParams([
              ['global', params.global.toString()],
              ...params.statuses.map((status) => ['statuses', status.toString()]),
            ]),
          })
          .json<TaskMarker[]>(),
    }),
}
