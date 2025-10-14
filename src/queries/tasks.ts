import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Task } from '@/types/Task'

const queryKey = (taskId: string) => ['task', taskId]

const startTaskOptions = (taskId: string) =>
  queryOptions({
    queryKey: queryKey(taskId),
    queryFn: () => api.get(`api/v2/task/${taskId}/start`).json<Task>(),
    enabled: !!taskId,
  })

const getTaskOptions = (taskId: string) =>
  queryOptions({
    queryKey: queryKey(taskId),
    queryFn: () => api.get(`api/v2/task/${taskId}?mapillary=false`).json<Task>(),
    enabled: !!taskId,
  })

export { startTaskOptions, getTaskOptions }
