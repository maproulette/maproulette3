import { ApiConfig, ApiRequestOptions, ApiResponse, ApiError } from "../types";

const defaultConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:9000",
  timeout: 10000,
  credentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

let globalConfig: ApiConfig = { ...defaultConfig };

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

const parseResponse = async (response: Response): Promise<any> => {
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
  data?: any
): ApiError => ({
  name: "ApiError",
  message,
  status,
  statusText,
  data,
});

export const apiRequest = async <T = any>(
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
        responseData?.message || `HTTP ${response.status}`,
        response.status,
        response.statusText,
        responseData
      );
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
    };
  } catch (error: any) {
    if (error.name === "ApiError") {
      throw error;
    }

    if (error.name === "AbortError") {
      throw createApiError("Request timeout", 408, "Request Timeout");
    }

    throw createApiError(error.message || "Network error", 0, "Network Error");
  }
};

// HTTP method functions
export const apiGet = <T = any>(
  url: string,
  options?: Omit<ApiRequestOptions, "url" | "method">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "GET", ...options });
};

export const apiPost = <T = any>(
  url: string,
  data?: any,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "POST", data, ...options });
};

export const apiPut = <T = any>(
  url: string,
  data?: any,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "PUT", data, ...options });
};

export const apiPatch = <T = any>(
  url: string,
  data?: any,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "PATCH", data, ...options });
};

export const apiDelete = <T = any>(
  url: string,
  options?: Omit<ApiRequestOptions, "url" | "method">
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({ url, method: "DELETE", ...options });
};

export const apiUpload = <T = any>(
  url: string,
  file: File,
  options?: Omit<ApiRequestOptions, "url" | "method" | "data">
): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append("file", file);

  const { headers, ...restOptions } = options || {};
  const uploadHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  delete uploadHeaders["Content-Type"];

  return apiRequest<T>({
    url,
    method: "POST",
    headers: uploadHeaders,
    data: formData,
    ...restOptions,
  });
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    await apiGet("/api/v2/user/whoami");
    return true;
  } catch (error: any) {
    return error.status !== 401;
  }
};

export const api = {
  // User operations
  user: {
    whoami: () => apiGet("/api/v2/user/whoami"),
    logout: () => apiGet("/auth/signout"),
  },

  // OAuth operations
  oauth: {
    callback: (code: string) => apiGet("/auth/callback", { params: { code } }),
    login: (redirectUrl: string) => apiGet(redirectUrl),
  },

  // Generic CRUD operations
  get: <T = any>(url: string, options?: any) => apiGet<T>(url, options),
  post: <T = any>(url: string, data?: any, options?: any) =>
    apiPost<T>(url, data, options),
  put: <T = any>(url: string, data?: any, options?: any) =>
    apiPut<T>(url, data, options),
  patch: <T = any>(url: string, data?: any, options?: any) =>
    apiPatch<T>(url, data, options),
  delete: <T = any>(url: string, options?: any) => apiDelete<T>(url, options),
  upload: <T = any>(url: string, file: File, options?: any) =>
    apiUpload<T>(url, file, options),
};
