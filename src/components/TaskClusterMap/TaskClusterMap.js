import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker} from 'react-leaflet'
import { latLng } from 'leaflet'
import bbox from '@turf/bbox'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce'
import _noop from  'lodash/noop'
import _uniqueId from 'lodash/uniqueId'
import _compact from 'lodash/compact'
import { layerSourceWithId } from '../../services/VisibleLayer/LayerSources'
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
import { toLatLngBounds, calculateBoundingBox } from '../../services/MapBounds/MapBounds'
import './TaskClusterMap.scss'
import messages from './Messages'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

export const MAX_ZOOM = 18

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
 * TaskClusterMap allows a user to browse tasks and task clusters
 * geographically, optionally calling back when map bounds are modified
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskClusterMap extends Component {
  currentBounds = null
  currentZoom = 2
  skipNextUpdateBounds = false

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
  }

  /**
   * Signal a change to the current map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    if (this.skipNextUpdateBounds) {
      this.currentBounds = toLatLngBounds(bounds)
      this.currentZoom = zoom
      this.skipNextUpdateBounds = false
      return
    }

    this.currentBounds = toLatLngBounds(bounds)
    this.currentZoom = zoom
    if (!this.props.loading && !this.props.loadingTasks) {
      this.debouncedUpdateBounds(bounds, zoom)
    }
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    if (!this.props.loadingChallenge && !this.props.loading) {
      if (marker.options.bounding && marker.options.numberOfPoints > 1) {
        this.currentBounds = toLatLngBounds(bbox(marker.options.bounding))
        this.skipNextUpdateBounds = true
        this.debouncedUpdateBounds(this.currentBounds, this.currentZoom)

        // Reset Map so that it zooms to new marker bounds
        this.setState({mapMarkers: null})
      }
    }
  }

  debouncedUpdateBounds = _debounce(this.props.updateBounds, 200)

  generateMarkers = () => {
    const mapMarkers = _map(this.props.taskMarkers, (mark, index) => {
      let onClick = null
      let popup = null
      const taskId = mark.options.taskId
      if (taskId && this.props.showMarkerPopup) {
        popup = this.props.showMarkerPopup(mark)
      }
      else {
        onClick = () => this.markerClicked(mark)
      }

      const markerId =
        taskId ? `marker-task-${taskId}` :
        `marker-cluster-${mark.options.point.lat}-${mark.options.point.lng}-${mark.options.numberOfPoints}`

      if (mark.icon) {
        return <Marker key={markerId} position={mark.position} icon={mark.icon}
                        onClick={onClick}>{popup}</Marker>
      }
      else {
        return <Marker key={markerId} position={mark.position}
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

    if (!this.currentBounds && _get(this.props, 'boundingBox.length', 0) > 0) {
      this.currentBounds = toLatLngBounds(this.props.boundingBox)
    }

    if (!this.currentBounds && this.state.mapMarkers) {
      this.currentBounds = toLatLngBounds(calculateBoundingBox(
        _map(this.state.mapMarkers, (cluster) => cluster.props.position)
      ))
    }

    const map =
      <EnhancedMap className="mr-z-0"
                   center={latLng(0, 0)}
                   zoom={this.currentZoom} minZoom={2} maxZoom={MAX_ZOOM}
                   setInitialBounds={false}
                   initialBounds = {this.currentBounds}
                   zoomControl={false} animate={false} worldCopyJump={true}
                   onBoundsChange={this.updateBounds}
                   justFitFeatures>
        <ZoomControl className="mr-z-10" position='topright' />
        {this.props.showLasso && this.props.onBulkTaskSelection && !this.props.showAsClusters &&
         <LassoSelectionControl onLassoSelection={this.selectTasksInLayers} />
        }
        <VisibleTileLayer {...this.props} zIndex={1} />
        {overlayLayers}
        <span key={_uniqueId()}>{this.state.mapMarkers}</span>
      </EnhancedMap>

    return (
      <div className={classNames('taskcluster-map', {"full-screen-map": this.props.isMobile})}>
        {canClusterToggle && !this.props.loading &&
         <label className="mr-absolute mr-z-10 mr-pin-t mr-pin-l mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center">
            <input type="checkbox" className="mr-mr-2"
              checked={this.props.showAsClusters}
              onChange={this.props.toggleShowAsClusters} />
            <FormattedMessage {...messages.clusterTasksLabel } />
          </label>
        }
        <LayerToggle {...this.props} />
        <SearchControl
          {...this.props}
          onResultSelected={bounds => {
            this.currentBounds = toLatLngBounds(bounds)
            this.props.updateBounds(bounds)
          }}
        />
        {map}
        {(!!this.props.loading || !!this.props.loadingChallenge) && <BusySpinner mapMode />}
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
