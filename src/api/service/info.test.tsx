import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest: apiRequestMock }
})

import type { ServiceInfo } from './info'
import { serviceApi } from './info'

describe('serviceApi', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  describe('info', () => {
    it('fetches the service info from the expected endpoint', async () => {
      const info = { version: '1.2.3' } as unknown as ServiceInfo
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(info) })

      const { result } = renderHookWithClient(() => serviceApi.info())

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/service/info')
      expect(result.current.data).toEqual(info)
    })

    it('uses the ["service", "info"] query key', async () => {
      const info = { version: '1.2.3' } as unknown as ServiceInfo
      apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(info) })

      const { result, queryClient } = renderHookWithClient(() => serviceApi.info())

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(queryClient.getQueryData(['service', 'info'])).toEqual(info)
    })
  })
})
