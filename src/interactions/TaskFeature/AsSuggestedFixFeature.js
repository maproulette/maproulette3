import L from 'leaflet'
import 'leaflet-vectoricon'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

export class AsSuggestedFixFeature {
  constructor(feature, suggestedFix, featureId) {
    const fix = _isEmpty(suggestedFix) ? null :
      _find(suggestedFix.operations, op => _get(op, 'data.id') === featureId)

    Object.assign(this, feature, {suggestedFix: fix})
  }

  hasSuggestedFix() {
    return !_isEmpty(_get(this, 'suggestedFix.data'))
  }

  styleLeafletLayer(layer) {
    // TODO Remove return and apply styling once we settle on colors
    return

    // eslint-disable-next-line no-unreachable
    if (!this.hasSuggestedFix()) {
      return
    }

    switch (this.osmElementType()) {
      case 'NODE':
        this.styleNode(layer)
        break
      case 'WAY':
        this.styleWay(layer)
        break
      default:
        // Do nothing
        break
    }
  }

  styleNode(layer) {
    if (!layer.setIcon) {
      return
    }

    layer.setIcon(L.vectorIcon({
      className: 'location-marker-icon',
      viewBox: '0 0 20 20',
      svgHeight: 40,
      svgWidth: 40,
      type: 'path',
      shape: { // zondicons "location" icon
        d: "M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
      },
      style: {
        fill: this.operationColor(this.suggestedFix),
        stroke: colors['grey-leaflet'],
        strokeWidth: 0.5,
      },
      iconAnchor: [5, 15], // render tip of SVG near marker location
    }))
    layer.bindTooltip(`${this.operationDescription(this.suggestedFix)} node`)
  }

  styleWay(layer) {
    if (!layer.setStyle) {
      return
    }

    layer.setStyle({color: this.operationColor(this.suggestedFix)})
    layer.bindTooltip(`${this.operationDescription(this.suggestedFix)} way`)
  }

  operationColor(operation) {
    switch (operation.operationType) {
      case 'createElement':
        return colors['picton-blue']
      case 'modifyElement':
        return colors['orange']
      case 'deleteElement':
        return colors['lavender-rose']
      default:
        return colors['blue-leaflet']
    }
  }

  operationDescription(operation) {
    switch (operation.operationType) {
      case 'createElement':
        return 'New'
      case 'modifyElement':
        return 'Modified'
      case 'deleteElement':
        return 'Deleted'
      default:
        return ''
    }
  }

  osmElementType() {
    if (!this.hasSuggestedFix()) {
      return null
    }

    return this.suggestedFix.data.id.split('/')[0].toUpperCase()
  }
}

export default (feature, suggestedFix, featureId) =>
  new AsSuggestedFixFeature(feature, suggestedFix, featureId)
