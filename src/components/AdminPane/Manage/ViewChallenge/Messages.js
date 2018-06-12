import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ViewChallenge.
 */
export default defineMessages({
  challengeOverviewTabLabel: {
    id: "Admin.Challenge.tabs.overview.label",
    defaultMessage: "Overview",
  },

  challengeCommentsTabLabel: {
    id: "Admin.Challenge.tabs.comments.label",
    defaultMessage: "Comments",
  },

  challengeMetricsTabLabel: {
    id: "Admin.Challenge.tabs.metrics.label",
    defaultMessage: "Metrics",
  },

  asOf: {
    id: "Admin.Challenge.status.asOf.label",
    defaultMessage: "as of",
  },

  editChallengeLabel: {
    id: "Admin.Challenge.controls.edit.label",
    defaultMessage: "Edit",
  },

  rebuildChallengeLabel: {
    id: "Admin.Challenge.controls.rebuild.label",
    defaultMessage: "Rebuild",
  },

  rebuildChallengePrompt: {
    id: "Admin.Challenge.controls.rebuild.prompt",
    defaultMessage: "Rebuilding will re-run the Overpass query and refresh your challenge with the latest data. Tasks marked as fixed will be removed from your challenge (affecting your metrics), while tasks for new data will be added. In some situations tasks may be duplicated if matching up old data with new data is unsuccessful. Do you wish to proceed?",
  },

  cloneChallengeLabel: {
    id: "Admin.Challenge.controls.clone.label",
    defaultMessage: "Clone",
  },

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
  }
})
