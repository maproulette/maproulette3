import { queryOptions } from '@tanstack/react-query'
import type { Task, TaskMarkersParams, TasksMapData } from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from './'

/**
 * Task API
 *
 * Now using types generated from the Swagger specification.
 */
export const task = {
  startTask: (taskId: string) =>
    queryOptions({
      queryKey: ['task', taskId, 'start'],
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}/start`).json<Task>(),
      enabled: !!taskId,
    }),

  getTask: (taskId: number | undefined) =>
    queryOptions({
      queryKey: ['task', taskId],
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<Task>(),
      enabled: !!taskId,
    }),

  getTaskMarkers: (params: TaskMarkersParams) =>
    queryOptions({
      queryKey: ['taskMarkers', params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/taskMarkers`, {
            searchParams: convertParamsToSearchParams(params),
          })
          .json<TasksMapData>(),
    }),

  // getTaskBundle: (bundleId: number) =>
  //   queryOptions({
  //     queryKey: ['taskBundle', bundleId],
  //     queryFn: () => apiRequest.get(`api/v2/taskBundle/${bundleId}`).json<TaskBundle>(),
  //     enabled: !!bundleId,
  //   }),
}
