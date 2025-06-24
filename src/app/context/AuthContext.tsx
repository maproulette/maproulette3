"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { api } from "../utils/api";

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

const isSecurityError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

export const validateOAuthState = (state: string | null): boolean => {
  const storedState = localStorage.getItem("state");
  return storedState === state || process.env.NODE_ENV === "development";
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isAuthenticated = !!user?.id;

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      processCallback();
    } else {
      fetchUserData();
    }
  }, [searchParams, pathname]);

  const fetchUserData = async (): Promise<number | null> => {
    try {
      const response = await api.user.whoami();
      const userData = response.data;
      const userId = userData.id;

      if (userId) {
        setUser(userData);
        return userId;
      } else {
        setUser(null);
        return null;
      }
    } catch (error: any) {
      if (error.status === 401) {
        setUser(null);
        await logout();

        return null;
      } else {
        console.error("Failed to fetch user data:", error);
        setUser(null);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        const userId = await fetchUserData();
        if (userId) {
          const redirectUrl = getStoredRedirectUrl();
          if (redirectUrl) {
            router.push(redirectUrl);
            clearStoredRedirectUrl();
          }
        }
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.toString());
    } catch (error: any) {
      if (isSecurityError(error)) {
        await fetchUserData();
      } else {
        console.error("OAuth callback error:", error);
      }
    } finally {
      clearOAuthState();
      setIsVerifying(false);
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.clear();

    try {
      await api.user.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const login = async (): Promise<void> => {
    const loginUrl = `${
      process.env.NEXT_PUBLIC_SERVER_OAUTH_URL
    }${encodeURIComponent(pathname + searchParams.toString())}`;

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
    user,
    isAuthenticated,
    login,
    logout,
  };

  if (isVerifying || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isVerifying ? "Verifying session..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

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
