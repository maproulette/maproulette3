import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants defining the various statuses a Challenge may be
 * in. These statuses are defined on the server
 */
export const CHALLENGE_STATUS_NONE = 0 // called NA on the server
export const CHALLENGE_STATUS_BUILDING = 1
export const CHALLENGE_STATUS_FAILED = 2
export const CHALLENGE_STATUS_READY = 3 // called COMPLETE on the server
export const CHALLENGE_STATUS_PARTIALLY_LOADED = 4

export const ChallengeStatus = Object.freeze({
  none: CHALLENGE_STATUS_NONE,
  building: CHALLENGE_STATUS_BUILDING,
  failed: CHALLENGE_STATUS_FAILED,
  ready: CHALLENGE_STATUS_READY,
  partiallyLoaded: CHALLENGE_STATUS_PARTIALLY_LOADED,
})

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByStatus = _fromPairs(
  _map(messages, (message, key) => [ChallengeStatus[key], message])
)

/** Returns object containing localized labels  */
export const basemapLayerLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/**
 * Returns true if the given challenge status is considered to be usable
 * and presentable to users, false if not.
 */
export const isUsableChallengeStatus = function(status) {
  return status === CHALLENGE_STATUS_READY || status === CHALLENGE_STATUS_NONE
}
