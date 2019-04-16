import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import messages from './Messages'

/** Load next review task */
export const NEXT_LOAD_METHOD = 'next'

/** Load review page with all review tasks */
export const ALL_LOAD_METHOD = 'all'

/** Load inbox */
export const LOAD_INBOX_METHOD = 'inbox'

export const TaskReviewLoadMethod = Object.freeze({
  next: NEXT_LOAD_METHOD,
  all: ALL_LOAD_METHOD,
  inbox: LOAD_INBOX_METHOD,
})

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByReviewLoadMethod = _fromPairs(
  _map(messages, (message, key) => [TaskReviewLoadMethod[key], message])
)
