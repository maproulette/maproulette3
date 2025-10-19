import { queryOptions } from '@tanstack/react-query'
import type {
  Challenge,
  ChallengeData,
  ExploreChallengesParams,
  ExtendedFindParams,
} from '@/types/Challenge'
import type { BrowsedChallengeTaskMarkersParams, TaskMarker } from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from './'

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
          .get(`api/v2/challenges/extendedFind`, {
            searchParams: convertParamsToSearchParams(params)
          })
          .json<Challenge[]>(),
    }),

  exploreChallenges: (params: ExploreChallengesParams) =>
    queryOptions({
      queryKey: ['challenges', 'exploreChallenges', params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenges/exploreChallenges`, {
            searchParams: convertParamsToSearchParams(params),
          })
          .json<Challenge[]>(),
    }),

  getChallenge: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/challenge/${challengeId}`).json<Challenge>(),
      enabled: !!challengeId,
    }),

  getChallengeStats: (challengeId: string) =>
    queryOptions({
      queryKey: ['data', 'challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeData[]>(),
      enabled: !!challengeId,
    }),

  getChallengeTaskMarkers: (challengeId: number, params: BrowsedChallengeTaskMarkersParams) =>
    queryOptions({
      queryKey: ['challengeTaskMarkers', challengeId, params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenge/${challengeId}/taskMarkers`, {
            searchParams: convertParamsToSearchParams(params),
          })
          .json<TaskMarker[]>(),
      enabled: !!challengeId,
    }),
}
