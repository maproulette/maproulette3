import _isEqual from "lodash/isEqual";
import _map from "lodash/map";
import { Component } from "react";
import AsMappableCluster from "../../../interactions/TaskCluster/AsMappableCluster";

/**
 * WithTaskClusterMarkers makes map marker objects, generated from the given
 * task clusters, available to the WrappedComponent
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithTaskClusterMarkers = function (WrappedComponent) {
  return class extends Component {
    state = {
      taskMarkers: [],
    };

    componentDidMount() {
      this.updateMapMarkers();
    }

    componentDidUpdate(prevProps) {
      if (
        !_isEqual(this.props.taskClusters, prevProps.taskClusters) ||
        !_isEqual(this.props.selectedTasks, prevProps.selectedTasks) ||
        !_isEqual(this.props.selectedClusters, prevProps.selectedClusters)
      ) {
        this.updateMapMarkers();
      }
    }

    /**
     * Refreshes map marker data for the task clusters
     */
    updateMapMarkers() {
      const tasksToDeselect = [];

      const markers = _map(this.props.taskClusters, (cluster) => {
        const clusterStatus = cluster.status ?? cluster.taskStatus;
        const clusterId = cluster.id ?? cluster.taskId;
        const alreadyBundled =
          cluster.bundleId && this.props.initialBundle?.bundleId !== cluster.bundleId;
        const locked = cluster.lockedBy && cluster.lockedBy !== this.props.user.id;

        const bundleConflict = Boolean(
          (this.props.task &&
            clusterId &&
            this.props.task &&
            ![0, 3, 6].includes(clusterStatus) &&
            !this.props.taskBundle?.taskIds?.includes(clusterId) &&
            !this.props.initialBundle?.taskIds?.includes(clusterId)) ||
            alreadyBundled ||
            locked,
        );

        // If this task has a bundle conflict and is currently selected, add it to deselect list
        if (
          bundleConflict &&
          this.props.selectedTasks &&
          this.props.deselectTasks &&
          // Check if task is selected - handle both Map and object implementations
          ((this.props.selectedTasks.has && this.props.selectedTasks.has(clusterId)) ||
            (this.props.selectedTasks.selected &&
              this.props.selectedTasks.selected.has &&
              this.props.selectedTasks.selected.has(clusterId))) &&
          !this.props.taskBundle?.taskIds?.includes(clusterId) &&
          !this.props.initialBundle?.taskIds?.includes(clusterId)
        ) {
          tasksToDeselect.push({ id: clusterId });
        }

        return AsMappableCluster(cluster).mapMarker(
          this.props.monochromaticClusters,
          this.props.selectedTasks,
          this.props.highlightPrimaryTask,
          this.props.selectedClusters,
          bundleConflict,
        );
      });

      // Deselect all tasks with bundle conflicts at once
      if (tasksToDeselect.length > 0 && this.props.deselectTasks) {
        // Use setTimeout to avoid state updates during render
        setTimeout(() => {
          this.props.deselectTasks(tasksToDeselect);
        }, 0);
      }

      this.setState({ taskMarkers: markers });
    }

    render() {
      return <WrappedComponent {...this.props} taskMarkers={this.state.taskMarkers} />;
    }
  };
};

export default WithTaskClusterMarkers;
