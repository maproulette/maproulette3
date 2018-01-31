import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import PropTypes from 'prop-types'

export const layerSourceShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  attributionId: PropTypes.string,
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

export const LayerSources = [
  {
    name: OPEN_STREET_MAP,
    url: process.env.REACT_APP_OPEN_STREET_MAP_TILESERVER_URL,
    attributionId: `map.attribution.${OPEN_STREET_MAP}`,
  },

  {
    name: OPEN_CYCLE_MAP,
    url: process.env.REACT_APP_OPEN_CYCLE_MAP_TILESERVER_URL,
    attributionId: `map.attribution.${OPEN_CYCLE_MAP}`
  },

  {
    name: BING,
    url: process.env.REACT_APP_BING_MAP_TILESERVER_URL,
    attributionId: `map.attribution.${BING}`,
    detectRetina: true,
    tileSize: 256,
  },
]

// If a Mapbox access/api token has been provided, then add Mapbox layer
// sources.
if (!_isEmpty(process.env.REACT_APP_MAPBOX_ACCESS_TOKEN)) {
  LayerSources.push({
    name: MAPBOX_STREETS,
    url: process.env.REACT_APP_MAPBOX_STREETS_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attributionId: `map.attribution.${MAPBOX_STREETS}`,
    default: true,
  })

  LayerSources.push({
    name: MAPBOX_SATELLITE_STREETS,
    url: process.env.REACT_APP_MAPBOX_SATELLITE_STREETS_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attributionId: `map.attribution.${MAPBOX_STREETS}`,
  })

  LayerSources.push({
    name: MAPBOX_LIGHT,
    url: process.env.REACT_APP_MAPBOX_LIGHT_MAP_TILESERVER_URL,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
    attributionId: `map.attribution.${MAPBOX_STREETS}`,
  })
}

export const defaultLayerSource = function() {
  const configuredDefault = _find(LayerSources, {default: true})
  return configuredDefault ? configuredDefault : LayerSources[0]
}

export const layerSourceWithName = function(name) {
  return _find(LayerSources, {name})
}
