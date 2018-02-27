import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _map from 'lodash/map'
import { latLng } from 'leaflet'
import { TaskStatus } from '../../services/Task/TaskStatus/TaskStatus'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithMapBounds from '../HOCs/WithMapBounds/WithMapBounds'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import BusySpinner from '../BusySpinner/BusySpinner'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * ChallengeMap allows a user to browse a challenge and its tasks
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
export class ChallengeMap extends Component {
  currentBounds = null

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:

    // the layer has been changed, or
    if (nextProps.layerSourceId !== this.props.layerSourceId) {
      return true
    }

    // the browsed challenge has changed, or
    if (_get(nextProps, 'browsedChallenge.id') !== 
        _get(this.props, 'browsedChallenge.id')) {
      return true
    }

    // the challenge id of the clustered tasks change
    if (_get(nextProps, 'clusteredTasks.challengeId') !==
        _get(this.props, 'clusteredTasks.challengeId')) {
      return true
    }

    // the loading status of clustered tasks change
    if (_get(nextProps, 'clusteredTasks.loading') !==
        _get(this.props, 'clusteredTasks.loading')) {
      return true
    }

    // the clustered tasks themselves change
    if (_get(nextProps, 'clusteredTasks.tasks.length') !==
        _get(this.props, 'clusteredTasks.tasks.length')) {
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
    this.props.setChallengeMapBounds(this.props.browsedChallenge.id,
                                     bounds, zoom)
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    if (this.props.onTaskClick) {
      this.props.onTaskClick(marker.options.challengeId, marker.options.taskId)
    }
    else {
      this.props.history.push(
        `/challenge/${marker.options.challengeId}/task/${marker.options.taskId}`)
    }
  }

  render() {
    if (!this.props.browsedChallenge) {
      return null
    }

    let fetchingClusteredTasks = false
    const markers = []
    let bounding = null

    // If we have clustered tasks for our challenge, create markers for them.
    if (_get(this.props, 'clusteredTasks.challengeId') ===
        this.props.browsedChallenge.id) {
      fetchingClusteredTasks = this.props.clusteredTasks.loading

      if (_get(this.props, 'clusteredTasks.tasks.length') > 0) {
        _each(this.props.clusteredTasks.tasks, task => {
          // Only show created or skipped tasks
          if (task.status === TaskStatus.created ||
              task.status === TaskStatus.skipped) {
            markers.push({
              position: [task.point.lat, task.point.lng],
              options: {
                challengeId: task.parent,
                taskId: task.id,
              },
            })
          }
        })
      }
    }

    // Get the challenge bounding so we know which part of the map to display.
    // Right now API double-nests bounding, but that will likely change.
    bounding = _get(this.props, 'browsedChallenge.bounding.bounding') ||
               _get(this.props, 'browsedChallenge.bounding')


    // If the challenge doesn't have a bounding polygon, build one from the
    // markers instead. This is extra work and requires waiting for the clustered
    // task data to arrive, so not ideal.
    if (!bounding && markers.length > 0) {
      bounding = bboxPolygon(
        bbox(featureCollection(
          _map(markers, marker => point([marker.position[1], marker.position[0]]))
        ))
      )
    }

    return (
      <div key={this.props.browsedChallenge.id}
           className={classNames('full-screen-map', this.props.className)}>
        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)} zoom={3} minZoom={2} maxZoom={18}
                     setInitialBounds={false}
                     initialBounds = {this.currentBounds}
                     zoomControl={false} animate={true}
                     features={bounding}
                     justFitFeatures={markers.length > 0}
                     onBoundsChange={this.updateBounds}>
          <ZoomControl position='topright' />
          <VisibleTileLayer defaultLayer={this.props.layerSourceId} />
          {markers.length > 0 &&
           <MarkerClusterGroup markers={markers} onMarkerClick={this.markerClicked} />
          }
        </EnhancedMap>

        {fetchingClusteredTasks && <BusySpinner />}
      </div>
    )
  }
}

ChallengeMap.propTypes = {
  /** The current challenge being browsed */
  browsedChallenge: PropTypes.object.isRequired,
  /** Invoked when the user moves the map */
  setChallengeMapBounds: PropTypes.func.isRequired,
  /** Invoked when the user clicks on an individual task marker */
  onTaskClick: PropTypes.func,
  /** layerId of default layer to display */
  layerSourceId: PropTypes.string,
}

export default WithMapBounds(WithStatus(ChallengeMap))
