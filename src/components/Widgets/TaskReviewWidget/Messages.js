import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskCompletionWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TaskReviewWidget.label",
    defaultMessage: "Task Review",
  },

  reviewTaskTitle: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  metaReviewTaskTitle: {
    id: "Notification.type.metaReview",
    defaultMessage: "Meta-Review",
  },

  reviewRevisionTaskTitle: {
    id: "Review.TaskAnalysisTable.controls.reviewAgainTask.label",
    defaultMessage: "Review Revision",
  },

  simultaneousTasks: {
    id: "Widgets.review.simultaneousTasks",
    defaultMessage: "Reviewing {taskCount, number} tasks together",
  },
});
