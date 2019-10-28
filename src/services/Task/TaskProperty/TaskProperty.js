import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants defining task property search types. These are sent to the server.
 */
export const TASK_PROPERTY_SEARCH_TYPE_EQUALS = "equals"
export const TASK_PROPERTY_SEARCH_TYPE_NOT_EQUALS = "not_equals"
export const TASK_PRIORITY_SEARCH_TYPE_CONTAINS = "contains"

export const TaskPropertySearchType = Object.freeze({
  equals: TASK_PROPERTY_SEARCH_TYPE_EQUALS,
  notEquals: TASK_PROPERTY_SEARCH_TYPE_NOT_EQUALS,
  contains: TASK_PRIORITY_SEARCH_TYPE_CONTAINS,
})

/**
 * Returns an object mapping property search type values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByPropertySearchType = _fromPairs(
  _map(messages, (message, key) => [TaskPropertySearchType[key], message])
)
