import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  searchButton: {
    id: "TaskPropertyFilter.controls.search",
    defaultMessage: "Search",
  },

  noneOption: {
    id: "TaskPropertyFilter.options.none.label",
    defaultMessage: "None",
  },

  filterByPropertyLabel: {
    id: "TaskPropertyFilter.label",
    defaultMessage: "Filter By Property",
  },

  filterByPriorityLabel: {
    id: "TaskPriorityFilter.label",
    defaultMessage: "Filter by Priority",
  },

  filterByStatusLabel: {
    id: "TaskStatusFilter.label",
    defaultMessage: "Filter by Status",
  },

  filterByReviewStatusLabel: {
    id: "TaskReviewStatusFilter.label",
    defaultMessage: "Filter by Review Status",
  },
})
