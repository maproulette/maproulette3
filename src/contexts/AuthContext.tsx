import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Loader } from '../components';
import type { ApiError, User, UserSettings } from '../types';
import { REDIRECT_URL_KEY } from '../types/RedirectUrl';
import { setUserData, removeUserData, USER_KEY } from '../types/User';
import { api, useApiQueryPublic } from '../utils';

type AuthParams = {
  code: string;
  state: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const isSecurityError = (error: ApiError): boolean => {
  return error.status === 401 || error.status === 403;
};

export const validateOAuthState = (state: string | null): boolean => {
  const storedState = localStorage.getItem('state');
  return storedState === state || import.meta.env.MODE === 'development';
};

export const setOAuthState = (state: string): void => {
  localStorage.setItem('state', state);
};

export const clearOAuthState = (): void => {
  localStorage.removeItem('state');
};

export const getStoredRedirectUrl = (): string | null => {
  return localStorage.getItem('redirect');
};

export const clearStoredRedirectUrl = (): void => {
  localStorage.removeItem('redirect');
};

export const useUserQuery = (enabled: boolean = true) => {
  return useApiQueryPublic({
    queryKey: USER_KEY,
    queryFn: async (): Promise<User> => {
      const response = await api.user.whoami();
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRedirectUrl = () => {
  const queryClient = useQueryClient();

  const setRedirectUrl = (url: string) => {
    queryClient.setQueryData(REDIRECT_URL_KEY, url);
  };

  const getRedirectUrl = (): string | undefined => {
    return queryClient.getQueryData(REDIRECT_URL_KEY);
  };

  const clearRedirectUrl = () => {
    queryClient.removeQueries({ queryKey: REDIRECT_URL_KEY });
  };

  return { setRedirectUrl, getRedirectUrl, clearRedirectUrl };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app' }) as AuthParams;
  const location = useLocation();
  const queryClient = useQueryClient();
  const { getRedirectUrl, clearRedirectUrl } = useRedirectUrl();
  const [codeUsed, setCodeUsed] = useState<boolean>(false);

  const { data: user, isLoading, error } = useUserQuery(!isLoggedOut);
  const isAuthenticated = !!user?.id;

  // Handle 401 errors from the user query
  useEffect(() => {
    if (error) {
      const apiError = error as { status?: number };
      if (apiError?.status === 401) {
        removeUserData(queryClient);
        setIsLoggedOut(true);
      }
    }
  }, [error, queryClient]);

  const logout = async (): Promise<void> => {
    clearOAuthState();

    try {
      await api.user.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeUserData(queryClient);
      queryClient.removeQueries({ queryKey: REDIRECT_URL_KEY });
      setIsLoggedOut(true);
    }
  };

  const processCallback = async (): Promise<void> => {
    const code = search.code;
    const state = search.state;

    if (!code) return;

    if (!validateOAuthState(state)) {
      clearOAuthState();
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.oauth.callback(code);
      const { token } = response.data;

      if (token) {
        setIsLoggedOut(false);
        await queryClient.invalidateQueries({ queryKey: USER_KEY });

        const redirectUrl = getRedirectUrl();
        if (redirectUrl) {
          navigate({ to: redirectUrl });
          clearRedirectUrl();
        }
      }
      // Clean up URL parameters
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (isSecurityError(apiError)) {
        await queryClient.invalidateQueries({ queryKey: USER_KEY });
      } else {
        console.error('OAuth callback error:', error);
      }
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());

      clearOAuthState();
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const code = search.code;

    if (code && !codeUsed) {
      setCodeUsed(true);
    }
  }, [codeUsed, search.code]);

  useEffect(() => {
    const code = search.code;

    if (code && codeUsed) {
      processCallback();
    }
  }, [codeUsed, search.code]);

  useEffect(() => {
    if (user && isLoggedOut) {
      setIsLoggedOut(false);
    }
  }, [user, isLoggedOut]);

  const login = async (): Promise<void> => {
    const currentUrl = location.pathname + location.search;
    queryClient.setQueryData(REDIRECT_URL_KEY, currentUrl);

    const loginUrl = `${
      import.meta.env.VITE_SERVER_OAUTH_URL
    }?redirect=${encodeURIComponent(currentUrl)}`;

    try {
      const response = await api.oauth.login(loginUrl);
      const jsonData = response.data;

      if (jsonData.state) {
        setOAuthState(jsonData.state);
        window.location.href = jsonData.redirect;
      }
    } catch (error) {
      console.log('error logging in:', error);
    }
  };

  const updateSettings = async (settings: UserSettings): Promise<User> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await api.user.updateSettings(user.id, settings);
      const updatedUser = response.data;

      setUserData(queryClient, updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    login,
    logout,
    updateSettings,
  };

  if (isVerifying || isLoading)
    return <Loader message={isVerifying ? 'Verifying session...' : 'Loading...'} />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
