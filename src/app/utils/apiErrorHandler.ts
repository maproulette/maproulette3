import { ApiError } from "../types";

export interface ApiErrorHandlerOptions {
  on401?: () => Promise<void>;
  onError?: (error: unknown) => void;
  setData: (data: unknown) => void;
  setIsLoading?: (loading: boolean) => void;
}

export const handleApiError = async (
  error: unknown,
  options: ApiErrorHandlerOptions
): Promise<void> => {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    options.setData(null);
    if (options.on401) {
      await options.on401();
    }
  } else {
    console.error("API request failed:", error);
    options.setData(null);
    if (options.onError) {
      options.onError(error);
    }
    throw error;
  }
};

export const executeApiRequest = async <T>(
  apiCall: () => Promise<{ data: T }>,
  options: ApiErrorHandlerOptions
): Promise<T | null> => {
  try {
    const response = await apiCall();
    const data = response.data;

    if (data && (data as unknown as { id: string }).id) {
      options.setData(data);
      return data;
    } else {
      options.setData(null);
      return null;
    }
  } catch (error: unknown) {
    await handleApiError(error, options);
    return null;
  } finally {
    if (options.setIsLoading) {
      options.setIsLoading(false);
    }
  }
};
