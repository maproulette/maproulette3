import React, { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, LayerGroup, Pane, MapContainer, useMap, useMapEvents, AttributionControl } from 'react-leaflet'
import { featureCollection } from '@turf/helpers'
import { coordAll } from '@turf/meta'
import { point } from '@turf/helpers'
import _isObject from 'lodash/isObject'
import L from 'leaflet'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _each from 'lodash/each'
import _sortBy from 'lodash/sortBy'
import _compact from 'lodash/compact'
import _flatten from 'lodash/flatten'
import _isEmpty from 'lodash/isEmpty'
import _clone from 'lodash/clone'
import _omit from 'lodash/omit'
import { buildLayerSources, DEFAULT_OVERLAY_ORDER }
       from '../../../services/VisibleLayer/LayerSources'
import DirectionalIndicationMarker
       from '../../EnhancedMap/DirectionalIndicationMarker/DirectionalIndicationMarker'
import MapillaryViewer from '../../MapillaryViewer/MapillaryViewer'
import OpenStreetCamViewer from '../../OpenStreetCamViewer/OpenStreetCamViewer'
import SourcedTileLayer
       from '../../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import OSMDataLayer from '../../EnhancedMap/OSMDataLayer/OSMDataLayer'
import ImageMarkerLayer from '../../EnhancedMap/ImageMarkerLayer/ImageMarkerLayer'
import TaskFeatureLayer from '../../EnhancedMap/TaskFeatureLayer/TaskFeatureLayer'
import LayerToggle from '../../EnhancedMap/LayerToggle/LayerToggle'
import FitBoundsControl
       from '../../EnhancedMap/FitBoundsControl/FitBoundsControl'
import MapAnimator from '../../EnhancedMap/MapAnimator/MapAnimator'
import WithTaskCenterPoint
       from '../../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithSearch from '../../HOCs/WithSearch/WithSearch'
import WithIntersectingOverlays
       from '../../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithVisibleLayer from '../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithKeyboardShortcuts
       from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import WithMapillaryImages from '../../HOCs/WithMapillaryImages/WithMapillaryImages'
import WithOpenStreetCamImages
       from '../../HOCs/WithOpenStreetCamImages/WithOpenStreetCamImages'
import { MAX_ZOOM, DEFAULT_ZOOM }
       from '../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import AsSimpleStyleableFeature
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import { supportedSimplestyles }
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import BusySpinner from '../../BusySpinner/BusySpinner'
import './TaskMap.scss'
import booleanDisjoint from '@turf/boolean-disjoint'
import AsIdentifiableFeature from '../../../interactions/TaskFeature/AsIdentifiableFeature'
import messages from './Messages'
import { IntlProvider } from 'react-intl'
import PropertyList from '../../EnhancedMap/PropertyList/PropertyList'
import { orderedFeatureLayers, animateFeatures, getClickPolygon, isClickOnMarker } from './helperFunctions'

const shortcutGroup = 'layers'

/**
 * TaskMap renders a map (and controls) appropriate for the given task,
 * including the various map-related features and configuration options set on
 * the task and its parent challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const TaskMapContent = (props) => {
  const map = useMap()
  const [showTaskFeatures, setShowTaskFeatures] = useState(true)
  const [showOSMData, setShowOSMData] = useState(false)
  const [osmData, setOsmData] = useState(null)
  const [osmDataLoading, setOsmDataLoading] = useState(null)
  const [mapillaryViewerImage, setMapillaryViewerImage] = useState(null)
  const [openStreetCamViewerImage, setOpenStreetCamViewerImage] = useState(null)
  const [directionalityIndicators, setDirectionalityIndicators] = useState({})
  const [showOSMElements, setShowOSMElements] = useState({ nodes: true, ways: true, areas: true })
  const taskFeatures = () => {
    if (_get(props, 'taskBundle.tasks.length', 0) > 0) {
      return featureCollection(
        _flatten(_compact(_map(props.taskBundle.tasks,
                               task => _get(task, 'geometries.features'))))
      ).features
    }

    // If current OSM data is available, show the feature's current OSM tags
    // instead of those bundled with the GeoJSON. We preserve any simplestyle
    // properties, allowing display colors and what not to be customized
    if (_get(props, 'osmElements.size', 0) > 0) {
      return AsMappableTask(props.task).featuresWithTags(
        _get(props.task, 'geometries.features'),
        props.osmElements,
        true,
        supportedSimplestyles,
      )
    }

    return _get(props.task, 'geometries.features')
  }
  const features = taskFeatures()
  const animator = new MapAnimator()

  useMapEvents({
    moveend: () => {
      if (props.task.id !== props.completingTask) {
        const bounds = map.getBounds()
        const zoom = map.getZoom()
        props.setTaskMapBounds(props.task.id, bounds, zoom, false)
        if (props.setWorkspaceContext) {
          props.setWorkspaceContext({
            taskMapTask: props.task,
            taskMapBounds: bounds,
            taskMapZoom: zoom
          })
        }
      }
    },
  })

   /** Process keyboard shortcuts for the layers */
  const handleKeyboardShortcuts = event => {
    // Ignore if shortcut group is not active
    if (_isEmpty(props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    // Ignore if modifier keys were pressed
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return
    }
    
    const layerShortcuts = props.keyboardShortcutGroups[shortcutGroup]
    switch(event.key) {
      case layerShortcuts.layerOSMData.key:
        toggleOSMDataVisibility()
        break
      case layerShortcuts.layerTaskFeatures.key:
        toggleTaskFeatureVisibility()
        break
      case layerShortcuts.layerMapillary.key:
        toggleMapillaryVisibility()
        break
      default:
    }
  }

  const popupLayerSelectionList = (layers, latlng) => {
    const contentElement = document.createElement('div')
    contentElement.style.maxHeight = '300px';
    ReactDOM.render(
      <div className="mr-text-base mr-px-4 mr-links-blue-light">
        <h3>{props.intl.formatMessage(messages.layerSelectionHeader)}</h3>
        <ol>
          {layers.map(([description, layerInfo], index) => {
            return (
              <IntlProvider
                key={`${description}-${index}`}  // Ensure unique key for each item
                locale={props.intl.locale}
                messages={props.intl.messages}
                textComponent="span"
              >
                <PropertyList
                  header={description}
                  featureProperties={_omit(layerInfo?.geometry?.properties, ['id', 'type'])}
                />
              </IntlProvider>
            );
          })}
        </ol>
      </div>,
      contentElement
    );
    
    L.popup({
      closeOnEscapeKey: false, // Otherwise our links won't get a onMouseLeave event
    }).setLatLng(latlng).setContent(contentElement).openOn(map)
  }
  
  const handleMapClick = (e) => {
    const clickBounds = getClickPolygon(e, map)
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
            if ((featureLayer.getIcon && isClickOnMarker(clickBounds, featureLayer, map)) ||
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
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * task features on or off.
   */
  const toggleTaskFeatureVisibility = () => {
    setShowTaskFeatures(prevState => !prevState);
  }

  const fetchOSMData = () => {
    setOsmDataLoading(true)
    props.fetchOSMData(
      map.getBounds().toBBoxString()
    ).then(xmlData => {
      // Indicate the map should skip fitting to bounds as the OSM data could
      // extend beyond the current view and we don't want the map to zoom out
      setOsmData(xmlData)
      setOsmDataLoading(false)
    })
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OSM data on or off.
   */
  const toggleOSMDataVisibility = () => {
    if (!showOSMData && !osmData && !osmDataLoading) {
      setOsmDataLoading(true)
      fetchOSMData()
    }
    setShowOSMData(!showOSMData)
    setOsmDataLoading(false)
  }

  const toggleOSMElements = element => {
    const newShowOSMElements = _clone(showOSMElements)
    newShowOSMElements[element] = !showOSMElements[element]
    setShowOSMElements(newShowOSMElements)
  }
  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * Mapillary markers on or off.
   */
  const toggleMapillaryVisibility = async () => {
    const isVirtual = _isFinite(props.virtualChallengeId)
    const challengeId = isVirtual ? props.virtualChallengeId :
                                    props.challenge.id
    // If enabling layer, fetch fresh data. This allows users to toggle the
    // layer off and on to refresh the data, e.g. if they have moved the map
    // and wish to expand coverage of mapillary imagery
    if (!props.showMapillaryLayer) {
      props.setShowMapillaryLayer(challengeId, isVirtual, true)
      await props.fetchMapillaryImagery(
        map.getBounds(),
        props.task
      )
    }
    else {
      props.setShowMapillaryLayer(challengeId, isVirtual, !props.showMapillaryLayer)
    }
  }

  /**
   * Reloads the task data with mapillary image info requested if needed
   */
  const loadMapillaryIfNeeded = async () => {
    // If we're supposed to show mapillary images but don't have them for
    // this task, go ahead and fetch them
    if (props.task && props.showMapillaryLayer) {
      if (props.mapillaryTaskId !== props.taskId ||
          (!props.mapillaryImages && !props.mapillaryLoading)) {
        await props.fetchMapillaryImagery(
          map.getBounds(),
          props.task
        )
      }
    }
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OpenStreetCam markers on or off.
   */
  const toggleOpenStreetCamVisibility = async () => {
    const isVirtual = _isFinite(props.virtualChallengeId)
    const challengeId = isVirtual ? props.virtualChallengeId :
                                    props.challenge.id
    // If enabling layer, fetch fresh data. This allows users to toggle the
    // layer off and on to refresh the data, e.g. if they have moved the map
    // and wish to expand coverage of OpenStreetCam imagery
    if (!props.showOpenStreetCamLayer) {
      props.setShowOpenStreetCamLayer(challengeId, isVirtual, true)
      await props.fetchOpenStreetCamImagery(
        map.getBounds(),
        props.task
      )
    }
    else {
      props.setShowOpenStreetCamLayer(challengeId, isVirtual, !props.showOpenStreetCamLayer)
    }
  }

  /**
   * Reloads the task data with OpenStreetCam image info requested if needed
   */
  const loadOpenStreetCamIfNeeded = async () => {
    // If we're supposed to show openStreetCam images but don't have them for
    // this task, go ahead and fetch them
    if (props.task && props.showOpenStreetCamLayer) {
      if (props.openStreetCamTaskId !== props.taskId ||
          (!props.openStreetCamImages && !props.openStreetCamLoading)) {
        await props.fetchOpenStreetCamImagery(
          map.getBounds(),
          props.task
        )
      }
    }
  }

  useEffect(() => {
    props.activateKeyboardShortcutGroup(
      _pick(props.keyboardShortcutGroups, shortcutGroup),
      handleKeyboardShortcuts
    );
  
    loadMapillaryIfNeeded();
    loadOpenStreetCamIfNeeded();
    generateDirectionalityMarkers();
    animator.setAnimationFunction(animateFeatures)

    map.on('click', handleMapClick)
  
    return () => {
      props.deactivateKeyboardShortcutGroup(shortcutGroup, handleKeyboardShortcuts);
      animator.reset()
      map.off('click', handleMapClick)
    };
  }, []);

  useEffect(() => {
    setOsmData(null)
  }, [props.task.id, props.task.geometries])

  useEffect(() => {
    loadMapillaryIfNeeded();
    loadOpenStreetCamIfNeeded();
    animator.setAnimationFunction(animateFeatures)
    if (showOSMData && !osmData) {
      fetchOSMData()
    }
  }, [props, osmData]);

  useEffect(() => {
    if (features.length !== 0) {
      const layerGroup = L.featureGroup(
        features.map(feature => L.geoJSON(feature))
      );
      map.fitBounds(layerGroup.getBounds().pad(0.2));
    }
    map.closePopup()
  }, [props.taskBundle, props.taskId]);

  const generateDirectionalityMarkers = () => {
    const markers = []
    const allFeatures = features
    _each(allFeatures, (feature, featureIndex) => {
      if (!feature.properties || !feature.properties.oneway) {
        return
      }

      const styles =
        AsSimpleStyleableFeature(feature, _get(props, 'challenge.taskStyles')).getFinalLayerStyles()
      const coords = coordAll(feature)
      if (["yes", "true", "1"].indexOf(feature.properties.oneway) !== -1) {
        for (let i = 0; i < coords.length - 1; i++) {
          markers.push(
            <DirectionalIndicationMarker
              key={`directional-marker-${props.task.id}-${featureIndex}-${i}`}
              betweenPoints={[point(coords[i]), point(coords[i + 1])]}
              atMidpoint
              styles={styles}
            />
          )
        }
      }
      else if (["-1", "reverse"].indexOf(feature.properties.oneway) !== -1) {
        for (let i = coords.length - 1; i > 0; i--) {
          markers.push(
            <DirectionalIndicationMarker
              key={`directional-marker-${props.task.id}-${featureIndex}-${i}`}
              betweenPoints={[point(coords[i]), point(coords[i - 1])]}
              atMidpoint
              styles={styles}
            />
          )
        }
      }
    })

    setDirectionalityIndicators({
      id: "directionality-indicators",
      component: <LayerGroup key="directionality-indicators">{markers}</LayerGroup>,
    })
  }

  const mapillaryImageMarkers = () => {
    return {
      id: "mapillary",
      component: (
        <ImageMarkerLayer
          key="mapillary"
          mrLayerId="mapillary"
          mrLayerLabel="Mapillary"
          images={props.mapillaryImages}
          markerColor="#39AF64"
          imageClicked={imageKey => setMapillaryViewerImage(imageKey)}
          imageAlt="Mapillary"
        />
      ),
    }
  }

  const openStreetCamImageMarkers = () => ({
    id: "openstreetcam",
    component: (
      <ImageMarkerLayer
        key="openstreetcam"
        mrLayerId="openstreetcam"
        mrLayerLabel="OpenStreetCam"
        images={props.openStreetCamImages}
        markerColor="#C851E0"
        imageClicked={imageKey => setOpenStreetCamViewerImage(imageKey)}
        imageAlt="OpenStreetCam"
      />
    ),
  })

  const applyStyling = taskFeatures => {
    // If the challenge has conditional styles, apply those
    const conditionalStyles = _get(props, 'challenge.taskStyles')
    if (conditionalStyles) {
      return _map(
        taskFeatures,
        feature => AsSimpleStyleableFeature(feature, conditionalStyles)
      )
    }

    // Otherwise just give back the features as-is
    return taskFeatures
  }

  const sortOverlayLayers = (layers) => {
    let overlayOrder = props.getUserAppSetting(props.user, 'mapOverlayOrder')
    if (_isEmpty(overlayOrder)) {
      overlayOrder = DEFAULT_OVERLAY_ORDER
    }

    // Sort the overlays according to the user's preferences. We then reverse
    // that order because the layer rendered on the map last will be on top
    if (overlayOrder && overlayOrder.length > 0) {
      return _sortBy(layers, layer => {
        const position = overlayOrder.indexOf(layer.id)
        return position === -1 ? Number.MAX_SAFE_INTEGER : position
      }).reverse()
    }

    return layers
  }

  const maxZoom = _get(props.task, "parent.maxZoom", MAX_ZOOM)
  
  const renderMapillaryViewer = () => {
    return (
      <MapillaryViewer
        key={Date.now()}
        initialImageKey={mapillaryViewerImage}
        onClose={() => setMapillaryViewerImage(null)}
      />
    )
  }

  const taskFeatureLayer = useMemo(() => {
    return {
      id: "task-features",
      component: (
        <TaskFeatureLayer
          key="task-features"
          mrLayerId="task-features"
          features={applyStyling(features)}
          animator={animator}
          externalInteractive
        />
      )
    }
  }, [props.taskBundle, props.taskId]);

  const overlayLayers = () => {
    let layers = buildLayerSources(
      props.visibleOverlays, _get(props, 'user.settings.customBasemaps'),
      (layerId, index, layerSource) => ({
        id: layerId,
        component: <SourcedTileLayer key={layerId} source={layerSource} mrLayerId={layerId} />,
      })
    )

    if (showTaskFeatures) {
      layers.push(taskFeatureLayer);
    }

    if (props.showMapillaryLayer) {
      layers.push(mapillaryImageMarkers())
    }

    if (props.showOpenStreetCamLayer) {
      layers.push(openStreetCamImageMarkers())
    }

    if (showOSMData && osmData) {
      layers.push({
        id: "osm-data",
        component: (
          <OSMDataLayer
            key="osm-data"
            mrLayerId="osm-data"
            xmlData={osmData}
            zoom={map.getZoom()}
            showOSMElements={showOSMElements}
            animator={animator}
            externalInteractive
          />
        ),
      })
    }

    if (showTaskFeatures && !_isEmpty(directionalityIndicators)) {
      layers.push(directionalityIndicators)
    }

    return sortOverlayLayers(layers)
  }

  if (!props.task || !_isObject(props.task.parent)) {
    return <BusySpinner />
  }

  return (
    <div className={classNames("task-map task", {"full-screen-map": props.isMobile})}>
      <LayerToggle
        {...props}
        showTaskFeatures={showTaskFeatures}
        toggleTaskFeatures={toggleTaskFeatureVisibility}
        showOSMData={showOSMData}
        toggleOSMData={toggleOSMDataVisibility}
        showOSMElements={showOSMElements}
        toggleOSMElements={toggleOSMElements}
        osmDataLoading={osmDataLoading}
        toggleMapillary={props.isMapillaryEnabled() ? toggleMapillaryVisibility : undefined}
        showMapillary={props.showMapillaryLayer}
        mapillaryCount={_get(props, 'mapillaryImages.length', 0)}
        toggleOpenStreetCam={props.isOpenStreetCamEnabled() ? toggleOpenStreetCamVisibility : undefined}
        showOpenStreetCam={props.showOpenStreetCamLayer}
        openStreetCamCount={_get(props, 'openStreetCamImages.length', 0)}
        overlayOrder={props.getUserAppSetting(props.user, 'mapOverlayOrder')}
      />
      <ZoomControl position='topright' />
      <FitBoundsControl features={features} />
      <SourcedTileLayer maxZoom={maxZoom} {...props} />
      {overlayLayers().map((layer, index) => (
        <Pane key={`pane-${index}`} name={`pane-${index}`} style={{zIndex: 10 + index}} className="custom-pane">
          {layer.component}
        </Pane>
      ))}
      {mapillaryViewerImage && renderMapillaryViewer()}
      {openStreetCamViewerImage && <OpenStreetCamViewer key={Date.now()} images={props.openStreetCamImages} initialImageKey={openStreetCamViewerImage} onClose={() => setOpenStreetCamViewerImage(null)} />}
    </div>
  )
}

const TaskMap = (props) => {
  const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [map]);
    return null;
  };

  return (
    <div className={classNames("task-map task", {"full-screen-map": props.isMobile})}>
      <MapContainer
        taskBundle={props.taskBundle}
        center={props.centerPoint}
        zoomControl={false}
        zoom={DEFAULT_ZOOM}
        minZoom={2}
        maxZoom={MAX_ZOOM}
        attributionControl={false}
        maxBounds={[[-90, -180], [90, 180]]} 
      >
        <ResizeMap />
        <AttributionControl position="bottomleft" prefix={false} />
        <TaskMapContent {...props} />
      </MapContainer>
    </div>
  );
};

TaskMap.propTypes = {
  taskBundle: PropTypes.object,
  centerPoint: PropTypes.object.isRequired,
};

TaskMap.propTypes = {
  /** The task for which to display the map */
  task: PropTypes.object,
  /** Invoked when the bounds of the map are modified by the user */
  setTaskMapBounds: PropTypes.func.isRequired,
  /**
   * The desired centerpoint of the map in (Lat, Lng).
   * @see See WithTaskCenterpoint HOC
   */
  centerPoint: PropTypes.object.isRequired,
}

export default WithSearch(
  WithMapillaryImages(
    WithOpenStreetCamImages(
      WithTaskCenterPoint(
        WithVisibleLayer(
          WithIntersectingOverlays(
            WithKeyboardShortcuts(TaskMap),
            'task'
          )
        )
      ),
    ),
  ),
  'task'
)