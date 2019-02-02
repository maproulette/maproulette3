import _isUndefined from 'lodash/isUndefined'
import _each from 'lodash/each'

/**
 * AsSimpleStylableFeature adds functionality for interpreting
 * [simplestyle](https://github.com/mapbox/simplestyle-spec) properties
 */
export class AsSimpleStyleableFeature {
  constructor(feature) {
    Object.assign(this, feature)
  }

  // Maps simplestyle propertie names to corresponding leaflet style option names
  simplestyleLeafletMapping = {
    'stroke': 'color',
    'stroke-width': 'weight',
    'stroke-opacity': 'opacity',
    'fill': 'fillColor',
    'fill-opacity': 'fillOpacity',
  }

  /**
   * Styles the given Leaflet layer with any supported simplestyle properties
   * present on this feature
   */
  styleLeafletLayer(layer) {
    if (this.properties) {
      _each(this.simplestyleLeafletMapping, (leafletStyle, simplestyleProperty) => {
        if (!_isUndefined(this.properties[simplestyleProperty])) {
          layer.setStyle({[leafletStyle]: this.properties[simplestyleProperty]})
        }
      })
    }
  }
}

export default feature => new AsSimpleStyleableFeature(feature)
