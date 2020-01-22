import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants defining task property search types. These are sent to the server.
 */
export const TASK_PROPERTY_SEARCH_TYPE_EQUALS = "equals"
export const TASK_PROPERTY_SEARCH_TYPE_NOT_EQUAL = "not_equal"
export const TASK_PRIORITY_SEARCH_TYPE_CONTAINS = "contains"
export const TASK_PRIORITY_SEARCH_TYPE_GREATER_THAN = "greater_than"
export const TASK_PRIORITY_SEARCH_TYPE_LESS_THAN = "less_than"

export const TASK_PROPERTY_OPERATION_TYPE_AND = "and"
export const TASK_PROPERTY_OPERATION_TYPE_OR = "or"

export const TaskPropertySearchTypeString = Object.freeze({
  equals: TASK_PROPERTY_SEARCH_TYPE_EQUALS,
  notEqual: TASK_PROPERTY_SEARCH_TYPE_NOT_EQUAL,
  contains: TASK_PRIORITY_SEARCH_TYPE_CONTAINS,
})

export const TaskPropertySearchTypeNumber = Object.freeze({
  equals: TASK_PROPERTY_SEARCH_TYPE_EQUALS,
  notEquals: TASK_PROPERTY_SEARCH_TYPE_NOT_EQUAL,
  greaterThan: TASK_PRIORITY_SEARCH_TYPE_GREATER_THAN,
  lessThan: TASK_PRIORITY_SEARCH_TYPE_LESS_THAN,
})

export const TaskPropertyOperationType = Object.freeze({
  and: TASK_PROPERTY_OPERATION_TYPE_AND,
  or: TASK_PROPERTY_OPERATION_TYPE_OR,
})


/**
 * Returns an object mapping property search type values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByPropertySearchType = _fromPairs(
  _map(messages, (message, key) => [TaskPropertySearchTypeString[key], message])
)

/**
 * Returns an object mapping property operation type values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByPropertyOperationType = _fromPairs(
  _map(messages, (message, key) => [TaskPropertyOperationType[key], message])
)
