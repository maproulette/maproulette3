import PropTypes from 'prop-types'
import { Map } from 'react-leaflet'
import { geoJSON, LatLngBounds, LatLng, latLng } from 'leaflet'
import _isEmpty from 'lodash/isEmpty'

/**
 * EnhancedMap is an extension of the react-leaflet Map that provides
 * additional functionality. Inheritance is necessary to gain access to the
 * underlyling Leaflet map instance.
 *
 * > Note that any props accepted by react-leaflet Map can also be passed
 * > to EnhancedMap.
 *
 * @see See [react-leaflet](https://github.com/PaulLeCam/react-leaflet)
 * @see See [leaflet](http://leafletjs.com/)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class EnhancedMap extends Map {
  currentFeatures = null

  /**
   * Invoked after the user is finished altering the map bounds, either by
   * moving the map or altering the zoom level. It will invoke `onBoundsChange`
   * if given.
   *
   * @private
   */
  onZoomOrMoveEnd = () => {
    if (this.props.onBoundsChange) {
      // This method can get called a few times when things are first rendering,
      // so we make sure the map has actually moved from its initial center or
      // zoom before recording a bounds change.

      if (!this.leafletElement.getCenter().equals(this.props.center) ||
          this.leafletElement.getZoom() !== this.props.zoom) {
        this.props.onBoundsChange(this.leafletElement.getBounds(),
                                  this.leafletElement.getZoom())
      }
    }
  }

  updateFeatures = (newFeatures) => {
    if (!_isEmpty(this.currentFeatures)) {
      this.currentFeatures.remove()
    }

    if (!_isEmpty(newFeatures)) {
      this.currentFeatures = geoJSON(newFeatures)
      if (!this.props.justFitFeatures) {
        this.currentFeatures.addTo(this.leafletElement)
      }

      this.leafletElement.fitBounds(this.currentFeatures.getBounds().pad(0.5))
    }
  }

  componentDidMount() {
    super.componentDidMount()

    // If there are geojson features, add them to the leaflet map and then
    // fit the map to the bounds of those features.
    if (this.props.features) {
      this.updateFeatures(this.props.features)
    }

    // Setup event handlers for moveend and zoomend events if the parent
    // needs to be notified of changes to the map bounds.
    if (this.props.onBoundsChange) {
      this.leafletElement.on('zoomend', this.onZoomOrMoveEnd)
      this.leafletElement.on('moveend', this.onZoomOrMoveEnd)

      // Unless requested otherwise, invoke onBoundsChange for the initial
      // bounding box.
      if (this.props.onBoundsChange && this.props.setInitialBounds !== false) {
        this.props.onBoundsChange(this.leafletElement.getBounds(),
                                  this.leafletElement.getZoom())
      }
    }

    if (this.props.initialBounds && _isEmpty(this.props.features)) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.initialBounds && _isEmpty(this.props.features)) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }

    if (this.props.features !== prevProps.features ||
        this.props.justFitFeatures !== prevProps.justFitFeatures) {
      this.updateFeatures(this.props.features)
    }
  }

  componentWillUnmount() {
    this.leafletElement.stop()
    this.leafletElement.off('zoomend', this.onZoomOrMoveEnd)
    this.leafletElement.off('moveend', this.onZoomOrMoveEnd)

    super.componentWillUnmount()
  }
}

EnhancedMap.propTypes = {
  /** Centerpoint of map */
  center: PropTypes.instanceOf(LatLng),
  /** Zoom level of map */
  zoom: PropTypes.number,
  /** Initial bounding box for the map; overrides center and zoom */
  initialBounds: PropTypes.instanceOf(LatLngBounds),
  /** If given, invoked with latest LatLngBounds when map is changed */
  onBoundsChange: PropTypes.func,
  /** If false, onBoundsChange will not be invoked for initial bounding box */
  setInitialBounds: PropTypes.bool,
  /** If true, features will only be used to fit bounds, not rendered */
  justFitFeatures: PropTypes.bool,
}

EnhancedMap.defaultProps = {
  center: latLng(0, 45),
  zoom: 13,
  setInitialBounds: true,
  justFitFeatures: false,
}
