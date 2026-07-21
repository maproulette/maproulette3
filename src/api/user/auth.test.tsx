import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'

type MutableEnv = { VITE_APP_URL?: string }

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

import { userAuth } from './auth'

describe('userAuth', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.post.mockReset()
  })

  it('signOut calls the signout endpoint', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(undefined) })

    await userAuth.signOut()

    expect(apiRequestMock.get).toHaveBeenCalledWith('auth/signout')
  })

  it('callback encodes the redirect_uri from window.env.VITE_APP_URL', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ token: 'abc' }) })
    ;(window.env as MutableEnv).VITE_APP_URL = 'https://example.test'

    const result = await userAuth.callback('the-code')

    expect(apiRequestMock.get).toHaveBeenCalledWith(
      'auth/callback?code=the-code&redirect_uri=https%3A%2F%2Fexample.test'
    )
    expect(result).toEqual({ token: 'abc' })
  })

  it('whoAmI fetches the current user when not logged out', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve({ id: 7 }) })

    const { result } = renderHookWithClient(() => userAuth.whoAmI(false))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/whoami')
    expect(result.current.data).toEqual({ id: 7 })
  })

  it('whoAmI does not fetch when the user is logged out', () => {
    const { result } = renderHookWithClient(() => userAuth.whoAmI(true))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('refreshAuth invalidates the whoami and user query keys', async () => {
    const { queryClient } = renderHookWithClient(() => userAuth.whoAmI(true))
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await userAuth.refreshAuth(queryClient)

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
  })

  it('clearAuth removes the whoami query', () => {
    const { queryClient } = renderHookWithClient(() => userAuth.whoAmI(true))
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    userAuth.clearAuth(queryClient)

    expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
  })
})
