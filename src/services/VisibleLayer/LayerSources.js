import PropTypes from 'prop-types'
import QueryString from 'query-string'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { ChallengeBasemap, basemapLayerSources }
       from '../Challenge/ChallengeBasemap/ChallengeBasemap'
import defaultLayers from '../../defaultLayers.json'
import extraLayers from '../../extraLayers.json'

export const layerSourceShape = PropTypes.shape({
  /** Unique id for layer */
  id: PropTypes.string.isRequired,
  /** The type of layer (tms, wms, bing, etc) */
  type: PropTypes.oneOf(['tms', 'wms', 'bing']),
  /** Human-readable name of layer formatted as react-intl message */
  name: PropTypes.string,
  /** Description of the layer */
  description: PropTypes.string,
  /** Tile server URL */
  url: PropTypes.string.isRequired,
  /** Human-readable attribution of layer formatted as react-intl message */
  attribution: PropTypes.shape({
    /** True if attribution is required */
    required: PropTypes.bool,
    /** The attribution text to show */
    text: PropTypes.string,
    /** The URL to which the attribution text should link */
    url: PropTypes.string,
  }),
  /** The maximum zoom supported by the layer */
  max_zoom: PropTypes.number,
  /** Width/height of tiles */
  tileSize: PropTypes.number,
  /** Set to true to mark as a default layer */
  default: PropTypes.bool,
  /** Set to true for dynamically-created layers, such as custom basemaps */
  isDynamic: PropTypes.bool,
})

export const OPEN_STREET_MAP = 'MAPNIK'
export const OPEN_CYCLE_MAP = 'tf-cycle'
export const BING = 'Bing'
export const MAPBOX_STREETS = 'Mapbox'
export const MAPBOX_LIGHT = 'MapboxLight'
export const MAPBOX_SATELLITE_STREETS = 'MapboxSatellite'

/**
 * Array of available layer sources. Start with default layers from the [OSM
 * Editor Layer Index](https://github.com/osmlab/editor-layer-index) and
 * add/override based on local .env file settings.
 */
export const LayerSources = defaultLayers.concat(extraLayers)

// Load any API keys from .env file
let layerAPIKeys = {}
if (_get(process.env, 'REACT_APP_MAP_LAYER_API_KEYS', '').length > 0) {
  try {
    layerAPIKeys = JSON.parse(process.env.REACT_APP_MAP_LAYER_API_KEYS)
  }
  catch(e) {
    console.log("Failed to parse map layer API keys. Ignoring.")
    console.log(e)
  }
}

export const normalizeBingLayer = function(layer) {
  const normalizedLayer = Object.assign({}, layer)
  normalizedLayer.url = process.env.REACT_APP_BING_MAP_TILESERVER_URL
  normalizedLayer.maxZoom = normalizedLayer.max_zoom

  return normalizedLayer
}

export const normalizeTMSLayer = function(layer) {
  const normalizedLayer = Object.assign({}, layer)
  normalizedLayer.subdomains = (normalizedLayer.url.match(/{switch:(.*?)}/) || ['',''])[1].split(',')
  normalizedLayer.url = normalizedLayer.url.replace(/{switch:(.*?)}/, '{s}')
  normalizedLayer.url = normalizedLayer.url.replace('{zoom}', '{z}')
  normalizedLayer.maxZoom = normalizedLayer.max_zoom

  // If an API key has been specified in .env file, add it into layer url
  const apiKey = layerAPIKeys[normalizedLayer.id]
  if (apiKey) {
    const urlComponents = QueryString.parseUrl(normalizedLayer.url)
    urlComponents.query[apiKey.name] = apiKey.value
    normalizedLayer.url = urlComponents.url + '?' + QueryString.stringify(urlComponents.query)
  }

  return normalizedLayer
}

export const normalizeLayer = function(layer) {
  switch(layer.type) {
    case 'bing':
      return normalizeBingLayer(layer)
    case 'tms':
      return normalizeTMSLayer(layer)
    default:
      return layer
  }
}

/**
 * Returns a default layer source for use in situations where no layer source
 * has been specified.
 */
export const defaultLayerSource = function() {
  const configuredDefault = _find(LayerSources, {id: process.env.REACT_APP_DEFAULT_MAP_LAYER_ID})
  return configuredDefault ? configuredDefault : LayerSources[0]
}

/**
 * Retrieves the (static) layer source with a matching id. Dynamic layer
 * sources are not searched.
 */
export const layerSourceWithId = function(id) {
  return _find(LayerSources, {id})
}

/**
 * Create and return a dynamic layer source with the given layerId
 * and url. Primarily intended for use with custom basemaps.
 */
export const createDynamicLayerSource = function(layerId, url) {
  return {
    id: layerId,
    name: 'Custom',
    url,
    isDynamic: true,
  }
}

/**
 * Returns a layer source for the given basemapSetting, including generating a
 * dynamic layer source with the given customBasemap and layerId if appropriate.
 */
export const basemapLayerSource = function(basemapSetting, customBasemap, layerId) {
  if (_isFinite(basemapSetting) && basemapSetting !== ChallengeBasemap.none) {
    if (basemapSetting !== ChallengeBasemap.custom) {
      return layerSourceWithId(basemapLayerSources()[basemapSetting])
    }
    else if (!_isEmpty(customBasemap)) {
      return createDynamicLayerSource(layerId, customBasemap)
    }
  }

  return null
}
