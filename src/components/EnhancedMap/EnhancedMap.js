import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Map as ReactLeafletMap } from 'react-leaflet'
import { LatLngBounds, LatLng, Point, latLng } from 'leaflet'
import L from 'leaflet'
import bboxPolygon from '@turf/bbox-polygon'
import booleanDisjoint from '@turf/boolean-disjoint'
import booleanContains from '@turf/boolean-contains'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _each from 'lodash/each'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _isArray from 'lodash/isArray'
import _sortBy from 'lodash/sortBy'
import _filter from 'lodash/filter'
import _reduce from 'lodash/reduce'
import _find from 'lodash/find'
import _size from 'lodash/size'
import _noop from  'lodash/noop'
import { IntlProvider } from 'react-intl'
import AsIdentifiableFeature
       from '../../interactions/TaskFeature/AsIdentifiableFeature'
import messages from './Messages'
import PropertyList from './PropertyList/PropertyList'

const PIXEL_MARGIN = 10 // number of pixels on each side of a click to consider

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
export class EnhancedMap extends ReactLeafletMap {
  animationHandle = null
  mapBoundsFitToLayer = false
  mapMoved = false
  noInitialBoundsSet = true

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
      const matchingLayers = []
      this.leafletElement.eachLayer(layer => {
        if (_get(layer, 'options.mrLayerId') === this.props.fitToLayer && layer.getBounds) {
          matchingLayers.push(layer)
        }
      })
      if (matchingLayers.length === 0) {
        return
      }

      // If multiple layers match, try to find the parent layer (which will
      // contain a non-empty _layers object)
      let fitLayer = null
      if (matchingLayers.length > 1) {
        fitLayer = _find(matchingLayers, l => _size(l._layers) > 0)
      }
      if (!fitLayer) {
        fitLayer = matchingLayers[0]
      }

      // By default, we always fit the map bounds to the fit Layer.
      // However, if we're only supposed to fit the features as necessary, then
      // we do it for initial render (no updates) or if the layer
      // features wouldn't all be displayed at the present zoom level.
      const layerBounds = fitLayer.getBounds()
      if (layerBounds && (
            !this.props.fitBoundsOnlyAsNecessary ||
            !this.mapBoundsFitToLayer ||
            !this.leafletElement.getBounds().contains(layerBounds)
          )) {
        this.leafletElement.fitBounds(layerBounds.pad(0.5))
      }
    }, 0)
  }


  /**
   * Return bounding polygon centered around clicked layer point, with
   * PIXEL_MARGIN on each side of the point
   */
  getClickPolygon = clickEvent => {
    const center = clickEvent.layerPoint
    const nw = this.leafletElement.layerPointToLatLng(new Point(center.x - PIXEL_MARGIN, center.y - PIXEL_MARGIN))
    const se = this.leafletElement.layerPointToLatLng(new Point(center.x + PIXEL_MARGIN, center.y + PIXEL_MARGIN))
    return bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])
  }

  /**
   * Determines if a click was within a marker's icon, which could potentially
   * extend far beyond our PIXEL_MARGIN from the marker's represened point
   */
  isClickOnMarker = (clickPolygon, marker) => {
    const icon = marker.getIcon()
    const iconOptions = Object.assign({}, Object.getPrototypeOf(icon).options, icon.options)
    const markerPoint = this.leafletElement.containerPointToLayerPoint(
      this.leafletElement.latLngToContainerPoint(marker.getLatLng())
    )

    // We need an iconAnchor and iconSize to continue
    if (!_isArray(iconOptions.iconAnchor) || !_isArray(iconOptions.iconSize)) {
      return false
    }

    const nw = this.leafletElement.layerPointToLatLng(new Point(
      markerPoint.x - iconOptions.iconAnchor[0],
      markerPoint.y - iconOptions.iconAnchor[1]
    ))
    const se = this.leafletElement.layerPointToLatLng(new Point(
      markerPoint.x + (iconOptions.iconSize[0] - iconOptions.iconAnchor[0]),
      markerPoint.y + (iconOptions.iconSize[1] - iconOptions.iconAnchor[1])
    ))
    const markerPolygon = bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])

    return !booleanDisjoint(clickPolygon, markerPolygon)
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
      this.leafletElement.on('movestart', this.props.onZoomOrMoveStart)

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

    if (this.props.externalInteractive) {
      this.leafletElement.on('click', e => {
        const clickBounds = this.getClickPolygon(e)
        const candidateLayers = new Map()
        this.leafletElement.eachLayer(layer => {
          if (!_isEmpty(layer._layers)) {
            // multiple features in a layer could match. Detect them and then
            // put them into an intuitive order
            const intraLayerMatches = []
            _each(layer._layers, featureLayer => {
              if (featureLayer.toGeoJSON) {
                const featureGeojson = featureLayer.toGeoJSON()
                // Look for an overlap between the click and the feature. However, since marker
                // layers are represented by an icon (which could extend far beyond the feature
                // plus our usual pixel margin), check for a click on the marker itself as well
                if ((featureLayer.getIcon && this.isClickOnMarker(clickBounds, featureLayer)) ||
                    !booleanDisjoint(clickBounds, featureGeojson)) {
                  const featureId = AsIdentifiableFeature(featureGeojson).normalizedTypeAndId()
                  const featureName = _get(featureGeojson, 'properties.name')
                  let layerDescription =
                    (featureLayer.options.mrLayerLabel || '') + (featureId ? `: ${featureId}` : '')
                  if (!layerDescription) {
                    // worst case, fall back to a layer id (ours, preferably, or leaflet's)
                    layerDescription = `Layer ${featureLayer.mrLayerId || featureLayer._leaflet_id}`
                  }

                  const layerLabel = featureName ? (
                    <React.Fragment>
                      <div>{layerDescription}</div>
                      <div className="mr-text-grey-light mr-text-xs">{featureName}</div>
                    </React.Fragment>
                  ) : layerDescription

                  intraLayerMatches.push({
                    mrLayerId: featureLayer.options.mrLayerId,
                    description: layerDescription,
                    label: layerLabel,
                    geometry: featureGeojson,
                    layer: featureLayer,
                  })
                }
              }
            })

            if (intraLayerMatches.length > 0) {
              this.orderedFeatureLayers(intraLayerMatches).forEach(match => {
                candidateLayers.set(match.description, match)
              })
            }
          }
        })

        if (candidateLayers.size === 1) {
          candidateLayers.values().next().value.layer.fire('mr-external-interaction', {
            map: this.leafletElement,
            latlng: e.latlng,
          })
        }
        else if (candidateLayers.size > 1) {
          let layers = [...candidateLayers.entries()]
          if (this.props.overlayOrder && this.props.overlayOrder.length > 0) {
            layers = _sortBy(layers, layerEntry => {
              const position = this.props.overlayOrder.indexOf(layerEntry[1].mrLayerId)
              return position === -1 ? Number.MAX_SAFE_INTEGER : position
            })
          }

          this.popupLayerSelectionList(layers, e.latlng)
        }
      })
    }
  }

  /**
   * Simple sorting of multiple related feature layers (such as all in a single map
   * layer) by geometry type into order of: points, lineStrings, surrounded polygons,
   * surrounding polygons. Each layer should be an object with a `geometry` field
   */
  orderedFeatureLayers(layers) {
    if (!layers || layers.length < 2) {
      return layers // nothing to do
    }

    // We'll process polygons separately
    const geometryOrder = ['Point', 'MultiPoint', 'LineString', 'MultiLineString']
    const orderedLayers = _sortBy(
      _filter(layers, l => geometryOrder.indexOf(l.geometry.type) !== -1), // no polygons yet
      l => geometryOrder.indexOf(l.geometry.type)
    )

    // Now order any polygons by number of enclosing polygons, so enclosed will come
    // before enclosing
    const polygonLayers = _filter(layers, l => l.geometry.type === 'Polygon' || l.geometry.type === 'MultiPolygon')
    const orderedPolygons = polygonLayers.length < 2 ? polygonLayers : _sortBy(
      polygonLayers,
      l => _reduce(
        polygonLayers,
        (count, other) => {
          return booleanContains(other.geometry, l.geometry) ? count + 1 : count
        },
        0
      )
    ).reverse()

    return orderedLayers.concat(orderedPolygons)
  }

  popupLayerSelectionList = (layers, latlng) => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <div className="mr-text-base mr-px-4 mr-links-blue-light">
        <h3>{this.props.intl.formatMessage(messages.layerSelectionHeader)}</h3>
        <ol>
          {layers.map(([description, layerInfo]) => {
            return (
                <IntlProvider
                              key={this.props.intl.locale} 
                              locale={this.props.intl.locale} 
                              messages={this.props.intl.messages}
                              textComponent="span" 
                >
                  <PropertyList
                    header={description}
                    featureProperties={_omit(layerInfo?.geometry?.properties, ['id', 'type'])}
                    onBack={() => this.popupLayerSelectionList(layers, latlng)}
                  />
                </IntlProvider>
            )
          })}
        </ol>
      </div>,
      contentElement
    )

    L.popup({
      closeOnEscapeKey: false, // Otherwise our links won't get a onMouseLeave event
    }).setLatLng(latlng).setContent(contentElement).openOn(this.leafletElement)
  }

  componentDidUpdate(prevProps) {
    if (this.props.animator) {
      this.props.animator.setAnimationFunction(this.animateFeatures)
    }

    if (this.props.taskMarkers && this.noInitialBoundsSet && this.props.initialBounds && _isFinite(this.props.initialBounds.getNorth())) {
      this.noInitialBoundsSet = false
      this.leafletElement.fitBounds(this.props.initialBounds)
    } else if (!this.props.center.equals(prevProps.center)) {
      this.fitBoundsToLayer()
      this.leafletElement.panTo(this.props.center)
    }

    if (!_isEqual(this.props.fitToLayer, prevProps.fitToLayer) || this.props.taskBundle !== prevProps.taskBundle) {
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
      this.leafletElement.off('movestart', this.props.onZoomOrMoveStart)
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
  /** If given, will invoke a method when map is being moved */
  onZoomOrMoveStart: PropTypes.func,
}

EnhancedMap.defaultProps = {
  center: latLng(0, 45),
  zoom: 13,
  setInitialBounds: true,
  justFitFeatures: false,
  animateFeatures: false,
  onZoomOrMoveStart: _noop,
}

export default EnhancedMap
