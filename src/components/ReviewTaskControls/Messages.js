import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with InspectTaskControls
 */
export default defineMessages({
  updateReviewStatusLabel: {
    id: "Admin.TaskReview.controls.updateReviewStatusTask.label",
    defaultMessage: "Update Review Status",
  },

  currentTaskStatus: {
    id: "Admin.TaskReview.controls.currentTaskStatus.label",
    defaultMessage: "Task Status:",
  },

  currentReviewStatus: {
    id: "Admin.TaskReview.controls.currentReviewStatus.label",
    defaultMessage: "Review Status:",
  },

  taskTags: {
    id: "Admin.TaskReview.controls.taskTags.label",
    defaultMessage: "Tags:",
  },

  reviewNotRequested: {
    id: "Admin.TaskReview.controls.reviewNotRequested",
    defaultMessage: "A review has not been requested for this task.",
  },

  reviewAlreadyClaimed: {
    id: "Admin.TaskReview.controls.reviewAlreadyClaimed",
    defaultMessage: "This task is currently being reviewed by someone else.",
  },

  userNotReviewer: {
    id: "Admin.TaskReview.controls.userNotReviewer",
    defaultMessage: "You are not currently setup as a reviewer. To become " +
                    "a reviewer you can do so by visiting your user settings.",
  },

  reviewerIsMapper: {
    id: "Admin.TaskReview.reviewerIsMapper",
    defaultMessage: "You cannot review tasks you mapped.",
  },

  taskNotCompleted: {
    id: "Admin.TaskReview.controls.taskNotCompleted",
    defaultMessage: "This task is not ready for review as it has not been completed yet.",
  },

  approved: {
    id: "Admin.TaskReview.controls.approved",
    defaultMessage: "Approve",
  },

  rejected: {
    id: "Admin.TaskReview.controls.rejected",
    defaultMessage: "Reject",
  },

  approvedWithFixes: {
    id: "Admin.TaskReview.controls.approvedWithFixes",
    defaultMessage: "Approve (with fixes)",
  },

  startReview: {
    id: "Admin.TaskReview.controls.startReview",
    defaultMessage: "Start Review",
  },

  skipReview: {
    id: "Admin.TaskReview.controls.skipReview",
    defaultMessage: "Skip Review",
  },

  resubmit: {
    id: "Admin.TaskReview.controls.resubmit",
    defaultMessage: "Submit for Review Again",
  },

})
