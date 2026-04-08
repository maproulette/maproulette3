import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Challenge } from '@/types/Challenge'
import type { components } from '@/types/openApiTypes'
import type { Task } from '@/types/Task'
import type { User, UserMetricsResponse, UserProperties, UserSettings } from '@/types/User'
import { apiRequest } from '../'

export type LockedTaskData = components['schemas']['org.maproulette.framework.model.LockedTaskData']
export type TeamUser = components['schemas']['org.maproulette.framework.model.TeamUser']

export interface UserActivityEntry {
  id: number
  created: string
  osmUserId: number
  typeId: number
  parentId: number
  parentName: string
  itemId: number
  action: number
  status: number
  extra: string
}

export const userProfile = {
  getUser: (userId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId],
        queryFn: () => apiRequest.get(`api/v2/user/${userId}`).json<User>(),
        enabled: !!userId,
      })
    ),

  activity: () =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'activity'],
        queryFn: () => apiRequest.get('api/v2/data/user/activity').json<UserActivityEntry[]>(),
      })
    ),

  metrics: (userId: number | undefined, monthDuration: number = -1) =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'metrics', userId, monthDuration],
        queryFn: () =>
          apiRequest
            .get(`api/v2/data/user/${userId}/metrics`, {
              searchParams: { monthDuration },
            })
            .json<UserMetricsResponse>(),
        enabled: !!userId,
      })
    ),

  savedChallenges: (userId: number | undefined, limit: number = 10, page: number = 0) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId, 'savedChallenges', { limit, page }],
        queryFn: () =>
          apiRequest
            .get(`api/v2/user/${userId}/saved`, {
              searchParams: { limit, page },
            })
            .json<Challenge[]>(),
        enabled: !!userId,
      })
    ),

  savedTasks: (userId: number | undefined, limit: number = 10, page: number = 0) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId, 'savedTasks', { limit, page }],
        queryFn: () =>
          apiRequest
            .get(`api/v2/user/${userId}/savedTasks`, {
              searchParams: { limit, page },
            })
            .json<Task[]>(),
        enabled: !!userId,
      })
    ),

  lockedTasks: (userId: number | undefined, limit: number = 50) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId, 'lockedTasks', { limit }],
        queryFn: () =>
          apiRequest
            .get(`api/v2/user/${userId}/lockedTasks`, {
              searchParams: { limit },
            })
            .json<LockedTaskData[]>(),
        enabled: !!userId,
      })
    ),

  teamMemberships: (userId: number | undefined) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId, 'teamMemberships'],
        queryFn: () =>
          apiRequest.get(`api/v2/team/all/user/${userId}/memberships`).json<TeamUser[]>(),
        enabled: !!userId,
      })
    ),

  useUpdateUserSettings: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({
        userId,
        settings,
        properties,
      }: {
        userId: number
        settings: UserSettings
        properties?: UserProperties
      }) => {
        const payload = {
          ...settings,
          ...(properties && { properties: JSON.stringify(properties) }),
        }
        return apiRequest.put(`api/v2/user/${userId}`, { json: payload }).json<User>()
      },
      onSuccess: (updatedUser) => {
        queryClient.setQueryData<User>(['user', 'whoami'], updatedUser)
      },
    })
  },
}
