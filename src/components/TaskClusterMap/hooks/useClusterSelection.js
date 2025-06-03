import { useCallback } from "react";
import _compact from "lodash/compact";
import _map from "lodash/map";

/**
 * Custom hook to handle cluster and task selection functionality
 *
 * @param {Function} onBulkTaskSelection - Callback for task selection
 * @param {Function} onBulkTaskDeselection - Callback for task deselection
 * @param {Function} onBulkClusterSelection - Callback for cluster selection
 * @param {Function} onBulkClusterDeselection - Callback for cluster deselection
 * @returns {Object} Selection utility functions
 */
export const useClusterSelection = (
  onBulkTaskSelection,
  onBulkTaskDeselection,
  onBulkClusterSelection,
  onBulkClusterDeselection,
) => {
  /**
   * Extract cluster data from a map layer
   */
  const clusterDataFromLayer = useCallback((layer) => {
    let clusterData = layer?.options?.icon?.options?.clusterData;
    if (!clusterData) {
      // Single-task markers use `taskData` instead of `clusterData`
      clusterData = layer?.options?.icon?.options?.taskData;
      if (!clusterData) {
        return;
      }

      // Add fields for compatibility with clusters
      if (!clusterData.numberOfPoints) {
        clusterData.numberOfPoints = 1;
        clusterData.isTask = true;
      }
    }

    return clusterData;
  }, []);

  /**
   * Select tasks in the provided layers
   */
  const selectTasksInLayers = useCallback(
    (layers) => {
      if (onBulkTaskSelection && typeof onBulkTaskSelection === "function") {
        const taskIds = _compact(
          _map(layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
        );
        const overlappingIds = _compact(_map(layers, (layer) => layer?.options?.taskId));
        const allIds = taskIds.concat(overlappingIds);
        onBulkTaskSelection(allIds);
      }
    },
    [onBulkTaskSelection],
  );

  /**
   * Deselect tasks in the provided layers
   */
  const deselectTasksInLayers = useCallback(
    (layers) => {
      if (onBulkTaskDeselection && typeof onBulkTaskDeselection === "function") {
        const taskIds = _compact(
          _map(layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
        );
        const overlappingIds = _compact(_map(layers, (layer) => layer?.options?.taskId));
        const allIds = taskIds.concat(overlappingIds);
        onBulkTaskDeselection(allIds);
      }
    },
    [onBulkTaskDeselection],
  );

  /**
   * Select clusters in the provided layers
   */
  const selectClustersInLayers = useCallback(
    (layers) => {
      if (onBulkClusterSelection) {
        const clusters = _compact(_map(layers, (layer) => clusterDataFromLayer(layer)));
        onBulkClusterSelection(clusters);
      }
    },
    [onBulkClusterSelection, clusterDataFromLayer],
  );

  /**
   * Deselect clusters in the provided layers
   */
  const deselectClustersInLayers = useCallback(
    (layers) => {
      if (onBulkClusterDeselection) {
        const clusters = _compact(_map(layers, (layer) => clusterDataFromLayer(layer)));
        onBulkClusterDeselection(clusters);
      }
    },
    [onBulkClusterDeselection, clusterDataFromLayer],
  );

  /**
   * Select all tasks in the current view
   */
  const selectAllTasksInView = useCallback(
    (taskIds) => {
      if (onBulkTaskSelection && typeof onBulkTaskSelection === "function") {
        onBulkTaskSelection(taskIds);
      } else {
        console.warn("onBulkTaskSelection is not a function");
      }
    },
    [onBulkTaskSelection],
  );

  /**
   * Select all clusters in the current view
   */
  const selectAllClustersInView = useCallback(
    (clusters) => {
      if (onBulkClusterSelection && typeof onBulkClusterSelection === "function") {
        onBulkClusterSelection(clusters);
      } else {
        console.warn("onBulkClusterSelection is not a function");
      }
    },
    [onBulkClusterSelection],
  );

  return {
    selectTasksInLayers,
    deselectTasksInLayers,
    selectClustersInLayers,
    deselectClustersInLayers,
    selectAllTasksInView,
    selectAllClustersInView,
    clusterDataFromLayer,
  };
};

export default useClusterSelection;
