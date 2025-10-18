import { queryOptions } from '@tanstack/react-query'
import type { Challenge, ChallengeData, ExtendedFindParams } from '@/types/Challenge'
import type { BrowsedChallengeTaskMarkersParams, TaskMarker } from '@/types/Task'
import { apiRequest } from './'

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
            searchParams: new URLSearchParams({
              global: params.global.toString(),
              bounds: params.bounds?.join(',') || '',
              sortBy: params.sortBy,
              limit: params.limit.toString(),
            }),
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
      queryKey: ['challengeTaskMarkers', challengeId],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenge/${challengeId}/taskMarkers`, {
            searchParams: new URLSearchParams([
              ...params.statuses.map((status) => ['statuses', status.toString()]),
            ]),
          })
          .json<TaskMarker[]>(),
      enabled: !!challengeId,
    }),
}
