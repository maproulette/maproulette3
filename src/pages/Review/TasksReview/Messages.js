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

  startReviewing: {
    id: "Review.TaskAnalysisTable.startReviewing",
    defaultMessage: "Review these Tasks",
  },

  onlySavedChallenges: {
    id: "Review.TaskAnalysisTable.onlySavedChallenges",
    defaultMessage: "Limit to favorite challenges",
  },

  excludeOtherReviewers: {
    id: "Review.TaskAnalysisTable.excludeOtherReviewers",
    defaultMessage: "Exclude reviews assigned to others",
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

  allReviewedTasks: {
    id: "Review.TaskAnalysisTable.allReviewedTasks",
    defaultMessage: "All Review-related Tasks",
  },

  totalTasks: {
    id: "Review.TaskAnalysisTable.totalTasks",
    defaultMessage: "Total: {countShown}"
  },

  configureColumnsLabel: {
    id: "Review.TaskAnalysisTable.configureColumns",
    defaultMessage: "Configure columns"
  },

  actionsColumnHeader: {
    id: "Review.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  viewCommentsLabel: {
    id: "Review.TaskAnalysisTable.columnHeaders.comments",
    defaultMessage: "Comments",
  },

  mapperControlsLabel: {
    id: "Review.TaskAnalysisTable.mapperControls.label",
    defaultMessage: "Actions",
  },

  reviewerControlsLabel: {
    id: "Review.TaskAnalysisTable.reviewerControls.label",
    defaultMessage: "Actions",
  },

  reviewCompleteControlsLabel: {
    id: "Review.TaskAnalysisTable.reviewCompleteControls.label",
    defaultMessage: "Actions",
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

  reviewRequestedByLabel: {
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

  reviewedAtLabel: {
    id: "Review.fields.reviewedAt.label",
    defaultMessage: "Reviewed On",
  },

  reviewTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  reviewAgainTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.reviewAgainTask.label",
    defaultMessage: "Review Revision",
  },

  resolveTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.resolveTask.label",
    defaultMessage: "Resolve",
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

  projectLabel: {
    id: "Review.fields.project.label",
    defaultMessage: "Project",
  },

  multipleTasksTooltip: {
    id: "Review.multipleTasks.tooltip",
    defaultMessage: "Multiple bundled tasks",
  },
})
