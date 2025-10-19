import ky from 'ky'
import { challenge } from './challenge'
import { project } from './project.tsx'
import { task } from './task'
import { user } from './user'

export const api = {
  challenge: challenge,
  task: task,
  user: user,
  project: project,
}

const apiKey = import.meta.env.VITE_SERVER_API_KEY

export const apiRequest = ky.extend({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000',
  credentials: 'include',
  timeout: 10000,
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
) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      searchParams.append(key, value)
    } else if (typeof value === 'number') {
      searchParams.append(key, value.toString())
    } else if (typeof value === 'boolean') {
      searchParams.append(key, value.toString())
    } else if (Array.isArray(value)) {
      // Add each array element as a separate query parameter with the same key
      value.forEach((item) => {
        searchParams.append(key, item.toString())
      })
    } else if (value === null || value === undefined) {
      searchParams.append(key, '')
    } else if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value))
    }
  })

  return searchParams
}
