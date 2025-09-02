import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  filterByPropertyLabel: {
    id: "TaskPropertyFilter.label",
    defaultMessage: "Property",
  },

  filterByPriorityLabel: {
    id: "Admin.EditTask.form.priority.label",
    defaultMessage: "Priority",
  },

  filterByStatusLabel: {
    id: "Admin.EditTask.form.status.label",
    defaultMessage: "Status",
  },

  filterByReviewStatusLabel: {
    id: "ChallengeProgress.reviewStatus.label",
    defaultMessage: "Review Status",
  },

  filterByMetaReviewStatusLabel: {
    id: "TaskReviewStatusFilter.metaReviewStatuses.label",
    defaultMessage: "Meta-Review Statuses",
  },
});
