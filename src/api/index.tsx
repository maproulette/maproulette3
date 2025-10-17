import ky from 'ky'
import { task } from './task'
import { user } from './user'
import { challenge } from './challenge'
import { project } from './project.tsx'

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
