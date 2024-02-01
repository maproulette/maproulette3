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

  restoreDefaultFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.restoreDefaultFilters.label",
    defaultMessage: "Restore Default Filters",
  },

  saveCurrentFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.saveCurrentFilters.label",
    defaultMessage: "Save Current Filters"
  },

  clearFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.clearFilters.label",
    defaultMessage: "Clear Filters"
  },

  filterListLabel: {
    id: "Widgets.TaskBundleWidget.controls.filterList.label",
    defaultMessage: "Filter By:"
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
    id: "Widgets.TaskBundleWidget.controls.startBundling.label",
    defaultMessage: "Start Bundling Tasks",
  },

  unbundleTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.stopBundling.label",
    defaultMessage: "Stop Bundling Tasks",
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

  noCooperativeWork: {
    id: "Widgets.TaskBundleWidget.noCooperativeWork",
    defaultMessage: "Cooperative tasks cannot be bundled together",
  },

  noVirtualChallenges: {
    id: "Widgets.TaskBundleWidget.noVirtualChallenges",
    defaultMessage: "Tasks in \"virtual\" challenges cannot be bundled together",
  },

  readOnly: {
    id: "Widgets.TaskBundleWidget.readOnly",
    defaultMessage: "Previewing task in read-only mode",
  },
})
