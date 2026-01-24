import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiRequest } from '../'

export const challengeLikes = {
  likeChallenge: async (challengeId: number) => {
    return apiRequest.post(`api/v2/challenge/${challengeId}/like`).json<void>()
  },

  unlikeChallenge: async (challengeId: number) => {
    return apiRequest.delete(`api/v2/challenge/${challengeId}/like`).json<void>()
  },

  isChallengeLiked: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', challengeId, 'isLiked'],
        queryFn: () =>
          apiRequest.get(`api/v2/challenge/${challengeId}/like`).json<{ isLiked: boolean }>(),
        enabled: !!challengeId,
      })
    ),

  getChallengeLikeCount: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', challengeId, 'likeCount'],
        queryFn: () =>
          apiRequest.get(`api/v2/challenge/${challengeId}/likeCount`).json<{ likeCount: number }>(),
        enabled: !!challengeId,
      })
    ),
}
