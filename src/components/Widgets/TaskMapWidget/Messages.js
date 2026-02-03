import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskMapWidget
 */
export default defineMessages({
  label: {
    id: "Activity.item.task",
    defaultMessage: "Task",
  },

  title: {
    id: "Activity.item.task",
    defaultMessage: "Task",
  },

  editMode: {
    id: "Widgets.TaskMapWidget.editMode",
    defaultMessage: "Current Mode:",
  },

  rapidFailed: {
    id: "Widgets.TaskMapWidget.rapidFailed",
    defaultMessage: "Widget Failed! Geometries Null!",
  },

  reselectTask: {
    id: "Widgets.TaskMapWidget.reselectTask",
    defaultMessage: "Re-Select Task",
  },

  viewTab: {
    id: "Widgets.TaskMapWidget.tab.view",
    defaultMessage: "Task Map",
  },

  editTab: {
    id: "Widgets.TaskMapWidget.tab.edit",
    defaultMessage: "Rapid Editor",
  },

  externalEditTab: {
    id: "Widgets.TaskMapWidget.tab.externalEdit",
    defaultMessage: "External Edit",
  },

  externalEditPrompt: {
    id: "Widgets.TaskMapWidget.externalEditPrompt",
    defaultMessage: "Use the button below to open this task in an external editor.",
  },
});
