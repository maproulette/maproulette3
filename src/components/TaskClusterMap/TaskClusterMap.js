import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker} from 'react-leaflet'
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
import _omit from 'lodash/omit'
import { layerSourceWithId } from '../../services/VisibleLayer/LayerSources'
import AsMappableCluster from '../../interactions/TaskCluster/AsMappableCluster'
import AsMappableTask from '../../interactions/Task/AsMappableTask'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import SearchControl from '../EnhancedMap/SearchControl/SearchControl'
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
  timerHandle = null

  state = {
    mapMarkers: null,
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

    // the task markers have changed
    if (!_isEqual(nextProps.taskMarkers, this.props.taskMarkers)) {
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

    return false
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskMarkers &&
        !_isEqual(this.props.taskMarkers, prevProps.taskMarkers)) {
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
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    this.currentBounds = toLatLngBounds(bounds)
    this.currentZoom = zoom
    this.currentSize = mapSize
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

  debouncedUpdateBounds = _debounce(this.props.updateBounds, 400)

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
    const heightDegrees = this.currentBounds.getNorth() - this.currentBounds.getSouth()
    const widthDegrees = this.currentBounds.getEast() - this.currentBounds.getWest()
    const degreesPerPixel = heightDegrees / this.currentSize.y
    const iconSizeDegrees = (CLUSTER_ICON_PIXELS + 20) * degreesPerPixel
    const maxClusterSize = Math.max(heightDegrees, widthDegrees) / 4.0 // 1/4 of map bounds

    // Track combined clusters in a map. The first cluster receives the
    // combined data, while we simply mark the other cluster with a flag so we
    // know it's already been combined into a cluster and shouldn't be
    // processed independently
    const combinedClusters = new Map()
    let currentCluster = null
    for (let i = 0; i < markers.length - 1; i++) {
      currentCluster = markers[i]

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

        // Calculate distance between the cluster centerpoints and see if it's
        // less than the icon size in degrees
        const currentPosition = point([currentCluster.options.point.lng,
                                       currentCluster.options.point.lat])
        const otherPosition = point([markers[j].options.point.lng,
                                     markers[j].options.point.lat])
        const markerDistance = distance(currentPosition, otherPosition, {units: 'degrees'})
        if (markerDistance <= iconSizeDegrees) {
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
            AsMappableCluster(currentCluster).leafletMarkerIcon(this.props.monochromaticClusters)

          // Store the combined cluster in the map, and mark the other cluster
          // with a flag so we know it has been combined into a cluster and
          // shouldn't be processed independently
          combinedClusters.set(currentCluster.options.clusterId, currentCluster)
          combinedClusters.set(markers[j].options.clusterId, true)
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
    const mapMarkers = _map(this.consolidateMarkers(this.props.taskMarkers), mark => {
      let onClick = null
      let popup = null
      const taskId = mark.options.taskId
      let position = mark.position
      if (taskId && this.props.showMarkerPopup) {
        popup = this.props.showMarkerPopup(mark)
      }
      else {
        onClick = () => this.markerClicked(mark)
      }

      const markerId =
        taskId ? `marker-task-${taskId}` :
        `marker-cluster-${mark.options.point.lat}-${mark.options.point.lng}-${mark.options.numberOfPoints}`

      // If we're rendering an individual task, snap its position to its geometry
      // if appropriate
      if (taskId) {
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

  selectTasksInLayers = layers => {
    if (this.props.onBulkTaskSelection) {
      const taskIds = _compact(_map(layers, layer => _get(layer, 'options.icon.options.taskData.taskId')))
      this.props.onBulkTaskSelection(taskIds)
    }
  }

  render() {
    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

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
    }
    else if (this.props.initialBounds) {
      this.currentBounds = this.props.initialBounds
    }

    const map =
      <EnhancedMap className="mr-z-0"
                   center={latLng(0, 0)}
                   zoom={this.currentZoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM}
                   setInitialBounds={false}
                   initialBounds = {this.currentBounds}
                   zoomControl={false} animate={false} worldCopyJump={true}
                   onBoundsChange={this.updateBounds}
                   justFitFeatures>
        <ZoomControl className="mr-z-10" position='topright' />
        {this.props.showLasso && this.props.onBulkTaskSelection &&
          (!this.props.showAsClusters || this.props.totalTaskCount <= CLUSTER_POINTS) &&
         <LassoSelectionControl onLassoSelection={this.selectTasksInLayers} />
        }
        <VisibleTileLayer {...this.props} zIndex={1} />
        {overlayLayers}
        {!this.props.mapZoomedOut &&
          <span key={_uniqueId()}>{this.state.mapMarkers}</span>
        }
      </EnhancedMap>

    return (
      <div className={classNames('taskcluster-map', {"full-screen-map": this.props.isMobile}, this.props.className)}>
        {canClusterToggle && !this.props.loading &&
         <label className="mr-absolute mr-z-10 mr-pin-t mr-pin-l mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center">
            <input type="checkbox" className="mr-mr-2"
              checked={this.props.showAsClusters}
              onChange={this.props.toggleShowAsClusters} />
            <FormattedMessage {...messages.clusterTasksLabel} />
          </label>
        }
        <LayerToggle {...this.props} />
        {!this.props.hideSearchControl &&
          <SearchControl
            {...this.props}
            onResultSelected={bounds => {
              this.currentBounds = toLatLngBounds(bounds)
              this.props.updateBounds(bounds)
            }}
          />
        }
        {!!this.props.mapZoomedOut && !this.state.locatingToUser &&
          <ZoomInMessage {...this.props} zoom={this.currentZoom}/>
        }
        {!!this.props.showTaskCount && this.state.displayTaskCount && !this.props.mapZoomedOut &&
          <div className="mr-absolute mr-pin-t mr-mt-3 mr-z-5 mr-w-full mr-flex mr-justify-center">
            <div className="mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
              <div className="mr-py-2 mr-px-3 mr-text-center">
                <FormattedMessage {...messages.taskCountLabel } values={{count: this.props.totalTaskCount}} />
              </div>
            </div>
          </div>
        }
        {map}
        {(!!this.props.loading || this.state.locatingToUser || !!this.props.loadingChallenge) && <BusySpinner mapMode />}
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
