import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskNearbyMap
 */
export default defineMessages({
  currentTaskTooltip: {
    id: "Widgets.TaskNearbyMap.currentTaskTooltip",
    defaultMessage: "Current Task",
  },

  noTasksAvailableLabel: {
    id: "ActivityMap.noTasksAvailable.label",
    defaultMessage: "No nearby tasks are available.",
  },

  priorityLabel: {
    id: "ActivityMap.tooltip.priorityLabel",
    defaultMessage: "Priority: ",
  },

  statusLabel: {
    id: "ActivityMap.tooltip.statusLabel",
    defaultMessage: "Status: ",
  },

  loadMoreTasks: {
    id: "Widgets.TaskNearbyMap.tooltip.loadMoreTasks.control",
    defaultMessage: "Load More Tasks",
  },
});
