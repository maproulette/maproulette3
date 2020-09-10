import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import _startCase from 'lodash/startCase'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'
import messages from './Messages'

const colors = resolveConfig(tailwindConfig).theme.colors

// These statuses are defined on the server
export const TASK_STATUS_CREATED = 0
export const TASK_STATUS_FIXED = 1
export const TASK_STATUS_FALSE_POSITIVE = 2
export const TASK_STATUS_SKIPPED = 3
export const TASK_STATUS_DELETED = 4
export const TASK_STATUS_ALREADY_FIXED = 5
export const TASK_STATUS_TOO_HARD = 6
export const TASK_STATUS_DISABLED = 9

export const TaskStatus = Object.freeze({
  created: TASK_STATUS_CREATED,
  fixed: TASK_STATUS_FIXED,
  falsePositive: TASK_STATUS_FALSE_POSITIVE,
  skipped: TASK_STATUS_SKIPPED,
  deleted: TASK_STATUS_DELETED,
  alreadyFixed: TASK_STATUS_ALREADY_FIXED,
  tooHard: TASK_STATUS_TOO_HARD,
  disabled: TASK_STATUS_DISABLED,
})

export const keysByStatus = Object.freeze(_invert(TaskStatus))

export const TaskStatusColors = Object.freeze({
  [TaskStatus.fixed]: colors['blue-viking'],
  [TaskStatus.alreadyFixed]: colors['yellow-sand'],
  [TaskStatus.falsePositive]: colors['mango'],
  [TaskStatus.skipped]: colors['pink'],
  [TaskStatus.tooHard]: colors['red-light'],
  [TaskStatus.created]: colors['purple'],
  [TaskStatus.disabled]: colors['wild-strawberry'],
  [TaskStatus.deleted]: colors['grey'],
})

/**
 * Returns a Set of status progressions that are allowed
 * for the given status. An empty Set is returned if no
 * progressions are allowed.
 *
 * Set includeSelf to true if the given (presumed current) status should be
 * also included in the results.
 *
 * @returns a Set of allowed status progressions
 */
export const allowedStatusProgressions = function(status, includeSelf = false, forRevision = false) {
  let progressions = null

  if (forRevision) {
    progressions = new Set([TaskStatus.fixed, TaskStatus.falsePositive,
                            TaskStatus.alreadyFixed, TaskStatus.tooHard])
    if (!includeSelf) {
      progressions.delete(status)
    }
    return progressions
  }

  switch(status) {
    case TaskStatus.created:
      progressions = new Set([TaskStatus.fixed, TaskStatus.falsePositive,
                              TaskStatus.skipped, TaskStatus.deleted,
                              TaskStatus.alreadyFixed, TaskStatus.tooHard,
                              TaskStatus.disabled])
      break
    case TaskStatus.fixed:
      progressions = new Set()
      break
    case TaskStatus.falsePositive:
      progressions = new Set([TaskStatus.fixed])
      break
    case TaskStatus.skipped:
    case TaskStatus.tooHard:
      progressions = new Set([TaskStatus.fixed, TaskStatus.falsePositive,
                              TaskStatus.skipped, TaskStatus.alreadyFixed,
                              TaskStatus.tooHard])
      break
    case TaskStatus.deleted:
      progressions = new Set([TaskStatus.created, TaskStatus.disabled])
      break
    case TaskStatus.disabled:
      progressions = new Set([TaskStatus.created, TaskStatus.deleted])
      break
    case TaskStatus.alreadyFixed:
      progressions = new Set()
      break
    default:
      throw new Error("unrecognized-task-status",
                      `Unrecognized task status ${status}`)
  }

  if (includeSelf) {
    progressions.add(status)
  }

  return progressions
}

/**
 * Returns true if the given status represents a final progression.
 * Technically this returns true for one status that can transition to a
 * different status as a correction (falsePositive -> fixed), but for most
 * purposes falsePositive should be treated as final.
 */
export const isFinalStatus = function(status) {
  return status === TaskStatus.fixed ||
         status === TaskStatus.alreadyFixed ||
         status === TaskStatus.falsePositive
}

/**
 * Returns true if the given status represents a completion status (i.e., it
 * isn't created or deleted)
 */
export const isCompletionStatus = function(status) {
  return status !== TaskStatus.created &&
         status !== TaskStatus.deleted &&
         status !== TaskStatus.disabled
}

/**
 * Returns true if the given status represents a status that is
 * valid for reviewing. (ie. not skipped and not created)
 */
export const isReviewableStatus = function(status) {
  return status !== TaskStatus.created &&
         status !== TaskStatus.skipped &&
         status !== TaskStatus.deleted &&
         status !== TaskStatus.disabled
}

/**
 * Returns a "machine name" for the status, which is start-cased and snake-cased
 * (e.g., "Already_Fixed" or "Created").
 */
export const statusMachineName = function(status) {
  return _startCase(keysByStatus[status]).replace(/\s+/, '_')
}

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByStatus = _fromPairs(
  _map(messages, (message, key) => [TaskStatus[key], message])
)

/** Returns object containing localized labels  */
export const statusLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
