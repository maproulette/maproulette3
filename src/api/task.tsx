import { queryOptions } from '@tanstack/react-query'
import { apiRequest } from './'
import type { Task } from '@/types/Task'

const queryKey = (taskId: string) => ['task', taskId]

export const task = {
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

  getTaskMarkers: () =>
    queryOptions({
      queryKey: ['taskMarkers'],
      queryFn: () => apiRequest.get(`api/v2/taskMarkers`).json<TaskMarker[]>(),
    }),
}

interface TaskMarker {
  id: string
  status: number
  location: {
    lat: number
    lng: number
  }
  challengeName: string
}
