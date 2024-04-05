import React, { Component } from 'react'
import _isEqual from 'lodash/isEqual'
import _map from 'lodash/map'
import AsMappableCluster
       from '../../../interactions/TaskCluster/AsMappableCluster'

/**
 * WithTaskClusterMarkers makes map marker objects, generated from the given
 * task clusters, available to the WrappedComponent
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithTaskClusterMarkers = function(WrappedComponent) {
  return class extends Component {
    state = {
      taskMarkers: [],
    }

    componentDidMount() {
      this.updateMapMarkers()
    }

    componentDidUpdate(prevProps) {
      if (!_isEqual(this.props.taskClusters, prevProps.taskClusters) ||
          !_isEqual(this.props.selectedTasks, prevProps.selectedTasks) ||
          !_isEqual(this.props.selectedClusters, prevProps.selectedClusters)) {
        this.updateMapMarkers()
      }
    }

    /**
     * Refreshes map marker data for the task clusters
     */
    updateMapMarkers() {
      const markers = _map(this.props.taskClusters, cluster => {
        const bundleConflict = Boolean(
          this.props.task &&
          !(cluster.taskStatus === 0 || cluster.status === 0 || 
            cluster.taskStatus === 3 || cluster.status === 3 || 
            cluster.taskStatus === 6 || cluster.status === 6) &&
          !this.props.taskBundle?.taskIds?.includes(cluster.id || cluster.taskId) &&
          !this.props.initialBundle?.taskIds?.includes(cluster.id || cluster.taskId) &&
          (cluster.id || cluster.taskId)
        );

        return AsMappableCluster(cluster).mapMarker(
          this.props.monochromaticClusters,
          this.props.selectedTasks,
          this.props.highlightPrimaryTask,
          this.props.selectedClusters,
          bundleConflict
        )
      })

      this.setState({taskMarkers: markers})
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          taskMarkers = {this.state.taskMarkers}
        />
      )
    }
  }
}

export default WithTaskClusterMarkers
