import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import { injectIntl } from 'react-intl'
import { MapControl, withLeaflet } from 'react-leaflet'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * Leaflet control that zooms the map out to a worldwide view
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * @private
 */
const FitWorldLeafletControl = L.Control.extend({
  onAdd: function(map) {
    // build the control button, render it, and return it
    const controlContent = (
      <button
        onClick={() => map.fitWorld()}
        className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
      >
        <SvgSymbol
          title={this.options.intl.formatMessage(messages.tooltip)}
          sym="globe-icon"
          className="mr-w-4 mr-h-4 mr-fill-current"
          viewBox="0 0 20 20"
        />
      </button>
    )

    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },
})

/**
 * FitWorldControl is a react-leaflet MapControl component intended to be
 * used as a child of a react-leaflet Map instance, such as EnhancedMap. When
 * clicked, the control zooms out to a worldwide view
 */
export class FitWorldControl extends MapControl {
  // props will be available as `options` field in the leaflet control
  createLeafletElement(props) {
    return new FitWorldLeafletControl(props)
  }
}

export default withLeaflet(injectIntl(FitWorldControl))
