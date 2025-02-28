import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskCompletionWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TaskCompletionWidget.label",
    defaultMessage: "Completion",
  },

  title: {
    id: "Widgets.TaskCompletionWidget.label",
    defaultMessage: "Completion",
  },

  inspectTitle: {
    id: "Admin.TaskAnalysisTable.controls.inspectTask.label",
    defaultMessage: "Inspect",
  },

  cooperativeWorkTitle: {
    id: "Widgets.TaskCompletionWidget.cooperativeWorkTitle",
    defaultMessage: "Proposed Changes",
  },

  simultaneousTasks: {
    id: "Widgets.ReviewNearbyTasksWidget.simultaneousTasks",
    defaultMessage: "Working on {taskCount, number} tasks together",
  },

  completeTogether: {
    id: "Widgets.TaskCompletionWidget.completeTogether",
    defaultMessage: "Complete Together",
  },

  cancelSelection: {
    id: "Widgets.TaskCompletionWidget.cancelSelection",
    defaultMessage: "Cancel Selection",
  },
});
