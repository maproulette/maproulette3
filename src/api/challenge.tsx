import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type {
  Challenge,
  ChallengeGetResponse,
  ChallengeStatsResponse,
  ChallengeTaskMarkersResponse,
  ExploreChallengesParams,
  FeaturedChallengesParams,
  FeaturedChallengesResponse,
  PreferredChallengesParams,
  PreferredChallengesResponse,
} from '@/types/Challenge'
import type { Comment } from '@/types/Comment'
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

  exploreChallengesInfinite: (params: ExploreChallengesParams) =>
    infiniteQueryOptions({
      queryKey: ['challenges', 'exploreChallengesInfinite', params],
      queryFn: ({ pageParam = 0 }) =>
        apiRequest
          .get(`api/v2/challenges/exploreChallenges`, {
            searchParams: params
              ? convertParamsToSearchParams({ ...params, offset: pageParam })
              : undefined,
          })
          .json<ChallengeGetResponse[]>(),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const limit = params?.limit ?? 10
        if (lastPage.length < limit) return undefined
        return allPages.length * limit
      },
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
      queryFn: async () =>
        apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeStatsResponse>(),
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

  searchChallenges: ({ search = '' }: { search?: string } = {}) =>
    queryOptions({
      queryKey: ['searchChallenges', search],
      queryFn: () =>
        apiRequest
          .get('api/v2/challenges/search', {
            searchParams: {
              search,
            },
          })
          .json<ChallengeGetResponse[]>(),
      enabled: search.length > 0,
    }),

  // Favorite endpoints
  favoriteChallenge: async (challengeId: number) => {
    return apiRequest.post(`api/v2/challenge/${challengeId}/favorite`).json<void>()
  },

  unfavoriteChallenge: async (challengeId: number) => {
    return apiRequest.delete(`api/v2/challenge/${challengeId}/favorite`).json<void>()
  },

  isChallengeFavorited: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId, 'isFavorited'],
      queryFn: () =>
        apiRequest.get(`api/v2/challenge/${challengeId}/favorite`).json<{ isFavorited: boolean }>(),
      enabled: !!challengeId,
    }),

  // Like endpoints
  likeChallenge: async (challengeId: number) => {
    return apiRequest.post(`api/v2/challenge/${challengeId}/like`).json<void>()
  },

  unlikeChallenge: async (challengeId: number) => {
    return apiRequest.delete(`api/v2/challenge/${challengeId}/like`).json<void>()
  },

  isChallengeLiked: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId, 'isLiked'],
      queryFn: () =>
        apiRequest.get(`api/v2/challenge/${challengeId}/like`).json<{ isLiked: boolean }>(),
      enabled: !!challengeId,
    }),

  getChallengeLikeCount: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId, 'likeCount'],
      queryFn: () =>
        apiRequest.get(`api/v2/challenge/${challengeId}/likeCount`).json<{ likeCount: number }>(),
      enabled: !!challengeId,
    }),

  // Comment endpoints
  getChallengeComments: (challengeId: number) =>
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
    }),

  getTaskComments: (challengeId: number) =>
    queryOptions({
      queryKey: ['challengeTaskComments', challengeId],
      queryFn: async () => {
        const response = await apiRequest
          .get(`api/v2/challenge/${challengeId}/comments`)
          .json<Record<string, Comment[]>>()
        return response || {}
      },
      enabled: !!challengeId,
    }),

  addChallengeComment: async (challengeId: number, comment: string) => {
    return apiRequest
      .post(`api/v2/challenge/${challengeId}/comment`, {
        json: { comment },
      })
      .json<{ id: number; comment: string; created: number }>()
  },

  cloneChallenge: async (challengeId: number, newName: string) => {
    return apiRequest
      .put(`api/v2/challenge/${challengeId}/clone/${encodeURIComponent(newName)}`)
      .json<ChallengeGetResponse>()
  createChallenge: async (
    projectId: number,
    challengeData: Partial<Challenge>
  ): Promise<Challenge> => {
    const { id: _id, ...challengeDataWithoutId } = challengeData
    const body: Record<string, unknown> = {
      parent: projectId,
      name: challengeDataWithoutId.name || '',
      description: challengeDataWithoutId.description || '',
      blurb: challengeDataWithoutId.blurb || '',
      instruction: challengeDataWithoutId.instruction || '',
      difficulty: challengeDataWithoutId.difficulty ?? 2,
      enabled: challengeDataWithoutId.enabled ?? true,
      featured: challengeDataWithoutId.featured ?? false,
      overpassQL: challengeDataWithoutId.overpassQL || '',
      overpassTargetType: '',
    }

    return apiRequest.post('api/v2/challenge', { json: body }).json<Challenge>()
  },

  updateChallenge: async (challengeId: number, updates: Partial<Challenge>): Promise<Challenge> => {
    return apiRequest
      .put(`api/v2/challenge/${challengeId}`, {
        json: {
          id: challengeId,
          ...updates,
        },
      })
      .json<Challenge>()
  },
}
