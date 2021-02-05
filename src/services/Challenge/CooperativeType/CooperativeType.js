import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants defining types of cooperative challenges
 * server.
 */
export const COOPERATIVE_TYPE_NONE = 0
export const COOPERATIVE_TYPE_TAGS = 1
export const COOPERATIVE_TYPE_CHANGEFILE = 2

export const CooperativeType = Object.freeze({
  none: COOPERATIVE_TYPE_NONE,
  tags: COOPERATIVE_TYPE_TAGS,
  changeFile: COOPERATIVE_TYPE_CHANGEFILE,
})

/**
 * Determines if the given cooperative type represents active cooperation, i.e.
 * that it's a valid type and is not NONE
 */
export const isCooperative = function(cooperativeType) {
  return !!keysByCooperativeType[cooperativeType] &&
         cooperativeType !== COOPERATIVE_TYPE_NONE
}

export const keysByCooperativeType = Object.freeze(_invert(CooperativeType))

/**
 * Returns an object mapping cooperative types to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByCooperativeType = _fromPairs(
  _map(messages, (message, key) => [CooperativeType[key], message])
)

/** Returns object containing localized labels  */
export const cooperativeTypeLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
