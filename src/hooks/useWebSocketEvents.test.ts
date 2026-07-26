// @vitest-environment happy-dom
import type { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { invalidateChallengeAggregates, patchChallengeTaskMarker } from '@/api/challenge/single'
import { type AuthContextType, useAuthContext } from '@/contexts/AuthContext'
import { useCongratulate } from '@/contexts/CongratulateContext'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { wsLogger } from '@/lib/logger'
import { createTestQueryClient, queryClientWrapper } from '@/test/queryClient'
import { renderHook } from '@/test/renderHook'
import type { TaskGetResponse } from '@/types/Task'
import type {
  AchievementAwardedMessage,
  NotificationNewMessage,
  ReviewEventMessage,
  TaskEventMessage,
  TeamUpdateMessage,
  WebSocketMessageTypes,
} from '@/types/WebSocket'
import { useWebSocketEvents } from './useWebSocketEvents'

vi.mock('@/contexts/AuthContext', () => ({ useAuthContext: vi.fn() }))
vi.mock('@/contexts/CongratulateContext', () => ({ useCongratulate: vi.fn() }))
vi.mock('@/contexts/WebSocketContext', () => ({ useWebSocketContext: vi.fn() }))
vi.mock('@/api/challenge/single', () => ({
  invalidateChallengeAggregates: vi.fn(),
  patchChallengeTaskMarker: vi.fn(),
}))
vi.mock('@/lib/logger', () => ({ wsLogger: { warn: vi.fn() } }))

const fakeUser = (id: number): AuthContextType['user'] =>
  ({ id }) as unknown as AuthContextType['user']

const mockAuth = (user: AuthContextType['user']) => {
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: !!user,
    authLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

const mockCongratulate = (enqueue = vi.fn()) => {
  vi.mocked(useCongratulate).mockReturnValue({
    current: null,
    enqueue,
    dismiss: vi.fn(),
  })
  return enqueue
}

const mockWebSocket = (
  lastMessage: WebSocketMessageTypes | null,
  subscribe: (name: string) => void = vi.fn()
) => {
  vi.mocked(useWebSocketContext).mockReturnValue({
    lastMessage,
    readyState: 1,
    sendMessage: vi.fn(),
    subscribe,
  } as unknown as ReturnType<typeof useWebSocketContext>)
  return subscribe
}

const mount = (queryClient: QueryClient = createTestQueryClient()) => {
  const rendered = renderHook(() => useWebSocketEvents(), {
    wrapper: queryClientWrapper(queryClient),
  })
  return { ...rendered, queryClient }
}

describe('useWebSocketEvents', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('subscribes to the tasks stream on mount', () => {
    mockAuth(undefined)
    mockCongratulate()
    const subscribe = mockWebSocket(null)

    mount()

    expect(subscribe).toHaveBeenCalledWith('tasks')
  })

  it('does nothing when there is no lastMessage', () => {
    mockAuth(undefined)
    mockCongratulate()
    mockWebSocket(null)
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    mount(queryClient)

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('ignores a non-object lastMessage', () => {
    mockAuth(undefined)
    mockCongratulate()
    mockWebSocket('not-an-object' as unknown as WebSocketMessageTypes)
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    expect(() => mount(queryClient)).not.toThrow()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  describe('achievement-awarded', () => {
    const message = (userId: number): AchievementAwardedMessage => ({
      messageType: 'achievement-awarded',
      data: { userId, achievement: [1, 2] },
    })

    it('enqueues each achievement and invalidates user queries when it is for the current user', () => {
      mockAuth(fakeUser(7))
      const enqueue = mockCongratulate()
      mockWebSocket(message(7))
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(enqueue).toHaveBeenCalledWith({ kind: 'achievement', achievementId: 1 })
      expect(enqueue).toHaveBeenCalledWith({ kind: 'achievement', achievementId: 2 })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 7] })
    })

    it('does nothing when the achievement is for a different user', () => {
      mockAuth(fakeUser(7))
      const enqueue = mockCongratulate()
      mockWebSocket(message(99))
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(enqueue).not.toHaveBeenCalled()
      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('does nothing when there is no current user', () => {
      mockAuth(undefined)
      const enqueue = mockCongratulate()
      mockWebSocket(message(7))
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(enqueue).not.toHaveBeenCalled()
      expect(invalidateSpy).not.toHaveBeenCalled()
    })
  })

  describe('task events', () => {
    const taskEvent = (overrides: Partial<TaskEventMessage['data']> = {}): TaskEventMessage => ({
      messageType: 'task-claimed',
      data: {
        task: { id: 1, parent: 10, status: 2 },
        challenge: null,
        project: null,
        byUser: { userId: 5, osmId: 1, displayName: 'x', avatarURL: '' },
        ...overrides,
      },
    })

    it('patches the cached task status and locks it on task-claimed', () => {
      mockAuth(undefined)
      mockCongratulate()
      const msg = taskEvent()
      mockWebSocket(msg)
      const queryClient = createTestQueryClient()
      queryClient.setQueryData<TaskGetResponse>(['task', 1], {
        id: 1,
        parent: 10,
        status: 0,
      } as TaskGetResponse)

      mount(queryClient)

      expect(queryClient.getQueryData<TaskGetResponse>(['task', 1])).toEqual({
        id: 1,
        parent: 10,
        status: 2,
      })
      expect(patchChallengeTaskMarker).toHaveBeenCalledWith(queryClient, 10, 1, {
        status: 2,
        lockedBy: 5,
      })
    })

    it('locks with null when task-claimed has no byUser', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent({ byUser: null }))
      const queryClient = createTestQueryClient()

      mount(queryClient)

      expect(patchChallengeTaskMarker).toHaveBeenCalledWith(
        queryClient,
        10,
        1,
        expect.objectContaining({ lockedBy: null })
      )
    })

    it('unlocks on task-released', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket({
        ...taskEvent(),
        messageType: 'task-released',
      })
      const queryClient = createTestQueryClient()

      mount(queryClient)

      expect(patchChallengeTaskMarker).toHaveBeenCalledWith(
        queryClient,
        10,
        1,
        expect.objectContaining({ lockedBy: null })
      )
    })

    it('derives the challenge id from data.challenge when present', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent({ challenge: { id: 55, parentId: 1, name: 'c', enabled: true } }))
      const queryClient = createTestQueryClient()

      mount(queryClient)

      expect(patchChallengeTaskMarker).toHaveBeenCalledWith(queryClient, 55, 1, expect.anything())
    })

    it('does not patch the marker on task-update when status is unchanged and no lock info applies', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket({
        messageType: 'task-update',
        data: {
          task: { id: 1, parent: 10, status: undefined },
          challenge: null,
          project: null,
          byUser: null,
        },
      })
      const queryClient = createTestQueryClient()

      mount(queryClient)

      expect(patchChallengeTaskMarker).not.toHaveBeenCalled()
    })

    it('invalidates task history regardless of status change', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent())
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 1] })
    })

    it('invalidates challenge aggregates only when the status actually changed', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent({ task: { id: 1, parent: 10, status: 2 } }))
      const queryClient = createTestQueryClient()
      queryClient.setQueryData<TaskGetResponse>(['task', 1], {
        id: 1,
        parent: 10,
        status: 2,
      } as TaskGetResponse)

      mount(queryClient)

      expect(invalidateChallengeAggregates).not.toHaveBeenCalled()
    })

    it('invalidates challenge aggregates when the status changed', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent({ task: { id: 1, parent: 10, status: 2 } }))
      const queryClient = createTestQueryClient()
      queryClient.setQueryData<TaskGetResponse>(['task', 1], {
        id: 1,
        parent: 10,
        status: 0,
      } as TaskGetResponse)

      mount(queryClient)

      expect(invalidateChallengeAggregates).toHaveBeenCalledWith(queryClient, 10)
    })

    it('does not invalidate challenge aggregates when newStatus is undefined', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(taskEvent({ task: { id: 1, parent: 10, status: undefined } }))
      const queryClient = createTestQueryClient()

      mount(queryClient)

      expect(invalidateChallengeAggregates).not.toHaveBeenCalled()
    })

    it('invalidates whoami/user on task-completed by the current user', () => {
      mockAuth(fakeUser(5))
      mockCongratulate()
      mockWebSocket({
        ...taskEvent({ byUser: { userId: 5, osmId: 1, displayName: 'x', avatarURL: '' } }),
        messageType: 'task-completed',
      })
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 5] })
    })

    it('does not invalidate whoami/user on task-completed by a different user', () => {
      mockAuth(fakeUser(5))
      mockCongratulate()
      mockWebSocket({
        ...taskEvent({ byUser: { userId: 99, osmId: 1, displayName: 'x', avatarURL: '' } }),
        messageType: 'task-completed',
      })
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['user', 'whoami'] })
    })
  })

  describe('review events', () => {
    const reviewMsg = (messageType: ReviewEventMessage['messageType']): ReviewEventMessage => ({
      messageType,
      data: { taskWithReview: { task: { id: 3, parent: 20, status: 1 } } },
    })

    it.each(['review-new', 'review-claimed', 'review-update'] as const)(
      'invalidates task and challenge aggregates on %s',
      (messageType) => {
        mockAuth(undefined)
        mockCongratulate()
        mockWebSocket(reviewMsg(messageType))
        const queryClient = createTestQueryClient()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        mount(queryClient)

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 3] })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'history', 3] })
        expect(invalidateChallengeAggregates).toHaveBeenCalledWith(queryClient, 20)
      }
    )
  })

  describe('team-update', () => {
    const teamMsg: TeamUpdateMessage = {
      messageType: 'team-update',
      data: { teamId: 8, userId: null },
    }

    it('invalidates the team and the current user membership query', () => {
      mockAuth(fakeUser(4))
      mockCongratulate()
      mockWebSocket(teamMsg)
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['team', 8] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 4, 'teamMemberships'] })
    })

    it('invalidates with an undefined user id when there is no current user', () => {
      mockAuth(undefined)
      mockCongratulate()
      mockWebSocket(teamMsg)
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['user', undefined, 'teamMemberships'],
      })
    })
  })

  describe('notification-new', () => {
    it('invalidates the notifications query', () => {
      mockAuth(undefined)
      mockCongratulate()
      const msg: NotificationNewMessage = {
        messageType: 'notification-new',
        data: { userId: 1 },
      }
      mockWebSocket(msg)
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      mount(queryClient)

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user', 'notifications'] })
    })
  })

  it('ignores message types with no matching dispatcher, such as pong', () => {
    mockAuth(undefined)
    mockCongratulate()
    mockWebSocket({ messageType: 'pong', data: null })
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    expect(() => mount(queryClient)).not.toThrow()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('swallows errors thrown while dispatching and logs them', () => {
    mockAuth(fakeUser(1))
    mockCongratulate(
      vi.fn(() => {
        throw new Error('boom')
      })
    )
    mockWebSocket({
      messageType: 'achievement-awarded',
      data: { userId: 1, achievement: [1] },
    })

    expect(() => mount()).not.toThrow()
    expect(wsLogger.warn).toHaveBeenCalledWith(
      'WebSocket dispatch error',
      expect.objectContaining({ error: expect.any(Error) })
    )
  })

  it('does not reprocess the same message object across re-renders', () => {
    const msg: NotificationNewMessage = {
      messageType: 'notification-new',
      data: { userId: 1 },
    }
    mockAuth(fakeUser(1))
    mockCongratulate()
    mockWebSocket(msg)
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { rerender } = mount(queryClient)
    expect(invalidateSpy).toHaveBeenCalledTimes(1)

    mockAuth(fakeUser(2))
    rerender()

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
  })
})
