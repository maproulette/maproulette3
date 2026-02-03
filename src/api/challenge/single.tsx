import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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

  getRandomTask: async (challengeId: number, queryClient: QueryClient) => {
    const tasks = await apiRequest
      .get(`api/v2/challenge/${challengeId}/tasks/random`, { searchParams: { limit: 1 } })
      .json<Task[]>()
    for (const task of tasks) {
      queryClient.setQueryData(['task', task.id], task)
    }
    return tasks
  },

  getTasksNearby: (challengeId: number, taskId: number, limit = 5) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['tasksNearby', challengeId, taskId, limit],
        queryFn: async () => {
          const tasks = await apiRequest
            .get(`api/v2/challenge/${challengeId}/tasksNearby/${taskId}`, {
              searchParams: { excludeSelfLocked: 'true', limit: String(limit) },
            })
            .json<Task[]>()
          for (const task of tasks) {
            queryClient.setQueryData(['task', task.id], task)
          }
          return tasks
        },
        enabled: !!challengeId && !!taskId,
      })
    )
  },

  // Mutation hook
  useCloneChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ challengeId, newName }: { challengeId: number; newName: string }) =>
        apiRequest
          .put(`api/v2/challenge/${challengeId}/clone/${encodeURIComponent(newName)}`)
          .json<ChallengeGetResponse>(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['challenge'] })
        queryClient.invalidateQueries({ queryKey: ['managedChallenges'] })
      },
    })
  },

  useCreateChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        projectId,
        challengeData,
      }: {
        projectId: number
        challengeData: Partial<Challenge>
      }) => {
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
      onSuccess: (newChallenge, variables) => {
        // Set the new challenge in cache
        queryClient.setQueryData<Challenge>(['challenge', newChallenge.id], newChallenge)
        // Invalidate project challenges list
        queryClient.invalidateQueries({ queryKey: ['projectChallenges', variables.projectId] })
      },
    })
  },

  useUpdateChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        challengeId,
        updates,
      }: {
        challengeId: number
        updates: Partial<Challenge>
      }) =>
        apiRequest
          .put(`api/v2/challenge/${challengeId}`, {
            json: {
              id: challengeId,
              ...updates,
            },
          })
          .json<Challenge>(),
      onSuccess: (updatedChallenge) => {
        queryClient.setQueryData<ChallengeGetResponse>(
          ['challenge', updatedChallenge.id],
          updatedChallenge
        )
      },
    })
  },

  useUploadGeoJSON: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        challengeId,
        geoJSONFile,
        options,
      }: {
        challengeId: number
        geoJSONFile: File
        options?: {
          lineByLine?: boolean
          removeUnmatched?: boolean
          dataOriginDate?: string
          skipSnapshot?: boolean
        }
      }) => {
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
              (req) => {
                req.headers.delete('Content-Type')
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
      onSuccess: (_data, variables) => {
        // Invalidate challenge task markers since tasks changed
        queryClient.invalidateQueries({ queryKey: ['challengeTaskMarkers', variables.challengeId] })
        queryClient.invalidateQueries({ queryKey: ['data', 'challenge', variables.challengeId] })
      },
    })
  },

  refreshChallenge: async (challengeId: number, queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] })
  },
}
