import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Challenge, ExtendedFindParams } from '@/types/Challenge'
import type { Project } from '@/types/Project'

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

const getChallengeOptions = (challengeId: string) =>
  queryOptions({
    queryKey: ['challenge', challengeId],
    queryFn: () => api.get(`api/v2/challenge/${challengeId}`).json<Challenge>(),
    enabled: !!challengeId,
  })

const getProjectOptions = (projectId: string) =>
  queryOptions({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`api/v2/project/${projectId}`).json<Project>(),
    enabled: !!projectId,
  })

export {
  preferredChallengesOptions,
  featuredChallengesOptions,
  extendedFindChallengesOptions,
  getChallengeOptions,
  getProjectOptions,
}
