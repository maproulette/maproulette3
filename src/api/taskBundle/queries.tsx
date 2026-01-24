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
  getTaskBundle: (bundleId: number, lockTasks = false) =>
    useQuery(
      queryOptions({
        queryKey: ['taskBundle', bundleId, lockTasks],
        queryFn: () =>
          apiRequest
            .post(`api/v2/taskBundle/${bundleId}`, {
              searchParams: { lockTasks: lockTasks.toString() },
            })
            .json<TaskBundleResponse>(),
        enabled: !!bundleId,
      })
    ),

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
