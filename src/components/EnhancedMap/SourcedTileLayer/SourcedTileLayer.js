import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, FormattedMessage } from 'react-intl'
import { TileLayer } from 'react-leaflet'
import { BingLayer } from 'react-leaflet-bing-v2'
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
const SourcedTileLayer = (props) => {
  const [layerRenderFailed, setLayerRenderFailed] = useState(false)

  const attribution = layer => {
    if (props.skipAttribution || _isEmpty(layer.attribution)) {
      return null
    }

    return layer.attribution.url ?
           `<a href="${layer.attribution.url}">${layer.attribution.text}</a>` :
           layer.attribution.text
  }

  useEffect(() => {
    if (layerRenderFailed && currentLayer) {
      setLayerRenderFailed(false)
    }
  }, [props.source.id])

  if (!props.source) {
    return null
  }

  if (layerRenderFailed) {
    if (fallbackLayer) {
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

  const normalizedLayer = normalizeLayer(props.source)

  if (normalizedLayer.type === 'bing') {
    return (
      <BingLayer
        key={normalizedLayer.id}
        {...normalizedLayer}
        type="Aerial"
        attribution={attribution(normalizedLayer)}
      />
    )
  }

  return (
    <TileLayer
      noWrap={true} 
      key={normalizedLayer.id}
      {...normalizedLayer}
      attribution={attribution(normalizedLayer)}
      {...props}
    />
  )
}

SourcedTileLayer.propTypes = {
  /** LayerSource to use */
  source: layerSourceShape,
  /** Set to true to suppress display of source attribution */
  skipAttribution: PropTypes.bool,
}

SourcedTileLayer.defaultProps = {
  skipAttribution: false,
}

export default WithErrors(injectIntl(SourcedTileLayer))
