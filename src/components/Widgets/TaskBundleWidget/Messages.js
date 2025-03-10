import { defineMessages } from "react-intl";

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
    defaultMessage: "Save Current Filters",
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
  },

  filterListLabel: {
    id: "Admin.manageTasks.controls.filterList.label",
    defaultMessage: "Filter By:",
  },

  taskIdLabel: {
    id: "Widgets.ReviewNearbyTasksWidget.popup.fields.taskId.label",
    defaultMessage: "Internal Id:",
  },

  nameLabel: {
    id: "Widgets.ReviewNearbyTasksWidget.popup.fields.name.label",
    defaultMessage: "Feature Id:",
  },

  statusLabel: {
    id: "Admin.Task.fields.status.label",
    defaultMessage: "Status:",
  },

  priorityLabel: {
    id: "TaskConfirmationModal.priority.label",
    defaultMessage: "Priority:",
  },

  selectedLabel: {
    id: "Widgets.TaskBundleWidget.popup.controls.selected.label",
    defaultMessage: "Selected",
  },

  alreadyBundledLabel: {
    id: "Widgets.TaskBundleWidget.popup.controls.alreadyBundled.label",
    defaultMessage: "Already bundled by someone else.",
  },

  bundleTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.startBundling.label",
    defaultMessage: "Start Bundling Tasks",
  },

  displayAllTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.displayAllTasks.label",
    defaultMessage: "Display All Tasks In View",
  },

  displayBundledTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.displayBundledTasks.label",
    defaultMessage: "Display Only Bundled Tasks",
  },

  unableToSelect: {
    id: "Widgets.TaskBundleWidget.unableToSelect",
    defaultMessage: "Unable to select",
  },

  cannotEditPrimaryTask: {
    id: "Widgets.TaskBundleWidget.cannotEditPrimaryTask",
    defaultMessage: "Cannot edit primary task",
  },

  removeFromBundle: {
    id: "Widgets.TaskBundleWidget.removeFromBundle",
    defaultMessage: "Remove from bundle",
  },

  addToBundle: {
    id: "Widgets.TaskBundleWidget.addToBundle",
    defaultMessage: "Add to bundle",
  },

  unbundleTasksLabel: {
    id: "Widgets.TaskBundleWidget.controls.stopBundlinsg.label",
    defaultMessage: "Delete Bundle",
  },

  resetBundleLabel: {
    id: "Widgets.TaskBundleWidget.controls.resetBundleLabel.label",
    defaultMessage: "Reset Bundle",
  },

  currentTask: {
    id: "Widgets.TaskBundleWidget.currentTask",
    defaultMessage: "(current task)",
  },

  simultaneousTasks: {
    id: "Widgets.ReviewNearbyTasksWidget.simultaneousTasks",
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
    id: "Admin.TaskInspect.readonly.message",
    defaultMessage: "Previewing task in read-only mode",
  },

  fetchBundleError: {
    id: "Widgets.TaskBundleWidget.fetchBundleError",
    defaultMessage: "Failed to fetch task bundle. Please try again.",
  },

  lockTaskError: {
    id: "Widgets.TaskBundleWidget.lockTaskError",
    defaultMessage: "Failed to lock task {taskId}. Please try again.",
  },

  refreshTaskLockError: {
    id: "Widgets.TaskBundleWidget.refreshTaskLockError",
    defaultMessage: "Failed to refresh task lock. Please try again.",
  },

  updateTaskBundleError: {
    id: "Widgets.TaskBundleWidget.updateTaskBundleError",
    defaultMessage: "Failed to update task bundle. Please try again.",
  },

  tooManyTasks: {
    id: "Widgets.TaskBundleWidget.tooManyTasks",
    defaultMessage: "Initial bundle cannot exceed 50 tasks",
  },

  bundleLimitError: {
    id: "Widgets.TaskBundleWidget.bundleLimitError",
    defaultMessage: "Cannot create bundle with more than 50 tasks",
  },

  lockError: {
    id: "Widgets.TaskBundleWidget.lockError",
    defaultMessage: "Failed to lock tasks. Please try again.",
  },

  unlockError: {
    id: "Widgets.TaskBundleWidget.unlockError",
    defaultMessage: "Failed to unlock tasks. Please try again.",
  },

  refreshError: {
    id: "Widgets.TaskBundleWidget.refreshError",
    defaultMessage: "Failed to refresh task locks. Please try again.",
  },

  bundleTypeError: {
    id: "Widgets.TaskBundleWidget.bundleTypeError",
    defaultMessage: "Cannot bundle tasks of different types together",
  },
});
