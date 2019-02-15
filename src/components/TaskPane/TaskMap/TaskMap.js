import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, LayerGroup, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import { layerSourceWithId } from '../../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../../EnhancedMap/EnhancedMap'
import MapillaryViewer from '../../MapillaryViewer/MapillaryViewer'
import SourcedTileLayer
       from '../../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import OSMDataLayer from '../../EnhancedMap/OSMDataLayer/OSMDataLayer'
import LayerToggle from '../../EnhancedMap/LayerToggle/LayerToggle'
import FitBoundsControl
       from '../../EnhancedMap/FitBoundsControl/FitBoundsControl'
import WithTaskCenterPoint
       from '../../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithSearch from '../../HOCs/WithSearch/WithSearch'
import WithIntersectingOverlays
       from '../../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithVisibleLayer from '../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithKeyboardShortcuts
       from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM }
       from '../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import BusySpinner from '../../BusySpinner/BusySpinner'
import './TaskMap.scss'

/**
 * TaskMap renders a map (and controls) appropriate for the given task,
 * including the various map-related features and configuration options set on
 * the task and its parent challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskMap extends Component {
  state = {
    showTaskFeatures: true,
    showOSMData: false,
    osmData: null,
    osmDataLoading: false,
    mapillaryLayerLoading: false,
    mapillaryViewerImage: null,
  }

  /** Process keyboard shortcuts for the layers */
  handleKeyboardShortcuts = event => {
    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const layerShortcuts = this.props.keyboardShortcutGroups.layers
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
    this.setState({showTaskFeatures: !this.state.showTaskFeatures})
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * OSM data on or off.
   */
  toggleOSMDataVisibility = () => {
    if (!this.state.showOSMData && !this.state.osmData && !this.state.osmDataLoading) {
      this.setState({osmDataLoading: true})
      this.props.fetchOSMData(this.props.mapBounds.bounds.toBBoxString()).then(xmlData => {
        this.setState({osmData: xmlData, osmDataLoading: false})
      })
    }
    this.setState({showOSMData: !this.state.showOSMData})
  }

  /**
   * Invoked by LayerToggle when the user wishes to toggle visibility of
   * Mapillary markers on or off.
   */
  toggleMapillaryVisibility = async () => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    this.props.challenge.id
    // If there's no mapillary data, we'll reload the task and request it
    if (!this.props.showMapillaryLayer && !this.props.task.mapillaryImages) {
      this.setState({mapillaryLayerLoading: true})
      this.props.setShowMapillaryLayer(challengeId, isVirtual, true)
      await this.props.refreshTask(this.props.task.id, true)
      this.setState({mapillaryLayerLoading: false})
    }
    else {
      this.props.setShowMapillaryLayer(challengeId, isVirtual, !this.props.showMapillaryLayer)
    }
  }

  /**
   * Reloads the task data with mapillary image info requested if needed
   */
  loadMapillaryIfNeeded = () => {
    // If we're supposed to show mapillary images but don't have them,
    // explicitly reload the task with mapillary images
    if (this.props.task &&
        this.props.showMapillaryLayer &&
        !this.props.task.mapillaryImages) {
      this.props.refreshTask(this.props.task.id, true)
    }
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, 'layers'),
      this.handleKeyboardShortcuts)

    this.loadMapillaryIfNeeded()
  }

  componentDidUpdate() {
    this.loadMapillaryIfNeeded()
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to avoid constantly re-rendering, so we only re-render if the
    // task or our internal state changes. We care about changes to the task
    // id, its geometries, layer options, and a few settings on the parent
    // challenge.
    if (nextState.showTaskFeatures !== this.state.showTaskFeatures) {
      return true
    }

    if (nextState.showOSMData !== this.state.showOSMData ||
        nextState.osmDataLoading !== this.state.osmDataLoading ||
        nextState.osmData !== this.state.osmData) {
      return true
    }

    if (nextProps.showMapillaryLayer !== this.props.showMapillaryLayer ||
        nextState.mapillaryLayerLoading !== this.state.mapillaryLayerLoading ||
        nextState.mapillaryViewerImage !== this.state.mapillaryViewerImage) {
      return true
    }

    if(_get(nextProps, 'task.id') !== _get(this.props, 'task.id')) {
      return true
    }

    if(_get(nextProps, 'task.mapillaryImages.length') !==
       _get(this.props, 'task.mapillaryImages.length')) {
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

    return false
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup('layers',
                                               this.handleKeyboardShortcuts)
  }

  updateTaskBounds = (bounds, zoom) => {
    // Don't update map bounds if this task is in the process of completing.
    // We don't want to risk sending updates on a stale task as this one gets
    // unloaded.
    if (this.props.task.id !== this.props.completingTask) {
      this.props.setTaskMapBounds(this.props.task.id, bounds, zoom, false)
    }
  }

  mapillaryImageMarkers = () => {
    if (_get(this.props, 'task.mapillaryImages.length', 0) === 0) {
      return []
    }

    const icon = L.vectorIcon({
      svgHeight: 12,
      svgWidth: 12,
      type: 'circle',
      shape: { r: 6, cx: 6, cy: 6 },
      style: { fill: "#39AF64" }, // mapillary green
    })

    const markers = _map(this.props.task.mapillaryImages, (imageInfo, index) =>
      <Marker key={imageInfo.key} position={[imageInfo.lat, imageInfo.lon]}
              icon={icon}
              onMouseover={({target}) => target.openPopup()}
              onClick={() => this.setState({mapillaryViewerImage: imageInfo.key})}>
        <Popup>
          <img src={imageInfo.url_320} alt="From Mapillary"
               onClick={() => this.setState({mapillaryViewerImage: imageInfo.key})} />
        </Popup>
      </Marker>
    )

    return <LayerGroup key={Date.now()}>{markers}</LayerGroup>
  }

  render() {
    if (!this.props.task || !_isObject(this.props.task.parent)) {
      return <BusySpinner />
    }

    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    const mapillaryMarkers = this.props.showMapillaryLayer ?
                             this.mapillaryImageMarkers() : []

    const zoom = _get(this.props.task, "parent.defaultZoom", DEFAULT_ZOOM)
    const minZoom = _get(this.props.task, "parent.minZoom", MIN_ZOOM)
    const maxZoom = _get(this.props.task, "parent.maxZoom", MAX_ZOOM)

    // Note: we need to also pass maxZoom to the tile layer (in addition to the
    // map), or else leaflet won't autoscale if the zoom goes beyond the
    // capabilities of the layer.

    return (
      <div className={classNames("task-map task", {"full-screen-map": this.props.isMobile})}>
        <LayerToggle {...this.props}
                     showTaskFeatures={this.state.showTaskFeatures}
                     toggleTaskFeatures={this.toggleTaskFeatureVisibility}
                     showOSMData={this.state.showOSMData}
                     toggleOSMData={this.toggleOSMDataVisibility}
                     osmDataLoading={this.state.osmDataLoading}
                     showMapillary={this.props.showMapillaryLayer}
                     toggleMapillary={this.toggleMapillaryVisibility}
                     mapillaryLoading={this.state.mapillaryLayerLoading}
                     mapillaryCount={_get(this.props, 'task.mapillaryImages.length', 0)} />
        <EnhancedMap center={this.props.centerPoint} zoom={zoom} zoomControl={false}
                     minZoom={minZoom} maxZoom={maxZoom} worldCopyJump={true}
                     features={_get(this.props.task, 'geometries.features')}
                     justFitFeatures={!this.state.showTaskFeatures}
                     fitFeaturesOnlyAsNecessary
                     animateFeatures
                     onBoundsChange={this.updateTaskBounds}
        >
          <ZoomControl position='topright' />
          <FitBoundsControl />
          <SourcedTileLayer maxZoom={maxZoom} {...this.props} zIndex={1} />
          {overlayLayers}
          {this.state.showOSMData && this.state.osmData &&
            <OSMDataLayer xmlData={this.state.osmData} />
          }
          {this.props.showMapillaryLayer && mapillaryMarkers}
        </EnhancedMap>

        {this.state.mapillaryViewerImage &&
         <MapillaryViewer key={Date.now()}
                          images={this.props.task.mapillaryImages}
                          initialImageKey={this.state.mapillaryViewerImage}
                          onDeactivate={() => this.setState({mapillaryViewerImage: null})} />
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
  WithTaskCenterPoint(
    WithVisibleLayer(
      WithIntersectingOverlays(
        WithKeyboardShortcuts(TaskMap),
        'task'
      )
    )
  ),
  'task'
)
