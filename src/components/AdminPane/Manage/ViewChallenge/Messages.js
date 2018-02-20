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

  tasksBuilding: {
    id: "Admin.Challenge.tasksBuilding",
    defaultMessage: "Tasks Building...",
  },

  tasksFailed: {
    id: "Admin.Challenge.tasksFailed",
    defaultMessage: "Tasks Failed to Build",
  },

  refreshStatusLabel: {
    id: "Admin.Challenge.controls.refreshStatus.label",
    defaultMessage: "Refresh Status",
  },

  tasksHeader: {
    id: "Admin.Tasks.header",
    defaultMessage: "Tasks",
  },

  editTaskLabel: {
    id: "Admin.Task.controls.edit.label",
    defaultMessage: "Edit",
  },
})
