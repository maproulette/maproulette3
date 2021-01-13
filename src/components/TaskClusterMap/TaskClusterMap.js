import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker, LayerGroup, Rectangle, Polyline, Pane }
       from 'react-leaflet'
import { latLng } from 'leaflet'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import distance from '@turf/distance'
import centroid from '@turf/centroid'
import { point, featureCollection, geometryCollection } from '@turf/helpers'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce'
import _noop from  'lodash/noop'
import _uniqueId from 'lodash/uniqueId'
import _compact from 'lodash/compact'
import _cloneDeep from 'lodash/cloneDeep'
import _isObject from 'lodash/isObject'
import _sortBy from 'lodash/sortBy'
import _omit from 'lodash/omit'
import _isEmpty from 'lodash/isEmpty'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _reject from 'lodash/reject'
import { buildLayerSources, DEFAULT_OVERLAY_ORDER }
       from '../../services/VisibleLayer/LayerSources'
import { TaskPriorityColors } from '../../services/Task/TaskPriority/TaskPriority'
import AsMappableCluster from '../../interactions/TaskCluster/AsMappableCluster'
import AsSpiderableMarkers from '../../interactions/TaskCluster/AsSpiderableMarkers'
import AsMappableTask from '../../interactions/Task/AsMappableTask'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import FitBoundsControl from '../EnhancedMap/FitBoundsControl/FitBoundsControl'
import FitWorldControl from '../EnhancedMap/FitWorldControl/FitWorldControl'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import SearchControl from '../EnhancedMap/SearchControl/SearchControl'
import SearchContent from '../EnhancedMap/SearchControl/SearchContent'
import LassoSelectionControl
       from '../EnhancedMap/LassoSelectionControl/LassoSelectionControl'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithIntersectingOverlays
       from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import BusySpinner from '../BusySpinner/BusySpinner'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import ZoomInMessage from './ZoomInMessage'
import './TaskClusterMap.scss'
import messages from './Messages'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

export const MAX_ZOOM = 18
export const MIN_ZOOM = 2

/**
 * An uncluster option will be offered if no more than this number of tasks
 * will be shown.
 */
export const UNCLUSTER_THRESHOLD = 1000 // max number of tasks

/**
 * The number of clusters to show.
 */
export const CLUSTER_POINTS = 25

/**
 * The size of cluster marker icons in pixels
 */
export const CLUSTER_ICON_PIXELS = 40

/**
 * TaskClusterMap allows a user to browse tasks and task clusters
 * geographically, optionally calling back when map bounds are modified
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskClusterMap extends Component {
  currentBounds = null
  currentSize = null
  currentZoom = MIN_ZOOM
  leafletMap = null
  timerHandle = null
  unspiderHandle = null
  skipNextBoundsUpdate = false

  state = {
    mapMarkers: null,
    searchOpen: false,
    spidered: new Map(),
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:
    if (!_isEqual(nextState, this.state)) {
      return true
    }

    // the loading status of tasks change
    if (!!nextProps.loading !== !!this.props.loading ||
        !!nextProps.loadingChallenge !== !!this.props.loadingChallenge) {
      return true
    }

    // the map bounds have changed
    if (!_isEqual(nextProps.boundingBox, this.props.boundingBox)) {
      return true
    }

    // The primary task location has changed
    if (!_isEqual(nextProps.taskCenter, this.props.taskCenter)) {
      return true
    }

    // the task markers have changed
    if (!_isEqual(nextProps.taskMarkers, this.props.taskMarkers)) {
      return true
    }

    // the selected clusters have changed
    if (!_isEqual(nextProps.selectedClusters, this.props.selectedClusters)) {
      return true
    }

    // the task markers have changed
    if (!_isEqual(nextProps.showPriorityBounds, this.props.showPriorityBounds)) {
      return true
    }

    // the base layer has changed
    if (_get(nextProps, 'source.id') !== _get(this.props, 'source.id')) {
      return true
    }

    // the available overlays have changed
    if (!_isEqual(nextProps.intersectingOverlays, this.props.intersectingOverlays)) {
      return true
    }

    // the visible overlays have changed
    if (nextProps.visibleOverlays.length !== this.props.visibleOverlays.length) {
       return true
    }

    // the ordering of overlays has changed
    if (!_isEqual(nextProps.getUserAppSetting(nextProps.user, 'mapOverlayOrder'),
                  this.props.getUserAppSetting(this.props.user, 'mapOverlayOrder'))) {
       return true
    }

    return false
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.taskMarkers && !this.props.delayMapLoad &&
       (!_isEqual(this.props.taskMarkers, prevProps.taskMarkers) ||
        this.props.selectedClusters !== prevProps.selectedClusters)) {
      // Since our markers have changed we need to recalculate the
      // currentBounds if we aren't given a boundingBox
      this.currentBounds = !this.props.boundingBox ? null :
        toLatLngBounds(this.props.boundingBox)
      this.refreshSpidered()
      this.generateMarkers()
    }
    else if (this.state.spidered !== prevState.spidered) {
      this.generateMarkers()
    }

    if (!this.props.loading && prevProps.loading) {
      // No longer loading. Kick off timer to hide task count message
      if (this.timerHandle) {
        clearTimeout(this.timerHandle)
      }
      this.timerHandle = setTimeout(() => {
        this.setState({displayTaskCount: false})
      }, 3000)
      this.setState({displayTaskCount: true})
    }
    else if (this.props.loading && this.state.displayTaskCount) {
      this.setState({displayTaskCount: false})
      if (this.timerHandle) {
        clearTimeout(this.timerHandle)
        this.timerHandle = null
      }
    }
  }

  componentWillUnmount() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle)
      this.timerHandle = null
    }
  }

  /**
   * Signal a change to the current map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom, mapSize) => {
    const priorZoom = this.currentZoom
    this.currentZoom = zoom
    this.currentSize = mapSize
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    // Unspider tasks when the zoom is changed
    if (!this.unspiderHandle && this.currentZoom && this.currentZoom !== priorZoom) {
      this.unspiderHandle = setTimeout(() => {
        this.unspider()
        this.unspiderHandle = null
      }, 500)
    }

    this.currentBounds = toLatLngBounds(bounds)
    if (this.skipNextBoundsUpdate) {
      this.skipNextBoundsUpdate = false
      return
    }
    this.debouncedUpdateBounds(bounds, zoom)
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    if (!this.props.loadingChallenge) {
      if (marker.options.bounding && marker.options.numberOfPoints > 1) {
        this.currentBounds = toLatLngBounds(bbox(marker.options.bounding))
        this.debouncedUpdateBounds(this.currentBounds, this.currentZoom)

        // Reset Map so that it zooms to new marker bounds
        this.setState({mapMarkers: null})
      }
      else if (this.props.onTaskClick) {
        this.props.onTaskClick(marker.options.taskId)
      }
    }
  }

  openSearch = () => this.setState({searchOpen: true})

  closeSearch = () => this.setState({searchOpen: false})

  debouncedUpdateBounds = _debounce(this.props.updateBounds, 400)

  spiderIfNeeded = (marker, allMarkers) => {
    if (this.state.spidered.has(marker.options.taskId)) {
      // Marker is already spidered
      if (this.props.onTaskClick) {
        this.props.onTaskClick(marker.options.taskId)
      }
      return
    }

    // Determine if we need to spider out overlapping markers
    const overlapping = this.overlappingTasks(marker, allMarkers)
    if (overlapping && overlapping.length > 0) {
      overlapping.push(marker)
      this.spider(marker, overlapping)
    }
    else {
      // If nothing needs to be spidered, make sure we're not spidered
      this.unspider()
      if (this.props.onTaskClick) {
        this.props.onTaskClick(marker.options.taskId)
      }
    }
  }

  spider = (clickedMarker, overlappingMarkers) => {
    const centerPointPx = this.leafletMap.latLngToLayerPoint(clickedMarker.position)
    const spidered = AsSpiderableMarkers(overlappingMarkers).spider(centerPointPx, CLUSTER_ICON_PIXELS)
    _each([...spidered.values()], s => s.position = this.leafletMap.layerPointToLatLng(s.positionPx))
    this.setState({spidered})
  }

  refreshSpidered = () => {
    if (this.state.spidered.size === 0) {
      return
    }

    const refreshed = new Map()
    _each(this.props.taskMarkers, marker => {
      if (this.state.spidered.has(marker.options.taskId)) {
        // Update icons of spidered tasks from the new task markers, indicating
        // selected state
        refreshed.set(marker.options.taskId, Object.assign(
          {},
          this.state.spidered.get(marker.options.taskId),
          {icon: marker.icon}
        ))
      }
    })

    this.setState({spidered: refreshed})
  }

  unspider = () => {
    if (this.state.spidered.size > 0) {
      this.setState({spidered: new Map()})
    }
  }

  mapMetricsInDegrees = (iconSize=CLUSTER_ICON_PIXELS + 20) => {
    const metrics = {}
    metrics.heightDegrees = this.currentBounds.getNorth() - this.currentBounds.getSouth()
    metrics.widthDegrees = this.currentBounds.getEast() - this.currentBounds.getWest()
    metrics.degreesPerPixel = metrics.heightDegrees / this.currentSize.y
    metrics.iconSizeDegrees = iconSize * metrics.degreesPerPixel

    return metrics
  }

  markerDistanceDegrees = (first, second) => {
    const firstPosition = point([first.options.point.lng, first.options.point.lat])
    const secondPosition = point([second.options.point.lng, second.options.point.lat])
    return distance(firstPosition, secondPosition, {units: 'degrees'})
  }

  consolidateMarkers = markers => {
    // Make sure conditions are appropriate for consolidation
    if (!this.props.showAsClusters ||
        this.props.totalTaskCount <= CLUSTER_POINTS ||
        !markers || !this.currentBounds || !this.currentSize) {
      return markers
    }

    // Our goal is to consolidate clusters that would visually overlap on the
    // map so that the clustering looks more natural. We do this by calculating
    // the degrees per pixel based on the current map bounds and map size in
    // pixels, and then consolidating clusters that are within a "cluster
    // icon's size" (plus a 20px buffer) of each other
    //
    // As one additional consideration, we don't want a cluster to grow to
    // bigger than 1/4 of the current map bounds or we risk the map not zooming
    // when we fit the map bounds to the cluster bounds as the result of a user
    // click
    const { heightDegrees, widthDegrees, iconSizeDegrees } = this.mapMetricsInDegrees()
    const maxClusterSize = Math.max(heightDegrees, widthDegrees) / 4.0 // 1/4 of map bounds

    // Track combined clusters in a map. The first cluster receives the
    // combined data, while we simply mark the other cluster with a flag so we
    // know it's already been combined into a cluster and shouldn't be
    // processed independently
    const combinedClusters = new Map()
    let currentCluster = null
    for (let i = 0; i < markers.length - 1; i++) {
      currentCluster = markers[i]

      // We can't combine markers missing a bounding
      if (_isEmpty(currentCluster.options.bounding)) {
        continue
      }

      // Don't process clusters that have already been combined into a cluster
      if (combinedClusters.has(currentCluster.options.clusterId)) {
        continue
      }

      // Look for clusters to combine into this one
      for (let j = i + 1; j < markers.length; j++) {
        // If it's already been combined into a cluster, skip it
        if (combinedClusters.has(markers[j].options.clusterId)) {
          continue
        }

        // We can't combine with a marker missing a bounding
        if (_isEmpty(markers[j].options.bounding)) {
          continue
        }

        try {
          // Check if distance between clusters is less than the icon size in degrees
          if (this.markerDistanceDegrees(currentCluster, markers[j]) <= iconSizeDegrees) {
            const combinedBounds = bbox(geometryCollection([
              currentCluster.options.bounding,
              markers[j].options.bounding
            ]))

            // Make sure combined cluster won't be too large, or the map may not
            // zoom if we try to fit the map to its bbox
            if (combinedBounds[3] - combinedBounds[1] > maxClusterSize ||  // North - South
                combinedBounds[2] - combinedBounds[0] > maxClusterSize) {  // East - West
              continue
            }

            // Clone the current cluster and update its data to reflect the
            // combined bounds, new centerpoint, combined task count, etc.
            currentCluster = _omit(_cloneDeep(currentCluster),
                                  ['options.taskId', 'options.taskStatus', 'options.taskPriority'])
            currentCluster.options.bounding = bboxPolygon(combinedBounds).geometry
            currentCluster.options.numberOfPoints += markers[j].options.numberOfPoints

            const centerpoint = centroid(currentCluster.options.bounding)
            currentCluster.options.point = {
              lat: centerpoint.geometry.coordinates[1],
              lng: centerpoint.geometry.coordinates[0]
            }
            currentCluster.position = [currentCluster.options.point.lat,
                                      currentCluster.options.point.lng]

            // Generate a fresh icon that reflects the updated number of points/tasks
            currentCluster.icon =
              AsMappableCluster(currentCluster).leafletMarkerIcon(this.props.monochromaticClusters, null, false, this.props.selectedClusters)

            // Store the combined cluster in the map, and mark the other cluster
            // with a flag so we know it has been combined into a cluster and
            // shouldn't be processed independently
            combinedClusters.set(currentCluster.options.clusterId, currentCluster)
            combinedClusters.set(markers[j].options.clusterId, true)
          }
        }
        catch(error) {
          console.log(error)
        }
      }
    }

    // Generate a list of final clusters by replacing clusters with the combined
    // versions from the map when appropriate
    const finalClusters = _compact(_map(markers, marker => {
      if (!combinedClusters.has(marker.options.clusterId)) {
        // Wasn't combined, return as-is
        return marker
      }

      if (_isObject(combinedClusters.get(marker.options.clusterId))) {
        // Return the combined version of the cluster
        return combinedClusters.get(marker.options.clusterId)
      }

      // Marker was combined into another cluster, discard
      return null
    }))

    return finalClusters
  }

  generateMarkers = () => {
    let consolidatedMarkers = this.consolidateMarkers(this.props.taskMarkers)

    // If some tasks are spidered, replace their markers with the spidered versions
    if (this.state.spidered.size > 0) {
      consolidatedMarkers =
        _reject(consolidatedMarkers, m => this.state.spidered.has(m.options.taskId))
      consolidatedMarkers.push(...[...this.state.spidered.values()])
    }

    const mapMarkers = _map(consolidatedMarkers, mark => {
      let onClick = null
      let popup = null
      const taskId = mark.options.taskId
      let position = mark.position
      if (taskId) {
        if (this.props.showMarkerPopup) {
          popup = this.props.showMarkerPopup(mark)
        }

        if (this.props.allowSpidering) {
          onClick = () => this.spiderIfNeeded(mark, consolidatedMarkers)
        }
        else if (this.props.onTaskClick) {
          onClick = () => this.props.onTaskClick(taskId)
        }
      }
      else {
        onClick = () => this.markerClicked(mark)
      }

      const markerId =
        taskId ? `marker-task-${taskId}` :
        `marker-cluster-${mark.options.point.lat}-${mark.options.point.lng}-${mark.options.numberOfPoints}`

      // If we're rendering an individual task, snap its position to its geometry
      // if appropriate (and it's not spidered)
      if (taskId && !this.state.spidered.has(taskId)) {
        const nearestToCenter = AsMappableTask(mark.options).nearestPointToCenter()
        if (nearestToCenter) {
          position = [nearestToCenter.geometry.coordinates[1], nearestToCenter.geometry.coordinates[0]]
        }
      }

      if (mark.icon) {
        return <Marker key={markerId} position={position} icon={mark.icon}
                        onClick={onClick}>{popup}</Marker>
      }
      else {
        return <Marker key={markerId} position={position}
                        onClick={onClick}>{popup}</Marker>
      }
    })

    this.setState({mapMarkers})
  }

  overlappingTasks = (marker, allMarkers) => {
    const { iconSizeDegrees } = this.mapMetricsInDegrees(CLUSTER_ICON_PIXELS)
    const overlapping = _filter(allMarkers, otherMarker => {
      if (otherMarker === marker) return false
      const dist = this.markerDistanceDegrees(marker, otherMarker)
      return dist <= iconSizeDegrees
    })
    return overlapping
  }

  selectTasksInLayers = layers => {
    if (this.props.onBulkTaskSelection) {
      const taskIds = _compact(_map(layers, layer => _get(layer, 'options.icon.options.taskData.taskId')))
      this.props.onBulkTaskSelection(taskIds)
    }
  }

  deselectTasksInLayers = layers => {
    if (this.props.onBulkTaskDeselection) {
      const taskIds = _compact(_map(layers, layer => _get(layer, 'options.icon.options.taskData.taskId')))
      this.props.onBulkTaskDeselection(taskIds)
    }
  }

  selectClustersInLayers = layers => {
    if (this.props.onBulkClusterSelection) {
      const clusters = _compact(_map(layers, layer => this.clusterDataFromLayer(layer)))
      this.props.onBulkClusterSelection(clusters)
    }
  }

  deselectClustersInLayers = layers => {
    if (this.props.onBulkClusterDeselection) {
      const clusters = _compact(_map(layers, layer => this.clusterDataFromLayer(layer)))
      this.props.onBulkClusterDeselection(clusters)
    }
  }

  clusterDataFromLayer = layer => {
    let clusterData = _get(layer, 'options.icon.options.clusterData')
    if (!clusterData) {
      // Single-task markers will use `taskData` instead of `clusterData`, but
      // have fields compatible with clusterData
      clusterData = _get(layer, 'options.icon.options.taskData')

      // True tasks (versus clusters representing 1 task) won't have a
      // numberOfPoints field set, so add that for compatibility and mark that
      // it's actually a task
      if (!clusterData.numberOfPoints) {
        clusterData.numberOfPoints = 1
        clusterData.isTask = true
      }
    }

    return clusterData
  }

  render() {
    const renderId = _uniqueId()
    let overlayOrder = this.props.getUserAppSetting(this.props.user, 'mapOverlayOrder')
    if (_isEmpty(overlayOrder)) {
      overlayOrder = DEFAULT_OVERLAY_ORDER
    }
    let overlayLayers = buildLayerSources(
      this.props.visibleOverlays, _get(this.props, 'user.settings.customBasemaps'),
      (layerId, index, layerSource) => ({
        id: layerId,
        component: <SourcedTileLayer key={layerId} source={layerSource} />,
      })
    )

    if (this.props.showPriorityBounds) {
      overlayLayers.push({
        id: "priority-bounds",
        component: (
          <LayerGroup key="priority-bounds">
            {this.props.priorityBounds.map((bounds, index) =>
              <Rectangle
                key={index}
                bounds={toLatLngBounds(bounds.boundingBox)}
                color={TaskPriorityColors[bounds.priorityLevel]}
              />
            )}
          </LayerGroup>
        )
      })
    }

    // Sort the overlays according to the user's preferences. We then reverse
    // that order because the layer rendered on the map last will be on top
    if (overlayOrder && overlayOrder.length > 0) {
      overlayLayers = _sortBy(overlayLayers, layer => {
        const position = overlayOrder.indexOf(layer.id)
        return position === -1 ? Number.MAX_SAFE_INTEGER : position
      }).reverse()
    }

    const canClusterToggle = !!this.props.allowClusterToggle &&
      this.props.totalTaskCount <= UNCLUSTER_THRESHOLD &&
      this.props.totalTaskCount > CLUSTER_POINTS &&
      this.currentZoom < MAX_ZOOM

    if (!this.currentBounds && this.state.mapMarkers) {
      // Set Current Bounds to the minimum bounding box of our markers
      this.currentBounds = toLatLngBounds(
        bbox(featureCollection(
          _map(this.state.mapMarkers, cluster =>
            point([cluster.props.position[1], cluster.props.position[0]])
          )
        ))
      )
      // We've calculated the bounds so we don't need to do the next bounds update
      this.skipNextBoundsUpdate = true
      this.props.setInitialBounds && this.props.setInitialBounds(this.currentBounds)
    }
    else if (this.props.initialBounds) {
      this.currentBounds = this.props.initialBounds
    }

    const map =
      <EnhancedMap
        className="mr-z-0"
        center={latLng(0, 0)}
        zoom={this.currentZoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM}
        setInitialBounds={false}
        initialBounds = {this.currentBounds}
        zoomControl={false} animate={false} worldCopyJump={true}
        onBoundsChange={this.updateBounds}
        setLeafletMap={map => this.leafletMap = map}
        justFitFeatures
        onClick={() => this.unspider()}
      >
        <ZoomControl className="mr-z-10" position='topright' />
        {this.props.showFitWorld && <FitWorldControl />}
        {this.props.taskCenter &&
          <FitBoundsControl key={this.props.taskCenter.toString()} centerPoint={this.props.taskCenter} />
        }
        {this.props.showClusterLasso && this.props.onBulkClusterSelection && !this.props.mapZoomedOut &&
          <LassoSelectionControl
            onLassoSelection={this.selectClustersInLayers}
            onLassoDeselection={this.deselectClustersInLayers}
            onLassoClear={this.props.resetSelectedClusters}
            onLassoInteraction={this.closeSearch}
          />
        }
        {this.props.showLasso && this.props.onBulkTaskSelection &&
         (!this.props.showAsClusters || (!this.props.showClusterLasso && this.props.totalTaskCount <= CLUSTER_POINTS)) &&
         <LassoSelectionControl
            onLassoSelection={this.selectTasksInLayers}
            onLassoDeselection={this.deselectTasksInLayers}
            onLassoClear={this.props.resetSelectedTasks}
            onLassoInteraction={this.closeSearch}
         />
        }
        {!this.props.hideSearchControl &&
          <SearchControl
            {...this.props}
            openSearch={this.openSearch}
          />
        }
        <VisibleTileLayer {...this.props} zIndex={1} />
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
        {this.state.spidered.size > 0 && // draw spider lines
          <Pane
            key={`pane-${renderId}-spiderlines`}
            name={`pane-${renderId}-spiderlines`}
            style={{zIndex: 10 + overlayLayers.length}}
            className="custom-pane"
          >
           {_map([...this.state.spidered.values()], s => (
              <Polyline
                key={s.options.id}
                positions={[s.originalPosition, s.position]}
                color="black"
                weight={1}
              />
            ))
           }
          </Pane>
        }
        {!this.props.mapZoomedOut &&
         <Pane
           key={`pane-${renderId}-task-markers`}
           name={`pane-${renderId}-task-markers`}
           style={{zIndex: 10 + overlayLayers.length + 1}}
           className="custom-pane"
         >
           {this.state.mapMarkers}
         </Pane>
        }
      </EnhancedMap>

    return (
      <div className={classNames('taskcluster-map', {"full-screen-map": this.props.isMobile}, this.props.className)}>
        {canClusterToggle && !this.state.searchOpen && !this.props.loading &&
         <label className="mr-absolute mr-z-10 mr-top-0 mr-left-0 mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center">
           <input
             type="checkbox"
             className="mr-mr-2"
             checked={this.props.showAsClusters}
             onChange={() => {
               // Clear any existing selections when switching between tasks and clusters
               this.props.toggleShowAsClusters()
               this.props.resetSelectedClusters && this.props.resetSelectedClusters()
             }}
           />
           <FormattedMessage {...messages.clusterTasksLabel} />
         </label>
        }
        <LayerToggle {...this.props} overlayOrder={overlayOrder} />
        {!this.props.externalOverlay && !this.state.searchOpen &&
         !!this.props.mapZoomedOut && !this.state.locatingToUser &&
         <ZoomInMessage {...this.props} zoom={this.currentZoom} />
        }
        {!this.state.searchOpen && this.props.externalOverlay}
        {this.state.searchOpen &&
         <SearchContent
           {...this.props}
           onResultSelected={bounds => {
              this.currentBounds = toLatLngBounds(bounds)
              this.props.updateBounds(bounds)
           }}
           closeSearch={this.closeSearch}
         />
        }
        {this.props.delayMapLoad && !this.state.searchOpen &&
          <div className="mr-absolute mr-top-0 mr-mt-3 mr-w-full mr-flex mr-justify-center"
            onClick={() => this.props.forceMapLoad()}>
            <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
              <div className="mr-py-2 mr-px-3 mr-text-center mr-cursor-pointer">
                <FormattedMessage {...messages.moveMapToRefresh} />
              </div>
            </div>
          </div>
        }
        {!!this.props.showTaskCount && this.state.displayTaskCount && !this.props.mapZoomedOut &&
          <div className="mr-absolute mr-top-0 mr-mt-3 mr-z-5 mr-w-full mr-flex mr-justify-center">
            <div className="mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
              <div className="mr-py-2 mr-px-3 mr-text-center">
                <FormattedMessage {...messages.taskCountLabel } values={{count: this.props.totalTaskCount}} />
              </div>
            </div>
          </div>
        }
        {map}
        {(!!this.props.loading || this.state.locatingToUser || !!this.props.loadingChallenge) && <BusySpinner mapMode xlarge />}
      </div>
    )
  }
}

TaskClusterMap.propTypes = {
  /** Map markers for the tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  loading: PropTypes.bool,
  /** Invoked when the user moves the map */
  updateBounds: PropTypes.func,
}

TaskClusterMap.defaultProps = {
  updateBounds: _noop,
}

export default searchName =>
  WithStatus(
    WithVisibleLayer(
      WithIntersectingOverlays(TaskClusterMap, searchName)
    )
  )
