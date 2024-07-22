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
        const cluserStatus = cluster.status ?? cluster.taskStatus
        const clusterId = cluster.id ?? cluster.taskId 
        const alreadyBundled = cluster.bundleId && !this.props.taskBundle?.bundleId !== cluster.bundleId

        const bundleConflict = Boolean(
          (clusterId &&
          this.props.task &&
          ![0, 3, 6].includes(cluserStatus) &&
          !this.props.taskBundle?.taskIds?.includes(clusterId) &&
          !this.props.initialBundle?.taskIds?.includes(clusterId)) ||
          alreadyBundled
        ) 

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
