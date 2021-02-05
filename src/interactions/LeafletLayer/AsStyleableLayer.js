import _pick from 'lodash/pick'

/**
 * AsStylableLayer adds functionality for styling Leaflet layers
 */
export class AsStyleableLayer {
  constructor(layer) {
    this.layer = layer
    this.originalLeafletStyles = []
  }

  pushStyle(styles, identifier) {
    this.originalLeafletStyles.push({
      identifier,
      style: _pick(this.layer.options, [
        'color', 'fillColor', 'fillOpacity', 'fillRule', 'stroke',
        'lineCap', 'lineJoin', 'opacity', 'dashArray', 'dashOffset', 'weight',
      ]),
    })

    if (this.layer.setStyle) {
      this.layer.setStyle(styles)
    }
  }

  popStyle(identifier) {
    if (this.originalLeafletStyles.length === 0) {
      return
    }

    if (identifier &&
        this.originalLeafletStyles[this.originalLeafletStyles.length - 1].identifier !== identifier) {
      return
    }

    const priorStyle = this.originalLeafletStyles.pop()
    if (this.layer.setStyle) {
      this.layer.setStyle(priorStyle.style)
    }
  }
}

export default layer => new AsStyleableLayer(layer)
