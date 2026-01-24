import { queryOptions, useQuery } from '@tanstack/react-query'
import type {
  Challenge,
  ChallengeGetResponse,
  ChallengeStatsResponse,
  ChallengeTaskMarkersResponse,
} from '@/types/Challenge'
import type { Task } from '@/types/Task'
import { apiRequest } from '../'

export const challengeSingle = {
  getChallenge: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', challengeId],
        queryFn: () =>
          apiRequest.get(`api/v2/challenge/${challengeId}`).json<ChallengeGetResponse>(),
        enabled: !!challengeId,
      })
    ),

  getChallengeOptions: (challengeId: number) =>
    queryOptions({
      queryKey: ['challenge', challengeId],
      queryFn: () => apiRequest.get(`api/v2/challenge/${challengeId}`).json<ChallengeGetResponse>(),
    }),

  getChallengeStats: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['data', 'challenge', challengeId],
        queryFn: async () =>
          apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeStatsResponse>(),
        enabled: !!challengeId,
      })
    ),

  getChallengeTaskMarkers: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challengeTaskMarkers', challengeId],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenge/${challengeId}/taskMarkers`)
            .json<ChallengeTaskMarkersResponse>(),
        enabled: !!challengeId,
      })
    ),

  getRandomTask: (challengeId: number) => {
    return apiRequest
      .get(`api/v2/challenge/${challengeId}/tasks/random`, { searchParams: { limit: 1 } })
      .json<Task[]>()
  },

  cloneChallenge: async (challengeId: number, newName: string): Promise<ChallengeGetResponse> => {
    return apiRequest
      .put(`api/v2/challenge/${challengeId}/clone/${encodeURIComponent(newName)}`)
      .json<ChallengeGetResponse>()
  },

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

  uploadGeoJSON: async (
    challengeId: number,
    geoJSONFile: File,
    options?: {
      lineByLine?: boolean
      removeUnmatched?: boolean
      dataOriginDate?: string
      skipSnapshot?: boolean
    }
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('json', geoJSONFile)

    const searchParams: Record<string, string> = {}
    if (options?.lineByLine !== undefined) {
      searchParams.lineByLine = String(options.lineByLine)
    }
    if (options?.removeUnmatched !== undefined) {
      searchParams.removeUnmatched = String(options.removeUnmatched)
    }
    if (options?.dataOriginDate) {
      searchParams.dataOriginDate = options.dataOriginDate
    }
    if (options?.skipSnapshot !== undefined) {
      searchParams.skipSnapshot = String(options.skipSnapshot)
    }

    const request = apiRequest.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            request.headers.delete('Content-Type')
          },
        ],
      },
    })

    return request
      .put(`api/v2/challenge/${challengeId}/addFileTasks`, {
        body: formData,
        searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
      })
      .json<void>()
  },
}
