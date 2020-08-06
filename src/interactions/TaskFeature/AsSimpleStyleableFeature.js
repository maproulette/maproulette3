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
import _filter from 'lodash/filter'
import _flatten from 'lodash/flatten'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'
import AsFilterableFeature from './AsFilterableFeature'

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
  constructor(feature, conditionalStyles) {
    Object.assign(this, feature, {conditionalStyles})
  }

  /**
   * Styles the given Leaflet layer with any supported simplestyle properties
   * present on this feature
   */
  styleLeafletLayer(layer) {
    this.styleLeafletLayerWithStyles(layer, this.getFinalLayerStyles(layer))
  }

  /**
   * Styles the given Leaflet layer using the given simplestyles object of
   * simplestyle property names and desired values
   */
  styleLeafletLayerWithStyles(layer, simplestyles) {
    if (getType(layer.feature) === 'Point') {
      this.styleLeafletMarkerLayer(layer, simplestyles)
    }
    else {
      this.styleLeafletPathLayer(layer, simplestyles)
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

  /**
   * Generates an object containing the final determined styles for the given
   * layer (taking the layer type into account), or for this feature more
   * broadly if no layer is specified
   */
  getFinalLayerStyles(layer) {
    if (this.conditionalStyles) {
      return this.getConditionalStyles(layer, this.conditionalStyles)
    }
    else if (this.properties) {
      return this.getStyles(layer, this.simplestyleFeatureProperties(), false)
    }
    else {
      return {}
    }
  }

  /**
   * Apply the given styles conditionally based on whether this feature matches
   * the filters associated with each style. All matching styles (if any) are
   * combined and applied together on top of any normal styling from
   * simplestyle properties on this feature
   */
  getConditionalStyles(layer, conditionalStyles) {
    const filterableFeature = AsFilterableFeature(this)
    const matchingStyles = _filter(conditionalStyles, style =>
      filterableFeature.matchesPropertyFilter(style.propertySearch)
    )

    if (matchingStyles.length > 0) {
      // flatten all matching styles into a single object
      const styleObject = _fromPairs(_flatten(_map(matchingStyles, match =>
        _map(match.styles, style => [style.styleName, style.styleValue])
      )))

      return this.getStyles(layer, styleObject)
    }
    else {
      return this.getStyles(layer)
    }
  }

  getStyles(layer, simplestyles, mergeWithFeatureProperties=true) {
    const styles =
      mergeWithFeatureProperties ?
      _merge({}, this.simplestyleFeatureProperties(), simplestyles) :
      simplestyles

    // If we have a layer, only return styles applicable to that layer's type
    if (!layer) {
      return styles
    }

    const supportedStyles =
      getType(layer.feature) === 'Point' ?
      _intersection(_keys(styles), supportedSimplestylePointProperties) :
      _intersection(_keys(styles), supportedSimplestyleLineProperties)

    return _pick(styles, supportedStyles)
  }
}

export default (feature, conditionalStyles) =>
  new AsSimpleStyleableFeature(feature, conditionalStyles)
