import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Map, Marker } from 'react-leaflet'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import { MAPBOX_LIGHT,
         layerSourceWithName,
         defaultLayerSource } from '../../services/VisibleLayer/LayerSources'
import './InsetMap.css'

export default class InsetMap extends Component {
  render() {
    // Use requested layer source, otherwise Mapbox Light if it's available,
    // otherwise the default source.
    const layerSource =
      layerSourceWithName(this.props.layerSourceName || MAPBOX_LIGHT) ||
      defaultLayerSource()

    return (
      <div className={classNames("inset-map", this.props.className)}>
        <Map center={this.props.centerPoint}
             zoom={this.props.fixedZoom}
             minZoom={this.props.fixedZoom}
             maxZoom={this.props.fixedZoom}
             zoomControl={false}
             attributionControl={false}>
          <SourcedTileLayer source={layerSource} skipAttribution={true} />
          <Marker position={this.props.centerPoint}
                  {...(this.props.markerIcon ? {icon: this.props.markerIcon} : {})} />
        </Map>
      </div>
    )
  }
}

InsetMap.propTypes = {
  centerPoint: PropTypes.object.isRequired,
  fixedZoom: PropTypes.number,
  layerSourceName: PropTypes.string,
}

InsetMap.defaultProps = {
  fixedZoom: 3,
}
