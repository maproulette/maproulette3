import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  filterByPropertyLabel: {
    id: "TaskPropertyFilter.label",
    defaultMessage: "Task Property",
  },

  filterByPriorityLabel: {
    id: "TaskPriorityFilter.label",
    defaultMessage: "Task Priority",
  },

  filterByStatusLabel: {
    id: "TaskStatusFilter.label",
    defaultMessage: "Task Status",
  },

  filterByReviewStatusLabel: {
    id: "TaskReviewStatusFilter.label",
    defaultMessage: "Task Review Status",
  },

  filterByMetaReviewStatusLabel: {
    id: "TaskReviewStatusFilter.metaReviewStatuses.label",
    defaultMessage: "Meta-Review Statuses",
  },
})
