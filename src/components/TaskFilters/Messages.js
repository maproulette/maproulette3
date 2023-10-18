import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  filterByPropertyLabel: {
    id: "TaskPropertyFilter.label",
    defaultMessage: "Property",
  },

  filterByPriorityLabel: {
    id: "TaskPriorityFilter.label",
    defaultMessage: "Priority",
  },

  filterByStatusLabel: {
    id: "TaskStatusFilter.label",
    defaultMessage: "Status",
  },

  filterByReviewStatusLabel: {
    id: "TaskReviewStatusFilter.label",
    defaultMessage: "Review Status",
  },

  filterByMetaReviewStatusLabel: {
    id: "TaskReviewStatusFilter.metaReviewStatuses.label",
    defaultMessage: "Meta-Review Statuses",
  },
})
