import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskCompletionWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TaskReviewWidget.label",
    defaultMessage: "Task Review",
  },

  reviewTaskTitle: {
    id: "Widgets.TaskReviewWidget.reviewTaskTitle",
    defaultMessage: "Review",
  },

  metaReviewTaskTitle: {
    id: "Widgets.TaskReviewWidget.metaReviewTaskTitle",
    defaultMessage: "Meta-Review",
  },

  reviewRevisionTaskTitle: {
    id: "Widgets.TaskReviewWidget.reviewRevisionTaskTitle",
    defaultMessage: "Review Revision",
  },

  simultaneousTasks: {
    id: "Widgets.review.simultaneousTasks",
    defaultMessage: "Reviewing {taskCount, number} tasks together",
  },
})
