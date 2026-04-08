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

export type Notification = components['schemas']['org.maproulette.framework.model.UserNotification']

export const getNotificationThreadKey = (notification: Notification): number | string =>
  notification.taskId || notification.challengeName || 'no-task'

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
