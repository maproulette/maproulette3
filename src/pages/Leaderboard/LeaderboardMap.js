import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Map, Rectangle } from 'react-leaflet'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { layerSourceWithId, defaultLayerSource }
       from '../../services/VisibleLayer/LayerSources'
import { boundingBoxForCountry }
       from '../../services/Leaderboard/CountryBoundingBoxes'
import SourcedTileLayer
       from '../../components/EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import './LeaderboardMap.scss'


export default class LeaderboardMap extends Component {
  mapLayerSource = () => {
    return layerSourceWithId("osm-mapnik-black_and_white") || defaultLayerSource()
  }

  render() {
    const boundingBox = boundingBoxForCountry(this.props.countryCode)

    return (
      <div className={classNames("leaderboard-map", this.props.className)}>
        <Map bounds={toLatLngBounds(boundingBox)}
             maxBounds={toLatLngBounds(boundingBox)}
             zoomControl={false} worldCopyJump={true} dragging={false}
             scrollWheelZoom={false}
             attributionControl={false}>
          <SourcedTileLayer source={this.mapLayerSource()} skipAttribution={true} />
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
