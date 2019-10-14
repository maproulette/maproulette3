import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskBundleWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TaskBundleWidget.label",
    defaultMessage: "Multi-Task Work",
  },

  title: {
    id: "Widgets.TaskBundleWidget.reviewTaskTitle",
    defaultMessage: "Work on Multiple Tasks Together",
  },

  clearFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  taskIdLabel: {
    id: "Widgets.TaskBundleWidget.popup.fields.taskId.label",
    defaultMessage: "Internal Id:",
  },

  nameLabel: {
    id: "Widgets.TaskBundleWidget.popup.fields.name.label",
    defaultMessage: "Feature Id:",
  },

  statusLabel: {
    id: "Widgets.TaskBundleWidget.popup.fields.status.label",
    defaultMessage: "Status:",
  },

  priorityLabel: {
    id: "Widgets.TaskBundleWidget.popup.fields.priority.label",
    defaultMessage: "Priority:",
  },

  selectedLabel: {
    id: "Widgets.TaskBundleWidget.popup.controls.selected.label",
    defaultMessage: "Selected",
  },

  bundleTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.bundleTasks.label",
    defaultMessage: "Complete Together",
  },

  unbundleTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.unbundleTasks.label",
    defaultMessage: "Unbundle",
  },

  currentTask: {
    id: "Widgets.TaskBundleWidget.currentTask",
    defaultMessage: "(current task)",
  },

  simultaneousTasks: {
    id: "Widgets.TaskBundleWidget.simultaneousTasks",
    defaultMessage: "Working on {taskCount, number} tasks together",
  },

  disallowBundling: {
    id: "Widgets.TaskBundleWidget.disallowBundling",
    defaultMessage: "You are working on a single task. " +
                    "Task bundles cannot be created on this step.",
  },

  noSuggestedFixes: {
    id: "Widgets.TaskBundleWidget.noSuggestedFixes",
    defaultMessage: "Quick-fix tasks cannot be bundled together",
  },

  noVirtualChallenges: {
    id: "Widgets.TaskBundleWidget.noVirtualChallenges",
    defaultMessage: "Tasks in \"virtual\" challenges cannot be bundled together",
  },
})
