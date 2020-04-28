import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _min from 'lodash/min'
import messages from './Messages'

// These constants are defined on the server
export const ROLE_SUPERUSER = -1
export const ROLE_ADMIN = 1
export const ROLE_WRITE = 2
export const ROLE_READ = 3

export const Role = Object.freeze({
  admin: ROLE_ADMIN,
  write: ROLE_WRITE,
  read: ROLE_READ,
})

/**
 * Returns an object mapping role values to raw internationalized messages
 * suitable for use with FormattedMessage or formatMessage
 */
export const messagesByRole = _fromPairs(
  _map(messages, (message, key) => [Role[key], message])
)

/** Returns object containing localized labels  */
export const roleLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/** Returns the most privileged of the given roles **/
export const mostPrivilegedRole = function(roles) {
  return _min(roles)
}

/**
 * Determines if the target role is implied by the given list of possessed
 * roles
 */
export const rolesImply = function(targetRole, roles) {
  return mostPrivilegedRole(roles) <= targetRole
}
