import { queryOptions } from '@tanstack/react-query'
import { apiRequest } from './'
import type { Task } from '@/types/Task'

const queryKey = (taskId: string) => ['task', taskId]

export const tasks = {
  startTask: (taskId: string) =>
    queryOptions({
      queryKey: queryKey(taskId),
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}/start`).json<Task>(),
      enabled: !!taskId,
    }),

  getTask: (taskId: string) =>
    queryOptions({
      queryKey: queryKey(taskId),
      queryFn: () => apiRequest.get(`api/v2/task/${taskId}?mapillary=false`).json<Task>(),
      enabled: !!taskId,
    }),
}
