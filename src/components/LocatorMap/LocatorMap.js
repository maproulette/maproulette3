import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { get as _get } from 'lodash'
import { latLng } from 'leaflet'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithMapBoundsState from '../HOCs/WithMapBounds/WithMapBoundsState'
import WithMapBoundsDispatch from '../HOCs/WithMapBounds/WithMapBoundsDispatch'
import { ZoomControl } from 'react-leaflet'

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
 * > fromUserAction flag set to true. This component never sets that flag when
 * > dispatching new map bounds.
 *
 * @see See EnhancedMap
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class LocatorMap extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // We only re-render if:
    // (1) the layer has been changed, or
    // (2) it's the first time we've been given specific map bounds, or
    // (3) a change in map bounds was initiated by a user action, as opposed
    //     to simply navigating around in the map.
    if (nextProps.layerSourceName !== this.props.layerSourceName ||
        (this.props.mapBounds.locator === null && nextProps.mapBounds.locator !== null) ||
        _get(nextProps, 'mapBounds.locator.fromUserAction')) {
      return true
    }

    return false
  }

  render() {
    return (
      <div className={classNames('default-map full-screen-map', this.props.className)}>
        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)} zoom={3} minZoom={3} setInitialBounds={false}
                     initialBounds = {_get(this.props, 'mapBounds.locator.bounds')}
                     zoomControl={false} animate={true}
                     onBoundsChange={this.props.setLocatorMapBounds}>
          <ZoomControl position='topright' />
          <VisibleTileLayer defaultLayer={this.props.layerSourceName} />
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
  /** Invoked when the user moves the map, altering the map bounds */
  setLocatorMapBounds: PropTypes.func.isRequired,
  /** Name of default layer to display */
  layerSourceName: PropTypes.string,
}

export default
  WithMapBoundsState(WithMapBoundsDispatch(LocatorMap))
