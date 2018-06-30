import React from 'react'
import ReactDOM from 'react-dom'
import { Control, DomUtil, FeatureGroup } from 'leaflet' 
import { injectIntl } from 'react-intl'
import { MapControl } from 'react-leaflet'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './FitBoundsControl.css'

/**
 * Leaflet control for that fits the map bounds to the current features added
 * to the leaflet Map. This is wrapped by the FitBoundsControl below, which is
 * a react-leaflet MapControl.
 *
 * @private
 */
const FitBoundsLeafletControl = Control.extend({
  fitFeatures: function(map) {
    const geoJSONFeatures = new FeatureGroup()

    map.eachLayer(layer => {
      if (layer.feature) {
        geoJSONFeatures.addLayer(layer)
      }
    })

    map.fitBounds(geoJSONFeatures.getBounds().pad(0.5))
  },

  onAdd: function(map) {
    const controlContent = (
      <a className="fit-bounds-control button"
         title={this.options.intl.formatMessage(messages.tooltip)}
         onClick={() => this.fitFeatures(map)}>
        <span className="icon is-small">
          <SvgSymbol sym="target-icon" viewBox="0 0 20 20" />
        </span>
      </a>
    )

    const controlContainer = DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },

  onRemove: function(map) {},
})

/**
 * FitBoundsControl is a react-leaflet MapControl component intended to be used
 * as a child of a react-leaflet Map instance, such as EnhancedMap. When clicked,
 * the control fits the map to the bounds of the current features.
 */
export class FitBoundsControl extends MapControl {
  createLeafletElement = props => new FitBoundsLeafletControl(props)
}

export default injectIntl(FitBoundsControl)
