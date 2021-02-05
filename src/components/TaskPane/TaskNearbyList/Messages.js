import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskNearbyMap
 */
export default defineMessages({
  currentTaskTooltip: {
    id: "Widgets.TaskNearbyMap.currentTaskTooltip",
    defaultMessage: "Current Task",
  },

  noTasksAvailableLabel: {
    id: "Widgets.TaskNearbyMap.noTasksAvailable.label",
    defaultMessage: "No nearby tasks are available.",
  },

  priorityLabel: {
    id: "Widgets.TaskNearbyMap.tooltip.priorityLabel",
    defaultMessage: "Priority: ",
  },

  statusLabel: {
    id: "Widgets.TaskNearbyMap.tooltip.statusLabel",
    defaultMessage: "Status: ",
  },

  loadMoreTasks: {
    id: "Widgets.TaskNearbyMap.tooltip.loadMoreTasks.control",
    defaultMessage: "Load More Tasks",
  },
})
