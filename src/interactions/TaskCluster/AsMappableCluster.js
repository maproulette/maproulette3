import L from 'leaflet'
import { MAPBOX_LIGHT, OPEN_STREET_MAP }
       from '../../services/VisibleLayer/LayerSources'
import _isFunction from 'lodash/isFunction'

/**
 * AsMappableCluster adds functionality to a task cluster related to mapping,
 * such as generation of representative map marker objects suitable for Leaflet
 * maps
 */
export class AsMappableCluster {
  constructor(cluster) {
    Object.assign(this, cluster)
    this.rawData = cluster
  }

  /**
   * Generates a map marker object suitable for use with a Leaflet map, with
   * optionally customized appearance for the given map layer
   */
  mapMarker(mapLayerName) {
    return {
      position: [this.point.lat, this.point.lng],
      options: {...this.rawData},
      icon: this.leafletMarkerIcon(mapLayerName),
    }
  }

  /**
   * Generates a Leaflet Icon object appropriate for the given cluster based on
   * its size -- including using a standard marker for a single point -- and,
   * optionally, the map layer currently in use
   */
  leafletMarkerIcon(mapLayerName) {
    const count = _isFunction(this.rawData.getChildCount) ?
                  this.rawData.getChildCount() : this.numberOfPoints
    if (count > 1) {
      let colorScheme = null
      switch(mapLayerName) {
        case MAPBOX_LIGHT:
          colorScheme = 'monochromatic-blue-cluster'
          break;
        case OPEN_STREET_MAP:
          colorScheme = 'monochromatic-brown-cluster'
          break;
        default:
          colorScheme = 'greyscale-cluster'
          break;
      }

      let clusterSizeClass = ''
      if (count < 10) {
        clusterSizeClass = 'few'
      }
      else if (count > 100) {
        clusterSizeClass = 'many'
      }

      return L.divIcon({
        html: `<span class="count">${count}</span>`,
        className: `${colorScheme} ${clusterSizeClass}`,
        iconSize: L.point(40, 40),
      })
    }
    else {
      return new L.Icon.Default()
    }
  }
}

export default cluster => new AsMappableCluster(cluster)
