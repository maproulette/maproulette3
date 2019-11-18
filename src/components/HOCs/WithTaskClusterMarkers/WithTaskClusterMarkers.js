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
          !_isEqual(this.props.chosenTasks, prevProps.chosenTasks)) {
        this.updateMapMarkers()
      }
    }

    /**
     * Refreshes map marker data for the task clusters
     */
    updateMapMarkers() {
      const markers = _map(this.props.taskClusters, cluster => {
        return AsMappableCluster(cluster).mapMarker(
          this.props.monochromaticClusters,
          this.props.chosenTasks,
          this.props.highlightPrimaryTask
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
