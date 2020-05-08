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
