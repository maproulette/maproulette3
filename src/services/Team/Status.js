import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// These constants are defined on the server
export const STATUS_MEMBER = 0
export const STATUS_INVITED = 1

export const TeamStatus = Object.freeze({
  member: STATUS_MEMBER,
  invited: STATUS_INVITED,
})

/**
 * Returns an object mapping team status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage
 */
export const messagesByTeamStatus = _fromPairs(
  _map(messages, (message, key) => [TeamStatus[key], message])
)

/** Returns object containing localized labels  */
export const teamStatusLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
