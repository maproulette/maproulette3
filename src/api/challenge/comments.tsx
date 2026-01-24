import { queryOptions, useQuery } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
import { apiRequest } from '../'

export const challengeComments = {
  getChallengeComments: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challengeComments', challengeId],
        queryFn: () =>
          apiRequest.get(`api/v2/challenge/${challengeId}/challengeComments`).json<
            Array<{
              id: number
              osm_id: number
              osm_username: string
              avatarUrl: string
              challengeId: number
              projectId: number
              created: number
              comment: string
            }>
          >(),
        enabled: !!challengeId,
      })
    ),

  getTaskComments: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challengeTaskComments', challengeId],
        queryFn: async () => {
          const response = await apiRequest
            .get(`api/v2/challenge/${challengeId}/comments`)
            .json<Record<string, Comment[]>>()
          return response || {}
        },
        enabled: !!challengeId,
      })
    ),

  addChallengeComment: async (challengeId: number, comment: string) => {
    return apiRequest
      .post(`api/v2/challenge/${challengeId}/comment`, {
        json: { comment },
      })
      .json<{ id: number; comment: string; created: number }>()
  },
}
