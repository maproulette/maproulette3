import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { MapContainer, Marker } from 'react-leaflet'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import { layerSourceWithId,
         defaultLayerSource } from '../../services/VisibleLayer/LayerSources'
import './InsetMap.scss'

export default class InsetMap extends Component {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
  }

  componentDidUpdate(prevProps) {
    // If our parent provides height and width and they change, invalidate map
    // size so that Leaflet will re-render the tiles
    if (prevProps.h !== this.props.h || prevProps.w !== this.props.w) {
      this.mapRef.current.leafletElement.invalidateSize()
    }
  }

  render() {
    // Use requested layer source, otherwise the default source
    const layerSource =
      layerSourceWithId(this.props.layerSourceId) || defaultLayerSource()

    return (
      <div className={classNames("inset-map", this.props.className)}>
        <MapContainer
          center={this.props.centerPoint}
          zoom={this.props.fixedZoom}
          minZoom={this.props.fixedZoom}
          maxZoom={this.props.fixedZoom}
          zoomControl={false} worldCopyJump={true}
          attributionControl={false}
          whenCreated={this.mapRef}
        >
          <SourcedTileLayer source={layerSource} skipAttribution={true} />
          <Marker
            position={this.props.centerPoint}
            {...(this.props.markerIcon ? {icon: this.props.markerIcon} : {})}
          />
        </MapContainer>
      </div>
    )
  }
}

InsetMap.propTypes = {
  /** Desired center-point of the map */
  centerPoint: PropTypes.object.isRequired,
  /** Desired zoom of the map */
  fixedZoom: PropTypes.number,
  /** id of default layer to display */
  layerSourceId: PropTypes.string,
}

InsetMap.defaultProps = {
  fixedZoom: 3,
}
