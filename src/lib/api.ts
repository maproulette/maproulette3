import ky from 'ky'

const apiKey = import.meta.env.VITE_SERVER_API_KEY

const api = ky.extend({
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

const createApiWithBaseUrl = (baseUrl: string) => {
  return api.extend({
    prefixUrl: baseUrl,
  })
}

export { api, createApiWithBaseUrl }
