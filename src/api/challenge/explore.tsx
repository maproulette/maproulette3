import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import type {
  ChallengeGetResponse,
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

  featuredChallenges: (params: FeaturedChallengesParams) =>
    useQuery(
      queryOptions({
        queryKey: ['featuredChallenges', params?.limit],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenges/featured`, {
              searchParams: params,
            })
            .json<FeaturedChallengesResponse>(),
      })
    ),

  exploreChallenges: (params: ExploreChallengesParams) =>
    useQuery(
      queryOptions({
        queryKey: ['challenges', 'exploreChallenges', params],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenges/exploreChallenges`, {
              searchParams: params ? convertParamsToSearchParams(params) : undefined,
            })
            .json<ChallengeGetResponse[]>(),
        placeholderData: (previousData) => previousData,
      })
    ),

  exploreChallengesInfinite: (params: ExploreChallengesParams) =>
    useInfiniteQuery(
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
      })
    ),

  listing: (projectIds: number[], limit = 100, page = 0, onlyEnabled = false) =>
    useQuery(
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
      })
    ),

  searchChallenges: ({ search = '' }: { search?: string } = {}) =>
    useQuery(
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
      })
    ),
}
