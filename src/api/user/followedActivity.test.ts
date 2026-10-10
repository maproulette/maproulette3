// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import { stubFetch } from '@/test/stubFetch'
import { waitFor } from '@/test/waitFor'
import type { ActivityItem } from '@/types/Activity'
import { userFollowedActivity } from './followedActivity'

afterEach(() => {
  vi.unstubAllGlobals()
})

const action = { id: 1, created: '2026-01-01', typeId: 2 } as ActivityItem

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

describe('userFollowedActivity.followedActivity', () => {
  it('asks for the recent actions of the given mappers', async () => {
    const fetchMock = stubFetch(jsonResponse([action]))

    const { result } = renderHook(() => userFollowedActivity.followedActivity([3, 1]), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([action])

    const url = new URL(fetchMock.mock.calls[0][0].url)
    expect(url.pathname).toBe('/api/v2/data/user/activity')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      osmUserIds: '3,1',
      limit: '50',
      offset: '0',
      includeDetails: 'true',
    })
  })

  it('honours a caller-supplied limit', async () => {
    const fetchMock = stubFetch(jsonResponse([]))

    const { result } = renderHook(() => userFollowedActivity.followedActivity([1], { limit: 5 }), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const url = new URL(fetchMock.mock.calls[0][0].url)
    expect(url.searchParams.get('limit')).toBe('5')
  })

  it('does not query when the user follows nobody', () => {
    const fetchMock = stubFetch(jsonResponse([]))

    const { result } = renderHook(() => userFollowedActivity.followedActivity([]), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not query while the caller has it switched off', () => {
    const fetchMock = stubFetch(jsonResponse([]))

    const { result } = renderHook(
      () => userFollowedActivity.followedActivity([1], { enabled: false }),
      { wrapper: queryClientWrapper() }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
