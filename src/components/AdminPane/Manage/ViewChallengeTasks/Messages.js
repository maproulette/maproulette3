import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ViewChallengeTasks.
 */
export default defineMessages({
  tasksBuilding: {
    id: "Admin.Challenge.tasksBuilding",
    defaultMessage: "Tasks Building...",
  },

  tasksFailed: {
    id: "Admin.Challenge.tasksFailed",
    defaultMessage: "Tasks Failed to Build",
  },

  tasksNone: {
    id: "Admin.Challenge.tasksNone",
    defaultMessage: "No Tasks",
  },

  tasksCreatedCount: {
    id: "Admin.Challenge.tasksCreatedCount",
    defaultMessage: "{count, number} tasks created so far",
  },

  totalElapsedTime: {
    id: "Admin.Challenge.totalCreationTime",
    defaultMessage: "Total elapsed time:",
  },

  refreshStatusLabel: {
    id: "Admin.Challenge.controls.refreshStatus.label",
    defaultMessage: "Refreshing status in",
  },

  tasksHeader: {
    id: "Admin.ManageTasks.header",
    defaultMessage: "Tasks",
  },

  geographicIndexingNotice: {
    id: "Admin.ManageTasks.geographicIndexingNotice",
    defaultMessage: "Please note that it can take up to {delay} hours " +
                    "to geographically index new or modified challenges. " +
                    "Your challenge (and tasks) may not appear as " +
                    "expected in location-specific browsing or " +
                    "searches until indexing is complete."
  },

  bulkSelectionTooltip: {
    id: "Admin.manageTasks.controls.bulkSelection.tooltip",
    defaultMessage: "Select tasks for bulk operation",
  },

  changeStatusToLabel: {
    id: "Admin.manageTasks.controls.changeStatusTo.label",
    defaultMessage: "Change status to ",
  },

  changePriorityLabel: {
    id: "Admin.manageTasks.controls.changePriority.label",
    defaultMessage: "Change Priority",
  },

  showReviewColumnsLabel: {
    id: "Admin.manageTasks.controls.showReviewColumns.label",
    defaultMessage: "Show Review Columns",
  },

  hideReviewColumnsLabel: {
    id: "Admin.manageTasks.controls.hideReviewColumns.label",
    defaultMessage: "Hide Review Columns",
  },

  priorityLabel: {
    id: "Admin.manageTasks.priorityLabel",
    defaultMessage: "Priority",
  },

  exportCSVLabel: {
    id: "Admin.manageTasks.controls.exportCSV.label",
    defaultMessage: "Export CSV",
  },

  filterByStatusLabel: {
    id: "Admin.manageTasks.controls.filterByStatus.label",
    defaultMessage: "Filter by Status",
  },

  filterByReviewStatusLabel: {
    id: "Admin.manageTasks.controls.filterByReviewStatus.label",
    defaultMessage: "Filter by Review Status",
  },

  filterByPriorityLabel: {
    id: "Admin.manageTasks.controls.filterByPriority.label",
    defaultMessage: "Filter by Priority",
  },

  exportGeoJSONLabel: {
    id: "Admin.manageTasks.controls.exportGeoJSON.label",
    defaultMessage: "Export GeoJSON",
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  taskCountShownStatus: {
    id: "Admin.TaskAnalysisTableHeader.taskCountStatus",
    defaultMessage: "Shown: {countShown} Tasks",
  },

  taskPercentShownStatus: {
    id: "Admin.TaskAnalysisTableHeader.taskPercentStatus",
    defaultMessage: "Shown: {percentShown}% ({countShown}) of {countTotal} Tasks",
  },
})
