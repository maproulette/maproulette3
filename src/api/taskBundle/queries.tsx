import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task } from '@/types/Task'
import { apiRequest } from '../'

export interface TaskBundleResponse {
  bundleId: number
  ownerId: number
  taskIds: number[]
  tasks?: Task[]
}

export interface CreateTaskBundleRequest {
  name: string
  taskIds: number[]
  primaryId?: number
}

export const taskBundleQueries = {
  getTaskBundle: (bundleId: number, lockTasks = false) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['taskBundle', bundleId, lockTasks],
        queryFn: async () => {
          const bundle = await apiRequest
            .post(`api/v2/taskBundle/${bundleId}`, {
              searchParams: { lockTasks: lockTasks.toString() },
            })
            .json<TaskBundleResponse>()
          if (bundle.tasks) {
            for (const task of bundle.tasks) {
              queryClient.setQueryData(['task', task.id], task)
            }
          }
          return bundle
        },
        enabled: !!bundleId,
      })
    )
  },

  useCreateTaskBundle: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (data: CreateTaskBundleRequest) =>
        apiRequest
          .post('api/v2/taskBundle', {
            json: data,
          })
          .json<TaskBundleResponse>(),
      onSuccess: (bundle) => {
        // Set the new bundle in cache
        queryClient.setQueryData(['taskBundle', bundle.bundleId, false], bundle)
        if (bundle.tasks) {
          for (const task of bundle.tasks) {
            queryClient.setQueryData(['task', task.id], task)
          }
        }
        // Invalidate tasksInBounds since tasks now have bundleId set
        queryClient.invalidateQueries({ queryKey: ['tasksInBounds'] })
      },
    })
  },

  useUpdateTaskBundle: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ bundleId, taskIds }: { bundleId: number; taskIds: number[] }) =>
        apiRequest
          .post(`api/v2/taskBundle/${bundleId}/update`, {
            searchParams: { taskIds: taskIds.join(',') },
          })
          .json<TaskBundleResponse>(),
      onSuccess: (updatedBundle, variables) => {
        // Update the bundle in cache
        queryClient.setQueryData(['taskBundle', variables.bundleId, false], updatedBundle)
        if (updatedBundle.tasks) {
          for (const task of updatedBundle.tasks) {
            queryClient.setQueryData(['task', task.id], task)
          }
        }
        // Invalidate tasksInBounds since task bundleIds changed
        queryClient.invalidateQueries({ queryKey: ['tasksInBounds'] })
      },
    })
  },

  useDeleteTaskBundle: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (bundleId: number) => apiRequest.delete(`api/v2/taskBundle/${bundleId}`).json(),
      onSuccess: (_data, bundleId) => {
        // Remove the bundle from cache
        queryClient.removeQueries({ queryKey: ['taskBundle', bundleId] })
        // Invalidate tasksInBounds since tasks no longer have bundleId
        queryClient.invalidateQueries({ queryKey: ['tasksInBounds'] })
      },
    })
  },
}
