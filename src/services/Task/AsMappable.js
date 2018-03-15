import { point } from '@turf/helpers'
import center from '@turf/center'
import bbox from '@turf/bbox'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import { latLng } from 'leaflet'

/**
 * AsMappable adds functionality to a Task related to mapping.
 */
export class AsMappable {
  constructor(task) {
    Object.assign(this, task)
  }

  hasGeometries() {
    return _isObject(this.geometries)
  }

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

export default task => new AsMappable(task)
