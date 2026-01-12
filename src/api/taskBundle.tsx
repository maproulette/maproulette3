import { queryOptions } from '@tanstack/react-query'
import type { Task } from '@/types/Task'
import { apiRequest } from './'

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

export const taskBundle = {
  createTaskBundle: async (data: CreateTaskBundleRequest): Promise<TaskBundleResponse> => {
    return apiRequest
      .post('api/v2/taskBundle', {
        json: data,
      })
      .json<TaskBundleResponse>()
  },

  getTaskBundle: (bundleId: number, lockTasks = false) =>
    queryOptions({
      queryKey: ['taskBundle', bundleId, lockTasks],
      queryFn: () =>
        apiRequest
          .post(`api/v2/taskBundle/${bundleId}`, {
            searchParams: { lockTasks: lockTasks.toString() },
          })
          .json<TaskBundleResponse>(),
      enabled: !!bundleId,
    }),

  updateTaskBundle: async (bundleId: number, taskIds: number[]): Promise<TaskBundleResponse> => {
    return apiRequest
      .post(`api/v2/taskBundle/${bundleId}/update`, {
        searchParams: { taskIds: taskIds.join(',') },
      })
      .json<TaskBundleResponse>()
  },

  deleteTaskBundle: async (bundleId: number): Promise<void> => {
    return apiRequest.delete(`api/v2/taskBundle/${bundleId}`).json()
  },
}
