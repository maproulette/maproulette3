import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TaskStartResponse,
  TasksInBoundsParams,
  TasksInBoundsResponse,
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

  getTasks: (taskIds: number[]) =>
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
    }),

  getTaskMarkers: (params: TaskMarkersParams) =>
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
    }),

  getTasksInBounds: (params: TasksInBoundsParams) =>
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
    }),

  getTaskComments: (taskId: number) =>
    queryOptions({
      queryKey: ['taskComments', taskId],
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}/comments`).json<Comment[]>(),
      enabled: !!taskId,
    }),

  addTaskComment: async (taskId: number, comment: string, actionId?: number) => {
    return apiRequest
      .post(`api/v2/task/${taskId}/comment`, {
        json: {
          comment,
          actionId,
        },
      })
      .json<Comment>()
  },

  updateTaskStatus: async (
    taskId: number,
    status: number,
    options?: {
      tags?: string[]
      requestReview?: boolean
      comment?: string
    }
  ) => {
    const searchParams: Record<string, string> = {}
    if (options?.tags && options.tags.length > 0) {
      searchParams.tags = options.tags.join(',')
    }
    if (options?.requestReview !== undefined) {
      searchParams.requestReview = options.requestReview.toString()
    }

    const response = await apiRequest.put(`api/v2/task/${taskId}/${status}`, {
      searchParams,
      json: options?.comment ? { comment: options.comment } : undefined,
    })

    // If comment is provided, add it separately
    if (options?.comment) {
      await task.addTaskComment(taskId, options.comment)
    }

    return response
  },

  lockTask: async (taskId: number) => {
    return apiRequest.get(`api/v2/task/${taskId}/start`).json<TaskGetResponse>()
  },

  unlockTask: async (taskId: number) => {
    return apiRequest.get(`api/v2/task/${taskId}/release`).json<TaskGetResponse>()
  },

  refreshTaskLock: async (taskId: number) => {
    return apiRequest.get(`api/v2/task/${taskId}/refreshLock`).json<TaskGetResponse>()
  },

  // getTaskBundle: (bundleId: number) =>
  //   queryOptions({
  //     queryKey: ['taskBundle', bundleId],
  //     queryFn: () => apiRequest.get(`api/v2/taskBundle/${bundleId}`).json<TaskBundle>(),
  //     enabled: !!bundleId,
  //   }),
}
