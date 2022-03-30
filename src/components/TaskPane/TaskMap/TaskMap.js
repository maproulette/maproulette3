import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, LayerGroup, Pane } from 'react-leaflet'
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
import EnhancedMap from '../../EnhancedMap/EnhancedMap'
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
export class TaskMap extends Component {
  latestBounds = null // track latest map bounds without causing rerender
  animator = new MapAnimator()

  state = {
    showTaskFeatures: true,
    showOSMData: false,
    showOSMElements: {
      nodes: true,
      ways: true,
      areas: true,
    },
    osmData: null,
    osmDataLoading: false,
    mapillaryViewerImage: null,
    openStreetCamViewerImage: null,
    skipFit: false,
    latestZoom: null,
    directionalityIndicators: {},
  }

  /** Process keyboard shortcuts for the layers */
  handleKeyboardShortcuts = event => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const layerShortcuts = this.props.keyboardShortcutGroups[shortcutGroup]
    switch(event.key) {
      case layerShortcuts.layerOSMData.key:
        this.toggleOSMDataVisibility()
        break
      case layerShortcuts.layerTaskFeatures.key:
        this.toggleTaskFeatureVisibility()
        break
      case layerShortcuts.layerMapillary.key:
        this.toggleMapillaryVisibility()
        break
      default:
    }
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * task features on or off.
   */
  toggleTaskFeatureVisibility = () => {
    this.setState({showTaskFeatures: !this.state.showTaskFeatures, skipFit: true})
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OSM data on or off.
   */
  toggleOSMDataVisibility = () => {
    if (!this.state.showOSMData && !this.state.osmData && !this.state.osmDataLoading) {
      this.setState({osmDataLoading: true})
      this.props.fetchOSMData(
        this.props.mapBounds.bounds.toBBoxString()
      ).then(xmlData => {
        // Indicate the map should skip fitting to bounds as the OSM data could
        // extend beyond the current view and we don't want the map to zoom out
        this.setState({osmData: xmlData, osmDataLoading: false, skipFit: true})
      })
    }
    this.setState({showOSMData: !this.state.showOSMData})
  }

  toggleOSMElements = element => {
    const showOSMElements = _clone(this.state.showOSMElements)
    showOSMElements[element] = !showOSMElements[element]
    this.setState({showOSMElements})
  }

  /**
   * Ensures the OSM Data Layer is deactivated
   */
  deactivateOSMDataLayer = () => {
    this.setState({showOSMData: false, osmData: null, osmDataLoading: false})
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * Mapillary markers on or off.
   */
  toggleMapillaryVisibility = async () => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challenge.id
    // If enabling layer, fetch fresh data. This allows users to toggle the
    // layer off and on to refresh the data, e.g. if they have moved the map
    // and wish to expand coverage of mapillary imagery
    if (!this.props.showMapillaryLayer) {
      this.props.setShowMapillaryLayer(challengeId, isVirtual, true)
      await this.props.fetchMapillaryImagery(
        this.latestBounds ? this.latestBounds : this.props.mapBounds.bounds,
        this.props.task
      )
    }
    else {
      this.props.setShowMapillaryLayer(challengeId, isVirtual, !this.props.showMapillaryLayer)
    }
  }

  /**
   * Reloads the task data with mapillary image info requested if needed
   */
  loadMapillaryIfNeeded = async () => {
    // If we're supposed to show mapillary images but don't have them for
    // this task, go ahead and fetch them
    if (this.props.task && this.props.showMapillaryLayer) {
      if (this.props.mapillaryTaskId !== this.props.taskId ||
          (!this.props.mapillaryImages && !this.props.mapillaryLoading)) {
        await this.props.fetchMapillaryImagery(
          this.latestBounds ? this.latestBounds : this.props.mapBounds.bounds,
          this.props.task
        )
      }
    }
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OpenStreetCam markers on or off.
   */
  toggleOpenStreetCamVisibility = async () => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challenge.id
    // If enabling layer, fetch fresh data. This allows users to toggle the
    // layer off and on to refresh the data, e.g. if they have moved the map
    // and wish to expand coverage of OpenStreetCam imagery
    if (!this.props.showOpenStreetCamLayer) {
      this.props.setShowOpenStreetCamLayer(challengeId, isVirtual, true)
      await this.props.fetchOpenStreetCamImagery(
        this.latestBounds ? this.latestBounds : this.props.mapBounds.bounds,
        this.props.task
      )
    }
    else {
      this.props.setShowOpenStreetCamLayer(challengeId, isVirtual, !this.props.showOpenStreetCamLayer)
    }
  }

  /**
   * Reloads the task data with OpenStreetCam image info requested if needed
   */
  loadOpenStreetCamIfNeeded = async () => {
    // If we're supposed to show openStreetCam images but don't have them for
    // this task, go ahead and fetch them
    if (this.props.task && this.props.showOpenStreetCamLayer) {
      if (this.props.openStreetCamTaskId !== this.props.taskId ||
          (!this.props.openStreetCamImages && !this.props.openStreetCamLoading)) {
        await this.props.fetchOpenStreetCamImagery(
          this.latestBounds ? this.latestBounds : this.props.mapBounds.bounds,
          this.props.task
        )
      }
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, shortcutGroup),
      this.handleKeyboardShortcuts)

    this.loadMapillaryIfNeeded()
    this.loadOpenStreetCamIfNeeded()
    this.generateDirectionalityMarkers()
  }

  componentDidUpdate(prevProps) {
    this.loadMapillaryIfNeeded()
    this.loadOpenStreetCamIfNeeded()

    if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
      this.deactivateOSMDataLayer()
      this.setState({skipFit: false})
      this.generateDirectionalityMarkers()
    }
    else if (!_isEqual(_get(prevProps, 'task.geometries'), _get(this.props, 'task.geometries'))) {
      this.generateDirectionalityMarkers()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to avoid constantly re-rendering, so we only re-render if the
    // task or our internal state changes. We care about changes to the task
    // id, its geometries, layer options, and a few settings on the parent
    // challenge.
    if (nextState.showTaskFeatures !== this.state.showTaskFeatures ||
        nextState.directionalityIndicators !== this.state.directionalityIndicators) {
      return true
    }

    if (nextState.showOSMData !== this.state.showOSMData ||
        nextState.osmDataLoading !== this.state.osmDataLoading ||
        nextState.osmData !== this.state.osmData ||
        !_isEqual(nextState.showOSMElements, this.state.showOSMElements)) {
      return true
    }

    if (nextState.latestZoom !== this.state.latestZoom) {
      return true
    }

    if (nextProps.showMapillaryLayer !== this.props.showMapillaryLayer ||
        nextProps.mapillaryLoading !== this.props.mapillaryLoading ||
        nextProps.mapillaryTaskId !== this.props.mapillaryTaskId ||
        nextState.mapillaryViewerImage !== this.state.mapillaryViewerImage) {
      return true
    }

    if (nextProps.showOpenStreetCamLayer !== this.props.showOpenStreetCamLayer ||
        nextProps.openStreetCamLoading !== this.props.openStreetCamLoading ||
        nextProps.openStreetCamTaskId !== this.props.openStreetCamTaskId ||
        nextState.openStreetCamViewerImage !== this.state.openStreetCamViewerImage) {
      return true
    }

    if (!_isEqual(this.props.getUserAppSetting(nextProps.user, 'mapOverlayOrder'),
                  this.props.getUserAppSetting(this.props.user, 'mapOverlayOrder'))) {
      return true
    }

    if (!_isEqual(_get(nextProps, 'taskBundle.taskIds'),
                  _get(this.props, 'taskBundle.taskIds'))) {
      return true
    }

    if(_get(nextProps, 'task.id') !== _get(this.props, 'task.id')) {
      return true
    }

    if(_get(nextProps, 'mapillaryImages.length') !==
       _get(this.props, 'mapillaryImages.length')) {
      return true
    }

    if(_get(nextProps, 'openStreetCamImages.length') !==
       _get(this.props, 'openStreetCamImages.length')) {
      return true
    }

    if (_get(nextProps, 'source.id') !== _get(this.props, 'source.id')) {
      return true
    }

    if (!_isEqual(nextProps.intersectingOverlays, this.props.intersectingOverlays)) {
      return true
    }

    if (nextProps.visibleOverlays.length !== this.props.visibleOverlays.length) {
      return true
    }

    if (_get(nextProps, 'task.parent.defaultZoom') !==
        _get(this.props, 'task.parent.defaultZoom')) {
      return true
    }

    if (_get(nextProps, 'task.geometries') !==
        _get(this.props, 'task.geometries')) {
      // Do a deep comparison to make sure geometries really changed
      if (!_isEqual(_get(nextProps, 'task.geometries'),
                    _get(this.props, 'task.geometries'))) {
        return true
      }
    }

    if (nextProps.loadingOSMData !== this.props.loadingOSMData) {
      return true
    }

    if (!_isEqual(nextProps.activeKeyboardShortcuts, this.props.activeKeyboardShortcuts)) {
      return true
    }

    return false
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup(shortcutGroup,
                                               this.handleKeyboardShortcuts)
  }

  updateTaskBounds = (bounds, zoom) => {
    this.latestBounds = bounds
    this.setState({latestZoom: zoom})

    // Don't update map bounds if this task is in the process of completing.
    // We don't want to risk sending updates on a stale task as this one gets
    // unloaded.
    if (this.props.task.id !== this.props.completingTask) {
      this.props.setTaskMapBounds(this.props.task.id, bounds, zoom, false)
      if (this.props.setWorkspaceContext) {
        this.props.setWorkspaceContext({
          taskMapTask: this.props.task,
          taskMapBounds: bounds,
          taskMapZoom: zoom
        })
      }
    }
  }

  mapillaryImageMarkers = () => {
    return {
      id: "mapillary",
      component: (
        <ImageMarkerLayer
          key="mapillary"
          mrLayerId="mapillary"
          mrLayerLabel="Mapillary"
          images={this.props.mapillaryImages}
          markerColor="#39AF64"
          imageClicked={imageKey => this.setState({"mapillaryViewerImage": imageKey})}
          imageAlt="Mapillary"
        />
      ),
    }
  }

  openStreetCamImageMarkers = () => ({
    id: "openstreetcam",
    component: (
      <ImageMarkerLayer
        key="openstreetcam"
        mrLayerId="openstreetcam"
        mrLayerLabel="OpenStreetCam"
        images={this.props.openStreetCamImages}
        markerColor="#C851E0"
        imageClicked={imageKey => this.setState({"openStreetCamViewerImage": imageKey})}
        imageAlt="OpenStreetCam"
      />
    ),
  })

  generateDirectionalityMarkers = () => {
    const markers = []
    const allFeatures = this.taskFeatures()
    _each(allFeatures, (feature, featureIndex) => {
      if (!feature.properties || !feature.properties.oneway) {
        return
      }

      const styles =
        AsSimpleStyleableFeature(feature, _get(this.props, 'challenge.taskStyles')).getFinalLayerStyles()
      const coords = coordAll(feature)
      if (["yes", "true", "1"].indexOf(feature.properties.oneway) !== -1) {
        for (let i = 0; i < coords.length - 1; i++) {
          markers.push(
            <DirectionalIndicationMarker
              key={`directional-marker-${this.props.task.id}-${featureIndex}-${i}`}
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
              key={`directional-marker-${this.props.task.id}-${featureIndex}-${i}`}
              betweenPoints={[point(coords[i]), point(coords[i - 1])]}
              atMidpoint
              styles={styles}
            />
          )
        }
      }
    })

    this.setState({
      directionalityIndicators: {
        id: "directionality-indicators",
        component: <LayerGroup key="directionality-indicators">{markers}</LayerGroup>,
      }
    })
  }

  taskFeatures = () => {
    if (_get(this.props, 'taskBundle.tasks.length', 0) > 0) {
      return featureCollection(
        _flatten(_compact(_map(this.props.taskBundle.tasks,
                               task => _get(task, 'geometries.features'))))
      ).features
    }

    // If current OSM data is available, show the feature's current OSM tags
    // instead of those bundled with the GeoJSON. We preserve any simplestyle
    // properties, allowing display colors and what not to be customized
    if (_get(this.props, 'osmElements.size', 0) > 0) {
      return AsMappableTask(this.props.task).featuresWithTags(
        _get(this.props.task, 'geometries.features'),
        this.props.osmElements,
        true,
        supportedSimplestyles,
      )
    }

    return _get(this.props.task, 'geometries.features')
  }

  applyStyling = taskFeatures => {
    // If the challenge has conditional styles, apply those
    const conditionalStyles = _get(this.props, 'challenge.taskStyles')
    if (conditionalStyles) {
      return _map(
        taskFeatures,
        feature => AsSimpleStyleableFeature(feature, conditionalStyles)
      )
    }

    // Otherwise just give back the features as-is
    return taskFeatures
  }

  renderMapillaryViewer = () => {
    return (
      <MapillaryViewer
        key={Date.now()}
        initialImageKey={this.state.mapillaryViewerImage}
        onClose={() => this.setState({mapillaryViewerImage: null})}
      />
    )
  }

  render() {
    const zoom = _get(this.props.task, "parent.defaultZoom", DEFAULT_ZOOM)
    const minZoom = _get(this.props.task, "parent.minZoom", MIN_ZOOM)
    const maxZoom = _get(this.props.task, "parent.maxZoom", MAX_ZOOM)
    const renderId = _uniqueId()
    let overlayOrder = this.props.getUserAppSetting(this.props.user, 'mapOverlayOrder')
    if (_isEmpty(overlayOrder)) {
      overlayOrder = DEFAULT_OVERLAY_ORDER
    }

    this.animator.reset()

    if (!this.props.task || !_isObject(this.props.task.parent)) {
      return <BusySpinner />
    }

    let overlayLayers = buildLayerSources(
      this.props.visibleOverlays, _get(this.props, 'user.settings.customBasemaps'),
      (layerId, index, layerSource) => ({
        id: layerId,
        component: <SourcedTileLayer key={layerId} source={layerSource} mrLayerId={layerId} />,
      })
    )

    if (this.state.showTaskFeatures) {
      overlayLayers.push({
        id: "task-features",
        component: (
          <TaskFeatureLayer
            key="task-features"
            mrLayerId="task-features"
            features={this.applyStyling(this.taskFeatures())}
            animator={this.animator}
            externalInteractive
          />
        )
      })
    }

    if (this.props.showMapillaryLayer) {
      overlayLayers.push(this.mapillaryImageMarkers())
    }

    if (this.props.showOpenStreetCamLayer) {
      overlayLayers.push(this.openStreetCamImageMarkers())
    }

    if (this.state.showOSMData && this.state.osmData) {
      overlayLayers.push({
        id: "osm-data",
        component: (
          <OSMDataLayer
            key="osm-data"
            mrLayerId="osm-data"
            xmlData={this.state.osmData}
            zoom={_isFinite(this.state.latestZoom) ? this.state.latestZoom : zoom}
            showOSMElements={this.state.showOSMElements}
            animator={this.animator}
            externalInteractive
          />
        ),
      })
    }

    if (this.state.showTaskFeatures && !_isEmpty(this.state.directionalityIndicators)) {
      overlayLayers.push(this.state.directionalityIndicators)
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
      <div className={classNames("task-map task", {"full-screen-map": this.props.isMobile})}>
        <LayerToggle
          {...this.props}
          showTaskFeatures={this.state.showTaskFeatures}
          toggleTaskFeatures={this.toggleTaskFeatureVisibility}
          showOSMData={this.state.showOSMData}
          toggleOSMData={this.toggleOSMDataVisibility}
          showOSMElements={this.state.showOSMElements}
          toggleOSMElements={this.toggleOSMElements}
          osmDataLoading={this.state.osmDataLoading}
          toggleMapillary={this.props.isMapillaryEnabled() ? this.toggleMapillaryVisibility : undefined}
          showMapillary={this.props.showMapillaryLayer}
          mapillaryCount={_get(this.props, 'mapillaryImages.length', 0)}
          toggleOpenStreetCam={this.props.isOpenStreetCamEnabled() ? this.toggleOpenStreetCamVisibility : undefined}
          showOpenStreetCam={this.props.showOpenStreetCamLayer}
          openStreetCamCount={_get(this.props, 'openStreetCamImages.length', 0)}
          overlayOrder={overlayOrder}
        />
        <EnhancedMap
          center={this.props.centerPoint}
          zoom={zoom}
          zoomControl={false}
          minZoom={minZoom}
          maxZoom={maxZoom}
          worldCopyJump={true}
          fitToLayer={this.state.skipFit ? null : 'task-features'}
          fitBoundsOnlyAsNecessary
          animator={this.animator}
          onBoundsChange={this.updateTaskBounds}
          conditionalStyles={_get(this.props, 'challenge.taskStyles')}
          externalInteractive
          overlayOrder={overlayOrder}
        >
          <ZoomControl position='topright' />
          <FitBoundsControl />
          <SourcedTileLayer maxZoom={maxZoom} {...this.props} />
          {_map(overlayLayers, (layer, index) => (
            <Pane
              key={`pane-${renderId}-${index}`}
              name={`pane-${index}`}
              style={{zIndex: 10 + index}}
              className="custom-pane"
            >
              {layer.component}
            </Pane>
          ))}
        </EnhancedMap>

        {this.state.mapillaryViewerImage && this.renderMapillaryViewer()}

        {this.state.openStreetCamViewerImage &&
         <OpenStreetCamViewer
            key={Date.now()}
            images={this.props.openStreetCamImages}
            initialImageKey={this.state.openStreetCamViewerImage}
            onClose={() => this.setState({openStreetCamViewerImage: null})}
         />
        }
      </div>
    )
  }
}

TaskMap.propTypes = {
  /** The task for which to display the map */
  task: PropTypes.object,
  /** Invoked when the bounds of the map are modified by the user */
  setTaskMapBounds: PropTypes.func.isRequired,
  /** Invoked when user wishes to display OSM data layer on map */
  fetchOSMData: PropTypes.func.isRequired,
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
