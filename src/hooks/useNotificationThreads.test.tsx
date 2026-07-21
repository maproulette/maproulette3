import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Notification } from '@/types/Notification'
import { NotificationType } from '@/types/Notification'
import { useNotificationThreads } from './useNotificationThreads'

function makeNotification(props: Partial<Notification>): Notification {
  return {
    id: 1,
    notificationType: NotificationType.SYSTEM,
    isRead: false,
    ...props,
  } as Notification
}

describe('useNotificationThreads', () => {
  it('returns an empty map for no notifications', () => {
    const { result } = renderHook(() => useNotificationThreads([]))
    expect(result.current).toEqual({})
  })

  it('groups notifications sharing the same taskId into one thread', () => {
    const a = makeNotification({ id: 1, taskId: 42 })
    const b = makeNotification({ id: 2, taskId: 42 })
    const c = makeNotification({ id: 3, taskId: 7 })

    const { result } = renderHook(() => useNotificationThreads([a, b, c]))

    expect(result.current['task:42']).toEqual([a, b])
    expect(result.current['task:7']).toEqual([c])
  })

  it('groups challenge-comment notifications by challengeId', () => {
    const a = makeNotification({
      id: 1,
      notificationType: NotificationType.CHALLENGE_COMMENT,
      challengeId: 5,
    })
    const b = makeNotification({
      id: 2,
      notificationType: NotificationType.CHALLENGE_COMMENT,
      challengeId: 5,
    })

    const { result } = renderHook(() => useNotificationThreads([a, b]))

    expect(result.current['challenge:5']).toEqual([a, b])
  })

  it('groups team notifications by targetId', () => {
    const a = makeNotification({ id: 1, notificationType: NotificationType.TEAM, targetId: 9 })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['team:9']).toEqual([a])
  })

  it('falls back to grouping by challengeName when no ids are present', () => {
    const a = makeNotification({ id: 1, challengeName: 'Fix roads' })
    const b = makeNotification({ id: 2, challengeName: 'Fix roads' })

    const { result } = renderHook(() => useNotificationThreads([a, b]))

    expect(result.current['challenge-name:Fix roads']).toEqual([a, b])
  })

  it('falls back to a single-notification thread keyed by id', () => {
    const a = makeNotification({ id: 55 })

    const { result } = renderHook(() => useNotificationThreads([a]))

    expect(result.current['single:55']).toEqual([a])
  })

  it('memoizes the result while notifications is unchanged', () => {
    const notifications = [makeNotification({ id: 1, taskId: 1 })]
    const { result, rerender } = renderHook(
      ({ notifications }) => useNotificationThreads(notifications),
      { initialProps: { notifications } }
    )
    const first = result.current

    rerender({ notifications })

    expect(result.current).toBe(first)
  })

  it('recomputes when the notifications array reference changes', () => {
    const notifications = [makeNotification({ id: 1, taskId: 1 })]
    const { result, rerender } = renderHook(
      ({ notifications }) => useNotificationThreads(notifications),
      { initialProps: { notifications } }
    )
    const first = result.current

    rerender({ notifications: [...notifications] })

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual(first)
  })
})
