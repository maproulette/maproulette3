import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../'

export const challengeFavorites = {
  favoriteChallenge: async (challengeId: number) => {
    return apiRequest.post(`api/v2/challenge/${challengeId}/favorite`).json<void>()
  },

  unfavoriteChallenge: async (challengeId: number) => {
    return apiRequest.delete(`api/v2/challenge/${challengeId}/favorite`).json<void>()
  },

  isChallengeFavorited: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', challengeId, 'isFavorited'],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenge/${challengeId}/favorite`)
            .json<{ isFavorited: boolean }>(),
        enabled: !!challengeId,
      })
    ),

  useFavoriteChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (challengeId: number) =>
        apiRequest.post(`api/v2/challenge/${challengeId}/favorite`).json<void>(),
      onSuccess: (_data, challengeId) => {
        queryClient.setQueryData<{ isFavorited: boolean }>(
          ['challenge', challengeId, 'isFavorited'],
          { isFavorited: true }
        )
      },
    })
  },

  useUnfavoriteChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (challengeId: number) =>
        apiRequest.delete(`api/v2/challenge/${challengeId}/favorite`).json<void>(),
      onSuccess: (_data, challengeId) => {
        queryClient.setQueryData<{ isFavorited: boolean }>(
          ['challenge', challengeId, 'isFavorited'],
          { isFavorited: false }
        )
      },
    })
  },
}
