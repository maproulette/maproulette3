import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import _get from 'lodash/get'
import { latLng } from 'leaflet'
import { ChallengeLocation }
       from '../../services/Challenge/ChallengeLocation/ChallengeLocation'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import WithChallengeFilters from '../HOCs/WithChallengeFilters/WithChallengeFilters'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithMapBounds from '../HOCs/WithMapBounds/WithMapBounds'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * LocatorMap presents a specially configured EnhancedMap that can be used to
 * search for challenges geographically (i.e., challenges with tasks within the
 * map bounds). It also can be used to visually represent geographic boundaries
 * while deciding on a challenge, such as when the user applies the "Near Me"
 * challenge filter.
 *
 * Initial map bounds can be provided, and the LocatorMap will also update the
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
export class LocatorMap extends Component {
  currentBounds = null

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:

    // the layer has been changed, or
    if (nextProps.layerSourceId !== this.props.layerSourceId) {
      return true
    }

    // it's the first time we've been given specific map bounds, or
    if (this.props.mapBounds.locator === null && nextProps.mapBounds.locator !== null) {
      return true
    }

    // a change in map bounds was initiated by a user action, as opposed
    // to simply navigating around in the map.
    if (_get(nextProps, 'mapBounds.locator.fromUserAction')) {
      return true
    }

    return false
  }

  /**
   * Signal a change to the current locator map bounds in response to a change
   * to the map (panning or zooming). If searching within map bounds is also
   * active, then signal that the map-bounded challenges also need to be
   * refreshed.
   *
   * @private
   */
  updateBounds = (bounds, zoom, fromUserAction=false) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    this.currentBounds = bounds
    this.props.setLocatorMapBounds(bounds, zoom, fromUserAction)

    if (_get(this.props, 'challengeFilter.location') ===
        ChallengeLocation.withinMapBounds) {
      this.props.updateBoundedChallenges(bounds)
    }
  }

  render() {
    return (
      <div key='locator'
           className={classNames('full-screen-map', this.props.className)}>
        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)} zoom={3} minZoom={2} maxZoom={18}
                     setInitialBounds={false}
                     initialBounds = {_get(this.props, 'mapBounds.locator.bounds')}
                     zoomControl={false} animate={true}
                     onBoundsChange={this.updateBounds}>
          <ZoomControl position='topright' />
          <VisibleTileLayer defaultLayer={this.props.layerSourceId} />
        </EnhancedMap>
      </div>
    )
  }
}

LocatorMap.propTypes = {
  /**
   * Initial bounds at which to render the map. To avoid an infinite loop, this
   * will only be honored once, unless the fromUserAction flag is set to true
   * on updated mapBounds values.
   */
  mapBounds: PropTypes.object,
  /** Invoked when the user moves the locator map */
  setLocatorMapBounds: PropTypes.func.isRequired,
  /** layerId of default layer to display */
  layerSourceId: PropTypes.string,
  /** The currently enabled challenge filter, if any */
  challengeFilter: PropTypes.object,
}

export default WithChallengeFilters(WithMapBounds(LocatorMap))
