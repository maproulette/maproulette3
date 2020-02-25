import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskProperty.
 */
export default defineMessages({
  equals: {
    id: "Task.property.searchType.equals",
    defaultMessage: "equals"
  },

  notEqual: {
    id: "Task.property.searchType.notEqual",
    defaultMessage: "doesn't equal"
  },

  contains: {
    id: "Task.property.searchType.contains",
    defaultMessage: "contains"
  },

  exists: {
    id: "Task.property.searchType.exists",
    defaultMessage: "exists"
  },

  missing: {
    id: "Task.property.searchType.missing",
    defaultMessage: "missing"
  },

  and: {
    id: "Task.property.operationType.and",
    defaultMessage: "and"
  },

  or: {
    id: "Task.property.operationType.or",
    defaultMessage: "or"
  },
})
