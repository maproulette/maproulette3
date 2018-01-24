import { map as _map,
         invert as _invert,
         fromPairs as _fromPairs } from 'lodash'
import messages from './Messages'

// These statuses are defined on the server
export const TASK_STATUS_CREATED = 0
export const TASK_STATUS_FIXED = 1
export const TASK_STATUS_FALSE_POSITIVE = 2
export const TASK_STATUS_SKIPPED = 3
export const TASK_STATUS_DELETED = 4
export const TASK_STATUS_ALREADY_FIXED = 5
export const TASK_STATUS_TOO_HARD = 6

export const TaskStatus = Object.freeze({
  created: TASK_STATUS_CREATED,
  fixed: TASK_STATUS_FIXED,
  falsePositive: TASK_STATUS_FALSE_POSITIVE,
  skipped: TASK_STATUS_SKIPPED,
  deleted: TASK_STATUS_DELETED,
  alreadyFixed: TASK_STATUS_ALREADY_FIXED,
  tooHard: TASK_STATUS_TOO_HARD,
})

export const keysByStatus = Object.freeze(_invert(TaskStatus))

/**
 * Returns true if the given status represents completion of
 * the task.
 */
export const isCompleted = function(status) {
  return status === TaskStatus.fixed ||
         status === TaskStatus.falsePositive ||
         status === TaskStatus.alreadyFixed ||
         status === TaskStatus.deleted
}

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByStatus = _fromPairs(
  _map(messages, (message, key) => [TaskStatus[key], message])
)

/** Returns object containing localized labels  */
export const statusLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
