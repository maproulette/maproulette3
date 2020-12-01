import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  title: {
    id: "ReviewStatus.metrics.title",
    defaultMessage: "Review Status",
  },

  awaitingReview: {
    id: "ReviewStatus.metrics.awaitingReview",
    defaultMessage: "Tasks awaiting review",
  },

  awaitingMetaReview: {
    id: "ReviewStatus.metrics.awaitingMetaReview",
    defaultMessage: "Tasks awaiting meta-review",
  },

  awaitingMetaReReview: {
    id: "ReviewStatus.metrics.awaitingMetaReReview",
    defaultMessage: "Tasks needing meta re-review",
  },

  approvedReview: {
    id: "ReviewStatus.metrics.approvedReview",
    defaultMessage: "Reviewed tasks that passed",
  },

  rejectedReview: {
    id: "ReviewStatus.metrics.rejectedReview",
    defaultMessage: "Reviewed tasks that failed",
  },

  assistedReview: {
    id: "ReviewStatus.metrics.assistedReview",
    defaultMessage: "Reviewed tasks that passed with fixes",
  },

  disputedReview: {
    id: "ReviewStatus.metrics.disputedReview",
    defaultMessage: "Reviewed tasks that have been contested",
  },

  metaRequestedReview: {
    id: "ReviewStatus.metrics.metaRequestedReview",
    defaultMessage: "Reviewed tasks that need a meta re-review",
  },

  metaApprovedReview: {
    id: "ReviewStatus.metrics.metaApprovedReview",
    defaultMessage: "Reviewed tasks that passed meta review",
  },

  metaRejectedReview: {
    id: "ReviewStatus.metrics.metaRejectedReview",
    defaultMessage: "Reviewed tasks that have failed meta review",
  },

  metaAssistedReview: {
    id: "ReviewStatus.metrics.metaAssistedReview",
    defaultMessage: "Reviewed tasks that passed meta review with fixes",
  },

  fixed: {
    id: "ReviewStatus.metrics.fixed",
    defaultMessage: "FIXED",
  },

  falsePositive: {
    id: "ReviewStatus.metrics.falsePositive",
    defaultMessage: "NOT AN ISSUE",
  },

  alreadyFixed: {
    id: "ReviewStatus.metrics.alreadyFixed",
    defaultMessage: "ALREADY FIXED",
  },

  tooHard: {
    id: "ReviewStatus.metrics.tooHard",
    defaultMessage: "TOO HARD",
  },

  byPriorityToggle: {
    id: "ReviewStatus.metrics.priority.toggle",
    defaultMessage: "View by Task Priority"
  },

  priorityLabel: {
    id: "ReviewStatus.metrics.priority.label",
    defaultMessage: "{priority} Priority Tasks"
  },

  byTaskStatusToggle: {
    id: "ReviewStatus.metrics.byTaskStatus.toggle",
    defaultMessage: "View by Task Status"
  },

  taskStatusLabel: {
    id: "ReviewStatus.metrics.taskStatus.label",
    defaultMessage: "{status} Tasks"
  },

  avgTimeSpent: {
    id: "ReviewStatus.metrics.averageTime.label",
    defaultMessage: "Avg time per review:"
  }

})
