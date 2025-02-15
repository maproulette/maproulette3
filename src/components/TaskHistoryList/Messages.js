import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  startedOnLabel: {
    id: "TaskHistory.fields.startedOn.label",
    defaultMessage: "Started on task",
  },

  startedReviewOnLabel: {
    id: "TaskHistory.fields.startedReviewOn.label",
    defaultMessage: "Started review on task",
  },

  viewAtticLabel: {
    id: "TaskHistory.controls.viewAttic.label",
    defaultMessage: "View Attic",
  },

  taskUpdatedLabel: {
    id: "TaskHistory.fields.taskUpdated.label",
    defaultMessage: "Task updated by challenge manager",
  },

  listByTime: {
    id: "TaskHistory.controls.listByTime.label",
    defaultMessage: "Entries",
  },

  listByUser: {
    id: "TaskHistory.controls.listByUser.label",
    defaultMessage: "Contributors",
  },

  reviewerType: {
    id: "Review.Dashboard.asReviewer.label",
    defaultMessage: "Reviewer",
  },

  metaReviewerType: {
    id: "Review.Dashboard.asMetaReviewer.label",
    defaultMessage: "Meta-Reviewer",
  },

  mapperType: {
    id: "Review.fields.requestedBy.label",
    defaultMessage: "Mapper",
  },

  metaReviewLabel: {
    id: "Notification.type.metaReview",
    defaultMessage: "Meta-Review",
  },

  errorTagsLabel: {
    id: "Admin.TaskReview.controls.errorTags",
    defaultMessage: "Error Tags",
  },
});
