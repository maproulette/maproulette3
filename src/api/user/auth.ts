import type { QueryClient } from '@tanstack/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import type { OAuthCallbackResponse } from '@/types/Oauth'
import type { UserWhoamiResponse } from '@/types/User'
import { apiRequest } from '../'

export const REDIRECT_URL_KEY = ['auth', 'redirectUrl'] as const

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

  setRedirectUrl: (queryClient: QueryClient, url: string) => {
    queryClient.setQueryData(REDIRECT_URL_KEY, url)
  },
  getRedirectUrl: (queryClient: QueryClient): string | undefined => {
    return queryClient.getQueryData(REDIRECT_URL_KEY)
  },
  clearRedirectUrl: (queryClient: QueryClient) => {
    queryClient.removeQueries({ queryKey: REDIRECT_URL_KEY })
  },
}
