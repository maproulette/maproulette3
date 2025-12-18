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
