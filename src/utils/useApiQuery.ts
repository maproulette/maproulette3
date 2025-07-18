import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useEffect, useCallback } from "react";

export interface UseApiQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError>, "retry"> {
  on401?: () => void;
  onError?: (error: TError) => void;
}

export function useApiQuery<TData, TError = unknown>(
  options: UseApiQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { logout } = useAuth();

  const queryResult = useQuery({
    ...options,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 4xx errors
      const apiError = error as { status?: number };
      if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleError = useCallback(() => {
    const apiError = queryResult.error as { status?: number };
    if (queryResult.error && apiError?.status === 401) {
      if (options.on401) {
        options.on401();
      } else {
        // Default behavior: logout
        logout();
      }
    } else if (queryResult.error && options.onError) {
      options.onError(queryResult.error);
    }
  }, [queryResult.error, logout, options.on401, options.onError, options]);

  useEffect(() => {
    handleError();
  }, [handleError]);

  return queryResult;
}
