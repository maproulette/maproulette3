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
    defaultMessage: 'Reviews Performed by You',
  },

  reviewerTasksTotal: {
    id: 'Metrics.reviewedTasksTitle.asReviewer.totalTasks',
    defaultMessage: 'Total tasks you reviewed',
  },

  approvedReview: {
    id: 'Metrics.reviewStats.asReviewer.approved.label',
    defaultMessage: "Reviews marked as passed",
  },

  rejectedReview: {
    id: 'Metrics.reviewStats.asReviewer.rejected.label',
    defaultMessage: "Reviews marked as failed",
  },

  assistedReview: {
    id: 'Metrics.reviewStats.asReviewer.assisted.label',
    defaultMessage: "Reviews marked as passed with changes",
  },

  disputedReview: {
    id: 'Metrics.reviewStats.asReviewer.disputed.label',
    defaultMessage: "Reviews that were disputed",
  },

  additionalReviews: {
    id: 'Metrics.reviewStats.asReviewer.additionalReviews.label',
    defaultMessage: "Provided an additional review",
  }
})
