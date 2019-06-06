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

  disputed: {
    id: "Task.reviewStatus.disputed",
    defaultMessage: "Contested"
  },

  unset: {
    id: "Task.reviewStatus.unset",
    defaultMessage: "Review not yet requested"
  },

  next: {
    id: 'Task.review.loadByMethod.next',
    defaultMessage: "Next Task",
  },

  all: {
    id: 'Task.review.loadByMethod.all',
    defaultMessage: "Back to Review All",
  },

  inbox: {
    id: 'Task.review.loadByMethod.inbox',
    defaultMessage: "Back to Inbox",
  },
})
