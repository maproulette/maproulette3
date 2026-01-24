import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TaskGetResponse, TaskStartResponse } from '@/types/Task'
import { apiRequest } from '../'

export const taskSingle = {
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
      await apiRequest
        .post(`api/v2/task/${taskId}/comment`, {
          json: {
            comment: options.comment,
          },
        })
        .json()
    }

    return response
  },

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
}
