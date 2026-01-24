import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
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
        queryKey: ['whoami'],
        queryFn: () => apiRequest.get('api/v2/user/whoami').json<UserWhoamiResponse>(),
        enabled: !isLoggedOut,
        retry: false,
      })
    ),

  refreshAuth: async () => {
    const queryClient = useQueryClient()
    await queryClient.invalidateQueries({ queryKey: ['whoami'] })
    await queryClient.invalidateQueries({ queryKey: ['user'] })
  },

  clearAuth: async () => {
    const queryClient = useQueryClient()
    queryClient.removeQueries({ queryKey: ['whoami'] })
  },

  setRedirectUrl: (url: string) => {
    const queryClient = useQueryClient()
    queryClient.setQueryData(REDIRECT_URL_KEY, url)
  },
  getRedirectUrl: (): string | undefined => {
    const queryClient = useQueryClient()
    return queryClient.getQueryData(REDIRECT_URL_KEY)
  },
  clearRedirectUrl: () => {
    const queryClient = useQueryClient()
    queryClient.removeQueries({ queryKey: REDIRECT_URL_KEY })
  },
}
