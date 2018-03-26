import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import _isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'
import { ChallengeBasemap, BasemapLayerSources }
       from '../Challenge/ChallengeBasemap/ChallengeBasemap'
import messages from './Messages'

export const layerSourceShape = PropTypes.shape({
  /** Unique id for layer */
  layerId: PropTypes.string.isRequired,
  /** Human-readable name of layer formatted as react-intl message */
  name: PropTypes.object,
  /** Tile server URL. Supports substitutions: {x}, {y}, {z}, {accessToken} */
  url: PropTypes.string.isRequired,
  /** Human-readable attribution of layer formatted as react-intl message */
  attribution: PropTypes.object,
  /** Width/height of tiles */
  tileSize: PropTypes.number,
  /**
   * Set to true to adjust non-retina tiles for retina displays. tileSize may
   * also need to be adjusted.
   *
   * @see See http://leafletjs.com/reference-1.0.3.html#tilelayer-detectretina
   */
  detectRetina: PropTypes.bool,
  /** Access token for substitution in tile server url */
  accessToken: PropTypes.string,
  /** Set to true to mark as the default layer */
  default: PropTypes.bool,
  /** Set to false if layer should not be offered to users for selection */
  isSelectable: PropTypes.bool,
  /** Set to true for dynamically-created layers, such as custom basemaps */
  isDynamic: PropTypes.bool,
})

export const OPEN_STREET_MAP = 'OpenStreetMap'
export const OPEN_CYCLE_MAP = 'OpenCycleMap'
export const BING = 'Bing'
export const MAPBOX_STREETS = 'Mapbox'
export const MAPBOX_LIGHT = 'MapboxLight'
export const MAPBOX_SATELLITE_STREETS = 'MapboxSatellite'

/** Array of available layer sources */
export const LayerSources = [{
    layerId: OPEN_STREET_MAP,
    name: messages.openStreetMapName,
    url: process.env.REACT_APP_OPEN_STREET_MAP_TILESERVER_URL,
    attribution: messages.openStreetMapAttribution,
  }, {
    layerId: OPEN_CYCLE_MAP,
    name: messages.openCycleMapName,
    url: process.env.REACT_APP_OPEN_CYCLE_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_THUNDERFOREST_ACCESS_TOKEN,
    attribution: messages.openCycleMapAttribution,
  }, {
    layerId: BING,
    name: messages.bingName,
    url: process.env.REACT_APP_BING_MAP_TILESERVER_URL,
    attribution: messages.bingAttribution,
  }]

// If a Thunderforest api key has been provided, switch from the old
// opencyclemap.org url to the new thunderforest.com url so that the
// "API Key Required" overlay will be removed (and we get retina).
if (!_isEmpty(process.env.REACT_APP_THUNDERFOREST_ACCESS_TOKEN)) {
  _find(LayerSources, {layerId: OPEN_CYCLE_MAP}).url =
    process.env.REACT_APP_THUNDERFOREST_TILESERVER_URL
}

// If a Mapbox access/api token has been provided, then add Mapbox layer
// sources.
if (!_isEmpty(process.env.REACT_APP_MAPBOX_ACCESS_TOKEN)) {
  LayerSources.push({
    layerId: MAPBOX_STREETS,
    name: messages.mapboxStreetsName,
    url: process.env.REACT_APP_MAPBOX_STREETS_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attribution: messages.mapboxAttribution,
    default: true,
  })

  LayerSources.push({
    layerId: MAPBOX_SATELLITE_STREETS,
    name: messages.mapboxSatelliteName,
    url: process.env.REACT_APP_MAPBOX_SATELLITE_STREETS_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attribution: messages.mapboxAttribution,
  })

  LayerSources.push({
    layerId: MAPBOX_LIGHT,
    name: messages.mapboxLightName,
    url: process.env.REACT_APP_MAPBOX_LIGHT_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attribution: messages.mapboxAttribution,
  })
}

/**
 * Returns a default layer source for use in situations where no layer source
 * has been specified.
 */
export const defaultLayerSource = function() {
  const configuredDefault = _find(LayerSources, {default: true})
  return configuredDefault ? configuredDefault : LayerSources[0]
}

/**
 * Retrieves the (static) layer source with a matching id. Dynamic layer
 * sources are not searched.
 */
export const layerSourceWithId = function(layerId) {
  return _find(LayerSources, {layerId})
}

/**
 * Create and return a dynamic layer source with the given layerId
 * and url. Primarily intended for use with custom basemaps.
 */
export const createDynamicLayerSource = function(layerId, url) {
  return {
    layerId,
    name: messages.customName,
    url,
    isSelectable: false,
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
      return layerSourceWithId(BasemapLayerSources[basemapSetting])
    }
    else if (!_isEmpty(customBasemap)) {
      return createDynamicLayerSource(layerId, customBasemap)
    }
  }

  return null
}
