import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { TileLayer } from 'react-leaflet'
import { BingLayer } from 'react-leaflet-bing'
import _isEmpty from 'lodash/isEmpty'
import { layerSourceShape, normalizeLayer }
       from '../../../services/VisibleLayer/LayerSources'

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
  attribution = layer => {
    if (this.props.skipAttribution || _isEmpty(layer.attribution)) {
      return null
    }

    return layer.attribution.url ?
           `<a href="${layer.attribution.url}">${layer.attribution.text}</a>` :
           layer.attribution.text
  }

  render() {
    const normalizedLayer = normalizeLayer(this.props.source)
    if (normalizedLayer.type === 'bing') {
      // Bing layers have to be specially rendered
      return (
        <BingLayer
          key={normalizedLayer.id}
          {...normalizedLayer}
          type="Aerial"
          attribution={this.attribution(normalizedLayer)}
          {...this.props}
        />
      )
    }

    return (
      <TileLayer
        key={normalizedLayer.id}
        {...normalizedLayer}
        attribution={this.attribution(normalizedLayer)}
        {...this.props}
      />
    )
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
