import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { invalidateChallengeAggregates, patchChallengeTaskMarker } from '@/api/challenge/single'
import { useAuthContext } from '@/contexts/AuthContext'
import { useCongratulate } from '@/contexts/CongratulateContext'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { wsLogger } from '@/lib/logger'
import type { TaskGetResponse } from '@/types/Task'
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
        const messageType = lastMessage.messageType
        const taskId = lastMessage.data.task.id
        const challengeId = lastMessage.data.challenge?.id ?? lastMessage.data.task.parent
        const newStatus = lastMessage.data.task.status ?? undefined

        const cachedTask = queryClient.getQueryData<TaskGetResponse>(['task', taskId])
        const oldStatus = cachedTask?.status ?? undefined

        // Patch the cached task with the new status instead of refetching.
        if (newStatus !== undefined && cachedTask) {
          queryClient.setQueryData<TaskGetResponse>(['task', taskId], {
            ...cachedTask,
            status: newStatus,
          })
        }

        // Surgically patch the marker entry in the challenge's marker list.
        const markerPatch: Parameters<typeof patchChallengeTaskMarker>[3] = {}
        if (newStatus !== undefined) markerPatch.status = newStatus
        if (messageType === 'task-claimed') {
          markerPatch.lockedBy = lastMessage.data.byUser?.userId ?? null
        } else if (messageType === 'task-released') {
          markerPatch.lockedBy = null
        }
        if (Object.keys(markerPatch).length > 0) {
          patchChallengeTaskMarker(queryClient, challengeId, taskId, markerPatch)
        }

        // History always changes (every event creates a history entry); we can't
        // hydrate it from the message payload alone.
        queryClient.invalidateQueries({ queryKey: ['task', 'history', taskId] })

        // Aggregates only go stale when status actually changed. Lock/unlock
        // and unchanged-status updates leave counts untouched.
        const statusChanged = newStatus !== undefined && newStatus !== oldStatus
        if (statusChanged) {
          invalidateChallengeAggregates(queryClient, challengeId)
        }

        if (
          messageType === 'task-completed' &&
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
        const challengeId = lastMessage.data.taskWithReview.task.parent
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        queryClient.invalidateQueries({ queryKey: ['task', 'history', taskId] })
        invalidateChallengeAggregates(queryClient, challengeId)
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
