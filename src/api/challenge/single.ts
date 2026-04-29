import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  Challenge,
  ChallengeActivityEntry,
  ChallengeGetResponse,
  ChallengeStatsResponse,
  ChallengeTaskMarkersResponse,
} from '@/types/Challenge'
import type { Task } from '@/types/Task'
import { apiKey, apiRequest } from '../'

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

  getChallengeTags: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', 'tags', challengeId],
        queryFn: () =>
          apiRequest
            .get(`api/v2/challenge/${challengeId}/tags`)
            .json<Array<{ id: number; name: string }>>(),
        enabled: !!challengeId,
        staleTime: 5 * 60 * 1000,
      })
    ),

  getChallengeStats: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', 'stats', challengeId],
        queryFn: async () =>
          apiRequest.get(`api/v2/data/challenge/${challengeId}`).json<ChallengeStatsResponse>(),
        enabled: !!challengeId,
      })
    ),

  getChallengeActivity: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', 'activity', challengeId],
        queryFn: ({ signal }) =>
          apiRequest
            .get(`api/v2/data/challenge/${challengeId}/activity`, { signal })
            .json<ChallengeActivityEntry[]>(),
        enabled: !!challengeId,
      })
    ),

  getChallengeTaskMarkers: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', 'taskMarkers', challengeId],
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

  fetchTasksNearby: async (challengeId: number, taskId: number, limit = 5) => {
    const tasks = await apiRequest
      .get(`api/v2/challenge/${challengeId}/tasksNearby/${taskId}`, {
        searchParams: { excludeSelfLocked: 'true', limit: String(limit) },
      })
      .json<Task[]>()
    return tasks
  },

  getTasksNearby: (challengeId: number, taskId: number, limit = 5) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['challenge', 'tasksNearby', challengeId, { taskId, limit }],
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
        queryClient.invalidateQueries({ queryKey: ['challenge', 'managed'] })
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
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
        const { id: _, ...challengeDataWithoutId } = challengeData
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
        const extra = challengeDataWithoutId as Record<string, unknown>
        if (extra.localGeoJSON !== undefined) body.localGeoJSON = extra.localGeoJSON
        if (extra.dataOriginDate !== undefined) body.dataOriginDate = extra.dataOriginDate

        return apiRequest.post('api/v2/challenge', { json: body }).json<Challenge>()
      },
      onSuccess: (newChallenge, variables) => {
        // Set the new challenge in cache
        queryClient.setQueryData<Challenge>(['challenge', newChallenge.id], newChallenge)
        // Invalidate project challenges list
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges', variables.projectId] })
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
        void queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
        void queryClient.invalidateQueries({ queryKey: ['challenge', 'explore'] })
        void queryClient.invalidateQueries({ queryKey: ['challenge', 'exploreInfinite'] })
      },
    })
  },

  useSaveOrUpdateChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (challenge: Partial<Challenge>) =>
        apiRequest.post('api/v2/challenge/saveOrUpdate', { json: challenge }).json<Challenge>(),
      onSuccess: (saved) => {
        queryClient.setQueryData<ChallengeGetResponse>(['challenge', saved.id], saved)
        void queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
        void queryClient.invalidateQueries({ queryKey: ['challenge', 'explore'] })
        void queryClient.invalidateQueries({ queryKey: ['challenge', 'exploreInfinite'] })
      },
    })
  },

  useUpdatePriorities: () => {
    const queryClient = useQueryClient()
    return useMutation({
      // The body must always include every priority key, even when a tier's
      // rule or bounds have been cleared. Empty strings tell the backend
      // "unset this field"; omitting them makes the DAL fall back to the
      // cached value and persist stale config the user thought they deleted.
      mutationFn: ({
        challengeId,
        priorities,
      }: {
        challengeId: number
        priorities: {
          defaultPriority: number
          highPriorityRule: string
          highPriorityBounds: string
          mediumPriorityRule: string
          mediumPriorityBounds: string
          lowPriorityRule: string
          lowPriorityBounds: string
        }
      }) =>
        apiRequest
          .put(`api/v2/challenge/${challengeId}/priorities`, { json: priorities })
          .json<Challenge>(),
      onSuccess: (updated, variables) => {
        queryClient.setQueryData<ChallengeGetResponse>(['challenge', updated.id], updated)
        // Backend re-evaluates every task's priority; force a refetch so the
        // map markers and any per-task views show the new tier values.
        void queryClient.invalidateQueries({
          queryKey: ['challenge', 'taskMarkers', variables.challengeId],
        })
        void queryClient.invalidateQueries({ queryKey: ['task'] })
      },
    })
  },

  /**
   * Dry-run priority recompute. Takes the same body as `useUpdatePriorities`
   * and returns the priority each task would receive, without writing. The
   * editor calls this (debounced) so the preview map and match counts match
   * what a subsequent save would actually persist — client-side `evaluatePriority`
   * can't evaluate rule-based tiers since the frontend doesn't load OSM tags.
   */
  usePreviewPriorities: (
    challengeId: number,
    draft: {
      defaultPriority: number
      highPriorityRule: string
      highPriorityBounds: string
      mediumPriorityRule: string
      mediumPriorityBounds: string
      lowPriorityRule: string
      lowPriorityBounds: string
    } | null
  ) =>
    useQuery({
      // Include the draft in the key so React Query dedupes identical drafts
      // and fetches anew when the user actually edits — no manual debounce
      // state plumbing needed on the caller side.
      queryKey: ['challenge', 'priorities', 'preview', challengeId, draft],
      queryFn: () =>
        apiRequest
          .post(`api/v2/challenge/${challengeId}/priorities/preview`, {
            json: draft ?? {},
          })
          .json<{
            priorities: Record<string, number>
            counts: { high: number; medium: number; low: number }
          }>(),
      enabled: Number.isFinite(challengeId) && challengeId > 0 && draft != null,
      // Keep the previous result rendered while a new preview is in flight,
      // so pins don't flicker to default between keystrokes.
      placeholderData: (prev) => prev,
      staleTime: 0,
    }),

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
        const searchParams: Record<string, string> = {
          lineByLine: String(options?.lineByLine ?? false),
          removeUnmatched: String(options?.removeUnmatched ?? false),
          skipSnapshot: String(options?.skipSnapshot ?? true),
        }
        if (options?.dataOriginDate) {
          searchParams.dataOriginDate = options.dataOriginDate
        }

        const formData = new FormData()
        formData.append('json', geoJSONFile)

        // Server expects multipart/form-data with boundary. apiRequest defaults to
        // Content-Type: application/json, so use a client that omits Content-Type
        // and lets the browser set multipart/form-data; boundary=...
        const multipartRequest = apiRequest.extend({
          hooks: {
            beforeRequest: [
              (req) => {
                req.headers.delete('Content-Type')
                if (apiKey) req.headers.set('apiKey', apiKey)
              },
            ],
          },
        })

        return multipartRequest
          .put(`api/v2/challenge/${challengeId}/addFileTasks`, {
            body: formData,
            searchParams,
          })
          .json<void>()
      },
      onSuccess: (_data, variables) => {
        // Invalidate challenge task markers since tasks changed
        queryClient.invalidateQueries({
          queryKey: ['challenge', 'taskMarkers', variables.challengeId],
        })
        queryClient.invalidateQueries({ queryKey: ['challenge', 'stats', variables.challengeId] })
      },
    })
  },

  refreshChallenge: async (challengeId: number, queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] })
  },

  useMoveChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ challengeId, toProjectId }: { challengeId: number; toProjectId: number }) =>
        apiRequest.post(`api/v2/challenge/${challengeId}/project/${toProjectId}`).json<void>(),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] })
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
      },
    })
  },

  useDeleteChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (challengeId: number) =>
        apiRequest.delete(`api/v2/challenge/${challengeId}`).then(() => ({ challengeId })),
      onSuccess: (_, challengeId) => {
        queryClient.removeQueries({ queryKey: ['challenge', challengeId] })
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
        queryClient.invalidateQueries({ queryKey: ['challenge', 'listing'] })
      },
    })
  },

  useArchiveChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ challengeId, isArchived }: { challengeId: number; isArchived: boolean }) =>
        apiRequest
          .post(`api/v2/challenge/${challengeId}/archive`, {
            json: { isArchived },
          })
          .json<void>(),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] })
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
        queryClient.invalidateQueries({ queryKey: ['challenge', 'listing'] })
      },
    })
  },

  useRebuildChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        challengeId,
        removeUnmatched,
        skipSnapshot,
      }: {
        challengeId: number
        removeUnmatched?: boolean
        skipSnapshot?: boolean
      }) => {
        const searchParams: Record<string, string> = {}
        if (removeUnmatched !== undefined) searchParams.removeUnmatched = String(removeUnmatched)
        if (skipSnapshot !== undefined) searchParams.skipSnapshot = String(skipSnapshot)
        return apiRequest
          .put(`api/v2/challenge/${challengeId}/rebuild`, { searchParams })
          .json<void>()
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] })
        queryClient.invalidateQueries({ queryKey: ['project', 'challenges'] })
        queryClient.invalidateQueries({ queryKey: ['challenge', 'stats', variables.challengeId] })
      },
    })
  },
}
