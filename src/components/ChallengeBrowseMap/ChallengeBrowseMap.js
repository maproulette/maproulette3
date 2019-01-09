import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import { latLng } from 'leaflet'
import { layerSourceWithId } from '../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithSearch from '../HOCs/WithSearch/WithSearch'
import WithIntersectingOverlays
       from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import BusySpinner from '../BusySpinner/BusySpinner'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * ChallengeBrowseMap allows a user to browse a challenge and its tasks
 * geographically. Tasks are shown in clusters when appropriate, and
 * a bounding box is displayed while the tasks load.
 *
 * As the map is moved, its current bounds are updated in the redux store so
 * that other components can make use of the bounds if desired (e.g.,
 * starting a challenge will begin with a task that is currently visible to
 * the user on the challenge map).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeBrowseMap extends Component {
  currentBounds = null

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:

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

    // the browsed challenge has changed, or
    if (_get(nextProps, 'browsedChallenge.id') !==
        _get(this.props, 'browsedChallenge.id')) {
      return true
    }

    // the task markers have changed
    if (_get(nextProps, 'taskMarkers.length') !==
        _get(this.props, 'taskMarkers.length')) {
      return true
    }

    // the loading status of tasks change
    if (!!nextProps.tasksLoading !== !!this.props.tasksLoading) {
      return true
    }

    return false
  }

  /**
   * Signal a change to the current challenge map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    this.currentBounds = bounds
    this.props.setChallengeBrowseMapBounds(this.props.browsedChallenge.id,
                                           bounds, zoom)
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    if (this.props.onTaskClick) {
      this.props.onTaskClick(marker.options.challengeId,
                             marker.options.isVirtualChallenge,
                             marker.options.taskId)
    }
  }

  render() {
    if (!this.props.browsedChallenge) {
      return null
    }

    let bounding = null
    // Get the challenge bounding so we know which part of the map to display.
    // Right now API double-nests bounding, but that will likely change.
    bounding = _get(this.props, 'browsedChallenge.bounding.bounding') ||
               _get(this.props, 'browsedChallenge.bounding')


    const hasTaskMarkers = _get(this.props, 'taskMarkers.length', 0) > 0

    // If the challenge doesn't have a bounding polygon, build one from the
    // markers instead. This is extra work and requires waiting for the task
    // data to arrive, so not ideal.
    if (!bounding && hasTaskMarkers) {
      bounding = bboxPolygon(
        bbox(featureCollection(
          _map(this.props.taskMarkers,
               marker => point([marker.position[1], marker.position[0]]))
        ))
      )
    }

    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    return (
      <div key={this.props.browsedChallenge.id}
           className={classNames('full-screen-map', this.props.className)}>
        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)} zoom={3} minZoom={2} maxZoom={18}
                     setInitialBounds={false}
                     initialBounds = {this.currentBounds}
                     zoomControl={false} animate={true} worldCopyJump={true}
                     features={bounding}
                     justFitFeatures={hasTaskMarkers}
                     onBoundsChange={this.updateBounds}>
          <ZoomControl position='topright' />
          <VisibleTileLayer {...this.props} zIndex={1} />
          {overlayLayers}
          {hasTaskMarkers &&
            <MarkerClusterGroup markers={this.props.taskMarkers}
                                onMarkerClick={this.markerClicked} />
          }
        </EnhancedMap>

        {!!this.props.tasksLoading && <BusySpinner />}
      </div>
    )
  }
}

ChallengeBrowseMap.propTypes = {
  /** The current challenge being browsed */
  browsedChallenge: PropTypes.object.isRequired,
  /** Map markers for the tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  tasksLoading: PropTypes.bool,
  /** Invoked when the user moves the map */
  setChallengeBrowseMapBounds: PropTypes.func.isRequired,
  /** Invoked when the user clicks on an individual task marker */
  onTaskClick: PropTypes.func,
}

export default WithSearch(
  WithStatus(
    WithVisibleLayer(
      WithIntersectingOverlays(ChallengeBrowseMap, 'challengeBrowse')
    )
  ),
  'challengeBrowse'
)
