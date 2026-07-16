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

import { service } from './index'
import type { ServiceInfo } from './info'
import { serviceApi } from './info'

describe('service', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  it('re-exports every function from serviceApi', () => {
    expect(Object.keys(service).sort()).toEqual(Object.keys(serviceApi).sort())
    expect(service.info).toBe(serviceApi.info)
  })

  it('info fetches the service info via the wired-through function', async () => {
    const info = { version: '1.2.3' } as ServiceInfo
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(info) })

    const { result } = renderHookWithClient(() => service.info())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/service/info')
    expect(result.current.data).toEqual(info)
  })
})
