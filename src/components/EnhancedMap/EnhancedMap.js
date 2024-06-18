import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { MapContainer, useMap } from 'react-leaflet'
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
const Map = (props) => {
  const [noInitialBoundsSet, setNoInitialBoundsSet] = useState(true)
  const [mapMoved, setMapMoved] = useState(false)
  const map = useMap()

  /**
   * Invoked after the user is finished altering the map bounds, either by
   * moving the map or altering the zoom level. It will invoke `onBoundsChange`
   * if given.
   *
   * @private
   */
  const onZoomOrMoveEnd = () => {
    if (props.onBoundsChange) {
      // This method can get called a few times when things are first
      // rendering, so -- if the map hasn't been moved yet (panned or
      // zoomed) -- we make sure the map has actually moved from its
      // initial center or zoom before recording a bounds change
      if (mapMoved ||
          !map.getCenter().equals(props.center) ||
          map.getZoom() !== props.zoom) {
        setMapMoved(true)
        props.onBoundsChange(map.getBounds(),
                             map.getZoom(),
                             map.getSize())
      }
    }
  }

  /**
   * Returns a promise that resolves to the full length of the SVG path once it
   * has finished rendering.
   */
  const pathComplete = (path, priorLength, subsequentCheck = false) => {
    return new Promise(resolve => {
      const currentLength = path.getTotalLength()
      if (subsequentCheck && currentLength === priorLength) {
        resolve(currentLength)
        return
      }

      setTimeout(() => {
        pathComplete(path, currentLength, true).then(length => resolve(length))
      }, 100)
    })
  }

  /**
   * Performs simple animation of SVG paths and markers to provide a visual cue
   * to the user that new paths/markers have been rendered on the map, and to
   * call attention to them.
   */
  const animateFeatures = () => {
    // Animate paths
    const paths = document.querySelectorAll('.leaflet-pane path.leaflet-interactive')
    if (paths.length > 0) {
      for (let path of paths) {
        pathComplete(path).then(pathLength => {
          path.style.strokeDasharray = `${pathLength} ${pathLength}`
          path.style.strokeDashoffset = pathLength

          // reset to normal after transition completes
          path.addEventListener("transitionend", () => {
            path.style.strokeDasharray = 'none'
          })

          // kick off transition
          path.getBoundingClientRect()
          path.style.transition = 'stroke-dashoffset 1s ease-in-out'
          path.style.strokeDashoffset = '0'
          path.style.opacity = '1'
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


    
  const fitBoundsToLayer = () => {
    if (_isEmpty(props.fitToLayer)) {
      return
    }

    // Use a timeout to give Leaflet a chance to re-render its layers
    // after a React render
    setTimeout(() => {
      const matchingLayers = []
      map.eachLayer(layer => {
        if (_get(layer, 'options.mrLayerId') === props.fitToLayer && layer.getBounds) {
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
            !props.fitBoundsOnlyAsNecessary ||
            true ||
            !map.getBounds().contains(layerBounds)
          )) {
        map.fitBounds(layerBounds.pad(0.5))
      }
    }, 0)
  }


  /**
   * Return bounding polygon centered around clicked layer point, with
   * PIXEL_MARGIN on each side of the point
   */
  const getClickPolygon = clickEvent => {
    const center = clickEvent.layerPoint
    const nw = map.layerPointToLatLng(new Point(center.x - PIXEL_MARGIN, center.y - PIXEL_MARGIN))
    const se = map.layerPointToLatLng(new Point(center.x + PIXEL_MARGIN, center.y + PIXEL_MARGIN))
    return bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])
  }

  /**
   * Determines if a click was within a marker's icon, which could potentially
   * extend far beyond our PIXEL_MARGIN from the marker's represened point
   */
  const isClickOnMarker = (clickPolygon, marker) => {
    const icon = marker.getIcon()
    const iconOptions = Object.assign({}, Object.getPrototypeOf(icon).options, icon.options)
    const markerPoint = map.containerPointToLayerPoint(
      map.latLngToContainerPoint(marker.getLatLng())
    )

    // We need an iconAnchor and iconSize to continue
    if (!_isArray(iconOptions.iconAnchor) || !_isArray(iconOptions.iconSize)) {
      return false
    }

    const nw = map.layerPointToLatLng(new Point(
      markerPoint.x - iconOptions.iconAnchor[0],
      markerPoint.y - iconOptions.iconAnchor[1]
    ))
    const se = map.layerPointToLatLng(new Point(
      markerPoint.x + (iconOptions.iconSize[0] - iconOptions.iconAnchor[0]),
      markerPoint.y + (iconOptions.iconSize[1] - iconOptions.iconAnchor[1])
    ))
    const markerPolygon = bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])

    return !booleanDisjoint(clickPolygon, markerPolygon)
  }

  useEffect(() => {
    if (props.animator) {
      props.animator.setAnimationFunction(animateFeatures)
    }

    if (props.noAttributionPrefix) {
      map.attributionControl.setPrefix(false)
    }

    // If there are geojson features, add them to the leaflet map and then
    // fit the map to the bounds of those features.
    if (props.fitToLayer) {
      fitBoundsToLayer()
    }

    // Setup event handlers for moveend and zoomend events if the parent
    // needs to be notified of changes to the map bounds.
    if (props.onBoundsChange) {
      map.on('zoomend', onZoomOrMoveEnd)
      map.on('moveend', onZoomOrMoveEnd)
      map.on('movestart', props.onZoomOrMoveStart)

      // Unless requested otherwise, invoke onBoundsChange for the initial
      // bounding box.
      if (props.onBoundsChange && props.setInitialBounds !== false) {
        props.onBoundsChange(map.getBounds(),
                                  map.getZoom())
      }
    }

    if (props.initialBounds && _isFinite(props.initialBounds.getNorth())) {
      map.fitBounds(props.initialBounds)
    }

    if (props.externalInteractive) {
      map.on('click', e => {
        const clickBounds = getClickPolygon(e)
        const candidateLayers = new Map()
        map.eachLayer(layer => {
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
                if ((featureLayer.getIcon && isClickOnMarker(clickBounds, featureLayer)) ||
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
              orderedFeatureLayers(intraLayerMatches).forEach(match => {
                candidateLayers.set(match.description, match)
              })
            }
          }
        })

        if (candidateLayers.size === 1) {
          candidateLayers.values().next().value.layer.fire('mr-external-interaction', {
            map: map,
            latlng: e.latlng,
          })
        }
        else if (candidateLayers.size > 1) {
          let layers = [...candidateLayers.entries()]
          if (props.overlayOrder && props.overlayOrder.length > 0) {
            layers = _sortBy(layers, layerEntry => {
              const position = props.overlayOrder.indexOf(layerEntry[1].mrLayerId)
              return position === -1 ? Number.MAX_SAFE_INTEGER : position
            })
          }

          popupLayerSelectionList(layers, e.latlng)
        }
      })
    }
  }, [])

  /**
   * Simple sorting of multiple related feature layers (such as all in a single map
   * layer) by geometry type into order of: points, lineStrings, surrounded polygons,
   * surrounding polygons. Each layer should be an object with a `geometry` field
   */
  const orderedFeatureLayers = (layers) => {
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

  const popupLayerSelectionList = (layers, latlng) => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <div className="mr-text-base mr-px-4 mr-links-blue-light">
        <h3>{props.intl.formatMessage(messages.layerSelectionHeader)}</h3>
        <ol>
          {layers.map(([description, layerInfo]) => {
            return (
                <IntlProvider
                              key={props.intl.locale} 
                              locale={props.intl.locale} 
                              messages={props.intl.messages}
                              textComponent="span" 
                >
                  <PropertyList
                    header={description}
                    featureProperties={_omit(layerInfo?.geometry?.properties, ['id', 'type'])}
                    onBack={() => popupLayerSelectionList(layers, latlng)}
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
    }).setLatLng(latlng).setContent(contentElement).openOn(map)
  }

  useEffect(() => {
    if (!props.prevCenter || !props.prevFitToLayer || !props.prevTaskBundle) {
      props = {...props, prevCenter: props.center, prevFitToLayer: props.fitToLayer, prevTaskBundle: props.taskBundle}
    }
  
    if (props.animator) {
      props.animator.setAnimationFunction(animateFeatures)
    }

    if (props.taskMarkers && noInitialBoundsSet && !props.initialBoundsSet && props.initialBounds && _isFinite(props.initialBounds.getNorth())) {
      setNoInitialBoundsSet(false)
      map.fitBounds(props.initialBounds)
    } else if (!_isEqual(props.center, props.prevCenter)) {
      fitBoundsToLayer()
      map.panTo(props.center)
    }

    if (!_isEqual(props.fitToLayer, props.prevFitToLayer) || props.taskBundle !== props.prevTaskBundle) {
      fitBoundsToLayer()
    }
  
    props.prevCenter = props.center
    props.prevFitToLayer = props.fitToLayer
    props.prevTaskBundle = props.taskBundle
    }, [props])
  
  useEffect(() => {
    return () => {
      if (props.animator) {
        props.animator.reset()
      }
  
      try {
        map.stop()
        map.off('zoomend', onZoomOrMoveEnd)
        map.off('moveend', onZoomOrMoveEnd)
        map.off('movestart', props.onZoomOrMoveStart)
      }
      catch(e) {} // Bad custom basemaps can cause problems when stopping Leaflet
    }
  }, [props.animator])

  return <>{props.children}</>
}

const EnhancedMap = (props) => {
  return (
    <MapContainer whenCreated={props.ref} center={props.center} zoom={props.zoom}>
      <Map {...props} />
    </MapContainer>
  )
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
  /** If given, will invoke a method when map is being moved */
  onZoomOrMoveStart: PropTypes.func,
  children: PropTypes.node.isRequired,
}

EnhancedMap.defaultProps = {
  center: latLng(0, 45),
  zoom: 13,
  ref: React.createRef(),
  setInitialBounds: true,
  justFitFeatures: false,
  onZoomOrMoveStart: _noop,
}

export default EnhancedMap
