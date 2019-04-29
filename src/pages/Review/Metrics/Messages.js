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
    defaultMessage: "Review tasks that passed",
  },

  rejectedReview: {
    id: "ReviewStatus.metrics.rejectedReview",
    defaultMessage: "Review tasks that failed",
  },

  assistedReview: {
    id: "ReviewStatus.metrics.assistedReview",
    defaultMessage: "Review tasks that passed with fixes",
  },

  disputedReview: {
    id: "ReviewStatus.metrics.disputedReview",
    defaultMessage: "Review tasks that have been contested",
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
})
