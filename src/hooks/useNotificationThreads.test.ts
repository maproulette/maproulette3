// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { baseNotification } from '@/test/notificationFixtures'
import { renderHook } from '@/test/renderHook'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { useNotificationThreads } from './useNotificationThreads'

describe('useNotificationThreads', () => {
  it('returns an empty object for no notifications', () => {
    const { result } = renderHook(() => useNotificationThreads([]))

    expect(result.current).toEqual({})
  })

  it('groups notifications sharing a taskId into the same thread', () => {
    const a = baseNotification({ id: 1, taskId: 42 })
    const b = baseNotification({ id: 2, taskId: 42 })

    const { result } = renderHook(() => useNotificationThreads([a, b]))

    expect(result.current['task:42']).toEqual([a, b])
  })

  it('groups challenge-comment notifications by challengeId', () => {
    const a = baseNotification({
      id: 1,
      notificationType: NotificationType.CHALLENGE_COMMENT,
      challengeId: 7,
    })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['challenge:7']).toEqual([a])
  })

  it('groups team notifications by targetId', () => {
    const a = baseNotification({
      id: 1,
      notificationType: NotificationType.TEAM,
      targetId: 3,
    })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['team:3']).toEqual([a])
  })

  it('falls back to grouping by challengeName when no ids are available', () => {
    const a = baseNotification({ id: 1, challengeName: 'Fix Roads' })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['challenge-name:Fix Roads']).toEqual([a])
  })

  it('falls back to a single-notification thread keyed by its own id', () => {
    const a = baseNotification({ id: 9 })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['single:9']).toEqual([a])
  })

  it('recomputes when the notifications array changes', () => {
    const a = baseNotification({ id: 1, taskId: 1 })
    const b = baseNotification({ id: 2, taskId: 2 })

    const { result, rerender } = renderHook(
      (notifications: Notification[]) => useNotificationThreads(notifications),
      { initialProps: [a] }
    )

    expect(Object.keys(result.current)).toEqual(['task:1'])

    rerender([a, b])

    expect(Object.keys(result.current).sort()).toEqual(['task:1', 'task:2'])
  })
})
