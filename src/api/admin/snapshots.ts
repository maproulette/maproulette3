import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../'

export interface ChallengeSnapshot {
  id: number
  challengeId: number
  created: string
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

  exportSnapshotsCsv: async (challengeId: number): Promise<Blob> => {
    const response = await apiRequest.get(`api/v2/snapshot/challenge/${challengeId}/export`)
    return response.blob()
  },
}
