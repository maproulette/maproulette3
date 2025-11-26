import { queryOptions } from '@tanstack/react-query'
import type { OAuthCallbackResponse } from '@/types/Oauth'
import type {
  User,
  UserNotificationsResponse,
  UserProperties,
  UserSettings,
  UserWhoamiResponse,
} from '@/types/User'
import { apiRequest } from './'

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

  notification: (userId: number | undefined) =>
    queryOptions({
      queryKey: ['user', 'notifications', userId],
      queryFn: () =>
        apiRequest.get(`api/v2/user/${userId}/notifications`).json<UserNotificationsResponse>(),
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
}
