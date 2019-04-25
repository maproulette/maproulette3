import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker} from 'react-leaflet'
import { latLng } from 'leaflet'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce'
import { layerSourceWithId } from '../../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../../../components/EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../../../components/EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../../../components/EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../../../components/HOCs/WithVisibleLayer/WithVisibleLayer'
import WithIntersectingOverlays
       from '../../../components/HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithStatus from '../../../components/HOCs/WithStatus/WithStatus'
import BusySpinner from '../../../components/BusySpinner/BusySpinner'
import { toLatLngBounds, boundsWithinDegrees }
  from '../../../services/MapBounds/MapBounds'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * ReviewBrowseMap allows a user to browse review tasks
 * geographically. Tasks are shown in clusters when appropriate, and
 * a bounding box is displayed while the tasks load.
 *
 * As the map is moved, its current bounds are updated in the redux store so
 * that other components can make use of the bounds if desired
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ReviewBrowseMap extends Component {
  currentBounds = null
  mapMarkers = null
  taskMarkers = null
  skipNextUpdateBounds = false

  componentDidUpdate(prevProps, prevState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:
    if (_get(prevProps, 'reviewData') !== _get(this.props, 'reviewData')) {
      return true
    }

    // the base layer has changed, or
    if (_get(prevProps, 'source.id') !== _get(this.props, 'source.id')) {
      return true
    }

    // the available overlays have changed, or
    if (!_isEqual(prevProps.intersectingOverlays, this.props.intersectingOverlays)) {
      return true
    }

    // the visible overlays have changed, or
    if (prevProps.visibleOverlays.length !== this.props.visibleOverlays.length) {
       return true
    }

    // the task markers have changed
    if (_get(prevProps, 'taskMarkers.length') !==
        _get(this.props, 'taskMarkers.length')) {
      return true
    }

    // the task markers have changed
    if (_get(prevProps, 'taskMarkers') !== _get(this.props, 'taskMarkers')) {
      return true
    }

    // the loading status of tasks change
    if (!!prevProps.tasksLoading !== !!this.props.tasksLoading) {
      return true
    }

    return false
  }

  /**
   * Signal a change to the current map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)){
      return
    }
    else if (this.currentBounds && bounds && boundsWithinDegrees(bounds, this.currentBounds, 2.5/zoom)) {
      return
    }
    else if (this.skipNextUpdateBounds) {
      this.currentBounds = toLatLngBounds(bounds)
      this.skipNextUpdateBounds = false
      return
    }

    if (!this.skipNextUpdateBounds) {
      this.currentBounds = toLatLngBounds(bounds)
      if (!this.props.loading) {
        this.debouncedUpdateReview(bounds.toBBoxString())
      }
    }
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    this.currentBounds = toLatLngBounds(bbox(marker.options.bounding))
    this.skipNextUpdateBounds = true
    this.debouncedUpdateReview(this.currentBounds.toBBoxString())
  }

  debouncedUpdateReview = _debounce(this.props.updateReview, 200)

  generateMarkers = (props) => {
    if (this.mapMarkers === null || !_isEqual(props.taskMarkers, this.taskMarkers)) {
      this.taskMarkers = this.props.taskMarkers
      this.mapMarkers = _map(this.props.taskMarkers, (mark, index) => {
        const icon = mark.icon
        if (icon) {
          return <Marker key={`marker-${index}`} position={mark.position} icon={icon}
                         onClick={() => this.markerClicked(mark)} />
        }
        else {
          return <Marker key={`marker-${index}`} position={mark.position}
                         onClick={() => this.markerClicked(mark)} />
        }
      })
    }
  }

  render() {
    if (!this.props.reviewData) {
      return null
    }

    // Get the bounding so we know which part of the map to display.
    if (_get(this.props, 'reviewCriteria.boundingBox')) {
      this.currentBounds = toLatLngBounds(_get(this.props, 'reviewCriteria.boundingBox').split(","))
      this.skipNextUpdateBounds = true
    }

    const hasTaskMarkers = _get(this.props, 'taskMarkers.length', 0) > 0

    let bounding = null
    if (hasTaskMarkers) {
      bounding = bboxPolygon(
        bbox(featureCollection(
          _map(this.props.taskMarkers,
               marker => point([marker.position[1], marker.position[0]]))
        ))
      )
    }

    if (hasTaskMarkers) {
      this.generateMarkers(this.props)
    }

    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    const map =
      <EnhancedMap className="mr-z-0"
                   center={latLng(0, 45)}
                   zoom={3} minZoom={2} maxZoom={18}
                   setInitialBounds={false}
                   initialBounds = {this.currentBounds}
                   zoomControl={false} animate={true} worldCopyJump={true}
                   features={bounding}
                   justFitFeatures={hasTaskMarkers}
                   onBoundsChange={this.updateBounds}>
        <ZoomControl className="mr-z-10" position='topright' />
        <VisibleTileLayer {...this.props} zIndex={1} />
        {overlayLayers}
        {this.mapMarkers}
      </EnhancedMap>

    return (
      <div className={classNames('challenge-task-map', this.props.className)}>
        <LayerToggle {...this.props} />
        {map}
        {!!this.props.tasksLoading && <BusySpinner />}
      </div>
    )
  }
}

ReviewBrowseMap.propTypes = {
  /** Map markers for the tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  tasksLoading: PropTypes.bool,
  /** Invoked when the user moves the map */
  //setReviewBrowseMapBounds: PropTypes.func.isRequired,
  /** Invoked when the user clicks on an individual task marker */
  //onTaskClick: PropTypes.func,
}

export default
  WithStatus(
    WithVisibleLayer(
      WithIntersectingOverlays(ReviewBrowseMap, 'reviewBrowse')
    )
  )
