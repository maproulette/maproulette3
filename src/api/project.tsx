import { queryOptions } from '@tanstack/react-query'
import { apiRequest } from './'
import type { Project } from '@/types/Project'

export const project = {
  getProject: (projectId: number | undefined) =>
    queryOptions({
      queryKey: ['project', projectId],
      queryFn: () => apiRequest.get(`api/v2/project/${projectId}`).json<Project>(),
      enabled: !!projectId,
    }),
}
