import _isUndefined from 'lodash/isUndefined'
import _each from 'lodash/each'
import _keys from 'lodash/keys'


// Maps simplestyle property names to corresponding leaflet style option names
const simplestyleLeafletMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity',
}

// Names of supported simplestyle properties
export const supportedSimplestyles = _keys(simplestyleLeafletMapping)

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
      _each(simplestyleLeafletMapping, (leafletStyle, simplestyleProperty) => {
        if (!_isUndefined(this.properties[simplestyleProperty]) && layer.setStyle) {
          layer.setStyle({[leafletStyle]: this.properties[simplestyleProperty]})
        }
      })
    }
  }
}

export default feature => new AsSimpleStyleableFeature(feature)
