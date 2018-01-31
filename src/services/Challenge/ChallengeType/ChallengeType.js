import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// These constants are defined on the server
export const CHALLENGE_TYPE_CHALLENGE = 1
export const CHALLENGE_TYPE_SURVEY = 4

export const ChallengeType = Object.freeze({
  challenge: CHALLENGE_TYPE_CHALLENGE,
  survey: CHALLENGE_TYPE_SURVEY,
})

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByType = _fromPairs(
  _map(messages, (message, key) => [ChallengeType[key], message])
)

/** Returns object containing localized labels  */
export const typeLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
