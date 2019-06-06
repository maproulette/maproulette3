import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// These statuses are defined on the server
export const REVIEW_STATUS_NEEDED = 0
export const REVIEW_STATUS_APPROVED = 1
export const REVIEW_STATUS_REJECTED = 2
export const REVIEW_STATUS_APPROVED_WITH_FIXES = 3
export const REVIEW_STATUS_DISPUTED = 4

export const REVIEW_STATUS_NOT_SET = -1

export const TaskReviewStatus = Object.freeze({
  needed: REVIEW_STATUS_NEEDED,
  approved: REVIEW_STATUS_APPROVED,
  rejected: REVIEW_STATUS_REJECTED,
  approvedWithFixes: REVIEW_STATUS_APPROVED_WITH_FIXES,
  disputed: REVIEW_STATUS_DISPUTED,
})

export const TaskReviewStatusWithUnset = Object.freeze({
  needed: REVIEW_STATUS_NEEDED,
  approved: REVIEW_STATUS_APPROVED,
  rejected: REVIEW_STATUS_REJECTED,
  approvedWithFixes: REVIEW_STATUS_APPROVED_WITH_FIXES,
  disputed: REVIEW_STATUS_DISPUTED,
  unset: REVIEW_STATUS_NOT_SET,
})

export const keysByReviewStatus = Object.freeze(_invert(TaskReviewStatusWithUnset))

/**
 * Returns true if the given status represents a status where review is needed.
 */
export const isNeeded = function(status) {
  return status === TaskReviewStatus.needed
}

/**
 * Returns true if the given status represents a status where review has been done
 */
export const hasBeenReviewed = function(status) {
  return status !== TaskReviewStatus.needed
}

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByReviewStatus = _fromPairs(
  _map(messages, (message, key) => [TaskReviewStatusWithUnset[key], message])
)

/** Returns object containing localized labels  */
export const reviewStatusLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/**
 * Returns true if the given status represents a status that is
 * valid for reviewing. (ie. not skipped and not created)
 */
export const isNeedsReviewStatus = function(status) {
  return status === TaskReviewStatus.needed || status === TaskReviewStatus.disputed
}
