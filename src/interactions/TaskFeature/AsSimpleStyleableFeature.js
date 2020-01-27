import L from 'leaflet'
import 'leaflet-vectoricon'
import { getType } from '@turf/invariant'
import _isUndefined from 'lodash/isUndefined'
import _each from 'lodash/each'
import _keys from 'lodash/keys'
import { colors } from '../../tailwind'


// Maps simplestyle property names to corresponding leaflet style option names
const simplestyleLineToLeafletMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity',
}

const simplestylePointProperties = [
  'marker-color', 'marker-size',
]

// Names of supported simplestyle properties
export const supportedSimplestyles =
  _keys(simplestyleLineToLeafletMapping).concat(simplestylePointProperties)

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
      if (getType(layer.feature) === 'Point') {
        this.styleLeafletMarkerLayer(layer)
      }
      else {
        this.styleLeafletPathLayer(layer)
      }
    }
  }

  styleLeafletPathLayer(layer) {
    if (!layer.setStyle) {
      return
    }

    _each(simplestyleLineToLeafletMapping, (leafletStyle, simplestyleProperty) => {
      if (!_isUndefined(this.properties[simplestyleProperty])) {
        layer.setStyle({[leafletStyle]: this.properties[simplestyleProperty]})
      }
    })
  }

  styleLeafletMarkerLayer(layer) {
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

    _each(simplestylePointProperties, (simplestyleProperty) => {
      if (!_isUndefined(this.properties[simplestyleProperty])) {
        switch (simplestyleProperty) {
          case 'marker-color':
            useCustomMarker = true
            customMarker.style.fill = this.properties[simplestyleProperty]
            break
          case 'marker-size':
            useCustomMarker = true
            switch (this.properties[simplestyleProperty]) {
              case 'small':
                customMarker.svgHeight = 20
                customMarker.svgWidth = 20
                break
              case 'large':
                customMarker.svgHeight = 60
                customMarker.svgWidth = 60
                break
              default:
                break
            }
            break
          default:
            break
        }
      }
    })

    if (useCustomMarker) {
      layer.setIcon(L.vectorIcon(customMarker))
    }
  }
}

export default feature => new AsSimpleStyleableFeature(feature)
