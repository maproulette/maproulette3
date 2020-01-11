import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Map } from 'react-leaflet'
import { geoJSON, LatLngBounds, LatLng, latLng } from 'leaflet'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import AsSimpleStyleableFeature
       from '../../interactions/TaskFeature/AsSimpleStyleableFeature'
import PropertyList from './PropertyList/PropertyList'

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
  animationHandle = null

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
                                  this.leafletElement.getZoom(),
                                  this.leafletElement.getSize())
      }
    }
  }

  /**
   * Schedules animation of SVG paths and markers on map. If animation is
   * already pending, it is first cancelled prior to scheduling a new one.
   */
  scheduleAnimation = () => {
    if (this.animationHandle) {
      clearTimeout(this.animationHandle)
    }
    this.animationHandle = setTimeout(this.animateFeatures, 250)
  }

  /**
   * Returns a promise that resolves to the full length of the SVG path once it
   * has finished rendering.
   */
  pathComplete(path, priorLength, subsequentCheck = false) {
    return new Promise(resolve => {
      const currentLength = path.getTotalLength()
      if (subsequentCheck && currentLength === priorLength) {
        resolve(currentLength)
        return
      }

      setTimeout(() => {
        this.pathComplete(path, currentLength, true).then(length => resolve(length))
      }, 100)
    })
  }

  /**
   * Performs simple animation of SVG paths and markers to provide a visual cue
   * to the user that new paths/markers have been rendered on the map, and to
   * call attention to them.
   */
  animateFeatures = () => {
    // Animate paths
    const paths = document.querySelectorAll('.leaflet-pane path.leaflet-interactive')
    if (paths.length > 0) {
      for (let path of paths) {
        this.pathComplete(path).then(pathLength => {
          path.style.strokeDasharray = `${pathLength} ${pathLength}`
          path.style.strokeDashoffset = pathLength

          // reset to normal after transition completes
          path.addEventListener("transitionend", () => {
            path.style.strokeDasharray = 'none';
          })

          // kick off transition
          path.getBoundingClientRect()
          path.style.transition = 'stroke-dashoffset 1s ease-in-out'
          path.style.strokeDashoffset = '0'
          path.style.opacity = '1';
        })
      }
    }

    // Animate markers
    const markers = document.querySelectorAll('.leaflet-marker-pane')
    if (markers) {
      for (let marker of markers) {
        marker.classList.remove('animated')
        setTimeout(() => marker.classList.add('animated'), 100)
      }
    }
  }

  updateFeatures = (newFeatures) => {
    const hasExistingFeatures = !_isEmpty(this.currentFeatures)
    if (hasExistingFeatures) {
      this.currentFeatures.remove()
    }

    if (!_isEmpty(newFeatures)) {
      this.currentFeatures = geoJSON(newFeatures, {
        onEachFeature: (feature, layer) => {
          layer.bindPopup(() => this.propertyList(feature.properties))

          // Animate features when added to map (if requested)
          if (this.props.animateFeatures) {
            const oldOnAdd = layer.onAdd
            layer.onAdd = map => {
              oldOnAdd.call(layer, map)
              this.scheduleAnimation()
            }
          }

          // Support [simplestyle](https://github.com/mapbox/simplestyle-spec)
          AsSimpleStyleableFeature(feature).styleLeafletLayer(layer)
        }
      })

      if (!this.props.justFitFeatures) {
        this.currentFeatures.addTo(this.leafletElement)
      }

      // By default, we always fit the map bounds to the task features.
      // However, if we're only supposed to fit the features as necessary, then
      // we do it for initial task (no existing features) or if the new task
      // features wouldn't all be displayed at the present zoom level.
      if (!this.props.fitFeaturesOnlyAsNecessary ||
          !hasExistingFeatures ||
          !this.leafletElement.getBounds().contains(this.currentFeatures.getBounds())) {
        this.leafletElement.fitBounds(this.currentFeatures.getBounds().pad(0.5))
      }
    }
  }

  propertyList = featureProperties => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <PropertyList featureProperties={featureProperties} />,
      contentElement
    )
    return contentElement
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

    if (this.props.initialBounds) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.initialBounds) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }
    else if (!this.props.center.equals(prevProps.center)) {
      this.leafletElement.panTo(this.props.center)
    }

    if (!_isEqual(this.props.features, prevProps.features) ||
        this.props.justFitFeatures !== prevProps.justFitFeatures) {
      this.updateFeatures(this.props.features)
    }
  }

  componentWillUnmount() {
    try {
      this.leafletElement.stop()
      this.leafletElement.off('zoomend', this.onZoomOrMoveEnd)
      this.leafletElement.off('moveend', this.onZoomOrMoveEnd)
    }
    catch(e) {} // Bad custom basemaps can cause problems when stopping Leaflet

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
  /** If true, features will be animated when initially added to the map */
  animateFeatures: PropTypes.bool,
}

EnhancedMap.defaultProps = {
  center: latLng(0, 45),
  zoom: 13,
  setInitialBounds: true,
  justFitFeatures: false,
  animateFeatures: false,
}
