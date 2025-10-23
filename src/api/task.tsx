import { queryOptions } from '@tanstack/react-query'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TaskStartResponse,
} from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from './'

export const task = {
  startTask: (taskId: number) =>
    queryOptions({
      queryKey: ['task', taskId, 'start'],
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}/start`).json<TaskStartResponse>(),
      enabled: !!taskId,
    }),

  getTask: (taskId: number) =>
    queryOptions({
      queryKey: ['task', taskId],
      queryFn: () =>
        apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<TaskGetResponse>(),
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
          .json<TaskMarkersResponse>(),
    }),

  // getTaskBundle: (bundleId: number) =>
  //   queryOptions({
  //     queryKey: ['taskBundle', bundleId],
  //     queryFn: () => apiRequest.get(`api/v2/taskBundle/${bundleId}`).json<TaskBundle>(),
  //     enabled: !!bundleId,
  //   }),
}
