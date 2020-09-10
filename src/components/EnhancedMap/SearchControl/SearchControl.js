import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import { MapControl, withLeaflet } from 'react-leaflet'
import _map from 'lodash/map'
import { FormattedMessage, injectIntl } from 'react-intl'
import WithNominatimSearch from '../../HOCs/WithNominatimSearch/WithNominatimSearch'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../BusySpinner/BusySpinner'
import Dropdown from '../../Dropdown/Dropdown'
import messages from './Messages'

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
  onAdd: function(map) {
    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(ControlContent(this.options), controlContainer)
    return controlContainer
  }
})

/**
 * Component that renders the actual control content
 */
const ControlContent = props => {
  const checkForSpecialKeys = e => {
    // Esc clears search, Enter signals completion
    if (e.key === "Escape") {
      props.clearNominatimSearch()
    }
    else if (e.key === "Enter") {
      props.searchNominatim()
    }
  }

  const resultItems = _map(props.nominatimResults, result => (
    <li key={result.osmId}>
      <button
        className='mr-text-current hover:mr-text-yellow'
        onClick={() => props.chooseNominatimResult(result)}
      >
        {result.name}
      </button>
    </li>
  ))

  return (
    <Dropdown
      className="mr-dropdown--right"
      dropdownButton={dropdown =>
        <button
          onClick={dropdown.toggleDropdownVisible}
          className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
        >
          <SvgSymbol sym="search-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
        </button>
      }
      dropdownContent={dropdown =>
        <div className="mr-min-w-102">
          <div className="mr-flex mr-justify-between mr-items-center">
            <div className="mr-flex mr-items-center">
              <input
                className="mr-input mr-input--green-lighter-outline mr-bg-black-25"
                type="text"
                placeholder={props.intl.formatMessage(messages.nominatimQuery)}
                value={props.nominatimQuery}
                onChange={(e) => props.updateNominatimQuery(e.target.value)}
                onKeyDown={checkForSpecialKeys}
              />
              {props.nominatumSearching ?
                <BusySpinner inline className="mr-static" /> :
                <button
                  className="mr-button mr-h-10 mr-py-0 mr-ml-4"
                  onClick={props.searchNominatim}
                >
                  <FormattedMessage {...messages.searchLabel } />
                </button>
              }
            </div>
            <button
              className="mr-ml-4"
              onClick={() => {
                dropdown.closeDropdown()
                props.clearNominatimSearch()
              }}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-white mr-w-4 mr-h-4"
                aria-hidden
              />
            </button>
          </div>

          {props.nominatimResults &&
            <React.Fragment>
              <hr className="mr-h-px mr-my-4 mr-bg-blue" />
              {resultItems.length === 0 ? <FormattedMessage {...messages.noResults } /> :
              <ol className="mr-o-2" onClick={() => dropdown.closeDropdown()}>
                {resultItems}
              </ol>
              }
            </React.Fragment>
          }
        </div>
      }
    />
  )
}

export default WithNominatimSearch(withLeaflet(injectIntl(SearchControl)))
