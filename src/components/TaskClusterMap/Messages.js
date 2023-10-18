import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  title: {
    id: "ReviewMap.metrics.title",
    defaultMessage: "Review Map",
  },
  clusterTasksLabel: {
    id: "TaskClusterMap.controls.clusterTasks.label",
    defaultMessage: "Cluster",
  },
  zoomInForTasksLabel: {
    id: "TaskClusterMap.message.zoomInForTasks.label",
    defaultMessage: "Zoom in to view tasks"
  },
  nearMeLabel: {
    id: "TaskClusterMap.message.nearMe.label",
    defaultMessage: "Near Me"
  },
  orLabel: {
    id: "TaskClusterMap.message.or.label",
    defaultMessage: "or"
  },
  taskCountLabel: {
    id: "TaskClusterMap.message.taskCount.label",
    defaultMessage: "{count,plural,=0{No tasks found}one{# task found}other{# tasks found}}"
  },
  moveMapToRefresh: {
    id: "TaskClusterMap.message.moveMapToRefresh.label",
    defaultMessage: "Click to show tasks"
  },
  refreshTasks: {
    id: "TaskClusterMap.message.refreshTasks.label",
    defaultMessage: "Click to refresh tasks"
  },
})
