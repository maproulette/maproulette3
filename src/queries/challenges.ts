import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Challenge, ExtendedFindParams } from '@/types/Challenge'

const preferredChallengesOptions = (limit: number = 5) =>
  queryOptions({
    queryKey: ['preferredChallenges', limit],
    queryFn: () => api.get(`api/v2/challenges/preferred?limit=${limit}`).json<Challenge[]>(),
  })

const featuredChallengesOptions = (limit: number = 50) =>
  queryOptions({
    queryKey: ['featuredChallenges', limit],
    queryFn: () => api.get(`api/v2/challenges/featured?limit=${limit}`).json<Challenge[]>(),
  })

const extendedFindChallengesOptions = (params: ExtendedFindParams) =>
  queryOptions({
    queryKey: ['challenges', 'extendedFind', params],
    queryFn: () => api.post('api/v2/challenges/extendedFind', { json: params }).json<Challenge[]>(),
  })

export { preferredChallengesOptions, featuredChallengesOptions, extendedFindChallengesOptions }
