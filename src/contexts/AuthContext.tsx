import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, createApiWithBaseUrl } from '@/api'
import { Loader } from '@/components/ui/Loader'
import type { OAuthLoginResponse } from '@/types/Oauth'
import type { User } from '@/types/User'

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
  if (!storedState || !state) {
    console.warn('[Auth] OAuth state validation failed: missing state')
    return false
  }
  if (storedState !== state) {
    console.error('[Auth] OAuth state mismatch - potential CSRF attack')
    return false
  }
  return true
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const search = useSearch({ from: '/_app' }) as AuthParams
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user, isLoading, error } = api.user.whoAmI(isLoggedOut)
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
        api.user.refreshAuth(queryClient)

        const redirectUrl = api.user.getRedirectUrl(queryClient)
        if (redirectUrl) {
          navigate({ to: redirectUrl })
          api.user.clearRedirectUrl(queryClient)
        }
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      if (isSecurityError(apiError)) {
        api.user.refreshAuth(queryClient)
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
      setCodeUsed(true)
    }
  }, [codeUsed, search.code])

  useEffect(() => {
    const code = search.code

    if (code && codeUsed) {
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
        api.user.clearAuth(queryClient)
        setIsLoggedOut(true)
      }
    }
  }, [error, queryClient])

  // All callbacks are memoized because they are stored in the context value.
  const login = useCallback(async (): Promise<void> => {
    const currentUrl = location.pathname + location.search
    api.user.setRedirectUrl(queryClient, currentUrl)

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
      console.error('Login failed:', error)
    }
  }, [location, queryClient])

  const logout = useCallback(async (): Promise<void> => {
    clearOAuthState()

    try {
      await api.user.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      api.user.clearAuth(queryClient)
      setIsLoggedOut(true)
    }
  }, [queryClient])

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value: AuthContextType = useMemo(
    () => ({
      user,
      authLoading: isLoading || isVerifying,
      isAuthenticated: !!user,
      error,
      login,
      logout,
    }),
    [user, isLoading, isVerifying, error, login, logout]
  )

  if (isLoading) {
    return <Loader isFullScreen />
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
