import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskReview.
 */
export default defineMessages({
  needed: {
    id: "Task.reviewStatus.needed",
    defaultMessage: "Review Requested",
  },

  approved: {
    id: "Notification.type.review.approved",
    defaultMessage: "Approved",
  },

  rejected: {
    id: "Task.reviewStatus.meta-rejected",
    defaultMessage: "Needs Revision",
  },

  approvedWithFixes: {
    id: "Task.reviewStatus.approvedWithFixes",
    defaultMessage: "Approved with Fixes",
  },

  approvedWithRevisions: {
    id: "Task.reviewStatus.approvedWithRevisions",
    defaultMessage: "Approved with Revisions",
  },

  approvedWithFixesAfterRevisions: {
    id: "Task.reviewStatus.approvedWithFixesAfterRevisions",
    defaultMessage: "Approved with Fixes after Revisions",
  },

  disputed: {
    id: "Task.reviewStatus.disputed",
    defaultMessage: "Contested",
  },

  unnecessary: {
    id: "Task.reviewStatus.meta-unnecessary",
    defaultMessage: "Unnecessary",
  },

  unset: {
    id: "Task.reviewStatus.unset",
    defaultMessage: "Review not yet requested",
  },

  metaNeeded: {
    id: "Task.reviewStatus.meta-needed",
    defaultMessage: "Re-Review Requested",
  },

  metaApproved: {
    id: "Notification.type.review.approved",
    defaultMessage: "Approved",
  },

  metaRejected: {
    id: "Task.reviewStatus.meta-rejected",
    defaultMessage: "Needs Revision",
  },

  metaApprovedWithFixes: {
    id: "Task.reviewStatus.approvedWithFixes",
    defaultMessage: "Approved with Fixes",
  },

  metaUnnecessary: {
    id: "Task.reviewStatus.meta-unnecessary",
    defaultMessage: "Unnecessary",
  },

  metaUnset: {
    id: "Review.tableFilter.metaReviewStatus.metaUnreviewed",
    defaultMessage: "Unreviewed",
  },

  next: {
    id: "Task.review.loadByMethod.next",
    defaultMessage: "Next Filtered Task",
  },

  nearby: {
    id: "Task.review.loadByMethod.nearby",
    defaultMessage: "Nearby Task",
  },

  all: {
    id: "Task.review.loadByMethod.all",
    defaultMessage: "Back to Review All",
  },

  inbox: {
    id: "Task.review.loadByMethod.inbox",
    defaultMessage: "Back to Inbox",
  },
});
