import type { components } from './openApiTypes'

export enum NotificationType {
  SYSTEM = 0,
  MENTION = 1,
  REVIEW_APPROVED = 2,
  REVIEW_REJECTED = 3,
  REVIEW_AGAIN = 4,
  CHALLENGE_COMPLETED = 5,
  TEAM = 6,
  FOLLOW = 7,
  MAPPER_CHALLENGE_COMPLETED = 8,
  REVIEW_REVISED = 9,
  META_REVIEW = 10,
  META_REVIEW_AGAIN = 11,
  REVIEW_COUNT = 12,
  REVISION_COUNT = 13,
  CHALLENGE_COMMENT = 14,
  CHALLENGE_UNLOCK_REQUESTED = 15,
}

export const NOTIFICATION_TYPE_NAMES: Record<number, string> = {
  [NotificationType.SYSTEM]: 'System Message',
  [NotificationType.MENTION]: 'Comment Mention',
  [NotificationType.REVIEW_APPROVED]: 'Task Approved',
  [NotificationType.REVIEW_REJECTED]: 'Revision Requested',
  [NotificationType.REVIEW_AGAIN]: 'Review Requested',
  [NotificationType.CHALLENGE_COMPLETED]: 'Challenge Completed',
  [NotificationType.TEAM]: 'Team',
  [NotificationType.FOLLOW]: 'Follow',
  [NotificationType.MAPPER_CHALLENGE_COMPLETED]: 'Mapper Challenge Completed',
  [NotificationType.REVIEW_REVISED]: 'Review Revised',
  [NotificationType.META_REVIEW]: 'Meta-Review',
  [NotificationType.META_REVIEW_AGAIN]: 'Meta-Review Again',
  [NotificationType.REVIEW_COUNT]: 'Review Count',
  [NotificationType.REVISION_COUNT]: 'Revision Count',
  [NotificationType.CHALLENGE_COMMENT]: 'Challenge Comment',
  [NotificationType.CHALLENGE_UNLOCK_REQUESTED]: 'Challenge Unlock Requested',
}

export type NotificationCategory =
  | 'all'
  | 'task_comment'
  | 'mention'
  | 'review'
  | 'challenge'
  | 'team'
  | 'system'

export type NotificationStatus = 'all' | 'unread' | 'read'

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'all',
  'task_comment',
  'mention',
  'review',
  'challenge',
  'team',
  'system',
]

export const NOTIFICATION_STATUSES: NotificationStatus[] = ['all', 'unread', 'read']

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  all: 'All',
  task_comment: 'Comments',
  mention: 'Mentions',
  review: 'Reviews',
  challenge: 'Challenges',
  team: 'Teams',
  system: 'System',
}

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  all: 'All',
  unread: 'Unread',
  read: 'Read',
}

// Reason: maps raw notification type numbers to a smaller set of user-facing categories.
// Notifications not covered here fall into 'system'.
export const NOTIFICATION_TYPE_CATEGORY: Record<number, NotificationCategory> = {
  [NotificationType.SYSTEM]: 'system',
  [NotificationType.MENTION]: 'mention',
  [NotificationType.REVIEW_APPROVED]: 'review',
  [NotificationType.REVIEW_REJECTED]: 'review',
  [NotificationType.REVIEW_AGAIN]: 'review',
  [NotificationType.REVIEW_REVISED]: 'review',
  [NotificationType.META_REVIEW]: 'review',
  [NotificationType.META_REVIEW_AGAIN]: 'review',
  [NotificationType.REVIEW_COUNT]: 'review',
  [NotificationType.REVISION_COUNT]: 'review',
  [NotificationType.CHALLENGE_COMPLETED]: 'challenge',
  [NotificationType.MAPPER_CHALLENGE_COMPLETED]: 'challenge',
  [NotificationType.CHALLENGE_COMMENT]: 'task_comment',
  [NotificationType.CHALLENGE_UNLOCK_REQUESTED]: 'challenge',
  [NotificationType.TEAM]: 'team',
  [NotificationType.FOLLOW]: 'team',
}

export const getNotificationCategory = (
  notificationType: number | undefined
): NotificationCategory => {
  if (notificationType === undefined) return 'system'
  return NOTIFICATION_TYPE_CATEGORY[notificationType] ?? 'system'
}

export type Notification = components['schemas']['org.maproulette.framework.model.UserNotification']

export const getNotificationThreadKey = (notification: Notification): number | string => {
  // Task-scoped threads group every notification tied to the same task
  // (mentions, reviews, and task comments land in the same bucket).
  if (notification.taskId) return `task:${notification.taskId}`
  // Challenge-level comment thread — when a comment lives on a challenge
  // rather than a specific task.
  if (
    notification.notificationType === NotificationType.CHALLENGE_COMMENT &&
    notification.challengeId
  ) {
    return `challenge:${notification.challengeId}`
  }
  // Team-scoped threads — TEAM notifications carry the team id in `targetId`.
  if (notification.notificationType === NotificationType.TEAM && notification.targetId) {
    return `team:${notification.targetId}`
  }
  // Fallback: group by challenge name when we don't have a stable id,
  // otherwise keep the notification as its own (single) thread.
  if (notification.challengeName) return `challenge-name:${notification.challengeName}`
  return `single:${notification.id}`
}

export const getNotificationPreview = (notification: Notification): string => {
  const type = notification.notificationType
  const fromUsername = notification.fromUsername
  const challengeName = notification.challengeName
  const taskId = notification.taskId
  const description = notification.description

  if (description) {
    return description
  }

  switch (type) {
    case NotificationType.SYSTEM:
      return 'System notification'
    case NotificationType.MENTION:
      return fromUsername
        ? `${fromUsername} mentioned you${taskId ? ` in task #${taskId}` : challengeName ? ` in ${challengeName}` : ''}`
        : 'You were mentioned'
    case NotificationType.REVIEW_APPROVED:
      return fromUsername
        ? `${fromUsername} approved${taskId ? ` task #${taskId}` : ''}`
        : `Task #${taskId || '?'} was approved`
    case NotificationType.REVIEW_REJECTED:
      return fromUsername
        ? `${fromUsername} requested revision${taskId ? ` for task #${taskId}` : ''}`
        : `Revision requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.REVIEW_AGAIN:
      return fromUsername
        ? `${fromUsername} requested review${taskId ? ` for task #${taskId}` : ''}`
        : `Review requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.CHALLENGE_COMPLETED:
      return challengeName ? `Challenge "${challengeName}" completed` : 'Challenge completed'
    case NotificationType.TEAM:
      return fromUsername ? `Team update from ${fromUsername}` : 'Team notification'
    case NotificationType.FOLLOW:
      return fromUsername ? `${fromUsername} started following you` : 'New follower'
    case NotificationType.MAPPER_CHALLENGE_COMPLETED:
      return challengeName
        ? `Mapper challenge "${challengeName}" completed`
        : 'Mapper challenge completed'
    case NotificationType.REVIEW_REVISED:
      return fromUsername
        ? `${fromUsername} revised${taskId ? ` task #${taskId}` : ''}`
        : `Task #${taskId || '?'} was revised`
    case NotificationType.META_REVIEW:
      return fromUsername
        ? `${fromUsername} requested meta-review${taskId ? ` for task #${taskId}` : ''}`
        : `Meta-review requested${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.META_REVIEW_AGAIN:
      return fromUsername
        ? `${fromUsername} requested meta-review again${taskId ? ` for task #${taskId}` : ''}`
        : `Meta-review requested again${taskId ? ` for task #${taskId}` : ''}`
    case NotificationType.REVIEW_COUNT:
      return taskId ? `Review count update for task #${taskId}` : 'Review count updated'
    case NotificationType.REVISION_COUNT:
      return taskId ? `Revision count update for task #${taskId}` : 'Revision count updated'
    case NotificationType.CHALLENGE_COMMENT:
      return fromUsername
        ? `${fromUsername} commented${challengeName ? ` on "${challengeName}"` : taskId ? ` on task #${taskId}` : ''}`
        : challengeName
          ? `New comment on "${challengeName}"`
          : 'New comment'
    case NotificationType.CHALLENGE_UNLOCK_REQUESTED:
      return challengeName
        ? `Unlock requested for "${challengeName}"`
        : 'Challenge unlock requested'
    default:
      return NOTIFICATION_TYPE_NAMES[type] || 'Notification'
  }
}
