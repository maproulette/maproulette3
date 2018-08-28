import { point } from '@turf/helpers'
import center from '@turf/center'
import bbox from '@turf/bbox'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import { latLng } from 'leaflet'

/**
 * AsMappableTask adds functionality to a Task related to mapping.
 */
export class AsMappableTask {
  constructor(task) {
    Object.assign(this, task)
  }

  /**
   * Determines if this task contains geometries with features and returns
   * true if so, false if not.
   */
  hasGeometries() {
    if (!_isObject(this.geometries)) {
      return false
    }

    // There are some tasks that have a FeatureCollection with null features,
    // so check for that here.
    if (this.geometries.type === 'FeatureCollection' &&
        !_isArray(this.geometries.features)) {
      return false
    }

    return true
  }

  /**
   * Generates a single object containing all feature properties found in the
   * task's geometries. Later properties will overwrite earlier properties with
   * the same name.
   */
  allFeatureProperties() {
    if (!this.hasGeometries()) {
      return []
    }

    let allProperties = {}

    this.geometries.features.forEach(feature => {
      if (feature && feature.properties) {
        allProperties = Object.assign(allProperties, feature.properties)
      }
    })

    return allProperties
  }

  /**
   * Returns the task centerpoint as a leaflet LatLng object, calculating it if
   * necessary (and possible). If the centerpoint can't be determined it will
   * default to (0, 0).
   */
  calculateCenterPoint() {
    let centerPoint = _get(this, 'location.coordinates')

    // Not all tasks have a center-point. In that case, we try to calculate
    // one ourselves based on the task features.
    if (!centerPoint && this.hasGeometries()) {
      centerPoint = _get(center(this.geometries), 'geometry.coordinates')
    }

    // If all our efforts failed, default to (0, 0).
    if (!centerPoint) {
      centerPoint = [0, 0]
    }

    // Our centerpoint is a standard GeoJSON Point, which is (Lng, Lat), but
    // Leaflet maps want (Lat, Lng).
    return latLng(centerPoint[1], centerPoint[0])
  }

  /**
   * Calculates and returns the bounding box of the task.
   */
  calculateBBox() {
    if (this.hasGeometries()) {
      return bbox(this.geometries)
    }
    else {
      const centerPoint = this.calculateCenterPoint()
      return bbox(point([centerPoint.lng, centerPoint.lat]))
    }
  }
}

export default task => new AsMappableTask(task)
