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
})
