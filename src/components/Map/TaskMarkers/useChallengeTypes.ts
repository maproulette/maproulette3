import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { apiRequest } from '@/api'
import { resolveTaskTypeFromTags, type TaskTypeKey } from './taskTypes'

const STALE_MS = 5 * 60 * 1000

export const useChallengeTypes = (challengeIds: number[]): Map<number, TaskTypeKey> => {
  const queries = useQueries({
    queries: challengeIds.map((id) => ({
      queryKey: ['challenge', 'tags', id] as const,
      queryFn: () =>
        apiRequest.get(`api/v2/challenge/${id}/tags`).json<Array<{ id: number; name: string }>>(),
      staleTime: STALE_MS,
      enabled: id > 0,
    })),
  })

  return useMemo(() => {
    const result = new Map<number, TaskTypeKey>()
    queries.forEach((q, idx) => {
      const id = challengeIds[idx]
      if (id == null) return
      const tags = q.data?.map((t) => t.name) ?? []
      const typeKey = resolveTaskTypeFromTags(tags)
      if (typeKey) result.set(id, typeKey)
    })
    return result
  }, [
    queries
      .map((q, i) => `${challengeIds[i]}:${q.data?.map((t) => t.name).join(',') ?? ''}`)
      .join('|'),
  ])
}
