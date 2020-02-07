import L from 'leaflet'
import 'leaflet-vectoricon'
import { getType } from '@turf/invariant'
import _isUndefined from 'lodash/isUndefined'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _fromPairs from 'lodash/fromPairs'
import _intersection from 'lodash/intersection'
import _keys from 'lodash/keys'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

const supportedSimplestylePointProperties = [
  'marker-color', 'marker-size',
]

const supportedSimplestyleLineProperties = [
  'stroke', 'stroke-width', 'stroke-opacity', 'fill', 'fill-opacity',
]

// Names of supported simplestyle properties
export const supportedSimplestyles =
  supportedSimplestyleLineProperties.concat(supportedSimplestylePointProperties)

// Maps simplestyle line properties to corresponding leaflet style options
const simplestyleLineToLeafletMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity',
}

/**
 * AsSimpleStylableFeature adds functionality for interpreting
 * [simplestyle](https://github.com/mapbox/simplestyle-spec) properties
 */
export class AsSimpleStyleableFeature {
  constructor(feature) {
    Object.assign(this, feature)
  }

  /**
   * Styles the given Leaflet layer with any supported simplestyle properties
   * present on this feature
   */
  styleLeafletLayer(layer) {
    if (this.properties) {
      this.styleLeafletLayerWithStyles(layer, this.simplestyleFeatureProperties(), false)
    }
  }

  /**
   * Styles the given Leaflet layer using the given simplestyles object of
   * simplestyle property names and desired values. If
   * mergeWithFeatureProperties is true (the default) then all simplestyle
   * properties specified on the feature will also be used, but overriden by
   * given styles where duplicated
   */
  styleLeafletLayerWithStyles(layer, simplestyles, mergeWithFeatureProperties=true) {
    const styles =
      mergeWithFeatureProperties ?
      _merge({}, this.simplestyleFeatureProperties(), simplestyles) :
      simplestyles

    if (getType(layer.feature) === 'Point') {
      const supportedStyles =
        _intersection(_keys(styles), supportedSimplestylePointProperties)

      this.styleLeafletMarkerLayer(layer, _pick(styles, supportedStyles))
    }
    else {
      const supportedStyles =
        _intersection(_keys(styles), supportedSimplestyleLineProperties)

      this.styleLeafletPathLayer(layer, _pick(styles, supportedStyles))
    }
  }

  /**
   * Styles a leaflet path layer with the given line-compatible simplestyles
   */
  styleLeafletPathLayer(layer, lineStyles) {
    if (!layer.setStyle) {
      return
    }

    _each(lineStyles, (styleValue, styleName) => {
      layer.setStyle({[simplestyleLineToLeafletMapping[styleName]]: styleValue})
    })
  }

  /**
   * Styles a leaflet marker layer with the given point-compatible simplestyles
   */
  styleLeafletMarkerLayer(layer, pointStyles) {
    if (!layer.setIcon) {
      return
    }

    const customMarker = {
      className: 'location-marker-icon',
      viewBox: '0 0 20 20',
      svgHeight: 40,
      svgWidth: 40,
      type: 'path',
      shape: { // zondicons "location" icon
        d: "M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
      },
      style: {
        fill: colors['blue-leaflet'],
        stroke: colors['grey-leaflet'],
        strokeWidth: 0.5,
      },
      iconAnchor: [5, 15], // render tip of SVG near marker location
    }

    let useCustomMarker = false

    _each(pointStyles, (styleValue, styleName) => {
      switch (styleName) {
        case 'marker-color':
          useCustomMarker = true
          customMarker.style.fill = styleValue
          break
        case 'marker-size':
          useCustomMarker = true
          switch (styleValue) {
            case 'small':
              customMarker.svgHeight = 20
              customMarker.svgWidth = 20
              break
            case 'large':
              customMarker.svgHeight = 60
              customMarker.svgWidth = 60
              break
            default:
              // medium is already the default size
              break
          }
          break
        default:
          break
      }
    })

    if (useCustomMarker) {
      layer.setIcon(L.vectorIcon(customMarker))
    }
  }

  /**
   * Retrieves all simplestyle properties specified on this feature
   */
  simplestyleFeatureProperties() {
    return _fromPairs(_compact(_map(supportedSimplestyles, simplestyleProperty => (
      !_isUndefined(this.properties[simplestyleProperty]) ?
      [simplestyleProperty, this.properties[simplestyleProperty]] :
      null
    ))))
  }
}

export default feature => new AsSimpleStyleableFeature(feature)
