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
    id: "Widgets.ReviewNearbyTasksWidget.label",
    defaultMessage: "Nearby Tasks",
  },

  filterListLabel: {
    id: "Admin.manageTasks.controls.filterList.label",
    defaultMessage: "Filter By:",
  },

  clearFiltersLabel: {
    id: "Admin.manageTasks.controls.clearFilters.label",
    defaultMessage: "Clear Filters",
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

  simultaneousTasks: {
    id: "Widgets.ReviewNearbyTasksWidget.simultaneousTasks",
    defaultMessage: "Working on {taskCount, number} tasks together",
  },
});
