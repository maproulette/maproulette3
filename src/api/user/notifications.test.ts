// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient, queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import { stubFetch } from '@/test/stubFetch'
import { waitFor } from '@/test/waitFor'
import { userNotifications } from './notifications'

function stubFetchByMethod(handlers: Partial<Record<string, () => Response | Promise<Response>>>) {
  const fetchMock = vi.fn(async (request: Request) => {
    const handler = handlers[request.method]
    if (!handler) throw new Error(`Unexpected method: ${request.method}`)
    return handler()
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('userNotifications.notification', () => {
  it('fetches notifications for a defined userId without params', async () => {
    const notifications = [{ id: 1, isRead: false }]
    const fetchMock = stubFetch(new Response(JSON.stringify(notifications), { status: 200 }))

    const { result } = renderHook(() => userNotifications.notification(7), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(notifications)

    const [request] = fetchMock.mock.calls[0]
    expect(new URL(request.url).pathname).toBe('/api/v2/user/7/notifications')
  })

  it('fetches notifications with params applied as search params', async () => {
    const fetchMock = stubFetch(new Response(JSON.stringify([]), { status: 200 }))

    const { result } = renderHook(() => userNotifications.notification(7, { limit: 5, page: 1 }), {
      wrapper: queryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [request] = fetchMock.mock.calls[0]
    const url = new URL(request.url)
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.get('page')).toBe('1')
  })

  it('is disabled when userId is undefined', () => {
    const fetchMock = stubFetch(new Response('[]', { status: 200 }))

    const { result } = renderHook(() => userNotifications.notification(undefined), {
      wrapper: queryClientWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('userNotifications.useMarkNotificationsAsRead', () => {
  it('marks the given notification ids as read in matching cached queries', async () => {
    const notifications = [
      { id: 1, isRead: false },
      { id: 2, isRead: false },
    ]
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['user', 'notifications', 7, undefined], notifications)
    const wrapper = queryClientWrapper(queryClient)

    stubFetchByMethod({
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })

    const { result } = renderHook(() => userNotifications.useMarkNotificationsAsRead(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [1] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toEqual([
      { id: 1, isRead: true },
      { id: 2, isRead: false },
    ])
  })

  it('is a no-op for notification queries that have not resolved data yet', async () => {
    let resolveGet: (response: Response) => void = () => {}
    const pendingGet = new Promise<Response>((resolve) => {
      resolveGet = resolve
    })
    const fetchMock = stubFetchByMethod({
      GET: () => pendingGet,
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })
    const queryClient = createTestQueryClient()
    const wrapper = queryClientWrapper(queryClient)

    renderHook(() => userNotifications.notification(7), { wrapper })
    const { result } = renderHook(() => userNotifications.useMarkNotificationsAsRead(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [1] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toBeUndefined()
    resolveGet(new Response('[]', { status: 200 }))
    expect(fetchMock).toHaveBeenCalled()
  })
})

describe('userNotifications.useMarkNotificationsAsUnread', () => {
  it('marks the given notification ids as unread in matching cached queries', async () => {
    const notifications = [
      { id: 1, isRead: true },
      { id: 2, isRead: true },
    ]
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['user', 'notifications', 7, undefined], notifications)
    const wrapper = queryClientWrapper(queryClient)

    stubFetchByMethod({
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })

    const { result } = renderHook(() => userNotifications.useMarkNotificationsAsUnread(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [2] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toEqual([
      { id: 1, isRead: true },
      { id: 2, isRead: false },
    ])
  })

  it('is a no-op for notification queries that have not resolved data yet', async () => {
    const pendingGet = new Promise<Response>(() => {})
    stubFetchByMethod({
      GET: () => pendingGet,
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })
    const queryClient = createTestQueryClient()
    const wrapper = queryClientWrapper(queryClient)

    renderHook(() => userNotifications.notification(7), { wrapper })
    const { result } = renderHook(() => userNotifications.useMarkNotificationsAsUnread(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [2] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toBeUndefined()
  })
})

describe('userNotifications.useDeleteNotifications', () => {
  it('removes the given notification ids from matching cached queries', async () => {
    const notifications = [
      { id: 1, isRead: false },
      { id: 2, isRead: false },
    ]
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['user', 'notifications', 7, undefined], notifications)
    const wrapper = queryClientWrapper(queryClient)

    stubFetchByMethod({
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })

    const { result } = renderHook(() => userNotifications.useDeleteNotifications(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [1] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toEqual([
      { id: 2, isRead: false },
    ])
  })

  it('is a no-op for notification queries that have not resolved data yet', async () => {
    const pendingGet = new Promise<Response>(() => {})
    stubFetchByMethod({
      GET: () => pendingGet,
      PUT: () => new Response(JSON.stringify({ id: 7 }), { status: 200 }),
    })
    const queryClient = createTestQueryClient()
    const wrapper = queryClientWrapper(queryClient)

    renderHook(() => userNotifications.notification(7), { wrapper })
    const { result } = renderHook(() => userNotifications.useDeleteNotifications(), {
      wrapper,
    })

    result.current.mutate({ userId: 7, notificationIds: [1] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(['user', 'notifications', 7, undefined])).toBeUndefined()
  })
})
