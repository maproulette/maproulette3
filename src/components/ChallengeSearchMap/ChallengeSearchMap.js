import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import { latLng } from 'leaflet'
import { layerSourceWithId } from '../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithIntersectingOverlays
       from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

/**
 * ChallengeSearchMap presents a specially configured EnhancedMap that can be used to
 * search for challenges geographically (i.e., challenges with tasks within the
 * map bounds). It also can be used to visually represent geographic boundaries
 * while deciding on a challenge, such as when the user applies the "Near Me"
 * challenge filter.
 *
 * Initial map bounds can be provided, and the ChallengeSearchMap will also update the
 * current bounds in the redux store as the map is moved so that other components
 * (like challenge results) can apply the bounds appropriately.
 *
 * > Note: because this map both updates bounds and accepts bounds, it must be
 * > careful to avoid an infinite loop. To do this, it treats the accepted
 * > mapBounds as initial bounds and only honors new bounds if they have the
 * > fromUserAction flag set to true. This component never sets that flag
 * > itself when dispatching new map bounds.
 *
 * @see See EnhancedMap
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeSearchMap extends Component {
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

    // the task markers have changed
    if (_get(nextProps, 'taskMarkers.length') !==
        _get(this.props, 'taskMarkers.length')) {
      return true
    }

    // the loading status of tasks has been changed
    if (!!nextProps.tasksLoading !== !!this.props.tasksLoading) {
      return true
    }

    // it's the first time we've been given specific map bounds, or
    if (this.props.mapBounds === null && nextProps.mapBounds !== null) {
      return true
    }

    // if mapbounds change we need to also update map
    if ((!this.props.mapBounds.bounds && nextProps.mapBounds.bounds) ||
        (nextProps.mapBounds.bounds && !this.props.mapBounds.bounds.equals(nextProps.mapBounds.bounds))) {
        return true
    }

    // a change in map bounds was initiated by a user action, as opposed
    // to simply navigating around in the map.
    if (_get(nextProps, 'mapBounds.fromUserAction')) {
      return true
    }

    return false
  }

  /**
   * Signal a change to the current challenge search map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom, fromUserAction=false) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    this.currentBounds = bounds
    this.props.updateChallengeSearchMapBounds(bounds, fromUserAction)
  }

  /**
   * Invoked to request popup content when a task marker on the map is clicked
   */
  popupContent = marker => {
    const content = (
      <div className="marker-popup-content">
        <h3>
          <a onClick={() => this.props.history.push(
            `/browse/challenges/${marker.options.challengeId}`
          )}>
            {marker.options.challengeName}
          </a>
        </h3>

        <div className="marker-popup-content__links">
          <div>
            <a onClick={() => {
              this.props.onTaskClick(marker.options.challengeId,
                                     marker.options.isVirtualChallenge,
                                     marker.options.taskId)
            }}>
              {this.props.intl.formatMessage(messages.startChallengeLabel)}
            </a>
          </div>
        </div>
      </div>
    )


    const contentElement = document.createElement('div')
    ReactDOM.render(content, contentElement)
    return contentElement
  }

  render() {
    const hasMarkers = _get(this.props, 'taskMarkers.length', 0) > 0

    if (hasMarkers) {
      _each(this.props.taskMarkers, marker => marker.popup = this.popupContent)
    }

    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    // If the app is still loading then we have no initialBounds
    const initialBounds = _get(this.props, 'mapBounds.bounds')

    return (
      <div key='ChallengeSearchMap'
           className={classNames('full-screen-map', this.props.className)}>
        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)} zoom={3} minZoom={2} maxZoom={18}
                     setInitialBounds={false}
                     initialBounds = {initialBounds}
                     zoomControl={false} animate={true}
                     onBoundsChange={this.updateBounds}>
          <ZoomControl position='topright' />
          <SourcedTileLayer {...this.props} zIndex={1} />
          {overlayLayers}
          {hasMarkers &&
           <MarkerClusterGroup markers={this.props.taskMarkers} />
          }
        </EnhancedMap>

        {!!this.props.tasksLoading && <BusySpinner />}
      </div>
    )
  }
}

ChallengeSearchMap.propTypes = {
  /**
   * Initial bounds at which to render the map. To avoid an infinite loop, this
   * will only be honored once, unless the fromUserAction flag is set to true
   * on updated mapBounds values.
   */
  mapBounds: PropTypes.object,
  /** Invoked when the user moves the challenge Search map */
  updateChallengeSearchMapBounds: PropTypes.func.isRequired,
  /** The currently enabled challenge filter, if any */
  searchFilters: PropTypes.object,
  /** Task markers to display */
  taskMarkers: PropTypes.array,
}

export default WithVisibleLayer(
      WithIntersectingOverlays(
        injectIntl(ChallengeSearchMap),
        'challenges'
      )
    )
