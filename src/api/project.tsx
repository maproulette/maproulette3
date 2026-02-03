import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Challenge } from '@/types/Challenge'
import type { Project, ProjectGetResponse } from '@/types/Project'
import { apiRequest } from './'

export const project = {
  getProject: (projectId: number | undefined) =>
    useQuery(
      queryOptions({
        queryKey: ['project', projectId],
        queryFn: () => apiRequest.get(`api/v2/project/${projectId}`).json<ProjectGetResponse>(),
        enabled: !!projectId,
      })
    ),

  getProjectOptions: (projectId: number) =>
    queryOptions({
      queryKey: ['project', projectId],
      queryFn: () => apiRequest.get(`api/v2/project/${projectId}`).json<ProjectGetResponse>(),
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
  } = {}) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['managedProjects', limit, page, onlyEnabled, onlyOwned, searchString],
        queryFn: async () => {
          const projects = await apiRequest
            .get('api/v2/projects/managed', {
              searchParams: {
                limit,
                page,
                onlyEnabled,
                onlyOwned,
                searchString,
              },
            })
            .json<Project[]>()
          for (const p of projects) {
            queryClient.setQueryData(['project', p.id], p)
          }
          return projects
        },
      })
    )
  },

  getProjectChallenges: (projectId: number | undefined, limit = 100, page = 0) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['projectChallenges', projectId, limit, page],
        queryFn: async () => {
          const challenges = await apiRequest
            .get(`api/v2/project/${projectId}/challenges`, {
              searchParams: {
                limit,
                page,
              },
            })
            .json<Challenge[]>()
          for (const challenge of challenges) {
            queryClient.setQueryData(['challenge', challenge.id], challenge)
          }
          return challenges
        },
        enabled: !!projectId,
      })
    )
  },

  searchProjects: ({ search = '' }: { search?: string } = {}) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['searchProjects', search],
        queryFn: async () => {
          const projects = await apiRequest
            .get('api/v2/projects/search', {
              searchParams: {
                search,
              },
            })
            .json<Project[]>()
          for (const p of projects) {
            queryClient.setQueryData(['project', p.id], p)
          }
          return projects
        },
        enabled: search.length > 0,
      })
    )
  },

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

  // Mutation hooks
  useCreateProject: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (projectData: Partial<Project>) =>
        apiRequest
          .post('api/v2/project', {
            json: projectData,
          })
          .json<Project>(),
      onSuccess: (newProject) => {
        queryClient.setQueryData<Project>(['project', newProject.id], newProject)
        queryClient.setQueriesData<Project[]>({ queryKey: ['managedProjects'] }, (oldProjects) =>
          oldProjects ? [newProject, ...oldProjects] : [newProject]
        )
      },
    })
  },

  useUpdateProject: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ projectId, updates }: { projectId: number; updates: Partial<Project> }) =>
        apiRequest
          .put(`api/v2/project/${projectId}`, {
            json: {
              id: projectId,
              ...updates,
            },
          })
          .json<Project>(),
      onSuccess: (updatedProject) => {
        queryClient.setQueryData<ProjectGetResponse>(['project', updatedProject.id], updatedProject)
        queryClient.setQueriesData<Project[]>({ queryKey: ['managedProjects'] }, (oldProjects) =>
          oldProjects?.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        )
      },
    })
  },

  getProjectStats: (projectId: number | undefined) =>
    useQuery(
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
      })
    ),
}
