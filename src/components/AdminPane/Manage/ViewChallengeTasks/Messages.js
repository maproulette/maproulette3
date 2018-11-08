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
    defaultMessage: "{count, number} tasks created",
  },

  asOf: {
    id: "Admin.Challenge.status.asOf.label",
    defaultMessage: "as of",
  },

  refreshStatusLabel: {
    id: "Admin.Challenge.controls.refreshStatus.label",
    defaultMessage: "Refresh Status",
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

  markCreatedLabel: {
    id: "Admin.manageTasks.controls.markCreated.label",
    defaultMessage: "Reset status to Created",
  },

  changePriorityLabel: {
    id: "Admin.manageTasks.controls.changePriority.label",
    defaultMessage: "Change Priority",
  },

  priorityLabel: {
    id: "Admin.manageTasks.priorityLabel",
    defaultMessage: "Priority",
  },

  exportCSVLabel: {
    id: "Admin.manageTasks.controls.exportCSV.label",
    defaultMessage: "Export CSV",
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },
})
