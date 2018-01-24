import { map as _map,
         fromPairs as _fromPairs } from 'lodash'
import messages from './Messages'

/**
 * Constants defining challenge and task priority levels. These statuses are
 * defined on the server.
 */
export const CHALLENGE_PRIORITY_HIGH = 0
export const CHALLENGE_PRIORITY_MEDIUM = 1
export const CHALLENGE_PRIORITY_LOW = 2

export const ChallengePriority = Object.freeze({
  high: CHALLENGE_PRIORITY_HIGH,
  medium: CHALLENGE_PRIORITY_MEDIUM,
  low: CHALLENGE_PRIORITY_LOW,
})

/**
 * Returns an object mapping priority values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByPriority = _fromPairs(
  _map(messages, (message, key) => [ChallengePriority[key], message])
)

/** Returns object containing localized labels  */
export const challengePriorityLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
