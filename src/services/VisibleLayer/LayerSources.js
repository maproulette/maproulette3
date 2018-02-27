import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import PropTypes from 'prop-types'
import messages from './Messages'

export const layerSourceShape = PropTypes.shape({
  name: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  attribution: PropTypes.object,
  tileSize: PropTypes.number,
  default: PropTypes.bool,
  public: PropTypes.bool,
  accessToken: PropTypes.string,
})

export const OPEN_STREET_MAP = 'OpenStreetMap'
export const OPEN_CYCLE_MAP = 'OpenCycleMap'
export const BING = 'Bing'
export const MAPBOX_STREETS = 'Mapbox'
export const MAPBOX_LIGHT = 'MapboxLight'
export const MAPBOX_SATELLITE_STREETS = 'MapboxSatellite'

export const LayerSources = [{
    layerId: OPEN_STREET_MAP,
    name: messages.openStreetMapName,
    url: process.env.REACT_APP_OPEN_STREET_MAP_TILESERVER_URL,
    attribution: messages.openStreetMapAttribution,
  }, {
    layerId: OPEN_CYCLE_MAP,
    name: messages.openCycleMapName,
    url: process.env.REACT_APP_OPEN_CYCLE_MAP_TILESERVER_URL,
    attribution: messages.openCycleMapAttribution,
  }, {
    layerId: BING,
    name: messages.bingName,
    url: process.env.REACT_APP_BING_MAP_TILESERVER_URL,
    attribution: messages.bingAttribution,
    detectRetina: true,
    tileSize: 256,
  }]

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

export const defaultLayerSource = function() {
  const configuredDefault = _find(LayerSources, {default: true})
  return configuredDefault ? configuredDefault : LayerSources[0]
}

export const layerSourceWithId = function(layerId) {
  return _find(LayerSources, {layerId})
}
