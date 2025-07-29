import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User, ApiError } from "../types";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api, useApiQueryPublic, QUERY_KEYS } from "../utils";
import { Loader } from "../components";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const isSecurityError = (error: ApiError): boolean => {
  return error.status === 401 || error.status === 403;
};

export const validateOAuthState = (state: string | null): boolean => {
  const storedState = localStorage.getItem("state");
  return storedState === state || import.meta.env.MODE === "development";
};

export const setOAuthState = (state: string): void => {
  localStorage.setItem("state", state);
};

export const clearOAuthState = (): void => {
  localStorage.removeItem("state");
};

export const getStoredRedirectUrl = (): string | null => {
  return localStorage.getItem("redirect");
};

export const clearStoredRedirectUrl = (): void => {
  localStorage.removeItem("redirect");
};

export const useUserQuery = (enabled: boolean = true) => {
  return useApiQueryPublic({
    queryKey: QUERY_KEYS.auth.user,
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
    queryClient.setQueryData(QUERY_KEYS.auth.redirectUrl, url);
  };

  const getRedirectUrl = (): string | undefined => {
    return queryClient.getQueryData(QUERY_KEYS.auth.redirectUrl);
  };

  const clearRedirectUrl = () => {
    queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.redirectUrl });
  };

  return { setRedirectUrl, getRedirectUrl, clearRedirectUrl };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
        queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.user });
        setIsLoggedOut(true);
      }
    }
  }, [error, queryClient]);

  const logout = useCallback(async (): Promise<void> => {
    clearOAuthState();

    try {
      await api.user.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.user });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.redirectUrl });
      setIsLoggedOut(true);
    }
  }, [queryClient, clearRedirectUrl]);

  const processCallback = async (): Promise<void> => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

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
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.user });

        const redirectUrl = getRedirectUrl();
        if (redirectUrl) {
          navigate(redirectUrl);
          clearRedirectUrl();
        }
      }
      // Clean up URL parameters
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (isSecurityError(apiError)) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.user });
      } else {
        console.error("OAuth callback error:", error);
      }
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.toString());

      clearOAuthState();
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && !codeUsed) {
      setCodeUsed(true);
    }
  }, [location.pathname, codeUsed]);

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && codeUsed) {
      processCallback();
    }
  }, [codeUsed]);

  useEffect(() => {
    if (user && isLoggedOut) {
      setIsLoggedOut(false);
    }
  }, [user, isLoggedOut]);

  const login = async (): Promise<void> => {
    const currentUrl = location.pathname + location.search;
    queryClient.setQueryData(QUERY_KEYS.auth.redirectUrl, currentUrl);

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
      console.log("error logging in:", error);
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    login,
    logout,
  };

  if (isVerifying || isLoading)
    return (
      <Loader message={isVerifying ? "Verifying session..." : "Loading..."} />
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
