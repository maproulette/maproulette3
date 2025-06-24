export interface ApiConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
}

export interface ApiRequestOptions extends RequestInit {
  url: string;
  params?: Record<string, string>;
  data?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

export interface ApiError {
  name: string;
  message: string;
  status: number;
  statusText: string;
  data?: any;
}
