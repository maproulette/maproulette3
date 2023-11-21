import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ViewChallengeTasks.
 */
export default defineMessages({
  tasksBuilding: {
    id: "Admin.Challenge.tasksBuilding",
    defaultMessage: "Tasks Building...",
  },

  tasksUpdating: {
    id: "Admin.Challenge.tasksUpdating",
    defaultMessage: "Tasks Updating...",
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
    defaultMessage: "tasks created so far.",
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
                    "searches until indexing is complete, nor " +
                    "when browsing map to choose location-based priority rules."
  },

  changePriorityLabel: {
    id: "Admin.manageTasks.controls.changePriority.label",
    defaultMessage: "Change Priority",
  },

  priorityLabel: {
    id: "Admin.manageTasks.priorityLabel",
    defaultMessage: "Priority",
  },

  filterListLabel: {
    id: "Admin.manageTasks.controls.filterList.label",
    defaultMessage: "Filter By:"
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  inspectTaskLabel: {
    id: "Admin.ChallengeTaskMap.controls.inspectTask.label",
    defaultMessage: "Inspect Task",
  },

  editTaskLabel: {
    id: "Admin.ChallengeTaskMap.controls.editTask.label",
    defaultMessage: "Edit Task",
  },

  nameLabel: {
    id: "Admin.Task.fields.name.label",
    defaultMessage: "Task:",
  },

  statusLabel: {
    id: "Admin.Task.fields.status.label",
    defaultMessage: "Status:",
  },

  actionCreated: {
    id: "Admin.Task.fields.actions.created",
    defaultMessage: "Created",
  },

  actionFixed: {
    id: "Admin.Task.fields.actions.fixed",
    defaultMessage: "Fixed",
  },

  actionNotAnIssue: {
    id: "Admin.Task.fields.actions.notAnIssue",
    defaultMessage: "Not an Issue",
  },

  actionSkipped: {
    id: "Admin.Task.fields.actions.skipped",
    defaultMessage: "Skipped",
  },

  actionAlreadyFixed: {
    id: "Admin.Task.fields.actions.alreadyFixed",
    defaultMessage: "Already Fixed",
  },

  actionTooHard: {
    id: "Admin.Task.fields.actions.tooHard",
    defaultMessage: "Can't Complete",
  },

  actionDisabled: {
    id: "Admin.Task.fields.actions.disabled",
    defaultMessage: "Disabled",
  }
})
