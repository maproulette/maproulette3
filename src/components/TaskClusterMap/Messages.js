import { defineMessages } from "react-intl";

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
    defaultMessage: "Zoom in to view tasks",
  },
  nearMeLabel: {
    id: "Challenge.location.nearMe",
    defaultMessage: "Near Me",
  },
  orLabel: {
    id: "Task.property.operationType.or",
    defaultMessage: "or",
  },
  taskCountLabel: {
    id: "TaskClusterMap.message.taskCount.label",
    defaultMessage: "{count,plural,=0{No tasks found}one{# task found}other{# tasks found}}",
  },
  moveMapToRefresh: {
    id: "TaskClusterMap.message.moveMapToRefresh.label",
    defaultMessage: "Click to show tasks",
  },
  refreshTasks: {
    id: "TaskClusterMap.message.refreshTasks.label",
    defaultMessage: "Click to refresh tasks",
  },
  // Priority bounds layer messages
  highPriority: {
    id: "PriorityBoundsLayer.priority.high",
    defaultMessage: "High Priority",
  },
  mediumPriority: {
    id: "PriorityBoundsLayer.priority.medium",
    defaultMessage: "Medium Priority",
  },
  lowPriority: {
    id: "PriorityBoundsLayer.priority.low",
    defaultMessage: "Low Priority",
  },
  fitWorldLabel: {
    id: "TaskClusterMap.controls.fitWorld.label",
    defaultMessage: "Fit World",
  },
  toggleLegendLabel: {
    id: "TaskClusterMap.controls.toggleLegend.label",
    defaultMessage: "Toggle Legend",
  },
  zoomInLabel: {
    id: "TaskClusterMap.controls.zoomIn.label",
    defaultMessage: "Zoom In",
  },
  zoomOutLabel: {
    id: "TaskClusterMap.controls.zoomOut.label",
    defaultMessage: "Zoom Out",
  },
  fitToFeaturesLabel: {
    id: "TaskClusterMap.controls.fitToFeatures.label",
    defaultMessage: "Fit to Features",
  },
  searchLabel: {
    id: "TaskClusterMap.controls.search.label",
    defaultMessage: "Search",
  },
  selectAllInViewLabel: {
    id: "TaskClusterMap.controls.selectAllInView.label",
    defaultMessage: "Select All In View",
  },
  lassoSelectLabel: {
    id: "CustomPriorityBoundsField.lassoSelect",
    defaultMessage: "Lasso Select",
  },
  lassoDeselectLabel: {
    id: "TaskClusterMap.controls.lassoDeselect.label",
    defaultMessage: "Lasso Deselect",
  },
  clearSelectionLabel: {
    id: "TaskClusterMap.controls.clearSelection.label",
    defaultMessage: "Clear Selection",
  },
  unknownPriority: {
    id: "PriorityBoundsLayer.priority.unknown",
    defaultMessage: "Unknown Priority",
  },
});
