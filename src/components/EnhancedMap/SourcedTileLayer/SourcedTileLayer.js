import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, FormattedMessage } from 'react-intl'
import { TileLayer } from 'react-leaflet'
import { BingLayer } from 'react-leaflet-bing'
import _isEmpty from 'lodash/isEmpty'
import WithErrors from '../../HOCs/WithErrors/WithErrors'
import AppErrors from '../../../services/Error/AppErrors'
import { layerSourceShape, normalizeLayer, defaultLayerSource }
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
  state = {}

  attribution = layer => {
    if (this.props.skipAttribution || _isEmpty(layer.attribution)) {
      return null
    }

    return layer.attribution.url ?
           `<a href="${layer.attribution.url}">${layer.attribution.text}</a>` :
           layer.attribution.text
  }

  componentDidCatch(error, info) {
    // Errors here are almost always related to bad layer info, e.g. from a
    // custom basemap. The most common problem is inclusion of an interpolation
    // variable in the URL that doesn't get replaced, which will cause Leaflet
    // to throw an exception
    const details =
      (this.props.source.name === "Custom" ? "custom basemap: " : "") + error.message
    this.props.addErrorWithDetails(AppErrors.map.renderFailure, details)
  }

  static getDerivedStateFromError(error) {
    return {layerRenderFailed: true}
  }

  render() {
    if (this.state.layerRenderFailed) {
      // Try rendering the default layer as a fallback. If we *are* the
      // fallback, just render an error message
      if (this.props.fallbackLayer) {
        return (
          <FormattedMessage
            {...AppErrors.map.renderFailure}
            values={{details: 'fallback to default layer failed'}}
          />
        )
      }
      else {
        return <SourcedTileLayer source={defaultLayerSource()} fallbackLayer={true} />
      }
    }

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

export default WithErrors(injectIntl(SourcedTileLayer))
