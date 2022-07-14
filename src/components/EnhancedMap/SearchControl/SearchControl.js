import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import { MapControl, withLeaflet } from 'react-leaflet'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

/**
 * SearchControl presents a Leaflet control that can be used to execute
 * geographic searches via Nominatim (name searches, lon/lat searches, etc.)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class SearchControl extends MapControl {
  // props will be available as `options` field in the leaflet control
  createLeafletElement(props) {
    return new SearchLeafletControl(props)
  }

  // Re-render the control content when this component is rerendered
  updateLeafletElement(fromProps, toProps) {
    ReactDOM.render(ControlContent(toProps), this.leafletElement.getContainer())
    return this.leafletElement
  }
}

/**
 * The actual Leaflet control, which simply performs an initial rendering of
 * the control content when the control is added to the map
 */
const SearchLeafletControl = L.Control.extend({
  onAdd: function() {
    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(ControlContent(this.options), controlContainer)
    return controlContainer
  }
})

/**
 * Component that renders the actual control content
 */
const ControlContent = props => {
  return (
    <button
      onClick={e => {
        console.log(e)
        props.openSearch(e.target)
      }}
      className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
    >
      <SvgSymbol sym="search-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
    </button>
  )
}

export default withLeaflet(SearchControl)
