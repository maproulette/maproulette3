import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with VisibleLayer
 */
export default defineMessages({
  openStreetMapName: {
    id: "map.name.openStreetMap",
    defaultMessage: "OpenStreetMap",
  },

  openStreetMapAttribution: {
    id: "map.attribution.openStreetMap",
    defaultMessage: "&copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>",
  },

  openCycleMapName: {
    id: "map.name.openCycleMap",
    defaultMessage: "OpenCycleMap",
  },

  openCycleMapAttribution: {
    id: "map.attribution.openCycleMap",
    defaultMessage: "&copy; OpenCycleMap, Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>",
  },

  bingName: {
    id: "map.name.bing",
    defaultMessage: "Bing",
  },

  bingAttribution: {
    id: "map.attribution.bing",
    defaultMessage: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },

  mapboxStreetsName: {
    id: "map.name.mapbox",
    defaultMessage: "Mapbox",
  },

  mapboxLightName: {
    id: "map.name.mapboxLight",
    defaultMessage: "Mapbox Light",
  },

  mapboxSatelliteName: {
    id: "map.name.mapboxSatellite",
    defaultMessage: "Mapbox Satellite",
  },

  mapboxAttribution: {
    id: "map.attribution.mapbox",
    defaultMessage: "&copy <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>, &copy <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  },

  customName: {
    id: "map.name.custom",
    defaultMessage: "Custom",
  }
})
