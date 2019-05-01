import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker} from 'react-leaflet'
import { latLng } from 'leaflet'
import bbox from '@turf/bbox'
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
import './ReviewBrowseMap.scss'

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

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:
    if (_get(nextProps, 'reviewCriteria.boundingBox') !== _get(this.props, 'reviewCriteria.boundingBox')) {
      return true
    }

    // the base layer has changed, or
    if (_get(nextProps, 'source.id') !== _get(this.props, 'source.id')) {
      return true
    }

    // the available overlays have changed, or
    if (!_isEqual(nextProps.intersectingOverlays, this.props.intersectingOverlays)) {
      return true
    }

    // the visible overlays have changed, or
    if (nextProps.visibleOverlays.length !== this.props.visibleOverlays.length) {
       return true
    }

    // the task markers have changed
    if (_get(nextProps, 'taskMarkers.length') !==
        _get(this.props, 'taskMarkers.length')) {
      return true
    }

    // the task markers have changed
    if (_get(nextProps, 'taskMarkers') !== _get(this.props, 'taskMarkers')) {
      return true
    }

    // the loading status of tasks change
    if (!!nextProps.loading !== !!this.props.loading) {
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

    if (_get(this.props, 'taskMarkers.length', 0) > 0) {
      this.generateMarkers(this.props)
    }

    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    const map =
      <EnhancedMap className="mr-z-0"
                   center={latLng(0, 0)}
                   zoom={2} minZoom={2} maxZoom={16}
                   setInitialBounds={false}
                   initialBounds = {this.currentBounds}
                   zoomControl={false} animate={false} worldCopyJump={true}
                   onBoundsChange={this.updateBounds}>
        <ZoomControl className="mr-z-10" position='topright' />
        <VisibleTileLayer {...this.props} zIndex={1} />
        {overlayLayers}
        {this.mapMarkers}
      </EnhancedMap>

    return (
      <div className={classNames('review-browse-map', {"full-screen-map": this.props.isMobile})}>
        <LayerToggle {...this.props} />
        {map}
        {!!this.props.loading && <BusySpinner mapMode />}
      </div>
    )
  }
}

ReviewBrowseMap.propTypes = {
  /** Map markers for the tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  loading: PropTypes.bool,
  /** Invoked when the user moves the map */
  updateReview: PropTypes.func.isRequired,
}

export default
  WithStatus(
    WithVisibleLayer(
      WithIntersectingOverlays(ReviewBrowseMap, 'reviewBrowse')
    )
  )
