import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with NotificationType
 */
export default defineMessages({
  system: {
    id: "Notification.type.system",
    defaultMessage: "System"
  },
  mention: {
    id: "Notification.type.mention",
    defaultMessage: "Mention"
  },
  reviewApproved: {
    id: "Notification.type.review.approved",
    defaultMessage: "Approved"
  },
  reviewRejected: {
    id: "Notification.type.review.rejected",
    defaultMessage: "Revise"
  },
  reviewAgain: {
    id: "Notification.type.review.again",
    defaultMessage: "Review"
  },
  challengeCompleted: {
    id: "Notification.type.challengeCompleted",
    defaultMessage: "Completed"
  },
  challengeCompletedLong: {
    id: "Notification.type.challengeCompletedLong",
    defaultMessage: "Challenge Completed"
  },
})
