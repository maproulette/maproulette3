import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// These statuses are defined on the server
export const NOTIFICATION_TYPE_SYSTEM = 0
export const NOTIFICATION_TYPE_MENTION = 1
export const NOTIFICATION_TYPE_REVIEW_APPROVED = 2
export const NOTIFICATION_TYPE_REVIEW_REJECTED = 3
export const NOTIFICATION_TYPE_REVIEW_AGAIN = 4
export const NOTIFICATION_TYPE_CHALLENGE_COMPLETED = 5

export const NotificationType = Object.freeze({
  system: NOTIFICATION_TYPE_SYSTEM,
  mention: NOTIFICATION_TYPE_MENTION,
  reviewApproved: NOTIFICATION_TYPE_REVIEW_APPROVED,
  reviewRejected: NOTIFICATION_TYPE_REVIEW_REJECTED,
  reviewAgain: NOTIFICATION_TYPE_REVIEW_AGAIN,
  challengeCompleted: NOTIFICATION_TYPE_CHALLENGE_COMPLETED,
})

export const keysByNotificationType = Object.freeze(_invert(NotificationType))

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByNotificationType = _fromPairs(
  _map(messages, (message, key) => [NotificationType[key], message])
)

/** Returns object containing localized labels  */
export const notificationTypeLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
