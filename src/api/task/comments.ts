import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
import type { TaskHistoryAction } from '@/types/Task'
import { apiRequest } from '../'

export const taskComments = {
  searchTaskComments: ({
    q,
    limit = 10,
    enabled = true,
  }: {
    q: string
    limit?: number
    enabled?: boolean
  }) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'comments', 'search', { q, limit }],
        queryFn: () =>
          apiRequest
            .get('api/v2/comments/search', {
              searchParams: { q, limit },
            })
            .json<Comment[]>(),
        enabled,
        placeholderData: (previousData) => previousData,
      })
    ),

  getTaskComments: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'comments', taskId],
        queryFn: () => apiRequest.get(`api/v2/task/${taskId}/comments`).json<Comment[]>(),
        enabled: !!taskId,
      })
    ),

  getTaskHistory: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['task', 'history', taskId],
        queryFn: () => apiRequest.get(`api/v2/task/${taskId}/history`).json<TaskHistoryAction[]>(),
        enabled: !!taskId,
      })
    ),

  useAddTaskComment: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ taskId, commentText }: { taskId: number; commentText: string }) =>
        apiRequest
          .post(`api/v2/task/${taskId}/comment`, {
            json: { comment: commentText },
          })
          .json<Comment>(),
      onSuccess: (newComment, variables) => {
        queryClient.setQueryData<Comment[]>(
          ['task', 'comments', variables.taskId],
          (oldComments) => (oldComments ? [...oldComments, newComment] : [newComment])
        )
        // Also invalidate task history so the new comment shows up
        queryClient.invalidateQueries({ queryKey: ['task', 'history', variables.taskId] })
      },
    })
  },
}
