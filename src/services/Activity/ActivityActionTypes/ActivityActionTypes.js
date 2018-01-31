import _map from 'lodash/map'
import _invert from 'lodash/invert'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// Constants defined on the server
export const ACTION_TYPE_UPDATED = 0
export const ACTION_TYPE_CREATED = 1
export const ACTION_TYPE_DELETED = 2
export const ACTION_TYPE_TASK_VIEWED = 3
export const ACTION_TYPE_TASK_STATUS_SET = 4
export const ACTION_TYPE_TAG_ADDED = 5
export const ACTION_TYPE_TAG_REMOVED = 6
export const ACTION_TYPE_QUESTION_ANSWERED = 7

export const ActivityActionType = Object.freeze({
  updated: ACTION_TYPE_UPDATED,
  created: ACTION_TYPE_CREATED,
  deleted: ACTION_TYPE_DELETED,
  taskViewed: ACTION_TYPE_TASK_VIEWED,
  taskStatusSet: ACTION_TYPE_TASK_STATUS_SET,
  tagAdded: ACTION_TYPE_TAG_ADDED,
  tagRemoved: ACTION_TYPE_TAG_REMOVED,
  questionAnswered: ACTION_TYPE_QUESTION_ANSWERED,
})

export const keysByAction = Object.freeze(_invert(ActivityActionType))

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByAction = _fromPairs(
  _map(messages, (message, key) => [ActivityActionType[key], message])
)

/** Returns object containing localized labels  */
export const actionLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
