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

import { userAdmin } from './admin'

describe('userAdmin', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
  })

  it('getAllUsers fetches users with default limit and page', async () => {
    const users = [{ id: 1 }, { id: 2 }]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(users) })

    const { result } = renderHookWithClient(() => userAdmin.getAllUsers())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/super-admin/users', {
      searchParams: { limit: 50, page: 0 },
    })
    expect(result.current.data).toEqual(users)
  })

  it('getAllUsers passes through explicit limit and page', async () => {
    const users = [{ id: 3 }]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(users) })

    const { result } = renderHookWithClient(() => userAdmin.getAllUsers({ limit: 20, page: 2 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/super-admin/users', {
      searchParams: { limit: 20, page: 2 },
    })
  })

  it('getAllUsers caches each returned user under its own query key', async () => {
    const users = [{ id: 1 }, { id: 2 }]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(users) })

    const { result, queryClient } = renderHookWithClient(() => userAdmin.getAllUsers())
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(setQueryDataSpy).toHaveBeenCalledWith(['user', 1], users[0])
    expect(setQueryDataSpy).toHaveBeenCalledWith(['user', 2], users[1])
  })

  it('getSuperUsers fetches the superusers list', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([1, 2, 3]) })

    const { result } = renderHookWithClient(() => userAdmin.getSuperUsers())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/superusers')
    expect(result.current.data).toEqual([1, 2, 3])
  })
})
