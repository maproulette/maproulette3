import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../'

export interface SnapshotActionSummary {
  total: number
  available: number
  fixed: number
  falsePositive: number
  skipped: number
  deleted: number
  alreadyFixed: number
  tooHard: number
  answered: number
  validated: number
  disabled: number
  avgTimeSpent?: number
  tasksWithTime?: number
}

export interface ChallengeSnapshot {
  id: number
  /** Backend field is `itemId` on the brief list; kept for compatibility. */
  itemId?: number
  /** Derived client-side alias for `itemId`. */
  challengeId?: number
  typeId?: number
  name?: string
  status?: number
  created: string
  actions?: SnapshotActionSummary
  priorityActions?: Record<string, SnapshotActionSummary>
  /** Legacy/shim: some callers expect keyed counts for backwards compat. */
  actionSummary?: Record<string, number>
  [key: string]: unknown
}

export const adminSnapshots = {
  listSnapshots: (challengeId: number | undefined) =>
    useQuery(
      queryOptions({
        queryKey: ['admin', 'snapshots', challengeId],
        queryFn: () =>
          apiRequest
            .get(`api/v2/snapshot/challenge/${challengeId}/list`)
            .json<ChallengeSnapshot[]>(),
        enabled: !!challengeId,
      })
    ),

  /**
   * Fetch the list with full actionSummary (and priority actionSummaries) included.
   * Passes `includeAllData=true` so each item carries counts per status.
   */
  listSnapshotsDetailed: (challengeId: number | undefined) =>
    useQuery(
      queryOptions({
        queryKey: ['admin', 'snapshots', challengeId, 'detailed'],
        queryFn: () =>
          apiRequest
            .get(`api/v2/snapshot/challenge/${challengeId}/list`, {
              searchParams: { includeAllData: true },
            })
            .json<ChallengeSnapshot[]>(),
        enabled: !!challengeId,
      })
    ),

  /** Retrieve a single snapshot by id (includes full actionSummary). */
  getSnapshot: (snapshotId: number | undefined) =>
    useQuery(
      queryOptions({
        queryKey: ['admin', 'snapshot', snapshotId],
        queryFn: () => apiRequest.get(`api/v2/snapshot/${snapshotId}`).json<ChallengeSnapshot>(),
        enabled: !!snapshotId,
      })
    ),

  useCreateSnapshot: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (challengeId: number) =>
        apiRequest.get(`api/v2/snapshot/challenge/${challengeId}/record`).json<ChallengeSnapshot>(),
      onSuccess: (_snap, challengeId) => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots', challengeId] })
      },
    })
  },

  useDeleteSnapshot: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (snapshotId: number) =>
        apiRequest.delete(`api/v2/snapshot/${snapshotId}`).json<void>(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots'] })
      },
    })
  },

  /**
   * Upload a snapshot CSV to restore/import historical data for a challenge.
   * The endpoint (`POST /api/v2/snapshot/challenge/:id/import`) is tentative —
   * the backend may not yet support it, in which case the mutation surfaces
   * the server error to the caller (we do not swallow it).
   */
  useImportSnapshots: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ challengeId, file }: { challengeId: number; file: File }) => {
        const body = new FormData()
        body.append('file', file)
        await apiRequest.post(`api/v2/snapshot/challenge/${challengeId}/import`, {
          body,
          headers: { 'Content-Type': undefined as unknown as string },
        })
      },
      onSuccess: (_r, { challengeId }) => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots', challengeId] })
      },
    })
  },

  exportSnapshotsCsv: async (challengeId: number): Promise<Blob> => {
    const response = await apiRequest.get(`api/v2/snapshot/challenge/${challengeId}/export`)
    return response.blob()
  },
}
