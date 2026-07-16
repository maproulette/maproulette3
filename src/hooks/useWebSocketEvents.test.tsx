import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderHookWithClient } from '@/test/queryClient'
import type { ChallengeTaskMarkersResponse } from '@/types/Challenge'
import type { TaskGetResponse } from '@/types/Task'
import type { User } from '@/types/User'
import type { WebSocketMessageTypes } from '@/types/WebSocket'

const { wsState, authState, congratulateState, wsLoggerMock } = vi.hoisted(() => ({
  wsState: { lastMessage: null as WebSocketMessageTypes | null, subscribe: vi.fn() },
  authState: { user: undefined as User | undefined },
  congratulateState: { enqueue: vi.fn() },
  wsLoggerMock: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

vi.mock('@/contexts/WebSocketContext', () => ({
  useWebSocketContext: () => wsState,
}))
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => authState,
}))
vi.mock('@/contexts/CongratulateContext', () => ({
  useCongratulate: () => congratulateState,
}))
vi.mock('@/lib/logger', () => ({
  wsLogger: wsLoggerMock,
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

import { useWebSocketEvents } from './useWebSocketEvents'

function makeUser(id: number): User {
  return { id } as User
}

function setLastMessage(message: WebSocketMessageTypes | null) {
  wsState.lastMessage = message
}

describe('useWebSocketEvents', () => {
  it('subscribes to the "tasks" stream once on mount', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    renderHookWithClient(() => useWebSocketEvents())

    expect(wsState.subscribe).toHaveBeenCalledTimes(1)
    expect(wsState.subscribe).toHaveBeenCalledWith('tasks')
  })

  it('re-subscribes when the context provides a new subscribe function (e.g. after a reconnect)', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    const { rerender } = renderHookWithClient(() => useWebSocketEvents())
    expect(wsState.subscribe).toHaveBeenCalledTimes(1)

    const newSubscribe = vi.fn()
    wsState.subscribe = newSubscribe
    rerender()

    expect(newSubscribe).toHaveBeenCalledWith('tasks')
  })

  it('does not resubscribe when rerendered with the same subscribe reference', () => {
    const subscribe = vi.fn()
    wsState.subscribe = subscribe
    wsState.lastMessage = null
    authState.user = undefined

    const { rerender } = renderHookWithClient(() => useWebSocketEvents())
    expect(subscribe).toHaveBeenCalledTimes(1)

    rerender()

    expect(subscribe).toHaveBeenCalledTimes(1)
  })

  it('unmounts cleanly without throwing', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    const { unmount } = renderHookWithClient(() => useWebSocketEvents())

    expect(() => unmount()).not.toThrow()
  })

  it('enqueues an achievement congratulation and invalidates user caches for the current user', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(7)
    congratulateState.enqueue = vi.fn()

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({
        messageType: 'achievement-awarded',
        data: { userId: 7, achievement: [10, 20] },
      })
      rerender()
    })

    expect(congratulateState.enqueue).toHaveBeenCalledWith({
      kind: 'achievement',
      achievementId: 10,
    })
    expect(congratulateState.enqueue).toHaveBeenCalledWith({
      kind: 'achievement',
      achievementId: 20,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 7] })
  })

  it('ignores an achievement message awarded to a different user', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(7)
    congratulateState.enqueue = vi.fn()

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({
        messageType: 'achievement-awarded',
        data: { userId: 999, achievement: [10] },
      })
      rerender()
    })

    expect(congratulateState.enqueue).not.toHaveBeenCalled()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('patches the cached task status and invalidates history/aggregates on a status-changing task event', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(7)

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())

    queryClient.setQueryData<TaskGetResponse>(['task', 5], {
      id: 5,
      status: 0,
    } as TaskGetResponse)
    queryClient.setQueryData<ChallengeTaskMarkersResponse>(['challenge', 'taskMarkers', 3], {
      markers: [{ id: 5, status: 0 } as ChallengeTaskMarkersResponse['markers'][number]],
      overlaps: [],
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({
        messageType: 'task-completed',
        data: {
          task: { id: 5, parent: 3, status: 1 },
          challenge: { id: 3, parentId: 1, name: 'c', enabled: true },
          project: null,
          byUser: { userId: 7, osmId: 7, displayName: 'me', avatarURL: '' },
        },
      })
      rerender()
    })

    expect(queryClient.getQueryData<TaskGetResponse>(['task', 5])?.status).toBe(1)
    expect(
      queryClient.getQueryData<ChallengeTaskMarkersResponse>(['challenge', 'taskMarkers', 3])
        ?.markers[0].status
    ).toBe(1)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 5] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 3] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'stats', 3] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'activity', 3] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 7] })
  })

  it('does not invalidate challenge aggregates when the task status is unchanged', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(7)

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    queryClient.setQueryData<TaskGetResponse>(['task', 5], {
      id: 5,
      status: 1,
    } as TaskGetResponse)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({
        messageType: 'task-update',
        data: {
          task: { id: 5, parent: 3, status: 1 },
          challenge: null,
          project: null,
          byUser: null,
        },
      })
      rerender()
    })

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['challenge', 3] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 5] })
  })

  it('sets lockedBy on the marker when a task is claimed, and clears it when released', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    queryClient.setQueryData<ChallengeTaskMarkersResponse>(['challenge', 'taskMarkers', 3], {
      markers: [{ id: 5, lockedBy: null } as ChallengeTaskMarkersResponse['markers'][number]],
      overlaps: [],
    })

    act(() => {
      setLastMessage({
        messageType: 'task-claimed',
        data: {
          task: { id: 5, parent: 3, status: null },
          challenge: null,
          project: null,
          byUser: { userId: 42, osmId: 42, displayName: 'other', avatarURL: '' },
        },
      })
      rerender()
    })

    expect(
      queryClient.getQueryData<ChallengeTaskMarkersResponse>(['challenge', 'taskMarkers', 3])
        ?.markers[0].lockedBy
    ).toBe(42)

    act(() => {
      setLastMessage({
        messageType: 'task-released',
        data: {
          task: { id: 5, parent: 3, status: null },
          challenge: null,
          project: null,
          byUser: null,
        },
      })
      rerender()
    })

    expect(
      queryClient.getQueryData<ChallengeTaskMarkersResponse>(['challenge', 'taskMarkers', 3])
        ?.markers[0].lockedBy
    ).toBe(null)
  })

  it('invalidates task and challenge aggregate caches on a review event', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({
        messageType: 'review-new',
        data: {
          taskWithReview: {
            task: { id: 8, parent: 4, status: 2 },
            review: { reviewStatus: 0 },
          },
        },
      })
      rerender()
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 8] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 8] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 4] })
  })

  it('invalidates the team and current user teamMemberships caches on a team update', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(7)

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({ messageType: 'team-update', data: { teamId: 12, userId: 7 } })
      rerender()
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 12] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 7, 'teamMemberships'] })
  })

  it('invalidates the notifications cache on a new-notification message', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = undefined

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      setLastMessage({ messageType: 'notification-new', data: { userId: 1, notificationType: 0 } })
      rerender()
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'notifications'] })
  })

  it('does not reprocess the same message object when an unrelated dependency changes', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(1)
    congratulateState.enqueue = vi.fn()

    const message: WebSocketMessageTypes = {
      messageType: 'notification-new',
      data: { userId: 1, notificationType: 0 },
    }
    setLastMessage(message)

    const { rerender, queryClient } = renderHookWithClient(() => useWebSocketEvents())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    // First render already processed `message` via mount effect; reset the spy
    // so we only observe invalidations from the rerender below.
    invalidateSpy.mockClear()

    act(() => {
      // Change an unrelated effect dependency (`user`) while `lastMessage`
      // keeps the exact same object reference — the WeakSet guard should
      // prevent re-processing the already-seen message.
      authState.user = makeUser(2)
      rerender()
    })

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['user', 'notifications'] })
  })

  it('logs and swallows errors thrown while dispatching a malformed message', () => {
    wsState.subscribe = vi.fn()
    wsState.lastMessage = null
    authState.user = makeUser(1)
    wsLoggerMock.warn = vi.fn()

    const malformedTaskMessage = {
      messageType: 'task-completed',
      data: {},
    } as WebSocketMessageTypes

    const { rerender } = renderHookWithClient(() => useWebSocketEvents())

    expect(() => {
      act(() => {
        setLastMessage(malformedTaskMessage)
        rerender()
      })
    }).not.toThrow()

    expect(wsLoggerMock.warn).toHaveBeenCalledWith(
      'WebSocket dispatch error',
      expect.objectContaining({ error: expect.anything() })
    )
  })
})
