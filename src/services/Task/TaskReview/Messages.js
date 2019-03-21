import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskReview.
 */
export default defineMessages({
  needed: {
    id: "Task.reviewStatus.needed",
    defaultMessage: "Review Requested"
  },
  approved: {
    id: "Task.reviewStatus.approved",
    defaultMessage: "Approved"
  },
  rejected: {
    id: "Task.reviewStatus.rejected",
    defaultMessage: "Needs Revision"
  },
  approvedWithFixes: {
    id: "Task.reviewStatus.approvedWithFixes",
    defaultMessage: "Approved with Fixes"
  },

  next: {
    id: 'Task.review.loadByMethod.next',
    defaultMessage: "Next Task",
  },

  all: {
    id: 'Task.review.loadByMethod.all',
    defaultMessage: "Back to Review All",
  },
})
