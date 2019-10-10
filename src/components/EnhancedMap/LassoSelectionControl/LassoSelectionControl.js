import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import 'leaflet-lasso'
import { injectIntl } from 'react-intl'
import { MapControl, withLeaflet } from 'react-leaflet'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

/**
 * Leaflet control that intializes leaflet-lasso for lasso selection of map
 * markers
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * @private
 */
const LassoSelectionLeafletControl = L.Control.extend({
  onAdd: function(map) {
    const lasso = L.lasso(map, {})

    map.on('lasso.finished', (event) => {
      this.options.onLassoSelection(event.layers)
    })

    // build the control button, render it, and return it
    const controlContent = (
      <button
        onClick={() => lasso.toggle()}
        className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
      >
        <SvgSymbol
          sym="lasso-icon"
          className="mr-w-4 mr-h-4 mr-fill-current"
          viewBox="0 0 512 512"
        />
      </button>
    )

    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },
})

/**
 * LassoSelectionControl is a react-leaflet MapControl component intended to be
 * used as a child of a react-leaflet Map instance, such as EnhancedMap. When
 * clicked, the control toggles activation of a lasso tool for selecting map
 * features
 */
export class LassoSelectionControl extends MapControl {
  // props will be available as `options` field in the leaflet control
  createLeafletElement(props) {
    return new LassoSelectionLeafletControl(props)
  }
}

export default withLeaflet(injectIntl(LassoSelectionControl))
