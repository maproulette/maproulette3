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

import { userSearch } from './search'

describe('userSearch', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  it('findUsers searches with the default limit', async () => {
    const users = [{ id: 1 }]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(users) })

    const { result } = renderHookWithClient(() => userSearch.findUsers('bob'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/users/find/bob', {
      searchParams: { limit: 10 },
    })
    expect(result.current.data).toEqual(users)
  })

  it('findUsers forwards an explicit limit', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() => userSearch.findUsers('bob', 5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/users/find/bob', {
      searchParams: { limit: 5 },
    })
  })

  it('findUsers URI-encodes the prefix', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() => userSearch.findUsers('a b/c'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/users/find/a%20b%2Fc', {
      searchParams: { limit: 10 },
    })
  })

  it('findUsers is disabled when the prefix is empty', () => {
    const { result } = renderHookWithClient(() => userSearch.findUsers(''))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('findUsers is disabled when the caller explicitly disables it', () => {
    const { result } = renderHookWithClient(() => userSearch.findUsers('bob', 10, false))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })
})
