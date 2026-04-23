import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../'

export const adminRebuild = {
  useRebuildChallenge: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({
        challengeId,
        localFile,
        dataOriginDate,
        removeUnmatchedTasks,
      }: {
        challengeId: number
        localFile?: File
        dataOriginDate?: string
        removeUnmatchedTasks?: boolean
      }) => {
        const searchParams: Record<string, string> = {}
        if (dataOriginDate) searchParams.dataOriginDate = dataOriginDate
        if (removeUnmatchedTasks) searchParams.removeUnmatched = 'true'

        if (localFile) {
          const body = new FormData()
          body.append('file', localFile)
          await apiRequest.post(`api/v2/challenge/${challengeId}/rebuild`, {
            body,
            searchParams,
            headers: { 'Content-Type': undefined as unknown as string },
          })
        } else {
          await apiRequest.post(`api/v2/challenge/${challengeId}/rebuild`, { searchParams })
        }
      },
      onSuccess: (_r, { challengeId }) => {
        queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] })
        queryClient.invalidateQueries({ queryKey: ['admin', 'snapshots', challengeId] })
      },
    })
  },
}
