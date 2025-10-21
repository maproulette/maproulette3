import { queryOptions } from '@tanstack/react-query'
import type { Project } from '@/types/api'
import { apiRequest } from './'

export const project = {
  getProject: (projectId: number | undefined) =>
    queryOptions({
      queryKey: ['project', projectId],
      queryFn: () => apiRequest.get(`api/v2/project/${projectId}`).json<Project>(),
      enabled: !!projectId,
    }),
}
