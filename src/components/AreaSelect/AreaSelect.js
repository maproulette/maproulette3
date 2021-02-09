import L from 'leaflet'
import './leaflet-areaselect'
import { injectIntl } from 'react-intl'
import { MapControl, withLeaflet } from 'react-leaflet'

/**
 * Leaflet AreaSelect that allows selection of a bounding box.
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * Code provided by: https://github.com/heyman/leaflet-areaselect/
 */
const AreaSelectLeaflet = L.Control.extend({
  onAdd: function(map) {
    const areaSelect = this.options.bounds ?
      L.areaSelect({bounds: this.options.bounds}) :
      L.areaSelect({height: 300, width: 200})
    areaSelect.addTo(map)

    // Send a callback when the bounds change
    areaSelect.on("change", () => {
      this.options.onBoundsChanged(areaSelect.getBounds())
    })

    return L.DomUtil.create('div')
  }})


/**
 * AreaSelect is a react-leaflet component intended to be
 * used as a child of a react-leaflet Map instance, such as EnhancedMap. When
 * clicked, the control activates
 */
export class AreaSelect extends MapControl {
  // props will be available as `options` field in the leaflet control
  createLeafletElement(props) {
    return new AreaSelectLeaflet(props)
  }
}

export default withLeaflet(injectIntl(AreaSelect))
