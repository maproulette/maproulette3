import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _min from 'lodash/min'
import messages from './Messages'

// These constants are defined on the server
export const GROUP_TYPE_SUPERUSER = -1
export const GROUP_TYPE_ADMIN = 1
export const GROUP_TYPE_WRITE = 2
export const GROUP_TYPE_READ = 3

export const GroupType = Object.freeze({
  admin: GROUP_TYPE_ADMIN,
  write: GROUP_TYPE_WRITE,
  read: GROUP_TYPE_READ,
})

/**
 * Returns an object mapping group type values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByGroupType = _fromPairs(
  _map(messages, (message, key) => [GroupType[key], message])
)

/** Returns object containing localized labels  */
export const groupTypeLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/** Returns the most privileged of the given group types **/
export const mostPrivilegedGroupType = function(groupTypes) {
  return _min(groupTypes)
}

/**
 * Determines if the target group type is implied by the given list of
 * possessed group types.
 */
export const groupTypesImply = function(targetGroupType, groupTypes) {
  return mostPrivilegedGroupType(groupTypes) <= targetGroupType
}
