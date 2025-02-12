import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TasksWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.ReviewNearbyTasksWidget.label",
    defaultMessage: "Nearby Tasks",
  },

  title: {
    id: "Widgets.ReviewNearbyTasksWidget.reviewTaskTitle",
    defaultMessage: "Nearby Tasks",
  },

  restoreDefaultFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.restoreDefaultFilters.label",
    defaultMessage: "Restore Default Filters",
  },

  saveCurrentFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.saveCurrentFilters.label",
    defaultMessage: "Save Current Filters",
  },

  clearFiltersLabel: {
    id: "Widgets.TaskBundleWidget.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  filterListLabel: {
    id: "Widgets.TaskBundleWidget.controls.filterList.label",
    defaultMessage: "Filter By:",
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

  displayAllTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.displayAllTasks.label",
    defaultMessage: "Display All Tasks In View",
  },

  displayBundledTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.displayBundledTasks.label",
    defaultMessage: "Display Only Bundled Tasks",
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
    defaultMessage:
      "You are working on a single task. " + "Task bundles cannot be created on this step.",
  },

  noCooperativeWork: {
    id: "Widgets.TaskBundleWidget.noCooperativeWork",
    defaultMessage: "Cooperative tasks cannot be bundled together",
  },

  noVirtualChallenges: {
    id: "Widgets.TaskBundleWidget.noVirtualChallenges",
    defaultMessage: 'Tasks in "virtual" challenges cannot be bundled together',
  },

  readOnly: {
    id: "Widgets.TaskBundleWidget.readOnly",
    defaultMessage: "Previewing task in read-only mode",
  },
});
