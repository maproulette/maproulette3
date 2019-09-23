import React, { Component } from 'react'
import _get from 'lodash/get'
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
      if (!_isEqual(this.props.taskClusters, prevProps.taskClusters)) {
        this.updateMapMarkers()
      }
    }

    /**
     * Refreshes map marker data for the task clusters
     */
    updateMapMarkers() {
      const mapLayerName = _get(this.props, 'source.name')
      const markers = _map(this.props.taskClusters, cluster =>
        AsMappableCluster(cluster).mapMarker(mapLayerName)
      )

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
