export interface ApiConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
}

export interface ApiRequestOptions extends RequestInit {
  url: string;
  params?: Record<string, string>;
  data?: unknown;
}

export interface ApiResponse<T = unknown> {
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
  data?: unknown;
}

export interface OAuthCallbackResponse {
  token: string;
}

export interface OAuthLoginResponse {
  state: string;
  redirect: string;
}
