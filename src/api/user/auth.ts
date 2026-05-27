import type { QueryClient } from '@tanstack/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import type { OAuthCallbackResponse } from '@/types/Oauth'
import type { UserWhoamiResponse } from '@/types/User'
import { apiRequest } from '../'

export const userAuth = {
  signOut: async () => await apiRequest.get('auth/signout').json<void>(),

  callback: async (code: string) =>
    await apiRequest.get(`auth/callback?code=${code}`).json<OAuthCallbackResponse>(),

  whoAmI: (isLoggedOut: boolean) =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'whoami'],
        queryFn: () => apiRequest.get('api/v2/user/whoami').json<UserWhoamiResponse>(),
        enabled: !isLoggedOut,
        retry: false,
      })
    ),

  whoAmIOptions: () =>
    queryOptions({
      queryKey: ['user', 'whoami'],
      queryFn: () => apiRequest.get('api/v2/user/whoami').json<UserWhoamiResponse>(),
      retry: false,
    }),

  refreshAuth: async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({ queryKey: ['user', 'whoami'] })
    await queryClient.invalidateQueries({ queryKey: ['user'] })
  },

  clearAuth: (queryClient: QueryClient) => {
    queryClient.removeQueries({ queryKey: ['user', 'whoami'] })
  },
}
