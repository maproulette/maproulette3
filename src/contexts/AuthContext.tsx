import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { createContext, useContext, useEffect, useState } from 'react'
import { api, createApiWithBaseUrl } from '@/api'
import { Loader } from '@/components/ui/Loader'
import type { OAuthLoginResponse } from '@/types/Oauth'
import type { User } from '@/types/User'

export const REDIRECT_URL_KEY = ['auth', 'redirectUrl'] as const

interface ApiError {
  name: string
  message: string
  status: number
  statusText: string
  data?: unknown
}

type AuthParams = {
  code: string
  state: string
}

export interface AuthContextType {
  user: User | undefined
  isAuthenticated: boolean
  authLoading: boolean
  error: Error | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const isSecurityError = (error: ApiError): boolean => {
  return error.status === 401 || error.status === 403
}

export const validateOAuthState = (state: string | null): boolean => {
  const storedState = localStorage.getItem('state')
  return storedState === state || import.meta.env.MODE === 'development'
}

export const setOAuthState = (state: string): void => {
  localStorage.setItem('state', state)
}

export const clearOAuthState = (): void => {
  localStorage.removeItem('state')
}

export const getStoredRedirectUrl = (): string | null => {
  return localStorage.getItem('redirect')
}

export const clearStoredRedirectUrl = (): void => {
  localStorage.removeItem('redirect')
}

export const useRedirectUrl = () => {
  const queryClient = useQueryClient()

  const setRedirectUrl = (url: string) => {
    queryClient.setQueryData(REDIRECT_URL_KEY, url)
  }

  const getRedirectUrl = (): string | undefined => {
    return queryClient.getQueryData(REDIRECT_URL_KEY)
  }

  const clearRedirectUrl = () => {
    queryClient.removeQueries({ queryKey: REDIRECT_URL_KEY })
  }

  return { setRedirectUrl, getRedirectUrl, clearRedirectUrl }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { getRedirectUrl, clearRedirectUrl } = useRedirectUrl()
  const search = useSearch({ from: '/_app' }) as AuthParams
  const location = useLocation()
  const navigate = useNavigate()
  const { data: user, isLoading, error } = useQuery(api.user.whoAmI(isLoggedOut))
  const queryClient = useQueryClient()
  const [codeUsed, setCodeUsed] = useState<boolean>(false)

  const processCallback = async (): Promise<void> => {
    const code = search.code
    const state = search.state

    if (!code) return

    if (!validateOAuthState(state)) {
      clearOAuthState()
      return
    }

    setIsVerifying(true)

    try {
      const { token } = await api.user.callback(code)

      if (token) {
        setIsLoggedOut(false)
        await queryClient.invalidateQueries({ queryKey: ['whoami'] })
        await queryClient.invalidateQueries({ queryKey: ['user'] })

        const redirectUrl = getRedirectUrl()
        if (redirectUrl) {
          navigate({ to: redirectUrl })
          clearRedirectUrl()
        }
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      if (isSecurityError(apiError)) {
        await queryClient.invalidateQueries({ queryKey: ['whoami'] })
        await queryClient.invalidateQueries({ queryKey: ['user'] })
      } else {
        console.error('OAuth callback error:', error)
      }
    } finally {
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      url.searchParams.delete('state')
      window.history.replaceState({}, '', url.toString())

      clearOAuthState()
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    const code = search.code

    if (code && !codeUsed) {
      console.log('setting code used')
      setCodeUsed(true)
    }
  }, [codeUsed, search.code])

  useEffect(() => {
    const code = search.code

    if (code && codeUsed) {
      console.log('processing callback')
      processCallback()
    }
  }, [codeUsed, search.code])

  useEffect(() => {
    if (user && isLoggedOut) {
      setIsLoggedOut(false)
    }
  }, [user, isLoggedOut])

  // Handle 401 errors from the user query
  useEffect(() => {
    if (error) {
      const apiError = error as { status?: number }
      if (apiError?.status === 401) {
        queryClient.removeQueries({ queryKey: ['whoami'] })
        setIsLoggedOut(true)
      }
    }
  }, [error, queryClient])

  const login = async (): Promise<void> => {
    const currentUrl = location.pathname + location.search
    queryClient.setQueryData(REDIRECT_URL_KEY, currentUrl)

    const oauthBaseUrl = import.meta.env.VITE_SERVER_OAUTH_URL
    const loginUrl = `?redirect=${encodeURIComponent(currentUrl)}`

    try {
      const oauthApi = createApiWithBaseUrl(oauthBaseUrl)
      const response = await oauthApi.get(loginUrl)
      const jsonData = (await response.json()) as OAuthLoginResponse

      if (jsonData.state) {
        setOAuthState(jsonData.state)
        window.location.href = jsonData.redirect
      }
    } catch (error) {
      console.log('error logging in:', error)
    }
  }

  const logout = async (): Promise<void> => {
    clearOAuthState()

    try {
      await api.user.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      queryClient.removeQueries({ queryKey: ['whoami'] })
      setIsLoggedOut(true)
    }
  }

  if (isLoading) {
    return <Loader isFullScreen />
  }

  const value: AuthContextType = {
    user,
    authLoading: isLoading || isVerifying,
    isAuthenticated: !!user,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
