import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get as _get } from 'lodash'
import { latLng } from 'leaflet'

export default function(WrappedComponent) {
  class WithTaskCenterPoint extends Component {
    render() {
      // The server gives us the center-point of a task as a standard GeoJSON
      // Point, which is (Lng, Lat), but Leaflet maps wants (Lat, Lng).
      // Note: not all tasks include a location, so be resilient.
      const centerPoint = latLng(
        _get(this.props, 'task.location.coordinates[1]', 0),
        _get(this.props, 'task.location.coordinates[0]', 0)
      )

      return <WrappedComponent centerPoint={centerPoint} {...this.props} />
    }
  }

  WithTaskCenterPoint.propTypes = {
    task: PropTypes.object.isRequired,
  }

  return WithTaskCenterPoint
}
