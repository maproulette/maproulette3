import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with User Metrics
 */
export default defineMessages({
  reviewerTitle: {
    id: 'Metrics.reviewedTasksTitle.asReviewer',
    defaultMessage: 'Tasks Reviewed by {username}',
  },

  reviewerTitleYou: {
    id: 'Metrics.reviewedTasksTitle.asReviewer.you',
    defaultMessage: 'Tasks Reviewed by You',
  },

  approvedReview: {
    id: 'Metrics.reviewStats.asReviewer.approved.label',
    defaultMessage: "Reviewed tasks as passed",
  },

  rejectedReview: {
    id: 'Metrics.reviewStats.asReviewer.rejected.label',
    defaultMessage: "Reviewed tasks as failed",
  },

  assistedReview: {
    id: 'Metrics.reviewStats.asReviewer.assisted.label',
    defaultMessage: "Reviewed tasks as passed with changes",
  },

  disputedReview: {
    id: 'Metrics.reviewStats.asReviewer.disputed.label',
    defaultMessage: "Tasks currently in dispute",
  },

  awaitingReview: {
    id: 'Metrics.reviewStats.asReviewer.awaiting.label',
    defaultMessage: "Tasks that need a follow up",
  },
})
