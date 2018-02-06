import React, { Component } from 'react'
import PropTypes from 'prop-types'
import center from '@turf/center'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import { latLng } from 'leaflet'

export default function(WrappedComponent) {
  class WithTaskCenterPoint extends Component {
    render() {
      let centerPoint = _get(this.props, 'task.location.coordinates')

      // Not all tasks have a center-point. In that case, we try to calculate
      // one ourselves based on the task features.
      if (!centerPoint && _isObject(_get(this.props, 'task.geometries'))) {
        centerPoint = _get(center(this.props.task.geometries), 'geometry.coordinates')
      }

      // If all our efforts failed, default to (0, 0).
      if (!centerPoint) {
        centerPoint = [0, 0]
      }

      // Our centerpoint is a standard GeoJSON Point, which is (Lng, Lat), but
      // Leaflet maps want (Lat, Lng).
      centerPoint = latLng(centerPoint[1], centerPoint[0])

      return <WrappedComponent centerPoint={centerPoint} {...this.props} />
    }
  }

  WithTaskCenterPoint.propTypes = {
    task: PropTypes.object.isRequired,
  }

  return WithTaskCenterPoint
}
