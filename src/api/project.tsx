import { queryOptions } from '@tanstack/react-query'
import type { Challenge } from '@/types/Challenge'
import type { Project, ProjectGetResponse } from '@/types/Project'
import { apiRequest } from './'

export const project = {
  getProject: (projectId: number | undefined) =>
    queryOptions({
      queryKey: ['project', projectId],
      queryFn: () => apiRequest.get(`api/v2/project/${projectId}`).json<ProjectGetResponse>(),
      enabled: !!projectId,
    }),

  getManagedProjects: ({
    limit = 50,
    page = 0,
    onlyEnabled = false,
    onlyOwned = false,
    searchString = '',
  }: {
    limit?: number
    page?: number
    onlyEnabled?: boolean
    onlyOwned?: boolean
    searchString?: string
  } = {}) =>
    queryOptions({
      queryKey: ['managedProjects', limit, page, onlyEnabled, onlyOwned, searchString],
      queryFn: () =>
        apiRequest
          .get('api/v2/projects/managed', {
            searchParams: {
              limit,
              page,
              onlyEnabled,
              onlyOwned,
              searchString,
            },
          })
          .json<Project[]>(),
    }),

  getProjectChallenges: (projectId: number | undefined, limit = 100, page = 0) =>
    queryOptions({
      queryKey: ['projectChallenges', projectId, limit, page],
      queryFn: () =>
        apiRequest
          .get(`api/v2/project/${projectId}/challenges`, {
            searchParams: {
              limit,
              page,
            },
          })
          .json<Challenge[]>(),
      enabled: !!projectId,
    }),

  searchProjects: ({ search = '' }: { search?: string } = {}) =>
    queryOptions({
      queryKey: ['searchProjects', search],
      queryFn: () =>
        apiRequest
          .get('api/v2/projects/search', {
            searchParams: {
              search,
            },
          })
          .json<Project[]>(),
      enabled: search.length > 0,
    }),
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    return apiRequest
      .post('api/v2/project', {
        json: projectData,
      })
      .json<Project>()
  },

  updateProject: async (projectId: number, updates: Partial<Project>): Promise<Project> => {
    return apiRequest
      .put(`api/v2/project/${projectId}`, {
        json: {
          id: projectId,
          ...updates,
        },
      })
      .json<Project>()
  },

  getProjectStats: (projectId: number | undefined) =>
    queryOptions({
      queryKey: ['data', 'project', projectId],
      queryFn: async () =>
        apiRequest.get(`api/v2/data/project/${projectId}`).json<{
          id?: number
          name?: string
          actions?: {
            total?: number
            available?: number
            fixed?: number
            falsePositive?: number
            skipped?: number
            deleted?: number
            alreadyFixed?: number
            tooHard?: number
            answered?: number
            validated?: number
            disabled?: number
            avgTimeSpent?: number
            tasksWithTime?: number
          }
        }>(),
      enabled: !!projectId,
    }),
}
