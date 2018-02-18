import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import messages from './Messages'

/** Load tasks randomly within challenge */
export const RANDOM_LOAD_METHOD = 'random'

/** Load tasks by proximity within challenge */
export const PROXIMITY_LOAD_METHOD = 'proximity'

export const TaskLoadMethod = Object.freeze({
  random: RANDOM_LOAD_METHOD,
  proximity: PROXIMITY_LOAD_METHOD,
})

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByLoadMethod = _fromPairs(
  _map(messages, (message, key) => [TaskLoadMethod[key], message])
)
