export interface ApiError {
  name: string
  message: string
  status: number
  statusText: string
  data?: unknown
}
