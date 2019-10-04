import { featureCollection } from '@turf/helpers'
import center from '@turf/center'
import bbox from '@turf/bbox'
import _get from 'lodash/get'
import _flatten from 'lodash/flatten'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import { latLng } from 'leaflet'

/**
 * AsMappableBundle adds functionality to a TaskBundle related to mapping
 */
export class AsMappableBundle {
  constructor(taskBundle) {
    Object.assign(this, taskBundle)
  }

  /**
   * Generates a GeoJSON feature collection representing the task bundle
   */
  featureCollection() {
    return featureCollection(
      _flatten(_compact(
        _map(this.tasks, task => _get(task, 'geometries.features'))
      ))
    )
  }

  /**
   * Calculates and returns the bounding box of the task
   */
  calculateBBox() {
    return bbox(this.featureCollection())
  }

  /**
   * Returns the centerpoint of the bundle as a leaflet LatLng object If the
   * centerpoint can't be determined it will default to (0, 0)
   */
  calculateCenterPoint() {
    const centerPoint = center(this.featureCollection())
    if (centerPoint) {
      // GeoJSON use lng,lat but Leaflet wants lat,lng so swap coordinates
      return latLng(centerPoint.geometry.coordinates[1],
                    centerPoint.geometry.coordinates[0])
    }

    return latLng(0, 0)
  }
}

export default taskBundle => new AsMappableBundle(taskBundle)
