import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { UserNotificationsResponse } from '@/types/User'

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

import { userNotifications } from './notifications'

function makeNotification(id: number, isRead: boolean): UserNotificationsResponse[number] {
  return {
    id,
    isRead,
  } as unknown as UserNotificationsResponse[number]
}

describe('userNotifications', () => {
  beforeEach(() => {
    apiRequestMock.get.mockReset()
    apiRequestMock.put.mockReset()
  })

  it('notification fetches notifications for a user with no params', async () => {
    const notifications = [makeNotification(1, false)]
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve(notifications) })

    const { result } = renderHookWithClient(() => userNotifications.notification(5))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5/notifications', {
      searchParams: {},
    })
    expect(result.current.data).toEqual(notifications)
  })

  it('notification forwards query params as search params', async () => {
    apiRequestMock.get.mockReturnValue({ json: () => Promise.resolve([]) })

    const { result } = renderHookWithClient(() =>
      userNotifications.notification(5, { limit: 10, page: 1 })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.get).toHaveBeenCalledWith('api/v2/user/5/notifications', {
      searchParams: { limit: 10, page: 1 },
    })
  })

  it('notification is disabled when there is no userId', () => {
    const { result } = renderHookWithClient(() => userNotifications.notification(undefined))

    expect(result.current.fetchStatus).toBe('idle')
    expect(apiRequestMock.get).not.toHaveBeenCalled()
  })

  it('useMarkNotificationsAsRead PUTs the notification ids and marks them read in the cache', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({}) })

    const { result, queryClient } = renderHookWithClient(() =>
      userNotifications.useMarkNotificationsAsRead()
    )
    const queryKey = ['user', 'notifications', 5, undefined]
    queryClient.setQueryData(queryKey, [makeNotification(1, false), makeNotification(2, false)])

    result.current.mutate({ userId: 5, notificationIds: [1] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5/notifications', {
      json: { notificationIds: [1] },
    })
    expect(queryClient.getQueryData(queryKey)).toEqual([
      makeNotification(1, true),
      makeNotification(2, false),
    ])
  })

  it('useMarkNotificationsAsUnread PUTs to the unread endpoint and marks them unread in the cache', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({}) })

    const { result, queryClient } = renderHookWithClient(() =>
      userNotifications.useMarkNotificationsAsUnread()
    )
    const queryKey = ['user', 'notifications', 5, undefined]
    queryClient.setQueryData(queryKey, [makeNotification(1, true), makeNotification(2, true)])

    result.current.mutate({ userId: 5, notificationIds: [2] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5/notifications/unread', {
      json: { notificationIds: [2] },
    })
    expect(queryClient.getQueryData(queryKey)).toEqual([
      makeNotification(1, true),
      makeNotification(2, false),
    ])
  })

  it('useDeleteNotifications PUTs to the delete endpoint and removes them from the cache', async () => {
    apiRequestMock.put.mockReturnValue({ json: () => Promise.resolve({}) })

    const { result, queryClient } = renderHookWithClient(() =>
      userNotifications.useDeleteNotifications()
    )
    const queryKey = ['user', 'notifications', 5, undefined]
    queryClient.setQueryData(queryKey, [makeNotification(1, true), makeNotification(2, true)])

    result.current.mutate({ userId: 5, notificationIds: [1] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiRequestMock.put).toHaveBeenCalledWith('api/v2/user/5/notifications/delete', {
      json: { notificationIds: [1] },
    })
    expect(queryClient.getQueryData(queryKey)).toEqual([makeNotification(2, true)])
  })
})
