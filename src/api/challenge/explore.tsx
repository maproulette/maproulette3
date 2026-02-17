import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  ChallengeGetResponse,
  ChallengeListingResponse,
  ExploreChallengesParams,
  FeaturedChallengesParams,
  FeaturedChallengesResponse,
  PreferredChallengesParams,
  PreferredChallengesResponse,
} from '@/types/Challenge'
import { apiRequest, convertParamsToSearchParams } from '../'

export const challengeExplore = {
  preferredChallenges: (params: PreferredChallengesParams) =>
    useQuery(
      queryOptions({
        queryKey: ['preferredChallenges', params?.limit],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenges/preferred`, {
              searchParams: params,
            })
            .json<PreferredChallengesResponse>(),
      })
    ),

  featuredChallenges: (params: FeaturedChallengesParams) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['featuredChallenges', params?.limit],
        queryFn: async () => {
          const challenges = await apiRequest
            .get(`api/v2/challenges/featured`, {
              searchParams: params,
            })
            .json<FeaturedChallengesResponse[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
      })
    )
  },

  exploreChallenges: (params: ExploreChallengesParams) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['challenges', 'exploreChallenges', params],
        queryFn: async () => {
          const challenges = await apiRequest
            .get(`api/v2/challenges/exploreChallenges`, {
              searchParams: params ? convertParamsToSearchParams(params) : undefined,
            })
            .json<ChallengeGetResponse[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
        placeholderData: (previousData) => previousData,
      })
    )
  },

  exploreChallengesInfinite: (params: ExploreChallengesParams) => {
    const queryClient = useQueryClient()
    return useInfiniteQuery(
      infiniteQueryOptions({
        queryKey: ['challenges', 'exploreChallengesInfinite', params],
        queryFn: async ({ pageParam = 0 }) => {
          const challenges = await apiRequest
            .get(`api/v2/challenges/exploreChallenges`, {
              searchParams: params
                ? convertParamsToSearchParams({ ...params, offset: pageParam })
                : undefined,
            })
            .json<ChallengeGetResponse[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
          const limit = params?.limit ?? 10
          if (lastPage.length < limit) return undefined
          return allPages.length * limit
        },
        placeholderData: keepPreviousData,
      })
    )
  },

  getChallengesListingOptions: (
    projectIds: number[],
    options?: { limit?: number; onlyEnabled?: boolean }
  ) =>
    queryOptions({
      queryKey: ['challengeListing', projectIds, options?.limit ?? -1, options?.onlyEnabled ?? false],
      queryFn: async () => {
        const challenges = await apiRequest
          .get('api/v2/challenges/listing', {
            searchParams: {
              projectIds: projectIds.join(','),
              limit: options?.limit ?? -1,
              page: 0,
              onlyEnabled: options?.onlyEnabled ?? false,
            },
          })
          .json<ChallengeListingResponse>()
        return challenges
      },
    }),

  listing: (projectIds: number[], limit = 100, page = 0, onlyEnabled = false) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['challengeListing', projectIds, limit, page, onlyEnabled],
        queryFn: async () => {
          const challenges = await apiRequest
            .get('api/v2/challenges/listing', {
              searchParams: {
                projectIds: projectIds.join(','),
                limit,
                page,
                onlyEnabled,
              },
            })
            .json<ChallengeGetResponse[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
      })
    )
  },

  searchChallenges: ({ search = '' }: { search?: string } = {}) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['searchChallenges', search],
        queryFn: async () => {
          const challenges = await apiRequest
            .get('api/v2/challenges/search', {
              searchParams: {
                search,
              },
            })
            .json<ChallengeGetResponse[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
        enabled: search.length > 0,
      })
    )
  },
}
