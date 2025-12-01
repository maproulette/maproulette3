import { queryOptions } from '@tanstack/react-query'
import type { OAuthCallbackResponse } from '@/types/Oauth'
import type {
  GetAllUsersParams,
  User,
  UserMetricsResponse,
  UserNotificationsParams,
  UserNotificationsResponse,
  UserProperties,
  UserSettings,
  UserWhoamiResponse,
} from '@/types/User'
import { apiRequest, convertParamsToSearchParams } from './'

export const user = {
  // useQuery is not needed for these
  signOut: async () => await apiRequest.get('auth/signout').json<void>(),
  callback: async (code: string) =>
    await apiRequest.get(`auth/callback?code=${code}`).json<OAuthCallbackResponse>(),

  whoAmI: (isLoggedOut: boolean) =>
    queryOptions({
      queryKey: ['whoami'],
      queryFn: () => apiRequest.get('api/v2/user/whoami').json<UserWhoamiResponse>(),
      enabled: !isLoggedOut,
      retry: false,
    }),

  notification: (userId: number | undefined, params?: UserNotificationsParams) =>
    queryOptions({
      queryKey: ['user', 'notifications', userId, params],
      queryFn: () =>
        apiRequest
          .get(`api/v2/user/${userId}/notifications`, {
            searchParams: convertParamsToSearchParams({ ...params }),
          })
          .json<UserNotificationsResponse>(),
      enabled: !!userId,
    }),

  metrics: (userId: number | undefined, monthDuration: number = -1) =>
    queryOptions({
      queryKey: ['user', 'metrics', userId, monthDuration],
      queryFn: () =>
        apiRequest
          .get(`api/v2/data/user/${userId}/metrics`, {
            searchParams: { monthDuration },
          })
          .json<UserMetricsResponse>(),
      enabled: !!userId,
    }),

  updateUserSettings: async (
    userId: number,
    settings: UserSettings,
    properties?: UserProperties
  ) => {
    const payload = {
      ...settings,
      ...(properties && { properties: JSON.stringify(properties) }),
    }
    return apiRequest.put(`api/v2/user/${userId}`, { json: payload }).json<User>()
  },

  // Super Admin endpoints
  getAllUsers: (params?: GetAllUsersParams) =>
    queryOptions({
      queryKey: ['users', 'all', params],
      queryFn: () =>
        apiRequest
          .get('api/v2/super-admin/users', {
            searchParams: convertParamsToSearchParams({
              limit: params?.limit ?? 50,
              page: params?.page ?? 0,
            }),
          })
          .json<User[]>(),
    }),

  getSuperUsers: () =>
    queryOptions({
      queryKey: ['users', 'superusers'],
      queryFn: () => apiRequest.get('api/v2/superusers').json<number[]>(),
    }),
}
