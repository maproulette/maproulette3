import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
import type { TaskHistoryAction } from '@/types/Task'
import { apiRequest } from '../'

export const taskComments = {
  getTaskComments: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['taskComments', taskId],
        queryFn: () => apiRequest.get(`api/v2/task/${taskId}/comments`).json<Comment[]>(),
        enabled: !!taskId,
      })
    ),

  getTaskHistory: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['taskHistory', taskId],
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
        queryClient.setQueryData<Comment[]>(['taskComments', variables.taskId], (oldComments) =>
          oldComments ? [...oldComments, newComment] : [newComment]
        )
        // Also invalidate task history so the new comment shows up
        queryClient.invalidateQueries({ queryKey: ['taskHistory', variables.taskId] })
      },
    })
  },
}
