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
import _get from 'lodash/get'
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
   * Add additional, explicit simple styles to the given leaflet layer. This is
   * intended to be used for adding extra, temporary styling (such as
   * highlighting a feature) that can be subsequently removed with
   * popLeafletLayerSimpleStyles
   */
  pushLeafletLayerSimpleStyles(layer, simplestyles, identifier) {
    if (!this.originalLeafletStyles) {
      this.originalLeafletStyles = []
    }
    this.originalLeafletStyles.push({
      identifier,
      style: _pick(layer.options, [
        'color', 'fillColor', 'fillOpacity', 'fillRule', 'stroke',
        'lineCap', 'lineJoin', 'opacity', 'dashArray', 'dashOffset', 'weight',
      ]),
      icon: layer.options.icon,
    })

    this.styleLeafletLayerWithStyles(layer, simplestyles)
  }

  /**
   * Restores the layer styling prior to the latest pushed styles from
   * pushLeafletLayerSimpleStyles, or does nothing if there are no prior styles
   * to restore
   */
  popLeafletLayerSimpleStyles(layer, identifier) {
    if (!this.originalLeafletStyles ||this.originalLeafletStyles.length === 0) {
      return
    }

    if (identifier &&
        this.originalLeafletStyles[this.originalLeafletStyles.length - 1].identifier !== identifier) {
      return
    }

    const priorStyle = this.originalLeafletStyles.pop()
    if (layer.setStyle) {
      layer.setStyle(priorStyle.style)
    }
    else if (_get(layer, 'options.icon.options.mrSvgMarker')) {
      // Restore icon, either SVG or original Leaflet
      layer._removeIcon()
      if (_get(priorStyle.icon, 'options.mrSvgMarker')) {
        layer.setIcon(L.vectorIcon(priorStyle.icon.options))
      }
      else {
        layer.setIcon(new L.Icon.Default())
      }
    }
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
      mrSvgMarker: true,
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
        marginTop: '0px',
        marginLeft: '0px',
      },
      iconSize: [40, 40],
      iconAnchor: [20, 40], // tip of marker
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
              customMarker.iconAnchor = [10, 20]
              customMarker.iconSize = [20, 20]
              break
            case 'large':
              customMarker.svgHeight = 60
              customMarker.svgWidth = 60
              customMarker.iconAnchor = [30, 60]
              customMarker.iconSize = [60, 60]
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

    // If the layer already has one of our svg markers, make sure to clean it
    // up or else Leaflet has a tendencey to render dup markers
    if (_get(layer, 'options.icon.options.mrSvgMarker')) {
      layer._removeIcon()

      if (!useCustomMarker) {
        layer.setIcon(new L.Icon.Default())
      }
    }

    if (useCustomMarker) {
      layer.setIcon(L.vectorIcon(customMarker))
    }
  }

  /**
   * Returns active marker-specific simplestyles for the current layer, or
   * empty object if there are none for this layer
   */
  markerSimplestyles(layer) {
    const styles = {}
    if (_get(layer, 'options.icon.options.mrSvgMarker')) {
      styles["marker-color"] = layer.options.icon.options.style.fill

      switch(layer.options.icon.options.svgHeight) {
        case 20:
          styles["marker-size"] = 'small'
          break
        case 60:
          styles["marker-size"] = 'large'
          break
        default:
          styles["marker-size"] = 'medium'
          break
      }
    }

    return styles
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
