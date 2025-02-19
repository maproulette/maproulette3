import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  noTasks: {
    id: "Review.TaskAnalysisTable.noTasks",
    defaultMessage: "No tasks found",
  },

  refresh: {
    id: "Inbox.controls.refreshNotifications.label",
    defaultMessage: "Refresh",
  },

  toggleMap: {
    id: "Review.TaskAnalysisTable.toggleMap",
    defaultMessage: "Toggle Map",
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  startReviewing: {
    id: "Review.TaskAnalysisTable.startReviewing",
    defaultMessage: "Review these Tasks",
  },

  startMetaReviewing: {
    id: "Review.TaskAnalysisTable.startMetaReviewing",
    defaultMessage: "Meta-Review these Tasks",
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
    id: "Review.Dashboard.tasksToBeReviewed",
    defaultMessage: "Tasks to be Reviewed",
  },

  tasksReviewedByMe: {
    id: "Review.Dashboard.tasksReviewedByMe",
    defaultMessage: "Tasks Reviewed by Me",
  },

  tasksMetaReviewedByMe: {
    id: "Review.TaskAnalysisTable.tasksMetaReviewedByMe",
    defaultMessage: "Tasks Meta-Reviewed by Me",
  },

  myReviewTasks: {
    id: "Review.TaskAnalysisTable.myReviewTasks",
    defaultMessage: "My Mapped Tasks after Review",
  },

  allReviewedTasks: {
    id: "Review.Dashboard.allReviewedTasks",
    defaultMessage: "All Review-related Tasks",
  },

  metaReviewTasks: {
    id: "Review.TaskAnalysisTable.metaReviewTasks",
    defaultMessage: "Meta Review Tasks",
  },

  tasksToMetaReview: {
    id: "Review.TaskAnalysisTable.tasksToMetaReview",
    defaultMessage: "Tasks to Meta Review",
  },

  totalTasks: {
    id: "Review.TaskAnalysisTable.totalTasks",
    defaultMessage: "Total: {countShown}",
  },

  configureColumnsLabel: {
    id: "Review.TaskAnalysisTable.configureColumns",
    defaultMessage: "Configure columns",
  },

  exportMapperCSVLabel: {
    id: "Review.TaskAnalysisTable.exportMapperCSVLabel",
    defaultMessage: "Export mapper CSV",
  },

  exportReviewTableCSVLabel: {
    id: "Review.TaskAnalysisTable.exportReviewTableCSVLabel",
    defaultMessage: "Export Review Table CSV",
  },

  requiredForExport: {
    id: "Review.TaskAnalysisTable.requiredForExport",
    defaultMessage: "Your can only export one",
  },

  requiredProject: {
    id: "Review.TaskAnalysisTable.requiredProject",
    defaultMessage: "project at a time.",
  },

  actionsColumnHeader: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  viewCommentsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.comments",
    defaultMessage: "Comments",
  },

  mapperControlsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  reviewerControlsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  metaReviewerControlsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  reviewCompleteControlsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  idLabel: {
    id: "Review.Task.fields.id.label",
    defaultMessage: "Internal Id",
  },

  featureIdLabel: {
    id: "Review.Task.fields.featureId.label",
    defaultMessage: "Feature Id",
  },

  statusLabel: {
    id: "Admin.EditTask.form.status.label",
    defaultMessage: "Status",
  },

  priorityLabel: {
    id: "Admin.EditTask.form.priority.label",
    defaultMessage: "Priority",
  },

  metaReviewStatusLabel: {
    id: "Review.fields.metaReviewStatus.label",
    defaultMessage: "Meta-Review Status",
  },

  reviewStatusLabel: {
    id: "ChallengeProgress.reviewStatus.label",
    defaultMessage: "Review Status",
  },

  reviewRequestedByLabel: {
    id: "Review.fields.requestedBy.label",
    defaultMessage: "Mapper",
  },

  reviewedByLabel: {
    id: "Review.Dashboard.asReviewer.label",
    defaultMessage: "Reviewer",
  },

  metaReviewedByLabel: {
    id: "Review.Dashboard.asMetaReviewer.label",
    defaultMessage: "Meta-Reviewer",
  },

  additionalReviewersLabel: {
    id: "Admin.fields.additionalReviewers.label",
    defaultMessage: "Additional Reviewers",
  },

  mappedOnLabel: {
    id: "Review.fields.mappedOn.label",
    defaultMessage: "Mapped On",
  },

  reviewedAtLabel: {
    id: "Admin.fields.reviewedAt.label",
    defaultMessage: "Reviewed On",
  },

  metaReviewedAtLabel: {
    id: "Admin.fields.metaReviewedAt.label",
    defaultMessage: "Meta-Reviewed On",
  },

  reviewTaskLabel: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  reviewAgainTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.reviewAgainTask.label",
    defaultMessage: "Review Revision",
  },

  metaReviewTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.metaReviewTask.label",
    defaultMessage: "Meta Review",
  },

  reviewFurtherTaskLabel: {
    id: "Review.TaskAnalysisTable.controls.reviewFurther.label",
    defaultMessage: "Review further",
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
    id: "Activity.item.challenge",
    defaultMessage: "Challenge",
  },

  challengeIdLabel: {
    id: "Review.fields.challengeId.label",
    defaultMessage: "Challenge Id",
  },

  projectLabel: {
    id: "Activity.item.project",
    defaultMessage: "Project",
  },

  projectIdLabel: {
    id: "Review.fields.projectId.label",
    defaultMessage: "Project Id",
  },

  tagsLabel: {
    id: "Admin.TaskAnalysisTable.columnHeaders.tags",
    defaultMessage: "Tags",
  },

  multipleTasksTooltip: {
    id: "Admin.TaskAnalysisTable.multipleTasks.tooltip",
    defaultMessage: "Multiple bundled tasks",
  },

  viewAllTasks: {
    id: "Review.tableFilter.viewAllTasks",
    defaultMessage: "View all tasks",
  },

  chooseFilter: {
    id: "Review.tablefilter.chooseFilter",
    defaultMessage: "Choose project or challenge",
  },

  reviewByProject: {
    id: "Review.tableFilter.reviewByProject",
    defaultMessage: "Review by project",
  },

  reviewByChallenge: {
    id: "Review.tableFilter.reviewByChallenge",
    defaultMessage: "Review by challenge",
  },

  allChallenges: {
    id: "Review.tableFilter.reviewByAllChallenges",
    defaultMessage: "All Challenges",
  },

  allProjects: {
    id: "Review.tableFilter.reviewByAllProjects",
    defaultMessage: "All Projects",
  },

  allNeeded: {
    id: "Review.tableFilter.metaReviewStatus.allNeeded",
    defaultMessage: "All Needed",
  },

  metaUnreviewed: {
    id: "Review.tableFilter.metaReviewStatus.metaUnreviewed",
    defaultMessage: "Unreviewed",
  },
});
