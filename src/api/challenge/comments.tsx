import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/types/Comment'
import { apiRequest } from '../'

export interface ChallengeCommentResponse {
  id: number
  osm_id: number
  osm_username: string
  avatarUrl: string
  challengeId: number
  projectId: number
  created: number
  comment: string
}

export const challengeComments = {
  searchChallengeComments: ({
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
        queryKey: ['searchChallengeComments', q, limit],
        queryFn: () =>
          apiRequest
            .get('api/v2/challengeComments/search', {
              searchParams: { q, limit },
            })
            .json<ChallengeCommentResponse[]>(),
        enabled,
        placeholderData: (previousData) => previousData,
      })
    ),

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

  useAddChallengeComment: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ challengeId, comment }: { challengeId: number; comment: string }) =>
        apiRequest
          .post(`api/v2/challenge/${challengeId}/comment`, {
            json: { comment },
          })
          .json<{ id: number; comment: string; created: number }>(),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['challengeComments', variables.challengeId] })
        queryClient.invalidateQueries({
          queryKey: ['challengeTaskComments', variables.challengeId],
        })
      },
    })
  },
}
