import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Map, Rectangle } from 'react-leaflet'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { defaultLayerSource } from '../../services/VisibleLayer/LayerSources'
import { boundingBoxForCountry } from '../../services/Leaderboard/CountryBoundingBoxes'
import './LeaderboardMap.css'


export default class LeaderboardMap extends Component {
  render() {
    const boundingBox = boundingBoxForCountry(this.props.countryCode)

    return (
      <div className={classNames("leaderboard-map", this.props.className)}>
        <Map bounds={toLatLngBounds(boundingBox)}
             maxBounds={toLatLngBounds(boundingBox)}
             zoomControl={false} worldCopyJump={true} dragging={false}
             scrollWheelZoom={false}
             attributionControl={false}>
          <SourcedTileLayer source={defaultLayerSource()} skipAttribution={true} />
          <Rectangle bounds={toLatLngBounds(boundingBox)} />
        </Map>
      </div>
    )
  }
}

LeaderboardMap.propTypes = {
  /** Desired center-point of the map */
  countryCode: PropTypes.string.isRequired,
}
