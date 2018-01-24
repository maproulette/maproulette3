import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { TileLayer } from 'react-leaflet'
import { layerSourceShape } from '../../../services/VisibleLayer/LayerSources'

/**
 * SourcedTileLayer renders a react-leaflet TileLayer from the current
 * LayerSource. Source attribution for the layer is included by default,
 * but can be suppressed with the skipAttribution prop.
 *
 * @see See [react-leaflet](https://github.com/PaulLeCam/react-leaflet)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class SourcedTileLayer extends Component {
  render() {
    const attribution =
      this.props.skipAttribution ? null :
      this.props.intl.formatMessage({id: this.props.source.attributionId,
                                     defaultMessage: ' '})

    return <TileLayer key={this.props.source.name}
                      {...this.props.source}
                      attribution={attribution}
                      {...this.props} />
  }
}

SourcedTileLayer.propTypes = {
  /** LayerSource to use */
  source: layerSourceShape.isRequired,
  /** Set to true to suppress display of source attribution */
  skipAttribution: PropTypes.bool,
}

SourcedTileLayer.defaultProps = {
  skipAttribution: false,
}

export default injectIntl(SourcedTileLayer)
