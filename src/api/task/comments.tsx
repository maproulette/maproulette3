import { queryOptions, useQuery } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
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
}
