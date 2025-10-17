import { queryOptions } from '@tanstack/react-query'
import { apiRequest } from './'
import type { Challenge, ChallengeData, ExtendedFindParams } from '@/types/Challenge'

export const challenge = {
  preferredChallenges: (limit: number = 5) =>
    queryOptions({
      queryKey: ['preferredChallenges', limit],
      queryFn: () =>
        apiRequest.get(`api/v2/challenges/preferred?limit=${limit}`).json<Challenge[]>(),
    }),

  featuredChallenges: (limit: number = 50) =>
    queryOptions({
      queryKey: ['featuredChallenges', limit],
      queryFn: () =>
        apiRequest.get(`api/v2/challenges/featured?limit=${limit}`).json<Challenge[]>(),
    }),

  extendedFind: (params: ExtendedFindParams) =>
    queryOptions({
      queryKey: ['challenges', 'extendedFind', params],
      queryFn: () =>
        apiRequest
          .get('api/v2/challenges/extendedFind', {
            searchParams: { ...params },
          })
          .json<Challenge[]>(),
    }),

  getChallenge: (challengeId: number | undefined) =>
    queryOptions({
      queryKey: ['challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/challenge/${challengeId}`).json<Challenge>(),
      enabled: !!challengeId,
    }),

  getChallengeStats: (challengeId: number | undefined) =>
    queryOptions({
      queryKey: ['data', 'challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeData[]>(),
      enabled: !!challengeId,
    }),
}
