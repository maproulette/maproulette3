import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TaskGetResponse, TaskStartResponse } from '@/types/Task'
import { apiRequest } from '../'

export interface TaskSearchResult {
  id: number
  name: string
  status: number | null
  parent: number
  challengeName: string
}

export const taskSingle = {
  searchTasks: ({ q, limit = 25 }: { q: string; limit?: number }) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'search', { q, limit }],
        queryFn: () =>
          apiRequest
            .get('api/v2/tasks/search', {
              searchParams: { q, limit },
            })
            .json<TaskSearchResult[]>(),
        enabled: q.length > 0,
      })
    ),

  startTask: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['task', taskId, 'start'],
        queryFn: () => apiRequest.get(`api/v2/task/${taskId}/start`).json<TaskStartResponse>(),
        enabled: !!taskId,
      })
    ),

  getTaskOptions: (taskId: number) =>
    queryOptions({
      queryKey: ['task', taskId],
      queryFn: () =>
        apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<TaskGetResponse>(),
      enabled: !!taskId,
    }),

  getTask: (taskId: number) => useQuery(taskSingle.getTaskOptions(taskId)),

  // Mutation hooks
  useLockTask: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (taskId: number) =>
        apiRequest.get(`api/v2/task/${taskId}/start`).json<TaskGetResponse>(),
      onSuccess: (lockedTask, taskId) => {
        queryClient.setQueryData<TaskGetResponse>(['task', taskId], lockedTask)
      },
    })
  },

  useUnlockTask: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (taskId: number) =>
        apiRequest.get(`api/v2/task/${taskId}/release`).json<TaskGetResponse>(),
      onSuccess: (unlockedTask, taskId) => {
        queryClient.setQueryData<TaskGetResponse>(['task', taskId], unlockedTask)
      },
    })
  },

  updateTask: async (taskId: number, body: TaskGetResponse) => {
    return apiRequest.put(`api/v2/task/${taskId}`, { json: body }).json<TaskGetResponse>()
  },

  useUpdateTask: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ taskId, body }: { taskId: number; body: TaskGetResponse }) =>
        taskSingle.updateTask(taskId, body),
      onSuccess: (updatedTask, { taskId }) => {
        queryClient.setQueryData<TaskGetResponse>(['task', taskId], updatedTask)
        if (updatedTask?.parent) {
          queryClient.invalidateQueries({ queryKey: ['challenge', 'stats', updatedTask.parent] })
          queryClient.invalidateQueries({ queryKey: ['challenge', updatedTask.parent] })
        }
      },
    })
  },

  useUpdateTaskStatus: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({
        taskId,
        status,
        options,
      }: {
        taskId: number
        status: number
        options?: {
          tags?: string[]
          requestReview?: boolean
          comment?: string
        }
      }) => {
        // Build query string manually
        const params = new URLSearchParams()
        if (options?.tags && options.tags.length > 0) {
          params.set('tags', options.tags.join(','))
        }
        if (options?.requestReview !== undefined) {
          params.set('requestReview', options.requestReview.toString())
        }

        const queryString = params.toString()
        const url = `api/v2/task/${taskId}/${status}${queryString ? `?${queryString}` : ''}`

        const response = await apiRequest.put(url)

        // If comment is provided, add it separately
        if (options?.comment) {
          await apiRequest
            .post(`api/v2/task/${taskId}/comment`, {
              json: {
                comment: options.comment,
              },
            })
            .json()
        }

        // Handle case where response might be empty (204 No Content)
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return response.json<TaskGetResponse>()
        }

        // If no JSON response, fetch the updated task
        return apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<TaskGetResponse>()
      },
      onSuccess: (updatedTask, variables) => {
        queryClient.setQueryData<TaskGetResponse>(['task', variables.taskId], updatedTask)
        // Invalidate challenge stats since task status changed
        if (updatedTask?.parent) {
          queryClient.invalidateQueries({ queryKey: ['challenge', 'stats', updatedTask.parent] })
          queryClient.invalidateQueries({ queryKey: ['challenge', updatedTask.parent] })
        }
      },
    })
  },
}
