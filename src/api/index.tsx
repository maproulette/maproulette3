import ky from 'ky'
import { challenge } from './challenge'
import { osm } from './osm'
import { project } from './project'
import { search } from './search'
import { task } from './task'
import { taskBundle } from './taskBundle'
import { user } from './user'

export const api = {
  challenge,
  task,
  taskBundle,
  user,
  project,
  osm,
  search,
}

export const apiKey = import.meta.env.VITE_SERVER_API_KEY

export const apiRequest = ky.extend({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000',
  credentials: 'include',
  timeout: 60000,
  retry: {
    limit: 0,
  },
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Content-Type', 'application/json')
        if (apiKey) {
          request.headers.set('apiKey', apiKey)
        }
      },
    ],
  },
})

export const createApiWithBaseUrl = (baseUrl: string) => {
  return apiRequest.extend({
    prefixUrl: baseUrl,
  })
}

export const convertParamsToSearchParams = (
  params: Record<
    string,
    | string
    | number
    | boolean
    | Record<string, string | number | boolean>
    | Array<string | number | boolean>
    | null
    | undefined
  >
): Record<string, string | number | boolean> => {
  const searchParams: Record<string, string | number | boolean> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return
    }

    if (typeof value === 'string') {
      searchParams[key] = value
    } else if (typeof value === 'number') {
      searchParams[key] = value
    } else if (typeof value === 'boolean') {
      searchParams[key] = value
    } else if (Array.isArray(value)) {
      searchParams[key] = value.map((item) => item.toString()).join(',')
    } else if (typeof value === 'object') {
      searchParams[key] = JSON.stringify(value)
    }
  })

  return searchParams
}
