import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, LayerGroup, Pane, MapContainer, useMap } from 'react-leaflet'
import { featureCollection } from '@turf/helpers'
import { coordAll } from '@turf/meta'
import { point } from '@turf/helpers'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _each from 'lodash/each'
import _sortBy from 'lodash/sortBy'
import _compact from 'lodash/compact'
import _flatten from 'lodash/flatten'
import _isEmpty from 'lodash/isEmpty'
import _clone from 'lodash/clone'
import _uniqueId from 'lodash/uniqueId'
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
import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM }
       from '../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import AsSimpleStyleableFeature
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import { supportedSimplestyles }
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import BusySpinner from '../../BusySpinner/BusySpinner'
import './TaskMap.scss'

const shortcutGroup = 'layers'

/**
 * TaskMap renders a map (and controls) appropriate for the given task,
 * including the various map-related features and configuration options set on
 * the task and its parent challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const TaskMapContainer = (props) => {
  const map = useMap()
  const [latestBounds, setLatestBounds] = useState(null)
  const animator = new MapAnimator()
const [showTaskFeatures, setShowTaskFeatures] = useState(true)
const [showOSMData, setShowOSMData] = useState(false)
const [showOSMElements, setShowOSMElements] = useState({
  nodes: true,
  ways: true,
  areas: true,
})
const [osmData, setOsmData] = useState(null)
const [osmDataLoading, setOsmDataLoading] = useState(null)
const [mapillaryViewerImage, setMapillaryViewerImage] = useState(null)
const [openStreetCamViewerImage, setOpenStreetCamViewerImage] = useState(null)
const [skipFit, setSkipFit] = useState(null)
const [latestZoom, setLatestZoom] = useState(null)
const [directionalityIndicators, setDirectionalityIndicators] = useState(null)

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

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * task features on or off.
   */
  const toggleTaskFeatureVisibility = () => {
    setShowTaskFeatures(!showTaskFeatures)
    setSkipFit(true)
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OSM data on or off.
   */
  const toggleOSMDataVisibility = () => {
    if (!showOSMData && !osmData && !osmDataLoading) {
      setOsmDataLoading(true)
      props.fetchOSMData(
        props.mapBounds.bounds.toBBoxString()
      ).then(xmlData => {
        // Indicate the map should skip fitting to bounds as the OSM data could
        // extend beyond the current view and we don't want the map to zoom out
        setOsmData(xmlData)
        setOsmDataLoading(false)
        setSkipFit(true)
      })
    }
    setShowOSMData(!showOSMData)
  }

  const toggleOSMElements = element => {
    const showOSMElements = _clone(showOSMElements)
    showOSMElements[element] = !showOSMElements[element]
    setShowOSMElements(showOSMElements)
  }

  /**
   * Ensures the OSM Data Layer is deactivated
   */
  const deactivateOSMDataLayer = () => {
    setShowOSMData(false)
    setOsmData(null)
    setOsmDataLoading(false)
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
        latestBounds ? latestBounds : props.mapBounds.bounds,
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
          latestBounds ? latestBounds : props.mapBounds.bounds,
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
        latestBounds ? latestBounds : props.mapBounds.bounds,
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
          latestBounds ? latestBounds : props.mapBounds.bounds,
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
  
    return () => {
      props.deactivateKeyboardShortcutGroup(shortcutGroup, handleKeyboardShortcuts);
    };
  }, []);

  useEffect(() => {
    loadMapillaryIfNeeded();
    loadOpenStreetCamIfNeeded();
  }, [props]);
  
  useEffect(() => {
    generateDirectionalityMarkers();
    
  }, [props.task.geometries]);

  useEffect(() => {
    deactivateOSMDataLayer()
    generateDirectionalityMarkers();
    
  }, [props.task.id]);

  useEffect(() => {
    return () => {
      props.deactivateKeyboardShortcutGroup(shortcutGroup, handleKeyboardShortcuts);
    };
  }, []);
  

  const updateTaskBounds = (bounds, zoom) => {
    setLatestBounds(bounds)
    setLatestZoom(zoom)

    // Don't update map bounds if this task is in the process of completing.
    // We don't want to risk sending updates on a stale task as this one gets
    // unloaded.
    if (props.task.id !== props.completingTask) {
      props.setTaskMapBounds(props.task.id, bounds, zoom, false)
      if (props.setWorkspaceContext) {
        props.setWorkspaceContext({
          taskMapTask: props.task,
          taskMapBounds: bounds,
          taskMapZoom: zoom
        })
      }
    }
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

  const generateDirectionalityMarkers = () => {
    const markers = []
    const allFeatures = taskFeatures()
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

  const renderMapillaryViewer = () => {
    return (
      <MapillaryViewer
        key={Date.now()}
        initialImageKey={mapillaryViewerImage}
        onClose={() => setMapillaryViewerImage(null)}
      />
    )
  }
    const zoom = _get(props.task, "parent.defaultZoom", DEFAULT_ZOOM)
    const minZoom = _get(props.task, "parent.minZoom", MIN_ZOOM)
    const maxZoom = _get(props.task, "parent.maxZoom", MAX_ZOOM)
    const renderId = _uniqueId()
    let overlayOrder = props.getUserAppSetting(props.user, 'mapOverlayOrder')
    if (_isEmpty(overlayOrder)) {
      overlayOrder = DEFAULT_OVERLAY_ORDER
    }

    animator.reset()

    if (!props.task || !_isObject(props.task.parent)) {
      return <BusySpinner />
    }

    let overlayLayers = buildLayerSources(
      props.visibleOverlays, _get(props, 'user.settings.customBasemaps'),
      (layerId, index, layerSource) => ({
        id: layerId,
        component: <SourcedTileLayer key={layerId} source={layerSource} mrLayerId={layerId} />,
      })
    )

    if (showTaskFeatures) {
      overlayLayers.push({
        id: "task-features",
        component: (
          <TaskFeatureLayer
            key="task-features"
            mrLayerId="task-features"
            features={applyStyling(taskFeatures())}
            animator={animator}
            externalInteractive
          />
        )
      })
    }

    if (props.showMapillaryLayer) {
      overlayLayers.push(mapillaryImageMarkers())
    }

    if (props.showOpenStreetCamLayer) {
      overlayLayers.push(openStreetCamImageMarkers())
    }

    if (showOSMData && osmData) {
      overlayLayers.push({
        id: "osm-data",
        component: (
          <OSMDataLayer
            key="osm-data"
            mrLayerId="osm-data"
            xmlData={osmData}
            zoom={_isFinite(latestZoom) ? latestZoom : zoom}
            showOSMElements={showOSMElements}
            animator={animator}
            externalInteractive
          />
        ),
      })
    }

    if (showTaskFeatures && !_isEmpty(directionalityIndicators)) {
      overlayLayers.push(directionalityIndicators)
    }

    // Sort the overlays according to the user's preferences. We then reverse
    // that order because the layer rendered on the map last will be on top
    if (overlayOrder && overlayOrder.length > 0) {
      overlayLayers = _sortBy(overlayLayers, layer => {
        const position = overlayOrder.indexOf(layer.id)
        return position === -1 ? Number.MAX_SAFE_INTEGER : position
      }).reverse()
    }

    // Note: we need to also pass maxZoom to the tile layer (in addition to the
    // map), or else leaflet won't autoscale if the zoom goes beyond the
    // capabilities of the layer.

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
          overlayOrder={overlayOrder}
        />
          <ZoomControl position='topright' />
          <FitBoundsControl features={props.features} />
          <SourcedTileLayer maxZoom={maxZoom} {...props} />
          {_map(overlayLayers, (layer, index) => (
            <Pane
              key={`pane-${renderId}-${index}`}
              name={`pane-${renderId}-${index}`}
              className="custom-pane"
            >
              {layer.component}
            </Pane>
          ))}

        {mapillaryViewerImage && renderMapillaryViewer()}

        {openStreetCamViewerImage &&
         <OpenStreetCamViewer
            key={Date.now()}
            images={props.openStreetCamImages}
            initialImageKey={openStreetCamViewerImage}
            onClose={() => setOpenStreetCamViewerImage(null)}
         />
        }
      </div>
    )
  }


const TaskMap = (props) => {
  return (
    <div className={classNames("task-map task", {"full-screen-map": props.isMobile})}>
      <MapContainer
        taskBundle={props.taskBundle}
        center={props.centerPoint}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <TaskMapContainer {...props} />
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
