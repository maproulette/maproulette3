import PropTypes from 'prop-types'
import { Map } from 'react-leaflet'
import { LatLngBounds, LatLng, latLng } from 'leaflet'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'

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
  animationHandle = null
  mapBoundsFitToLayer = false
  mapMoved = false

  /**
   * Invoked after the user is finished altering the map bounds, either by
   * moving the map or altering the zoom level. It will invoke `onBoundsChange`
   * if given.
   *
   * @private
   */
  onZoomOrMoveEnd = () => {
    if (this.props.onBoundsChange) {
      // This method can get called a few times when things are first
      // rendering, so -- if the map hasn't been moved yet (panned or
      // zoomed) -- we make sure the map has actually moved from its
      // initial center or zoom before recording a bounds change
      if (this.mapMoved ||
          !this.leafletElement.getCenter().equals(this.props.center) ||
          this.leafletElement.getZoom() !== this.props.zoom) {
        this.mapMoved = true
        this.props.onBoundsChange(this.leafletElement.getBounds(),
                                  this.leafletElement.getZoom(),
                                  this.leafletElement.getSize())
      }
    }
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

  fitBoundsToLayer = () => {
    if (_isEmpty(this.props.fitToLayer)) {
      return
    }

    // Use a timeout to give Leaflet a chance to re-render its layers
    // after a React render
    setTimeout(() => {
      let layerBounds = null
      this.leafletElement.eachLayer(layer => {
        if (_get(layer, 'options.mrLayerId') === this.props.fitToLayer) {
          layerBounds = layer.getBounds()
        }
      })

      // By default, we always fit the map bounds to the fit Layer.
      // However, if we're only supposed to fit the features as necessary, then
      // we do it for initial render (no updates) or if the layer
      // features wouldn't all be displayed at the present zoom level.
      if (layerBounds && (
            !this.props.fitBoundsOnlyAsNecessary ||
            !this.mapBoundsFitToLayer ||
            !this.leafletElement.getBounds().contains(layerBounds)
          )) {
        this.leafletElement.fitBounds(layerBounds.pad(0.5))
      }
    }, 0)
  }

  componentDidMount() {
    super.componentDidMount()

    if (this.props.animator) {
      this.props.animator.setAnimationFunction(this.animateFeatures)
    }

    if (this.props.noAttributionPrefix) {
      this.leafletElement.attributionControl.setPrefix(false)
    }

    // If there are geojson features, add them to the leaflet map and then
    // fit the map to the bounds of those features.
    if (this.props.fitToLayer) {
      this.fitBoundsToLayer()
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

    if (this.props.initialBounds && _isFinite(this.props.initialBounds.getNorth())) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.animator) {
      this.props.animator.setAnimationFunction(this.animateFeatures)
    }

    if (this.props.initialBounds && _isFinite(this.props.initialBounds.getNorth())) {
      this.leafletElement.fitBounds(this.props.initialBounds)
    }
    else if (!this.props.center.equals(prevProps.center)) {
      this.leafletElement.panTo(this.props.center)
    }

    if (!_isEqual(this.props.fitToLayer, prevProps.fitToLayer)) {
      this.fitBoundsToLayer()
    }
  }

  componentWillUnmount() {
    if (this.props.animator) {
      this.props.animator.reset()
    }

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
  /** If given, bounds will be fit to layer with the given mrLayerId */
  fitToLayer: PropTypes.string,
  /** If true, bounds will only be fit initially or if deemed necessary */
  fitBoundsOnlyAsNecessary: PropTypes.bool,
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
