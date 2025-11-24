import { queryOptions } from '@tanstack/react-query'
import type {
  ChallengeGetResponse,
  ChallengeTaskMarkersResponse,
  ExploreChallengesParams,
  FeaturedChallengesParams,
  FeaturedChallengesResponse,
  PreferredChallengesParams,
  PreferredChallengesResponse,
} from '@/types/Challenge'
import type { Task } from '@/types/Task'
import { apiRequest, convertParamsToSearchParams } from './'

export const challenge = {
  preferredChallenges: (params: PreferredChallengesParams) =>
    queryOptions({
      queryKey: ['preferredChallenges', params?.limit],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenges/preferred`, {
            searchParams: params,
          })
          .json<PreferredChallengesResponse>(),
    }),

  featuredChallenges: (params: FeaturedChallengesParams) =>
    queryOptions({
      queryKey: ['featuredChallenges', params?.limit],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenges/featured`, {
            searchParams: params,
          })
          .json<FeaturedChallengesResponse>(),
    }),

  exploreChallenges: (params: ExploreChallengesParams) =>
    queryOptions({
      queryKey: ['challenges', 'exploreChallenges', params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenges/exploreChallenges`, {
            searchParams: params ? convertParamsToSearchParams(params) : undefined,
          })
          .json<ChallengeGetResponse[]>(),
      placeholderData: (previousData) => previousData,
    }),

  getChallenge: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/challenge/${challengeId}`).json<ChallengeGetResponse>(),
      enabled: !!challengeId,
    }),

  getChallengeStats: (challengeId: number) =>
    queryOptions({
      queryKey: ['data', 'challenge', challengeId],
      queryFn: () =>
        apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeGetResponse>(),
      enabled: !!challengeId,
    }),

  getChallengeTaskMarkers: (challengeId: number) =>
    queryOptions({
      queryKey: ['challengeTaskMarkers', challengeId],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenge/${challengeId}/taskMarkers`)
          .json<ChallengeTaskMarkersResponse>(),
      enabled: !!challengeId,
    }),

  listing: (projectIds: number[], limit = 100, page = 0, onlyEnabled = false) =>
    queryOptions({
      queryKey: ['challengeListing', projectIds, limit, page, onlyEnabled],
      queryFn: () =>
        apiRequest
          .get('api/v2/challenges/listing', {
            searchParams: {
              projectIds: projectIds.join(','),
              limit,
              page,
              onlyEnabled,
            },
          })
          .json<ChallengeGetResponse[]>(),
    }),

  getRandomTask: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId, 'randomTask'],
      queryFn: () =>
        apiRequest
          .get(`api/v2/challenge/${challengeId}/tasks/random`, {
            searchParams: { limit: 1 },
          })
          .json<Task[]>(),
      enabled: !!challengeId,
    }),
}
