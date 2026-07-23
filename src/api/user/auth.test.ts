// @vitest-environment happy-dom

import { useQuery } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import { stubFetch } from '@/test/stubFetch'
import { waitFor } from '@/test/waitFor'
import { userAuth } from './auth'

// window.env's fields are declared read-only (set once at app boot from
// env.json), but tests need to simulate a deployment with no configured app
// URL, so we write through a narrow mutable view instead of widening with
// `as any`.
type MutableEnv = { VITE_APP_URL?: string }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('userAuth.signOut', () => {
  it('calls the signout endpoint', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 200 }))

    await userAuth.signOut()

    const [request] = fetchMock.mock.calls[0]
    expect(new URL(request.url).pathname).toBe('/auth/signout')
  })
})

describe('userAuth.callback', () => {
  it('uses window.env.VITE_APP_URL as the redirect_uri when configured', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify({ apiKey: 'abc' }), { status: 200 }))

    const result = await userAuth.callback('the-code')

    expect(result).toEqual({ apiKey: 'abc' })
    const [request] = fetchMock.mock.calls[0]
    const url = new URL(request.url)
    expect(url.pathname).toBe('/auth/callback')
    expect(url.searchParams.get('code')).toBe('the-code')
    expect(url.searchParams.get('redirect_uri')).toBe(window.env.VITE_APP_URL)
  })

  it('falls back to window.location.origin when VITE_APP_URL is not configured', async () => {
    const mutableEnv = window.env as MutableEnv
    const originalAppUrl = mutableEnv.VITE_APP_URL
    mutableEnv.VITE_APP_URL = undefined
    const fetchMock = stubFetch(new Response(JSON.stringify({}), { status: 200 }))

    try {
      await userAuth.callback('another-code')

      const [request] = fetchMock.mock.calls[0]
      const url = new URL(request.url)
      expect(url.searchParams.get('redirect_uri')).toBe(window.location.origin)
    } finally {
      mutableEnv.VITE_APP_URL = originalAppUrl
    }
  })
})

describe('userAuth.whoAmI', () => {
  it('fetches the current user when not logged out', async () => {
    const whoami = { id: 1, osmProfile: { displayName: 'alice' } }
    stubFetch(new Response(JSON.stringify(whoami), { status: 200 }))

    const { result } = renderHook(() => userAuth.whoAmI(false), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(whoami)
  })

  it('is disabled when the user is logged out', () => {
    const fetchMock = stubFetch(new Response('{}', { status: 200 }))

    const { result } = renderHook(() => userAuth.whoAmI(true), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('userAuth.whoAmIOptions', () => {
  it('builds queryOptions usable directly with useQuery, without retrying', async () => {
    const options = userAuth.whoAmIOptions()
    expect(options.queryKey).toEqual(['user', 'whoami'])
    expect(options.retry).toBe(false)

    const whoami = { id: 2, osmProfile: { displayName: 'bob' } }
    stubFetch(new Response(JSON.stringify(whoami), { status: 200 }))

    const { result } = renderHook(() => useQuery(userAuth.whoAmIOptions()), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(whoami)
  })
})

describe('userAuth.refreshAuth', () => {
  it('invalidates the whoami query and all user queries', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await userAuth.refreshAuth(queryClient)

    expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: ['user', 'whoami'] })
    expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: ['user'] })
  })
})

describe('userAuth.clearAuth', () => {
  it('removes the whoami query from the cache', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['user', 'whoami'], { id: 1 })

    userAuth.clearAuth(queryClient)

    expect(queryClient.getQueryData(['user', 'whoami'])).toBeUndefined()
  })
})
