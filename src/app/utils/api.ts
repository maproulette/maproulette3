import {
  ApiConfig,
  ApiRequestOptions,
  ApiResponse,
  ApiError,
  OAuthCallbackResponse,
  OAuthLoginResponse,
  Task,
} from "../types";
import { User } from "../types";

const defaultConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:9000",
  timeout: 10000,
  credentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

const globalConfig: ApiConfig = { ...defaultConfig };

const buildUrl = (url: string, params?: Record<string, string>): string => {
  const fullUrl = url.startsWith("http")
    ? url
    : `${globalConfig.baseURL}${url}`;

  if (!params) return fullUrl;

  const urlObj = new URL(fullUrl);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });

  return urlObj.toString();
};

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  if (contentType?.includes("text/")) {
    return response.text();
  }

  return response.blob();
};

const createApiError = (
  message: string,
  status: number,
  statusText: string,
  data?: unknown
): ApiError => ({
  name: "ApiError",
  message,
  status,
  statusText,
  data,
});

export const apiRequest = async <T = unknown>(
  options: ApiRequestOptions
): Promise<ApiResponse<T>> => {
  const {
    url,
    method = "GET",
    headers = {},
    params,
    data,
    ...restOptions
  } = options;

  const fullUrl = buildUrl(url, params);

  const requestHeaders = {
    ...globalConfig.defaultHeaders,
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: globalConfig.credentials,
    ...restOptions,
  };

  if (data && method !== "GET" && method !== "HEAD") {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeoutId = globalConfig.timeout
      ? setTimeout(() => controller.abort(), globalConfig.timeout)
      : null;

    const response = await fetch(fullUrl, {
      ...requestOptions,
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    const responseData = await parseResponse(response);

    if (!response.ok) {
      throw createApiError(
        (responseData as { message?: string })?.message ||
          `HTTP ${response.status}`,
        response.status,
        response.statusText,
        responseData
      );
    }

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
    };
  } catch (error: unknown) {
    if ((error as ApiError).name === "ApiError") {
      throw error;
    }

    if ((error as Error).name === "AbortError") {
      throw createApiError("Request timeout", 408, "Request Timeout");
    }

    throw createApiError(
      (error as Error).message || "Network error",
      0,
      "Network Error"
    );
  }
};

// HTTP method functions
export const apiGet = <T = unknown>(
  url: string,
  options?: Omit<ApiRequestOptions, "url" | "method">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "GET", ...options });
};

export const apiPost = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "POST", data, ...options });
};

export const apiPut = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "PUT", data, ...options });
};

export const apiPatch = <T = unknown>(
  url: string,
  data?: unknown,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "PATCH", data, ...options });
};

export const apiDelete = <T = unknown>(
  url: string,
  options?: Omit<ApiRequestOptions, "url" | "method">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "DELETE", ...options });
};

export const api = {
  // User operations
  user: {
    whoami: () => apiGet<User>("/api/v2/user/whoami"),
    logout: () => apiGet("/auth/signout"),
  },

  // OAuth operations
  oauth: {
    callback: (code: string) =>
      apiGet<OAuthCallbackResponse>("/auth/callback", { params: { code } }),
    login: (redirectUrl: string) => apiGet<OAuthLoginResponse>(redirectUrl),
  },

  task: {
    start: (taskId: string) => apiGet<Task>(`/api/v2/task/${taskId}/start`),
  },

  // Generic CRUD operations
  get: <T = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, "url" | "method">
  ) => apiGet<T>(url, options),
  post: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, "url" | "method" | "data">
  ) => apiPost<T>(url, data, options),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, "url" | "method" | "data">
  ) => apiPut<T>(url, data, options),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    options?: Omit<ApiRequestOptions, "url" | "method" | "data">
  ) => apiPatch<T>(url, data, options),
  delete: <T = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, "url" | "method">
  ) => apiDelete<T>(url, options),
};
