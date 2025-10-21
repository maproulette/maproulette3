import { queryOptions } from '@tanstack/react-query'
import type { OAuthCallbackResponse } from '@/types/Oauth'
import type { Notifications, User } from '@/types/User'
import { apiRequest } from './'

export const user = {
  // useQuery is not needed for these
  signOut: async () => await apiRequest.get('auth/signout').json<void>(),
  callback: async (code: string) =>
    await apiRequest.get(`auth/callback?code=${code}`).json<OAuthCallbackResponse>(),

  whoAmI: (isLoggedOut: boolean) =>
    queryOptions({
      queryKey: ['whoami'],
      queryFn: () => apiRequest.get('api/v2/user/whoami').json<User>(),
      enabled: !isLoggedOut,
      retry: false,
    }),

  notification: (userId?: number) =>
    queryOptions({
      queryKey: ['user', userId, 'notifications'],
      queryFn: () => apiRequest.get(`api/v2/user/${userId}/notifications`).json<Notifications>(),
      enabled: !!userId,
    }),
}
