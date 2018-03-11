import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants defining task priority levels. These statuses are defined on the
 * server.
 */
export const TASK_PRIORITY_HIGH = 0
export const TASK_PRIORITY_MEDIUM = 1
export const TASK_PRIORITY_LOW = 2

export const TaskPriority = Object.freeze({
  high: TASK_PRIORITY_HIGH,
  medium: TASK_PRIORITY_MEDIUM,
  low: TASK_PRIORITY_LOW,
})

export const keysByPriority = Object.freeze(_invert(TaskPriority))

/**
 * Returns an object mapping priority values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByPriority = _fromPairs(
  _map(messages, (message, key) => [TaskPriority[key], message])
)

/** Returns object containing localized labels  */
export const taskPriorityLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
