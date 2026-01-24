import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User, UserMetricsResponse, UserProperties, UserSettings } from '@/types/User'
import { apiRequest } from '../'

export const userProfile = {
  getUser: (userId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['user', userId],
        queryFn: () => apiRequest.get(`api/v2/user/${userId}`).json<User>(),
        enabled: !!userId,
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
        queryClient.setQueryData<User>(['whoami'], updatedUser)
      },
    })
  },
}
