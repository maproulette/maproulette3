import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  noTasks: {
    id: "Review.TaskAnalysisTable.noTasks",
    defaultMessage: "No tasks found",
  },

  refresh: {
    id: "Review.TaskAnalysisTable.refresh",
    defaultMessage: "Refresh",
  },

  tasksNoneReviewedByMe: {
    id: "Review.TaskAnalysisTable.noTasksReviewedByMe",
    defaultMessage: "You have not reviewed any tasks.",
  },

  tasksNoneReviewed: {
    id: "Review.TaskAnalysisTable.noTasksReviewed",
    defaultMessage: "None of your mapped tasks have been reviewed.",
  },

  tasksToBeReviewed: {
    id: "Review.TaskAnalysisTable.tasksToBeReviewed",
    defaultMessage: "Tasks to be Reviewed",
  },

  tasksReviewedByMe: {
    id: "Review.TaskAnalysisTable.tasksReviewedByMe",
    defaultMessage: "Tasks Reviewed by Me",
  },

  myReviewTasks: {
    id: "Review.TaskAnalysisTable.myReviewTasks",
    defaultMessage: "My Mapped Tasks after Review",
  },

  totalTasks: {
    id: "Review.TaskAnalysisTable.totalTasks",
    defaultMessage: "Total: {countShown}"
  },

  actionsColumnHeader: {
    id: "Review.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  commentsColumnHeader: {
    id: "Review.TaskAnalysisTable.columnHeaders.comments",
    defaultMessage: "Comments",
  },

  idLabel: {
    id: "Review.Task.fields.id.label",
    defaultMessage: "Internal Id",
  },

  statusLabel: {
    id: "Review.fields.status.label",
    defaultMessage: "Status",
  },

  reviewStatusLabel: {
    id: "Review.fields.reviewStatus.label",
    defaultMessage: "Review Status",
  },

  mappedByLabel: {
    id: "Review.fields.requestedBy.label",
    defaultMessage: "Mapper",
  },

  reviewedByLabel: {
    id: "Review.fields.reviewedBy.label",
    defaultMessage: "Reviewer",
  },

  mappedOnLabel: {
    id: "Review.fields.mappedOn.label",
    defaultMessage: "Mapped On",
  },

  reviewTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  viewTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.viewTask.label",
    defaultMessage: "View",
  },

  fixTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.fixTask.label",
    defaultMessage: "Fix",
  },

  challengeLabel: {
    id: "Review.fields.challenge.label",
    defaultMessage: "Challenge",
  },
})
