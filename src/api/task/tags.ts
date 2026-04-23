import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { components } from '@/types/openApiTypes'
import { apiRequest } from '../'

export type Keyword = components['schemas']['Keyword']

export const taskTags = {
  getTaskTags: (taskId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['task', taskId, 'tags'],
        queryFn: () => apiRequest.get(`api/v2/task/${taskId}/tags`).json<Keyword[]>(),
        enabled: !!taskId,
      })
    ),

  searchKeywords: (
    prefix: string,
    tagType: 'tasks' | 'challenges' | 'projects' = 'tasks',
    limit = 10
  ) =>
    useQuery(
      queryOptions({
        queryKey: ['keyword', 'find', { prefix, tagType, limit }],
        queryFn: () =>
          apiRequest
            .get('api/v2/keywords/find', {
              searchParams: { prefix, tagType, limit },
            })
            .json<Keyword[]>(),
        enabled: prefix.length > 0,
        staleTime: 30_000,
      })
    ),

  useUpdateTaskTags: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ taskId, tags }: { taskId: number; tags: string[] }) =>
        apiRequest
          .get(`api/v2/task/${taskId}/tags/update`, {
            searchParams: { tags: tags.join(',') },
          })
          .then(() => tags),
      onSuccess: (_tags, { taskId }) => {
        queryClient.invalidateQueries({ queryKey: ['task', taskId, 'tags'] })
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      },
    })
  },
}
