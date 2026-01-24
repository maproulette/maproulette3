import { queryOptions, useQuery } from '@tanstack/react-query'
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

// API call functions (return Promises)
const createTaskBundleApi = (data: CreateTaskBundleRequest) =>
  apiRequest
    .post('api/v2/taskBundle', {
      json: data,
    })
    .json<TaskBundleResponse>()

const getTaskBundleApi = (bundleId: number, lockTasks = false) =>
  apiRequest
    .post(`api/v2/taskBundle/${bundleId}`, {
      searchParams: { lockTasks: lockTasks.toString() },
    })
    .json<TaskBundleResponse>()

const updateTaskBundleApi = (bundleId: number, taskIds: number[]) =>
  apiRequest
    .post(`api/v2/taskBundle/${bundleId}/update`, {
      searchParams: { taskIds: taskIds.join(',') },
    })
    .json<TaskBundleResponse>()

const deleteTaskBundleApi = (bundleId: number) =>
  apiRequest.delete(`api/v2/taskBundle/${bundleId}`).json()

export const taskBundle = {
  // API call functions for use in mutation/query functions
  createTaskBundle: createTaskBundleApi,
  updateTaskBundle: updateTaskBundleApi,
  deleteTaskBundle: deleteTaskBundleApi,

  // Hook for querying task bundles
  getTaskBundle: (bundleId: number, lockTasks = false) =>
    useQuery(
      queryOptions({
        queryKey: ['taskBundle', bundleId, lockTasks],
        queryFn: () => getTaskBundleApi(bundleId, lockTasks),
        enabled: !!bundleId,
      })
    ),

  // Query options for use with queryClient.fetchQuery
  getTaskBundleOptions: (bundleId: number, lockTasks = false) =>
    queryOptions({
      queryKey: ['taskBundle', bundleId, lockTasks],
      queryFn: () => getTaskBundleApi(bundleId, lockTasks),
    }),
}
