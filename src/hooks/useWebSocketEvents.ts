import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useCongratulate } from '@/contexts/CongratulateContext'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { wsLogger } from '@/lib/logger'
import type {
  AchievementAwardedMessage,
  NotificationNewMessage,
  ReviewEventMessage,
  TaskEventMessage,
  TeamUpdateMessage,
  WebSocketMessageTypes,
} from '@/types/WebSocket'

const isAchievementMessage = (m: WebSocketMessageTypes): m is AchievementAwardedMessage =>
  m.messageType === 'achievement-awarded'

const isNotificationMessage = (m: WebSocketMessageTypes): m is NotificationNewMessage =>
  m.messageType === 'notification-new'

const isTaskEvent = (m: WebSocketMessageTypes): m is TaskEventMessage =>
  m.messageType === 'task-claimed' ||
  m.messageType === 'task-released' ||
  m.messageType === 'task-completed' ||
  m.messageType === 'task-update'

const isReviewEvent = (m: WebSocketMessageTypes): m is ReviewEventMessage =>
  m.messageType === 'review-new' ||
  m.messageType === 'review-claimed' ||
  m.messageType === 'review-update'

const isTeamUpdate = (m: WebSocketMessageTypes): m is TeamUpdateMessage =>
  m.messageType === 'team-update'

/**
 * Centralized dispatcher for WebSocket events coming from the backend.
 * Mount once at the app root (AppLayout).
 */
export const useWebSocketEvents = () => {
  const { lastMessage, subscribe } = useWebSocketContext()
  const { user } = useAuthContext()
  const { enqueue } = useCongratulate()
  const queryClient = useQueryClient()
  const seenRef = useRef<WeakSet<object>>(new WeakSet())

  // Subscribe to the task stream so we can listen for task-completed on our own tasks
  useEffect(() => {
    subscribe('tasks')
  }, [subscribe])

  useEffect(() => {
    if (!lastMessage || typeof lastMessage !== 'object') return
    if (seenRef.current.has(lastMessage as object)) return
    seenRef.current.add(lastMessage as object)

    try {
      if (isAchievementMessage(lastMessage)) {
        if (user && lastMessage.data.userId === user.id) {
          lastMessage.data.achievement.forEach((id) => {
            enqueue({ kind: 'achievement', achievementId: id })
          })
          queryClient.invalidateQueries({ queryKey: ['user', 'whoami'] })
          queryClient.invalidateQueries({ queryKey: ['user', user.id] })
        }
        return
      }

      if (isTaskEvent(lastMessage)) {
        const taskId = lastMessage.data.task.id
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })

        if (
          lastMessage.messageType === 'task-completed' &&
          user &&
          lastMessage.data.byUser?.userId === user.id
        ) {
          queryClient.invalidateQueries({ queryKey: ['user', 'whoami'] })
          queryClient.invalidateQueries({ queryKey: ['user', user.id] })
        }
        return
      }

      if (isReviewEvent(lastMessage)) {
        const taskId = lastMessage.data.taskWithReview.task.id
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        return
      }

      if (isTeamUpdate(lastMessage)) {
        queryClient.invalidateQueries({ queryKey: ['team', lastMessage.data.teamId] })
        queryClient.invalidateQueries({ queryKey: ['user', user?.id, 'teamMemberships'] })
        return
      }

      if (isNotificationMessage(lastMessage)) {
        queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
        return
      }
    } catch (error) {
      wsLogger.warn('WebSocket dispatch error', { error })
    }
  }, [lastMessage, user, enqueue, queryClient])
}
